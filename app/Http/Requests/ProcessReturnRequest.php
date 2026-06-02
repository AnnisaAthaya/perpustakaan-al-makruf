<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessReturnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'adjusted_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100000',
            ],
            'adjustment_reason' => [
                'nullable',
                'string',
                'min:10',
                'max:500',
                function ($attribute, $value, $fail) {
                    $adjustedAmount = $this->input('adjusted_amount');

                    // If adjusted_amount is provided and different, reason is required
                    if ($adjustedAmount !== null) {
                        // Get the original calculated amount from the loan
                        $loan = $this->route('loan');
                        $finePerDay = (float) \App\Models\Setting::getValue('fine_per_day', 2000);
                        $originalAmount = $loan->overdue_days * $finePerDay;

                        if ($adjustedAmount != $originalAmount && empty($value)) {
                            $fail('Alasan perubahan wajib diisi jika jumlah denda diubah.');
                        }
                    }
                },
            ],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'adjusted_amount.numeric' => 'Jumlah denda harus berupa angka.',
            'adjusted_amount.min' => 'Jumlah denda minimal Rp 0.',
            'adjusted_amount.max' => 'Jumlah denda maksimal Rp 100.000.',
            'adjustment_reason.min' => 'Alasan perubahan minimal 10 karakter.',
            'adjustment_reason.max' => 'Alasan perubahan maksimal 500 karakter.',
        ];
    }
}
