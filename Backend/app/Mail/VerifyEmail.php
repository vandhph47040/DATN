<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;

    public function __construct($code)
    {
        $this->code = $code;
    }

    public function build()
    {
        $subject = 'Mã xác thực tài khoản';
        $message = "<p>Chào bạn!</p><p>Dưới đây là mã xác thực tài khoản của bạn. Vui lòng không chia sẻ cho bất kỳ ai vì tính bảo mật của tài khoản</p><p>Mã xác thực tài khoản của bạn là: <strong>{$this->code}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p><p>Trân trọng!</p>";

        return $this->subject($subject)->html($message);
    }
}
