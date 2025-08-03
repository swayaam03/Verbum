<?php
header('Content-Type: application/json');

try {
    include 'connect.php';
    
    if ($conn) {
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'database' => 'verbum'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Exception: ' . $e->getMessage()
    ]);
}
?> 