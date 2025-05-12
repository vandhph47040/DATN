<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $code;

    public function __construct($code)
    {
        $this->code = $code;
    }

    public function build()
    {
        $subject = 'Mã OTP đặt lại mật khẩu';
        $message = "<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p>Dưới đây là mã OTP đặt lại mật khẩu của bạn. Vui lòng không chia sẻ cho bất kỳ ai vì tính bảo mật của tài khoản</p><p>Mã OTP của bạn là: <strong>{$this->code}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>Trân trọng!";

        return $this->subject($subject)->html($message);
    }
}
