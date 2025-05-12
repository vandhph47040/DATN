<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPalService
{
    protected $clientId;
    protected $secret;
    protected $mode;
    protected $apiUrl;

    public function __construct()
    {
        $this->clientId = env('PAYPAL_CLIENT_ID');
        $this->secret = env('PAYPAL_SECRET');
        $this->mode = env('PAYPAL_MODE', 'sandbox');
        $this->apiUrl = $this->mode === 'sandbox'
            ? 'https://api.sandbox.paypal.com'
            : 'https://api.paypal.com';
    }

    /**
     * Lấy access token từ PayPal
     *
     * @return string|null
     */
    public function getAccessToken()
    {
        $url = "{$this->apiUrl}/v1/oauth2/token";
        $credentials = base64_encode("{$this->clientId}:{$this->secret}");

        try {
            $response = Http::withHeaders([
                'Authorization' => "Basic {$credentials}"
            ])->asForm()->post($url, [
                'grant_type' => 'client_credentials'
            ]);

            $data = $response->json();
            if (isset($data['access_token'])) {
                return $data['access_token'];
            }

            Log::error('Failed to get PayPal access token', $data);
            return null;
        } catch (\Exception $e) {
            Log::error('PayPal access token exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Tạo một giao dịch thanh toán PayPal
     *
     * @param float $amount
     * @param string $currency
     * @param string $description
     * @param string $returnUrl
     * @param string $cancelUrl
     * @return array
     */
    public function createPayment($amount, $currency, $description, $returnUrl, $cancelUrl)
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return [
                'status' => 'error',
                'message' => 'Không thể lấy token xác thực từ PayPal'
            ];
        }

        $url = "{$this->apiUrl}/v1/payments/payment";

        $paymentData = [
            "intent" => "sale",
            "payer" => [
                "payment_method" => "PayPal"
            ],
            "transactions" => [
                [
                    "amount" => [
                        "total" => number_format($amount, 2, '.', ''),
                        "currency" => $currency
                    ],
                    "description" => $description
                ]
            ],
            "redirect_urls" => [
                "return_url" => $returnUrl,
                "cancel_url" => $cancelUrl
            ]
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json'
            ])->post($url, $paymentData);

            $data = $response->json();

            // Kiểm tra và lấy URL phê duyệt
            $approvalUrl = null;
            $paymentId = null;

            if (isset($data['id'])) {
                $paymentId = $data['id'];

                foreach ($data['links'] as $link) {
                    if ($link['rel'] === 'approval_url') {
                        $approvalUrl = $link['href'];
                        break;
                    }
                }

                if ($approvalUrl) {
                    return [
                        'status' => 'success',
                        'payment_id' => $paymentId,
                        'approval_url' => $approvalUrl
                    ];
                }
            }

            Log::error('Invalid PayPal response', ['response' => $data]);
            return [
                'status' => 'error',
                'message' => 'Không thể tạo URL thanh toán PayPal',
                'data' => $data
            ];
        } catch (\Exception $e) {
            Log::error('PayPal create payment exception: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Thực hiện thanh toán sau khi người dùng đã phê duyệt
     *
     * @param string $paymentId
     * @param string $payerId
     * @return array
     */
    public function executePayment($paymentId, $payerId)
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return [
                'status' => 'error',
                'message' => 'Không thể lấy token xác thực từ PayPal'
            ];
        }

        $url = "{$this->apiUrl}/v1/payments/payment/{$paymentId}/execute";

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json'
            ])->post($url, [
                'payer_id' => $payerId
            ]);

            $data = $response->json();

            if (isset($data['state']) && $data['state'] === 'approved') {
                return [
                    'status' => 'success',
                    'data' => $data
                ];
            }

            Log::error('PayPal payment execution failed', ['response' => $data]);
            return [
                'status' => 'error',
                'message' => 'Không thể hoàn tất thanh toán PayPal',
                'data' => $data
            ];
        } catch (\Exception $e) {
            Log::error('PayPal execute payment exception: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Lấy thông tin chi tiết của giao dịch thanh toán
     *
     * @param string $paymentId
     * @return array
     */
    public function getPaymentDetails($paymentId)
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return [
                'status' => 'error',
                'message' => 'Không thể lấy token xác thực từ PayPal'
            ];
        }

        $url = "{$this->apiUrl}/v1/payments/payment/{$paymentId}";

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json'
            ])->get($url);

            $data = $response->json();

            if (isset($data['id'])) {
                return [
                    'status' => 'success',
                    'data' => $data
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Không thể lấy thông tin thanh toán',
                'data' => $data
            ];
        } catch (\Exception $e) {
            Log::error('Get PayPal payment details exception: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
