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
    $article_id = $_GET['id'] ?? '';

    // Validate article ID
    if (empty($article_id) || !is_numeric($article_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid article ID']);
        exit;
    }

    // Check database connection
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    // Fetch the article with user information
    $sql = "SELECT a.id, a.title, a.author, a.content, a.image_path, a.created_at, 
                   u.full_name as user_name, u.email as user_email
            FROM articles a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE a.id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "i", $article_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        if (mysqli_num_rows($result) === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
            mysqli_stmt_close($stmt);
            exit;
        }

        $article = mysqli_fetch_assoc($result);
        
        echo json_encode([
            'success' => true,
            'article' => [
                'id' => $article['id'],
                'title' => $article['title'],
                'author' => $article['author'],
                'content' => $article['content'],
                'image_path' => $article['image_path'] ? 'uploads/' . $article['image_path'] : null,
                'created_at' => $article['created_at'],
                'user_name' => $article['user_name'] ?: 'Anonymous',
                'user_email' => $article['user_email']
            ]
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