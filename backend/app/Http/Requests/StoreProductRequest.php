<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:categories,id',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'name' => 'required|string|max:150',
            'slug' => 'required|string|max:150|unique:products,slug',
            'barcode' => 'nullable|string|max:50',
            'sku' => 'required|string|max:50|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'unit' => 'required|in:lb,kg,pack,unit',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
        ];
    }
}
