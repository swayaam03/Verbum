<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
echo "✅ submit-article.php is running<br>";

include 'connect.php';

// DEBUG: Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    echo "✅ Form received<br>";

    // Sanitize & assign variables
    $title = $_POST['articleTitle'] ?? '';
    $author = $_POST['articleAuthor'] ?: 'Anonymous';
    $content = $_POST['articleContent'] ?? '';

    echo "Title: $title<br>";
    echo "Author: $author<br>";
    echo "Content length: " . strlen($content) . " characters<br>";

    // Handle Image Upload
    $imageName = '';
    if (isset($_FILES['featureImage']) && $_FILES['featureImage']['error'] === 0) {
        $imageName = basename($_FILES['featureImage']['name']);
        $targetDir = "uploads/";
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true); // create folder if missing
        }

        $targetPath = $targetDir . $imageName;

        if (move_uploaded_file($_FILES['featureImage']['tmp_name'], $targetPath)) {
            echo "✅ Image uploaded: $imageName<br>";
        } else {
            echo "❌ Failed to upload image<br>";
        }
    } else {
        echo "⚠️ No image uploaded or upload failed<br>";
    }

    // Insert into DB
    $sql = "INSERT INTO articles (title, author, content, image) VALUES (?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ssss", $title, $author, $content, $imageName);
        if (mysqli_stmt_execute($stmt)) {
            echo "✅ Article saved to database!";
        } else {
            echo "❌ Database Error: " . mysqli_error($conn);
        }
    } else {
        echo "❌ Failed to prepare SQL: " . mysqli_error($conn);
    }
} else {
    echo "❌ Invalid request method.";
}
?>
