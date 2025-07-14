<?php
session_start();
include 'connect.php';
if (!isset($_SESSION['user_id'])) { die("Please log in."); }
$user_id = $_SESSION['user_id'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>My Library – Verbum</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body class="articles-page-body">
<header class="minimal-header">
  <div class="header-top container"><div class="logo"><h1>Library</h1></div></div>
</header>

<main class="articles-main-content">
  <div class="container">
    <h2 class="articles-page-heading">Saved Articles</h2>
    <div class="articles-grid">
<?php
$q="SELECT * FROM saved_news WHERE user_id=$user_id ORDER BY saved_at DESC";
$res=mysqli_query($conn,$q);
if(mysqli_num_rows($res)==0){ echo "<p>You haven’t saved anything yet.</p>"; }
while($row=mysqli_fetch_assoc($res)){
  $img=$row['image'] ?: 'https://via.placeholder.com/400x200?text=No+Image';
  $title=htmlspecialchars($row['title']);
  $url  =htmlspecialchars($row['url']);
  echo "
    <article class='article-card'>
      <img src='$img' class='article-image' alt='image'>
      <div class='article-content'>
        <h3 class='article-title'><a href='$url' target='_blank'>$title</a></h3>
        <p class='article-source-date'>{$row['source']} • ".date('M j, Y',strtotime($row['published_at']))."</p>
        <p class='article-description'>".htmlspecialchars($row['description']??'')."</p>
      </div>
    </article>
  ";
}
?>
    </div>
  </div>
</main>
</body>
</html>
