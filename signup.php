<?php
session_start();
include 'connect.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = trim($_POST['full-name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validate input
    if (empty($full_name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        exit;
    }

    // Check if email already exists
    $check_sql = "SELECT id FROM users WHERE email = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    
    if ($check_stmt) {
        mysqli_stmt_bind_param($check_stmt, "s", $email);
        mysqli_stmt_execute($check_stmt);
        $check_result = mysqli_stmt_get_result($check_stmt);
        
        if (mysqli_num_rows($check_result) > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            mysqli_stmt_close($check_stmt);
            exit;
        }
        mysqli_stmt_close($check_stmt);
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "sss", $full_name, $email, $hashed_password);
        
        if (mysqli_stmt_execute($stmt)) {
            $user_id = mysqli_insert_id($conn);
            $_SESSION['user_id'] = $user_id;
            echo json_encode(['success' => true, 'message' => 'Signup successful!']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Signup failed: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to prepare statement: ' . mysqli_error($conn)]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
}
?>