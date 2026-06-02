<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'nis' => ['required', 'string', 'max:20', 'unique:users,nis,'.$userId],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$userId],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'phone' => ['nullable', 'string', 'max:20'],
            'grade' => ['required', 'integer', 'in:10,11,12'],
            'class_name' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'membership_status' => ['required', 'string', 'in:active,inactive,suspended'],
            'password' => ['nullable', 'string', 'min:8'],
            'reset_password' => ['nullable', 'boolean'],
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
            'name.required' => 'Nama siswa wajib diisi.',
            'name.max' => 'Nama siswa maksimal 255 karakter.',
            'nis.required' => 'NIS wajib diisi.',
            'nis.max' => 'NIS maksimal 20 karakter.',
            'nis.unique' => 'NIS sudah terdaftar.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'date_of_birth.required' => 'Tanggal lahir wajib diisi.',
            'date_of_birth.date' => 'Format tanggal lahir tidak valid.',
            'date_of_birth.before' => 'Tanggal lahir harus sebelum hari ini.',
            'phone.max' => 'Nomor HP maksimal 20 karakter.',
            'grade.required' => 'Kelas wajib dipilih.',
            'grade.in' => 'Kelas harus X, XI, atau XII.',
            'class_name.required' => 'Nama kelas wajib diisi.',
            'class_name.max' => 'Nama kelas maksimal 50 karakter.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'membership_status.required' => 'Status keanggotaan wajib dipilih.',
            'membership_status.in' => 'Status keanggotaan tidak valid.',
            'password.min' => 'Password minimal 8 karakter.',
        ];
    }
}
