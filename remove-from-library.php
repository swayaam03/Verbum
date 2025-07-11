<?php
session_start();
include 'connect.php';

if (!isset($_SESSION['user_id'])) { die("⚠️ Not logged in"); }

$user_id    = $_SESSION['user_id'];
$article_id = intval($_GET['article_id']);        // remove-from-library.php?article_id=12

$sql = "DELETE FROM library WHERE user_id=? AND article_id=?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ii", $user_id, $article_id);
mysqli_stmt_execute($stmt);

header("Location: " . $_SERVER['HTTP_REFERER']);
exit();
?>
