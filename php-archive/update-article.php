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
    $title = trim($_POST['articleTitle'] ?? '');
    $author = trim($_POST['articleAuthor'] ?? $_SESSION['user_name'] ?? 'Anonymous');
    $content = trim($_POST['articleContent'] ?? '');
    $user_id = $_SESSION['user_id'];

    // Validate required fields
    if (empty($article_id) || !is_numeric($article_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid article ID']);
        exit;
    }

    if (empty($title) || empty($content)) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and content are required']);
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
            echo json_encode(['error' => 'Article not found or you do not have permission to edit it']);
            mysqli_stmt_close($check_stmt);
            exit;
        }

        $article = mysqli_fetch_assoc($result);
        mysqli_stmt_close($check_stmt);

        // Handle Image Upload (if new image is provided)
        $image_path = $article['image_path']; // Keep existing image by default
        if (isset($_FILES['featureImage']) && $_FILES['featureImage']['error'] === 0) {
            $imageName = basename($_FILES['featureImage']['name']);
            $targetDir = "uploads/";
            
            // Create uploads directory if it doesn't exist
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0777, true);
            }

            $targetPath = $targetDir . $imageName;
            
            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (in_array($_FILES['featureImage']['type'], $allowedTypes)) {
                if (move_uploaded_file($_FILES['featureImage']['tmp_name'], $targetPath)) {
                    // Delete old image if it exists
                    if (!empty($article['image_path'])) {
                        $old_image_path = "uploads/" . $article['image_path'];
                        if (file_exists($old_image_path)) {
                            unlink($old_image_path);
                        }
                    }
                    $image_path = $imageName;
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to upload image']);
                    exit;
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid image format. Please use JPEG, PNG, GIF, or WebP']);
                exit;
            }
        }

        // Update the article
        $update_sql = "UPDATE articles SET title = ?, author = ?, content = ?, image_path = ? WHERE id = ? AND user_id = ?";
        $update_stmt = mysqli_prepare($conn, $update_sql);

        if ($update_stmt) {
            mysqli_stmt_bind_param($update_stmt, "ssssii", $title, $author, $content, $image_path, $article_id, $user_id);
            
            if (mysqli_stmt_execute($update_stmt)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Article updated successfully!'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update article']);
            }
            
            mysqli_stmt_close($update_stmt);
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