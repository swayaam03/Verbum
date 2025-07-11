<?php
session_start();
include 'connect.php';

if (!isset($_SESSION['user_id'])) { die("⚠️ Not logged in"); }

$user_id    = $_SESSION['user_id'];
$article_id = intval($_GET['article_id']);        // e.g. save-to-library.php?article_id=12

/*  Try to insert first; if it exists, silently ignore  */
$sql = "INSERT IGNORE INTO library (user_id, article_id) VALUES (?, ?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ii", $user_id, $article_id);
mysqli_stmt_execute($stmt);

/* Redirect back to where the user came from */
header("Location: " . $_SERVER['HTTP_REFERER']);
exit();
?>
