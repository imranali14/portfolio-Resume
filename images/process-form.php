<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullName = $_POST["fullName"];
    $email = $_POST["email"];
    $mobileNumber = $_POST["mobileNumber"];
    $emailSubject = $_POST["emailSubject"];
    $message = $_POST["message"];

    $to = "imran.14ali110@gmail.com"; // Replace with your email address
    $subject = "New Contact Form Submission: $emailSubject";
    $headers = "From: $email";

    $mailBody = "Full Name: $fullName\n";
    $mailBody .= "Email: $email\n";
    $mailBody .= "Mobile Number: $mobileNumber\n\n";
    $mailBody .= "Message:\n$message";

    mail($to, $subject, $mailBody, $headers);
}
?>
