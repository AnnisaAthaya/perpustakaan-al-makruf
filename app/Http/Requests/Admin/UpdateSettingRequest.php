<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
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
            'fine_per_day' => ['required', 'integer', 'min:0', 'max:100000'],
            'loan_duration_days' => ['required', 'integer', 'min:1', 'max:30'],
            'qris_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_qris' => ['boolean'],
            'welcome_hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_welcome_hero' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'fine_per_day' => 'Denda per hari',
            'loan_duration_days' => 'Durasi peminjaman',
            'qris_image' => 'Gambar QRIS',
            'welcome_hero_image' => 'Gambar Hero Welcome',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fine_per_day.required' => 'Denda per hari wajib diisi.',
            'fine_per_day.min' => 'Denda per hari minimal Rp 0.',
            'fine_per_day.max' => 'Denda per hari maksimal Rp 100.000.',
            'loan_duration_days.required' => 'Durasi peminjaman wajib diisi.',
            'loan_duration_days.min' => 'Durasi peminjaman minimal 1 hari.',
            'loan_duration_days.max' => 'Durasi peminjaman maksimal 30 hari.',
            'qris_image.image' => 'File harus berupa gambar.',
            'qris_image.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
            'qris_image.max' => 'Ukuran gambar maksimal 2MB.',
            'welcome_hero_image.image' => 'File harus berupa gambar.',
            'welcome_hero_image.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
            'welcome_hero_image.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
