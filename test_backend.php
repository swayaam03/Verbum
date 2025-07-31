<?php
// Test script to verify backend functionality
session_start();
include 'connect.php';

echo "<h2>Verbum Backend Test</h2>";

// Test 1: Database Connection
echo "<h3>1. Database Connection Test</h3>";
if ($conn) {
    echo "✅ Database connection successful<br>";
} else {
    echo "❌ Database connection failed<br>";
    exit;
}

// Test 2: Check if tables exist
echo "<h3>2. Database Tables Test</h3>";
$tables = ['users', 'articles', 'library'];
foreach ($tables as $table) {
    $result = mysqli_query($conn, "SHOW TABLES LIKE '$table'");
    if (mysqli_num_rows($result) > 0) {
        echo "✅ Table '$table' exists<br>";
    } else {
        echo "❌ Table '$table' does not exist<br>";
    }
}

// Test 3: Session functionality
echo "<h3>3. Session Test</h3>";
if (session_status() === PHP_SESSION_ACTIVE) {
    echo "✅ Sessions are working<br>";
} else {
    echo "❌ Sessions are not working<br>";
}

// Test 4: File upload directory
echo "<h3>4. Upload Directory Test</h3>";
$upload_dir = "uploads/";
if (is_dir($upload_dir)) {
    echo "✅ Upload directory exists<br>";
} else {
    if (mkdir($upload_dir, 0777, true)) {
        echo "✅ Upload directory created<br>";
    } else {
        echo "❌ Failed to create upload directory<br>";
    }
}

// Test 5: Test user creation (simulate signup)
echo "<h3>5. User Creation Test</h3>";
$test_email = "test_" . time() . "@example.com";
$test_password = password_hash("test123", PASSWORD_DEFAULT);
$test_name = "Test User";

$sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "sss", $test_name, $test_email, $test_password);
    if (mysqli_stmt_execute($stmt)) {
        $user_id = mysqli_insert_id($conn);
        echo "✅ Test user created successfully (ID: $user_id)<br>";
        
        // Test 6: Test article creation
        echo "<h3>6. Article Creation Test</h3>";
        $article_sql = "INSERT INTO articles (title, author, content, user_id) VALUES (?, ?, ?, ?)";
        $article_stmt = mysqli_prepare($conn, $article_sql);
        
        if ($article_stmt) {
            $title = "Test Article";
            $author = "Test Author";
            $content = "This is a test article content.";
            
            mysqli_stmt_bind_param($article_stmt, "sssi", $title, $author, $content, $user_id);
            if (mysqli_stmt_execute($article_stmt)) {
                $article_id = mysqli_insert_id($conn);
                echo "✅ Test article created successfully (ID: $article_id)<br>";
                
                // Test 7: Test article fetching
                echo "<h3>7. Article Fetching Test</h3>";
                $fetch_sql = "SELECT * FROM articles WHERE user_id = ?";
                $fetch_stmt = mysqli_prepare($conn, $fetch_sql);
                
                if ($fetch_stmt) {
                    mysqli_stmt_bind_param($fetch_stmt, "i", $user_id);
                    mysqli_stmt_execute($fetch_stmt);
                    $result = mysqli_stmt_get_result($fetch_stmt);
                    
                    if (mysqli_num_rows($result) > 0) {
                        echo "✅ Article fetching works correctly<br>";
                    } else {
                        echo "❌ Article fetching failed<br>";
                    }
                    mysqli_stmt_close($fetch_stmt);
                }
            } else {
                echo "❌ Article creation failed<br>";
            }
            mysqli_stmt_close($article_stmt);
        }
        
        // Clean up test data
        mysqli_query($conn, "DELETE FROM articles WHERE user_id = $user_id");
        mysqli_query($conn, "DELETE FROM users WHERE id = $user_id");
        echo "🧹 Test data cleaned up<br>";
        
    } else {
        echo "❌ Test user creation failed<br>";
    }
    mysqli_stmt_close($stmt);
} else {
    echo "❌ Failed to prepare user creation statement<br>";
}

echo "<h3>🎉 Backend test complete!</h3>";
echo "<p>If all tests passed, your backend is working correctly with XAMPP.</p>";
?> 