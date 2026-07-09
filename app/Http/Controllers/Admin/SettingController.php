<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Models\Setting;
use App\Services\StorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'fine_per_day' => (int) Setting::getFinePerDay(),
            'loan_duration_days' => Setting::getLoanDurationDays(),
            'qris_image' => StorageService::url(Setting::getQrisImage(), FileType::QrisImage),
            'welcome_hero_image' => StorageService::url(Setting::getWelcomeHeroImage(), FileType::WelcomeHeroImage),
        ];

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Update fine per day
            Setting::setValue('fine_per_day', $validated['fine_per_day']);

            // Update loan duration days
            Setting::setValue('loan_duration_days', $validated['loan_duration_days']);

            // Handle QRIS image
            if ($request->boolean('remove_qris')) {
                $oldQris = Setting::getQrisImage();
                if ($oldQris) {
                    StorageService::delete($oldQris, FileType::QrisImage);
                }
                Setting::setValue('qris_image', '');
            } elseif ($request->hasFile('qris_image')) {
                // Delete old QRIS image if exists
                $oldQris = Setting::getQrisImage();
                if ($oldQris) {
                    StorageService::delete($oldQris, FileType::QrisImage);
                }

                // Store new QRIS image
                $path = StorageService::upload($request->file('qris_image'), FileType::QrisImage);

                if (! $path) {
                    throw new \Exception('Upload gagal: path kosong setelah upload');
                }

                Setting::setValue('qris_image', $path);

                Log::info('QRIS image updated successfully', [
                    'path' => $path,
                    'old_path' => $oldQris,
                ]);
            }

            // Handle Welcome Hero image
            if ($request->boolean('remove_welcome_hero')) {
                $oldHero = Setting::getWelcomeHeroImage();
                if ($oldHero) {
                    StorageService::delete($oldHero, FileType::WelcomeHeroImage);
                }
                Setting::setValue('welcome_hero_image', '');
            } elseif ($request->hasFile('welcome_hero_image')) {
                // Delete old hero image if exists
                $oldHero = Setting::getWelcomeHeroImage();
                if ($oldHero) {
                    StorageService::delete($oldHero, FileType::WelcomeHeroImage);
                }

                // Store new hero image
                $path = StorageService::upload($request->file('welcome_hero_image'), FileType::WelcomeHeroImage);

                if (! $path) {
                    throw new \Exception('Upload gagal: path kosong setelah upload');
                }

                Setting::setValue('welcome_hero_image', $path);

                Log::info('Welcome hero image updated successfully', [
                    'path' => $path,
                    'old_path' => $oldHero,
                ]);
            }

            return redirect()
                ->route('admin.settings.index')
                ->with('success', 'Pengaturan berhasil disimpan.');
        } catch (\Exception $e) {
            Log::error('Settings update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'has_file' => $request->hasFile('qris_image'),
                'file_valid' => $request->hasFile('qris_image') ? $request->file('qris_image')->isValid() : false,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan pengaturan: '.$e->getMessage());
        }
    }
}
