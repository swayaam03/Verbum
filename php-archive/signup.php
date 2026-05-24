<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = trim($_POST['full-name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm-password'] ?? '';

    // Validate inputs
    if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        exit;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid email address']);
        exit;
    }

    // Validate password length
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters long']);
        exit;
    }

    // Check if passwords match
    if ($password !== $confirm_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Passwords do not match']);
        exit;
    }

    // Check database connection
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
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
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists. Please use a different email or login.']);
            mysqli_stmt_close($check_stmt);
            exit;
        }
        mysqli_stmt_close($check_stmt);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
        exit;
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $insert_sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    $insert_stmt = mysqli_prepare($conn, $insert_sql);

    if ($insert_stmt) {
        mysqli_stmt_bind_param($insert_stmt, "sss", $full_name, $email, $hashed_password);
        
        if (mysqli_stmt_execute($insert_stmt)) {
            $user_id = mysqli_insert_id($conn);
            
            // Create session for the new user
            $_SESSION['user_id'] = $user_id;
            $_SESSION['user_name'] = $full_name;
            $_SESSION['user_email'] = $email;
            
            echo json_encode([
                'success' => true,
                'message' => 'Account created successfully!',
                'user' => [
                    'id' => $user_id,
                    'name' => $full_name,
                    'email' => $email
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create account. Please try again.']);
        }
        
        mysqli_stmt_close($insert_stmt);
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