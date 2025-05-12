<?php
return [
    //VnPay Config
    'vnp_TmnCode' => env('VNP_TMN_CODE', 'GXTS9J8E'),
    'vnp_HashSecret' => env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E'),
    'vnp_Url' => env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'vnp_ReturnUrl' => env('VNP_RETURN_URL', 'https://localhost:8000/api/VNPay/return'),
    //PayPal Config
    'client_id' => env('PAYPAL_CLIENT_ID', 'AZ0hSrHpJzzul_0GMfWUzh6atnw3Yma5d3MwZ7l2m1oSWjCPpCfWRHQC9_qjajceNT6B9mOmf7uTsAnm'),
    'secret' => env('PAYPAL_SECRET', 'EFJa_proQHCkDaXC3UWoX_8IQLzP-4f5Myn2vIF2UtVIZzcxZpoN0OnTVgTNTQWWFaSM1Mgod493ut18'),
    'mode' => env('PAYPAL_MODE', 'sandbox'), // Can be 'sandbox' or 'live'
    'http_connection_time_out' => 30,
    'log' => [
        'level' => 'FINE',
        'file' => storage_path() . '/logs/paypal.log',
    ],
];
