<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class OrderController extends Controller
{
    private const DELIVERY_FEE = 0;

    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * @OA\Get(
     *     path="/api/orders",
     *     tags={"Ordenes"},
     *     summary="Historial de compras del usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Listado de ordenes del usuario")
     * )
     */
    public function index(Request $request)
    {
        try {
            $orders = $request->user()
                ->orders()
                ->with('items.product')
                ->latest('id')
                ->get();

            return response()->json(['data' => $orders]);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/orders/{id}",
     *     tags={"Ordenes"},
     *     summary="Ver el detalle de una orden propia",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalle de la orden"),
     *     @OA\Response(response=404, description="Orden no encontrada")
     * )
     */
    public function show(Request $request, string $id)
    {
        try {
            // Solo puede ver ordenes que le pertenecen
            $order = $request->user()
                ->orders()
                ->with('items.product')
                ->findOrFail($id);

            return response()->json(['data' => $order]);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Order not found'], 404);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/orders",
     *     tags={"Ordenes"},
     *     summary="Crear una orden y procesar el pago con Stripe",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"items","payment_method"},
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *
     *                 @OA\Items(
     *                     @OA\Property(property="product_id", type="integer", example=1),
     *                     @OA\Property(property="quantity", type="integer", example=2)
     *                 )
     *             ),
     *             @OA\Property(property="payment_method", type="string", example="pm_card_visa")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Orden creada y pago procesado"),
     *     @OA\Response(response=402, description="El pago fue rechazado"),
     *     @OA\Response(response=422, description="Error de validacion o stock insuficiente")
     * )
     */
    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();
        $order = null;

        try {
            // 1. Orden + items + descuento de stock en una sola transaccion.
            $order = DB::transaction(function () use ($data, $request) {
                $subtotal = 0;
                $lines = [];

                foreach ($data['items'] as $item) {
                    $product = Product::where('is_active', true)
                        ->lockForUpdate()
                        ->findOrFail($item['product_id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \DomainException("Not enough stock for product: {$product->name}");
                    }

                    $lines[] = ['product' => $product, 'quantity' => $item['quantity']];
                    $subtotal += $product->price * $item['quantity'];
                }

                $subtotal = round($subtotal, 2);
                $deliveryFee = self::DELIVERY_FEE;
                $discount = 0;

                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'discount_amount' => $discount,
                    'total' => $subtotal + $deliveryFee - $discount,
                    'status' => 'pending',
                ]);

                foreach ($lines as $line) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $line['product']->id,
                        'quantity' => $line['quantity'],
                        'unit_price' => $line['product']->price,
                    ]);

                    $line['product']->decrement('stock', $line['quantity']);
                }

                return $order;
            });

            // 2. Cobro con Stripe (llamada externa, fuera de la transaccion)
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) round($order->total * 100), // Stripe usa centavos
                'currency' => 'usd',
                'payment_method' => $data['payment_method'],
                'confirm' => true,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
            ]);

            $paid = $paymentIntent->status === 'succeeded';

            $order->update([
                'status' => $paid ? 'paid' : 'cancelled',
                'payment_method' => 'card',
                'payment_id' => $paymentIntent->id,
            ]);

            if (! $paid) {
                $this->restoreStock($order);

                return response()->json([
                    'message' => 'Payment was not completed',
                    'data' => $order->fresh(['items.product']),
                ], 402);
            }

            return response()->json([
                'message' => 'Order created and paid successfully',
                'data' => $order->fresh(['items.product']),
            ], 201);

        } catch (ApiErrorException $error) {
            // Tarjeta rechazada, fondos insuficientes, etc.
            if ($order) {
                $this->restoreStock($order);
                $order->update(['status' => 'cancelled']);
            }

            return response()->json([
                'message' => 'Stripe error: '.$error->getMessage(),
            ], 402);

        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'One of the products is not available'], 422);

        } catch (\DomainException $error) {
            return response()->json(['message' => $error->getMessage()], 422);

        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    private function restoreStock(Order $order): void
    {
        foreach ($order->items()->with('product')->get() as $item) {
            $item->product->increment('stock', $item->quantity);
        }
    }
}
