<?php
include 'connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = $_POST['full-name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sss", $full_name, $email, $password);
    
    if (mysqli_stmt_execute($stmt)) {
        echo "Signup successful!";
    } else {
        echo "Signup failed: " . mysqli_error($conn);
    }
}
?>
