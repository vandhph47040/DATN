<!DOCTYPE html>
<html>
<head>
    <title>Thanh toán thành công</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="card">
            <div class="card-header bg-success text-white">
                <h3>Thanh toán thành công</h3>
            </div>
            <div class="card-body">
                <div class="alert alert-success">
                    <p>Cảm ơn bạn đã thanh toán. Giao dịch của bạn đã được xử lý thành công!</p>
                </div>
                
                <h4>Chi tiết giao dịch:</h4>
                <table class="table table-bordered">
                    <tbody>
                        @foreach($data as $key => $value)
                        <tr>
                            <th>{{ $key }}</th>
                            <td>{{ $value }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
                <div class="mt-4">
                    <a href="/" class="btn btn-primary">Trở về trang chủ</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>