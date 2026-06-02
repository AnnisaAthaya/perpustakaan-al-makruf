<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PromoteUsersRequest extends FormRequest
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
            'target_grade' => ['required', 'integer', 'in:10,11,12'],
            'target_class_name' => ['required', 'string', 'max:50'],
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['required', 'integer', 'exists:users,id'],
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
            'target_grade.in' => 'Tingkat kelas harus 10, 11, atau 12.',
            'target_class_name.required' => 'Nama kelas harus diisi.',
            'target_class_name.max' => 'Nama kelas maksimal 50 karakter.',
            'user_ids.required' => 'Pilih minimal 1 siswa untuk dipindahkan kelasnya.',
            'user_ids.min' => 'Pilih minimal 1 siswa untuk dipindahkan kelasnya.',
        ];
    }
}
