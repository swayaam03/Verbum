<?php
session_start();
include 'connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Optional if you're using separate ports

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch articles where user_id = current logged-in user
$sql = "SELECT id, title, author, image_path, content, created_at 
        FROM articles 
        WHERE user_id = ? 
        ORDER BY created_at DESC";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$articles = [];

while ($row = mysqli_fetch_assoc($result)) {
    $articles[] = $row;
}

echo json_encode($articles);
?>
