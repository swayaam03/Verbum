<?php
session_start();
include 'connect.php';

session_start();
echo "Session ID: " . session_id() . "<br>";
echo "Session user_id: " . ($_SESSION['user_id'] ?? 'NOT SET') . "<br>";

if (!isset($_SESSION['user_id'])) {
    die("Not logged in.");
}

$user_id = $_SESSION['user_id'];
$full_name = trim($_POST['full_name']);
$email = trim($_POST['email']);
$new_password = $_POST['new_password'];
$confirm_password = $_POST['confirm_password'];

// Input sanitization (basic)
$full_name = mysqli_real_escape_string($conn, $full_name);
$email = mysqli_real_escape_string($conn, $email);

// Validate required fields
if (empty($full_name) || empty($email)) {
    die("Full name and email are required.");
}

// Build the SQL query
$update_query = "UPDATE users SET full_name='$full_name', email='$email'";

// If password is being changed
if (!empty($new_password)) {
    if ($new_password !== $confirm_password) {
        die("Passwords do not match.");
    }

    // Hash the password securely
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $update_query .= ", password='$hashed_password'";
}

$update_query .= " WHERE id=$user_id";

if (mysqli_query($conn, $update_query)) {
    echo "✅ Settings updated successfully.";
} else {
    echo "❌ Error updating settings: " . mysqli_error($conn);
}
?>
