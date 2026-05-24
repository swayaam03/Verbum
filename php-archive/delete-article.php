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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $article_id = $_POST['article_id'] ?? '';
    $user_id = $_SESSION['user_id'];

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

    // First, check if the article belongs to the logged-in user
    $check_sql = "SELECT id, image_path FROM articles WHERE id = ? AND user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);

    if ($check_stmt) {
        mysqli_stmt_bind_param($check_stmt, "ii", $article_id, $user_id);
        mysqli_stmt_execute($check_stmt);
        $result = mysqli_stmt_get_result($check_stmt);

        if (mysqli_num_rows($result) === 0) {
            http_response_code(403);
            echo json_encode(['error' => 'Article not found or you do not have permission to delete it']);
            mysqli_stmt_close($check_stmt);
            exit;
        }

        $article = mysqli_fetch_assoc($result);
        mysqli_stmt_close($check_stmt);

        // Delete the article
        $delete_sql = "DELETE FROM articles WHERE id = ? AND user_id = ?";
        $delete_stmt = mysqli_prepare($conn, $delete_sql);

        if ($delete_stmt) {
            mysqli_stmt_bind_param($delete_stmt, "ii", $article_id, $user_id);
            
            if (mysqli_stmt_execute($delete_stmt)) {
                // Delete associated image file if it exists
                if (!empty($article['image_path'])) {
                    $image_path = "uploads/" . $article['image_path'];
                    if (file_exists($image_path)) {
                        unlink($image_path);
                    }
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Article deleted successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete article']);
            }
            
            mysqli_stmt_close($delete_stmt);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
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