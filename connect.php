<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "verbum";

$conn = mysqli_connect($host, $user, $password, $dbname);

if (!$conn) {
    die("❌ DB Connection failed: " . mysqli_connect_error());
}
?>
