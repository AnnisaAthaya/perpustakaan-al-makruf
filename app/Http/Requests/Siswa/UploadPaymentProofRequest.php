<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentProofRequest extends FormRequest
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
            'payment_proof' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB max
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
            'payment_proof.required' => 'Bukti pembayaran harus diupload.',
            'payment_proof.image' => 'File harus berupa gambar.',
            'payment_proof.mimes' => 'Format gambar harus jpg, jpeg, png, atau webp.',
            'payment_proof.max' => 'Ukuran file maksimal 5MB.',
        ];
    }
}
