<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:books,code'],
            'author' => ['required', 'string', 'max:255'],
            'publisher' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'language' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],
            'stock' => ['required', 'integer', 'min:1'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul buku wajib diisi.',
            'title.max' => 'Judul buku maksimal 255 karakter.',
            'code.required' => 'Kode buku wajib diisi.',
            'code.unique' => 'Kode buku sudah digunakan.',
            'author.required' => 'Penulis wajib diisi.',
            'author.max' => 'Nama penulis maksimal 255 karakter.',
            'publisher.required' => 'Penerbit wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'language.required' => 'Bahasa wajib dipilih.',
            'location.max' => 'Lokasi rak maksimal 100 karakter.',
            'year.integer' => 'Tahun terbit harus berupa angka.',
            'year.min' => 'Tahun terbit minimal 1900.',
            'year.max' => 'Tahun terbit tidak valid.',
            'stock.required' => 'Jumlah stok wajib diisi.',
            'stock.min' => 'Jumlah stok minimal 1.',
            'cover.image' => 'File harus berupa gambar.',
            'cover.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
            'cover.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
