<?php
session_start();
include 'connect.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validate input
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            if (password_verify($password, $row['password'])) {
                $_SESSION['user_id'] = $row['id'];
                echo json_encode(['success' => true, 'message' => 'Login successful!']);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid password']);
            }
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'No user found with this email']);
        }
        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
}
?>