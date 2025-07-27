session_start();
require 'db.php';

$user_id = $_SESSION['user_id']; // must be set at login
$title = $_POST['title'];
$author = $_POST['author'];
$content = $_POST['content'];
$image = $_POST['image']; // if image is optional, handle accordingly

$sql = "INSERT INTO articles (title, author, content, image, created_at, user_id)
        VALUES (?, ?, ?, ?, NOW(), ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssi", $title, $author, $content, $image, $user_id);
$stmt->execute();
