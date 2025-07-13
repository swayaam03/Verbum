<?php
/* -----------------------------------------------------------
   Gemini proxy  –  Verbum  |  2025‑07‑13
   -----------------------------------------------------------
   Expects a POST field  prompt=<text>
----------------------------------------------------------- */
error_reporting(E_ALL);
ini_set('display_errors', 1);
$response = curl_exec($ch);
echo $response;


$apiKey = "AIzaSyCYcBYkZWqFhJcNh-NfEMYhCGgLys7GsRM";   // ← your key
$prompt = trim($_POST['prompt'] ?? '');

if ($prompt === '') {
    http_response_code(400);
    echo json_encode(["error" => "Prompt is empty."]);
    exit;
}

/*  Build request payload for chat‑bison‑001 (v1beta)  */
$payload = [
  "prompt" => [
      "messages" => [
          ["author" => "user", "content" => $prompt]
      ]
  ]
];

$url = "https://generativelanguage.googleapis.com/v1beta/models/chat-bison-001:generateMessage?key=$apiKey";

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL            => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS     => json_encode($payload)
]);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
?>
