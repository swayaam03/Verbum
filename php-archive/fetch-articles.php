<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $user_id = $_SESSION['user_id'];

    // Check database connection
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    // Fetch articles for the logged-in user
    $sql = "SELECT id, title, author, content, image_path, created_at FROM articles WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $articles = [];
        while ($row = mysqli_fetch_assoc($result)) {
            // Truncate content for preview
            $content_preview = strlen($row['content']) > 200 
                ? substr($row['content'], 0, 200) . '...' 
                : $row['content'];

            $articles[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'author' => $row['author'],
                'content' => $row['content'],
                'content_preview' => $content_preview,
                'image_path' => $row['image_path'] ? 'uploads/' . $row['image_path'] : null,
                'created_at' => $row['created_at']
            ];
        }

        echo json_encode([
            'success' => true,
            'articles' => $articles
        ]);

        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
}

mysqli_close($conn);
?> 