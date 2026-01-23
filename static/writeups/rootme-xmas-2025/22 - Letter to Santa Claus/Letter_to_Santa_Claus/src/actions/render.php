<?php
    if (!file_exists("templates/" . $_SESSION["file"])) {
        echo '<div class="alert alert-warning" role="alert">
                <h4>📝 No Letter Created</h4>
                <p>You haven\'t created a letter template yet. Go to the "Create Letter Template" tab to get started!</p>
              </div>';
    }
    else {
        if (isset($_GET)) {
            echo '<div class="mb-4">';
            echo '<h2>📖 Preview Your Letter to Santa</h2>';
            echo '<p class="text-muted">Customize your letter values by adding parameters to the URL (e.g., ?child_name=Alice&age=8&wished_gift=a+doll)</p>';
            echo '</div>';
            echo '<div class="card shadow-sm" style="max-width: 800px; margin: 0 auto;">';

            extract($_GET);
            include "templates/" . $_SESSION["file"];
            
            echo '</div>';
        }
        else { ?>
            <div class="alert alert-info" role="alert">
              <h4>ℹ️ Customize Your Letter</h4>
              <p>Add parameters to the URL to customize your letter values.</p>
              <p class="mb-0"><small>Example: <code>/?action=render&child_name=Alice&age=8&wished_gift=a+doll</code></small></p>
            </div>
        <?php }

    }
?>