<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supabase Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Supabase integration including database and storage.
    |
    */

    'url' => env('SUPABASE_URL'),

    'key' => env('SUPABASE_KEY'),

    'service_key' => env('SUPABASE_SERVICE_KEY'),

    'bucket' => env('SUPABASE_BUCKET', 'payment-proofs'),

    'region' => env('SUPABASE_REGION', 'ap-southeast-1'),

];
