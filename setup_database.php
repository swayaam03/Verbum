<?php
// Database setup script for XAMPP
// Run this file in your browser to set up the database

echo "<h2>Verbum Database Setup</h2>";

// Database connection
$host = "localhost";
$user = "root";
$password = "";
$dbname = "verbum";

// First, try to connect without specifying database
$conn = mysqli_connect($host, $user, $password);

if (!$conn) {
    die("❌ Database connection failed: " . mysqli_connect_error());
}

echo "✅ Connected to MySQL successfully<br>";

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if (mysqli_query($conn, $sql)) {
    echo "✅ Database '$dbname' created or already exists<br>";
} else {
    echo "❌ Error creating database: " . mysqli_error($conn) . "<br>";
}

// Select the database
mysqli_select_db($conn, $dbname);

// Create users table
$users_sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (mysqli_query($conn, $users_sql)) {
    echo "✅ Users table created successfully<br>";
} else {
    echo "❌ Error creating users table: " . mysqli_error($conn) . "<br>";
}

// Create articles table
$articles_sql = "CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_path VARCHAR(255),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if (mysqli_query($conn, $articles_sql)) {
    echo "✅ Articles table created successfully<br>";
} else {
    echo "❌ Error creating articles table: " . mysqli_error($conn) . "<br>";
}

// Create library table
$library_sql = "CREATE TABLE IF NOT EXISTS library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_article (user_id, article_id)
)";

if (mysqli_query($conn, $library_sql)) {
    echo "✅ Library table created successfully<br>";
} else {
    echo "❌ Error creating library table: " . mysqli_error($conn) . "<br>";
}

// Test the connection with the new database
$test_conn = mysqli_connect($host, $user, $password, $dbname);
if ($test_conn) {
    echo "✅ Database connection test successful<br>";
    echo "<h3>🎉 Database setup complete! Your Verbum application is ready to use.</h3>";
} else {
    echo "❌ Database connection test failed: " . mysqli_connect_error() . "<br>";
}

mysqli_close($conn);
mysqli_close($test_conn);
?> 