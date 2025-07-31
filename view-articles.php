<?php
include 'connect.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>All Articles - Verbum</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
  <style>
    .image-container {
      height: 220px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .article-card-image {
      height: 100%;
      width: auto;
      object-fit: cover;
      object-position: center center;
      display: block;
    }
  </style>
</head>
<body class="articles-page-body">

  <header class="minimal-header">
    <div class="header-top container">
      <div class="logo"><h1>Verbum</h1></div>
      <nav class="main-nav">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="create-article.html">Create Article</a></li>
          <li><a href="profile.html">Profile</a></li>
        </ul>
      </nav>
      <button class="menu-toggle" aria-label="Toggle navigation">&#9776;</button>
    </div>
  </header>

  <main class="articles-main-content">
    <div class="container">
      <h2 class="articles-page-heading">All Articles</h2>

      <div class="articles-grid">
        <?php
        $query = "SELECT * FROM articles ORDER BY created_at DESC";
        $result = mysqli_query($conn, $query);

        if (mysqli_num_rows($result) > 0) {
          while ($row = mysqli_fetch_assoc($result)) {
            $title = htmlspecialchars($row['title']);
            $author = htmlspecialchars($row['author'] ?: 'Anonymous');
            $contentPreview = htmlspecialchars(mb_substr($row['content'], 0, 150)) . '...';
            $date = date("F j, Y", strtotime($row['created_at']));
            $image = $row['image_path'] ? "uploads/" . $row['image_path'] : "https://via.placeholder.com/600x400/F5F0EB/8B8B8B?text=No+Image";

            echo "
              <article class='article-card'>
                <div class='image-container'>
                  <img src='$image' alt='Article Image' class='article-card-image'>
                </div>
                <div class='article-card-content'>
                  <h3 class='article-card-title'>$title</h3>
                  <p class='article-card-author'>By $author</p>
                  <p class='article-card-preview'>$contentPreview</p>
                  <p class='article-card-date'>$date</p>
                </div>
              </article>
            ";
          }
        } else {
          echo "<p>No articles found.</p>";
        }
        ?>
      </div>
    </div>
  </main>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const menuToggle = document.querySelector('.menu-toggle');
      const mainNav = document.querySelector('.main-nav');
      if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
          mainNav.classList.toggle('active');
        });
      }
    });
  </script>

</body>
</html>
