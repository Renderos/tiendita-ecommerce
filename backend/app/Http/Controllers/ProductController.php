<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductController extends Controller
{
    private const RELATIONS = ['category:id,name,slug', 'brand:id,name,slug'];

    /**
     * @OA\Get(
     *     path="/api/products",
     *     tags={"Productos"},
     *     summary="Listar catalogo de productos activos (publico)",
     *     @OA\Response(response=200, description="Listado de productos")
     * )
     */
    public function index()
    {
        try {
            $products = Product::with(self::RELATIONS)
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json(['data' => $products]);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/products/{id}",
     *     tags={"Productos"},
     *     summary="Ver el detalle de un producto activo (publico)",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalle del producto"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
    public function show(string $id)
    {
        try {
            $product = Product::with(self::RELATIONS)
                ->where('is_active', true)
                ->findOrFail($id);

            return response()->json(['data' => $product]);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/products",
     *     tags={"Productos"},
     *     summary="Crear un producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"category_id","name","slug","sku","price","stock","unit"},
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="brand_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Manzana roja"),
     *             @OA\Property(property="slug", type="string", example="manzana-roja"),
     *             @OA\Property(property="sku", type="string", example="FRU-001"),
     *             @OA\Property(property="price", type="number", format="float", example=1.25),
     *             @OA\Property(property="stock", type="integer", example=100),
     *             @OA\Property(property="unit", type="string", example="lb")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Producto creado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=422, description="Error de validacion")
     * )
     */
    public function store(StoreProductRequest $request)
    {
        try {
            $product = Product::create($request->validated());

            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product->fresh(self::RELATIONS),
            ], 201);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/products/{id}",
     *     tags={"Productos"},
     *     summary="Actualizar un producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Producto actualizado"),
     *     @OA\Response(response=404, description="Producto no encontrado"),
     *     @OA\Response(response=422, description="Error de validacion")
     * )
     */
    public function update(UpdateProductRequest $request, string $id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->update($request->validated());

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product->fresh(self::RELATIONS),
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/products/{id}",
     *     tags={"Productos"},
     *     summary="Desactivar un producto (is_active = false)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Producto desactivado"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
    public function destroy(string $id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->update(['is_active' => false]);

            return response()->json(['message' => 'Product deactivated successfully']);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/products/{id}/restore",
     *     tags={"Productos"},
     *     summary="Reactivar un producto (is_active = true)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Producto reactivado"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
    public function restore(string $id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->update(['is_active' => true]);

            return response()->json(['message' => 'Product restored successfully']);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $error) {
            report($error);

            return response()->json(['message' => 'Unexpected error'], 500);
        }
    }
}
