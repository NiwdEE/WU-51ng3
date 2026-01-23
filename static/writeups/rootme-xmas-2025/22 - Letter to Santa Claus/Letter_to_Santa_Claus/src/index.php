<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

function uuid() {
    $data = random_bytes(16);

    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

session_start();

// Create templates directory if it doesn't exist
if (!is_dir("templates")) {
    mkdir("templates", 0755, true);
}

if (!isset($_SESSION["file"])) {
    $_SESSION["file"] = uuid() . ".html";
}

if (!isset($_GET["action"]) || !in_array($_GET["action"], ["add", "render"])) {
    header("Location: /?action=render");
    die();
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <?php include_once 'inc/head.html'; ?>
</head>
<body>
    <div id="main" class="container">

        <!-- Banner -->
        <?php include_once 'inc/banner.html'; ?>

        <hr>

        <!-- Navbar -->
        <?php include_once 'inc/navbar.html'; ?>

        <!-- Content -->
        <div id="content" class="p-4 border">
            <div class="container-fluid">

            <?php
                if ($_GET["action"] == "render") {
                    include "actions/render.php";
                }

                if ($_GET["action"] == "add") {
                    include "actions/add.php";
                }
            ?>
            </div>
        </div>

    </div>

    <!-- Scripts -->
    <?php include_once 'inc/scripts.html'; ?>

</body>
</html>