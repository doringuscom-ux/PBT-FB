<?php
/**
 * PB Tadka - Email Proxy Script
 * Upload this file to your Hostinger public_html folder.
 * Example of URL: https://pbtadka.com/send-otp.php
 */

// --- SECURITY SETTINGS ---
// Change this to a random secret phrase! 
// This must match the SECRET_KEY in your Render backend .env.
define('SECURITY_KEY', 'PBTadka_Secret_2026_Email_Key');

// --- HEADERS ---
header('Content-Type: application/json');

// --- INPUT VALIDATION ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST requests allowed"]);
    exit;
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON payload"]);
    exit;
}

$email = $data['email'] ?? '';
$otp = $data['otp'] ?? '';
$secret = $data['secret'] ?? '';

// Check Secret Key
if ($secret !== SECURITY_KEY) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized: Secret key mismatch"]);
    exit;
}

if (empty($email) || empty($otp)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and OTP are required"]);
    exit;
}

// --- EMAIL PREPARATION ---
$subject = "Verification Code for PB Tadka";
$from = "noreply@pbtadka.com"; // Hostinger usually likes it if the 'from' is on the same domain
$from_name = "PB Tadka";

$message = '
<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
    <h2 style="color: #e11d48; text-align: center;">PB Tadka Verification</h2>
    <p>Hello,</p>
    <p>Thank you for choosing PB Tadka. Please use the following One-Time Password (OTP) to proceed:</p>
    <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 8px;">
        ' . $otp . '
    </div>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn\'t request this, please ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 10px; color: #aaa; text-align: center;">&copy; 2026 PB Tadka. All rights reserved.</p>
</div>';

// Headers for HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: " . $from_name . " <" . $from . ">" . "\r\n";
$headers .= "Reply-To: " . $from . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// --- SENDING ---
if (mail($email, $subject, $message, $headers)) {
    echo json_encode(["success" => true, "message" => "Email sent successfully via Hostinger Proxy"]);
} else {
    $error = error_get_last();
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "PHP mail() function failed.",
        "details" => $error ? $error['message'] : "Possible domain verification issue. Ensure noreply@pbtadka.com exists."
    ]);
}
?>
