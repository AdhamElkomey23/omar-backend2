<?php
// Database configuration for Hostinger MySQL
class Database {
    // Hostinger database settings
    private $host = 'localhost';
    private $db_name = 'u179479756_newomar';
    private $username = 'u179479756_newomarapp';
    private $password = '#sS9ei3lK+';
    private $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                )
            );
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            return null;
        }
        
        return $this->conn;
    }
}
?>