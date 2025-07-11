<?php
session_start();
include 'connect.php';

if (!isset($_SESSION['user_id'])) { die("⚠️ Please log in to view your library."); }
$user_id = $_SESSION['user_id'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Library – Verbum</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    /* you can keep these in style.css, shown inline for clarity */
    .remove-btn { text-decoration:none;color:#a00;font-size:.9em; }
    .remove-btn:hover{ text-decoration:underline; }
  </style>
</head>

<body class="articles-page-body">
  <!-- ✅ reuse your existing minimalist header -->
  <header class="minimal-header">
    <div class="header-top container">
      <div class="logo"><h1>My Library</h1></div>
      <nav class="main-nav">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="create-article.html">Create</a></li>
          <li><a href="view-articles.php">Explore</a></li>
          <li><a href="library.php" class="active">Library</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="articles-main-content">
    <div class="container">
      <h2 class="articles-page-heading">Saved Articles</h2>

      <div class="articles-grid">
<?php
$sql = "
  SELECT a.*
  FROM articles a
  JOIN library  l ON l.article_id = a.id
  WHERE l.user_id = ?
  ORDER BY l.saved_at DESC
";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo "<p>You haven’t saved any articles yet.</p>";
}

while ($row = mysqli_fetch_assoc($result)) {
    $id      = $row['id'];
    $title   = htmlspecialchars($row['title']);
    $author  = htmlspecialchars($row['author'] ?: 'Anonymous');
    $preview = htmlspecialchars(mb_substr($row['content'],0,150)) . '…';
    $date    = date("F j, Y", strtotime($row['created_at']));
    $image   = $row['image'] ? "uploads/".$row['image']
                             : "https://via.placeholder.com/600x400/F6F1EB/8B8B8B?text=No+Image";

    echo "
      <article class='article-card'>
        <div class='image-container'>
          <img src='$image' class='article-card-image' alt='Image'>
        </div>
        <div class='article-card-content'>
          <h3 class='article-card-title'>$title</h3>
          <p class='article-card-author'>By $author</p>
          <p class='article-card-preview'>$preview</p>
          <p class='article-card-date'>$date</p>
          <p><a class='remove-btn' href='remove-from-library.php?article_id=$id'>&times; Remove</a></p>
        </div>
      </article>
    ";
}
?>
      </div>
    </div>
  </main>

  <script>
    /* keep your menu-toggle JS if used elsewhere */
  </script>
</body>
</html>
