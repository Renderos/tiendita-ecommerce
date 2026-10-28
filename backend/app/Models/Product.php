<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'barcode',
        'sku',
        'price',
        'cost_price',
        'stock',
        'min_stock_alert',
        'unit',
        'is_active',
        'is_featured',
    ];

    // cost_price es el costo interno; el catalogo es publico
    protected $hidden = ['cost_price'];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
        'min_stock_alert' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
