<?php
session_start();
include 'connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    echo "Form submitted!<br>";

    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM users WHERE email=?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo "User found: " . $row['email'] . "<br>";

        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            echo "Session user_id: " . $_SESSION['user_id'] . "<br>";
            echo "✅ Login successful!";
        } else {
            echo "❌ Invalid password.";
        }
    } else {
        echo "❌ No user found with this email.";
    }
}
?>
