'use strict'

const htmlConfirmTokenEmail = () => {
    return `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding: 10px 0;
        }

        .header h1 {
            margin: 0;
            color: #333333;
        }

        .content {
            padding: 20px;
            text-align: center;
        }

        .content p {
            font-size: 16px;
            color: #666666;
        }

        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Email Confirmation</h1>
        </div>
        <div class="content">
            <p>Thank you for registering! Please use the code below to confirm your email address.</p>
            <div class="otp-code">{{otp_code}}</div>
            <p>If you did not request this email, please ignore it.</p>
        </div>
    </div>
</body>

</html>
    `;
}

module.exports = {
    htmlConfirmTokenEmail
}