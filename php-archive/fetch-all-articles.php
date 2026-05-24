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
    // Check database connection
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    // Get pagination parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;

    // Validate pagination parameters
    if ($page < 1 || $limit < 1 || $limit > 50) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid pagination parameters']);
        exit;
    }

    // Fetch all articles with user information, ordered by newest first
    $sql = "SELECT a.id, a.title, a.author, a.content, a.image_path, a.created_at, 
                   u.full_name as user_name, u.email as user_email
            FROM articles a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC 
            LIMIT ? OFFSET ?";
    
    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ii", $limit, $offset);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $articles = [];
        while ($row = mysqli_fetch_assoc($result)) {
            // Truncate content for preview (first 200 characters)
            $content_preview = strlen($row['content']) > 200 
                ? substr($row['content'], 0, 200) . '...' 
                : $row['content'];

            $articles[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'author' => $row['author'],
                'content_preview' => $content_preview,
                'image_path' => $row['image_path'] ? 'uploads/' . $row['image_path'] : null,
                'created_at' => $row['created_at'],
                'user_name' => $row['user_name'] ?: 'Anonymous',
                'user_email' => $row['user_email']
            ];
        }

        // Get total count for pagination
        $count_sql = "SELECT COUNT(*) as total FROM articles";
        $count_result = mysqli_query($conn, $count_sql);
        $total_articles = mysqli_fetch_assoc($count_result)['total'];
        $total_pages = ceil($total_articles / $limit);

        echo json_encode([
            'success' => true,
            'articles' => $articles,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $total_pages,
                'total_articles' => $total_articles,
                'articles_per_page' => $limit
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