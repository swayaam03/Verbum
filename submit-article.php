<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in. Please log in first.']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize & assign variables
    $title = trim($_POST['articleTitle'] ?? '');
    $author = trim($_POST['articleAuthor'] ?? $_SESSION['user_name'] ?? 'Anonymous');
    $content = trim($_POST['articleContent'] ?? '');
    $user_id = $_SESSION['user_id'];

    // Validate required fields
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

    // Handle Image Upload
    $image_path = '';
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

    // Insert into database
    $sql = "INSERT INTO articles (title, author, content, image_path, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ssssi", $title, $author, $content, $image_path, $user_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $article_id = mysqli_insert_id($conn);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Article published successfully!',
                'article_id' => $article_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database Error: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to prepare SQL: ' . mysqli_error($conn)]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
}

mysqli_close($conn);
?> 