<?php
// Simple test file to debug signup issues
header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'Test response from signup.php',
    'test' => 'This is a test response'
]);
?> 