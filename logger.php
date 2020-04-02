<?php
$url = $_POST["url"];
$city = $_POST["city"];
$ip = $_SERVER['REMOTE_ADDR'];
$id_client = 0;

$username = "root";
$password = "root";
$db_name = "weather";
$conn = new mysqli("localhost", $username, $password, $db_name);
//Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
//Check if client IP known
$sql = "SELECT id FROM client WHERE ip='$ip'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $id_client = $row["id"];
}
else{
    //Insert new client
    $sql = "INSERT INTO client (ip) VALUES ('$ip')";
    if ($conn->query($sql) === TRUE) {
        $id_client = $conn->insert_id;
    }
    else {
        die("Error: " . $sql . "<br>" . $conn->error);
    }
}
$sql = "INSERT INTO request (id_client, url, city) VALUES ($id_client, '$url', '$city')";
    if ($conn->query($sql) === TRUE) {
        die("logged");
    }
    else {
        die("Error: " . $sql . "<br>" . $conn->error);
    }

$conn->close();
?>