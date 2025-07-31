<?php
session_start();
include 'connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Check database connection
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

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

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to prepare statement: ' . mysqli_error($conn)]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $user_id);

if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to execute query: ' . mysqli_stmt_error($stmt)]);
    mysqli_stmt_close($stmt);
    exit;
}

$result = mysqli_stmt_get_result($stmt);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to get result: ' . mysqli_error($conn)]);
    mysqli_stmt_close($stmt);
    exit;
}

$articles = [];

while ($row = mysqli_fetch_assoc($result)) {
    $articles[] = $row;
}

mysqli_stmt_close($stmt);
echo json_encode($articles);
?>