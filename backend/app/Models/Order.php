<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'subtotal',
        'delivery_fee',
        'discount_amount',
        'total',
        'status',
        'payment_method',
        'payment_id',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    protected $appends = ['payment'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Compatibilidad con el formato anterior de la API (tabla payments).
     * Ahora el pago vive dentro de orders (payment_method, payment_id).
     */
    public function getPaymentAttribute(): ?array
    {
        if (! $this->payment_id) {
            return null;
        }

        return [
            'payment_method' => $this->payment_method,
            'status' => match ($this->status) {
                'pending' => 'pending',
                'cancelled' => 'failed',
                default => 'succeeded',
            },
            'stripe_payment_intent_id' => $this->payment_id,
        ];
    }
}
