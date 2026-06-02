<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportCsvRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'csv' => [
                'required',
                'file',
                'mimes:csv,txt',
                'max:10240', // 10MB max
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'csv.required' => 'File CSV wajib diupload.',
            'csv.file' => 'File yang diupload tidak valid.',
            'csv.mimes' => 'File harus berformat CSV (.csv atau .txt).',
            'csv.max' => 'Ukuran file maksimal 10MB.',
        ];
    }
}
