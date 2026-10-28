<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $id = $this->route('id');

        return [
            'category_id' => 'sometimes|required|integer|exists:categories,id',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'name' => 'sometimes|required|string|max:150',
            'slug' => ['sometimes', 'required', 'string', 'max:150', Rule::unique('products', 'slug')->ignore($id)],
            'barcode' => 'nullable|string|max:50',
            'sku' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($id)],
            'price' => 'sometimes|required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'unit' => 'sometimes|required|in:lb,kg,pack,unit',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
        ];
    }
}
