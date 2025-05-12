<?php

namespace App\Mail;

// use BaconQrCode\Encoder\QrCode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $ticketDetails;

    /**
     * Create a new message instance.
     */
    public function __construct($booking, $ticketDetails)
    {
        $this->booking = $booking;
        $this->ticketDetails = $ticketDetails;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Đặt vé thành công',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildEmailContent(),
        );
    }

    protected function buildEmailContent(): string
    {
        $seats = implode(', ', array_map(function ($seat) {
            return "{$seat['row']}{$seat['column']} ({$seat['seat_type']})";
        }, $this->ticketDetails['seats']->toArray()));

        $combos = '';
        if (!empty($this->ticketDetails['combos'])) {
            $combos = implode(', ', array_map(function ($combo) {
                return "{$combo['display']} - " . number_format($combo['price'], 0, ',', '.') . " VNĐ";
            }, $this->ticketDetails['combos']->toArray()));
        }
        $comboDisplay = $combos ? $combos : 'Không có';

        $qrData = "Mã đặt vé: {$this->booking->id}\n" .
            "Phim: {$this->ticketDetails['movie']['title']}\n" .
            "Ngày chiếu: {$this->ticketDetails['show_date']}\n" .
            "Giờ chiếu: {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}\n" .
            "Phòng: {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})\n" .
            "Ghế: {$seats}";

        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
        $qrCode = base64_encode(file_get_contents($qrUrl));
        Log::info('QR Code Base64 (Mail): ' . $qrCode);

        return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vé xem phim</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; text-align: center;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background: #c0392b; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
        <tr>
            <!-- Phần bên trái -->
            <td style="background: #c0392b; color: #fff; padding: 20px; vertical-align: top; width: 70%;">
                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                        <td style="text-align: left; font-size: 24px; font-weight: bold; color: #fff;">
                            Movie<span style="color: #1e3a8a;">Forrest</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 60px; text-align: center; padding: 20px 0;">
                            🎥
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 28px; text-align: center; text-transform: uppercase; letter-spacing: 2px; color: #fff;">
                            Cinema Ticket
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 0;">
                            <table border="0" cellpadding="5" cellspacing="0" style="width: 100%;">
                                <tr>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        <span style="font-weight: bold;">Phim:</span>
                                    </td>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                    {$this->ticketDetails['movie']['title']}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        <span style="font-weight: bold;">Ngày chiếu:</span>
                                    </td>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        {$this->ticketDetails['show_date']}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        <span style="font-weight: bold;">Giờ:</span>
                                    </td>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                    {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table border="0" cellpadding="5" cellspacing="0" style="width: 100%;">
                                <tr>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        <span style="font-weight: bold;">Phòng:</span>
                                    </td>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                    {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        <span style="font-weight: bold;">Ghế:</span>
                                    </td>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        {$seats}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        <span style="font-weight: bold;">Mã đặt vé:</span>
                                    </td>
                                    <td style="text-align: left; width: 50%; color: #fff; font-size: 14px;">
                                        </span> {$this->booking->id}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
            <!-- Phần bên phải -->
            <td style="background: #fceae9; padding: 20px; vertical-align: middle; width: 30%; border-left: 2px dashed #c0392b;">
                <table border="0" cellpadding="5" cellspacing="0" style="width: 100%;">
                    <tr>
                        <td style="font-size: 14px; color: #000;">
                            <span style="font-weight: bold;">Ngày:</span> {$this->ticketDetails['show_date']}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #000;">
                            <span style="font-weight: bold;">Giờ:</span> {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #000;">
                            <span style="font-weight: bold;">Phòng:</span> {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #000;">
                            <span style="font-weight: bold;">Ghế:</span> {$seats}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $qrData = "Mã đặt vé: {$this->booking->id}\n" .
            "Phim: {$this->ticketDetails['movie']['title']}\n" .
            "Ngày chiếu: {$this->ticketDetails['calendar_show']['show_date']}\n" .
            "Giờ chiếu: {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}\n" .
            "Phòng: {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})\n" .
            "Ghế: " . implode(', ', array_map(function ($seat) {
                return "{$seat['row']}{$seat['column']} ({$seat['seat_type']})";
            }, $this->ticketDetails['seats']->toArray()));

        // Tạo và lưu file SVG
        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
        $qrCodePath = storage_path('app/public/qr_code_' . $this->booking->id . '.png');
        file_put_contents($qrCodePath, file_get_contents($qrUrl));
        $attachment = \Illuminate\Mail\Mailables\Attachment::fromPath($qrCodePath)
            ->as('qr_code.png')
            ->withMime('image/png');

        // Xóa file tạm sau khi gửi
        register_shutdown_function(function () use ($qrCodePath) {
            @unlink($qrCodePath);
        });
        return [$attachment];
    }
}
