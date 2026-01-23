<?php
    function getName($variable) {
        return implode(" ", explode("_", ucwords($variable, "_")));
    }

    if ($_SERVER['REQUEST_METHOD'] === "POST") {
        if (isset($_POST["parameters"])) {
            $template = '<div class="card-body" style="font-family: \'Georgia\', serif; line-height: 1.8; color: #111827;">';
            $template .= '<div class="text-center mb-4">
                            <h3 style="color: #dc2626; font-size: 1.75rem; font-weight: 700;">🎄 Letter to Santa Claus 🎅</h3>
                          </div>';
            $template .= '<div class="mb-3">
                            <p style="color: #111827; font-size: 1.1rem;"><strong>Dear Santa Claus,</strong></p>
                          </div>';
            
            foreach ($_POST["parameters"] as $variable) {
                if (!preg_match("/^[a-zA-Z0-9_]+$/", $variable)) {
                    continue;
                }
                $template .= '<div class="mb-2">
                                <p style="color: #111827;"><strong>' . getName($variable) . ':</strong> <span style="color: #dc2626; font-weight: 500;"><?php echo isset($' . $variable . ') ? htmlspecialchars($' . $variable . ') : \'Not provided\'; ?></span></p>
                              </div>';
            }
            
            $template .= '<div class="mt-4">
                            <p style="color: #111827;">With all my love,</p>
                            <p class="mt-3" style="color: #111827;"><strong><?php echo isset($child_name) ? htmlspecialchars($child_name) : \'A child\'; ?></strong></p>
                          </div>';
            $template .= '<div class="text-center mt-4">
                            <p style="color: #6b7280; font-size: 0.95rem;">✨ Merry Christmas! ✨</p>
                          </div>';
            $template .= '</div>';

            // Ensure templates directory exists
            if (!is_dir("templates")) {
                mkdir("templates", 0755, true);
            }

            $templatePath = "templates/" . $_SESSION["file"];
            if (file_put_contents($templatePath, $template) === false) {
                echo '<div class="alert alert-danger" role="alert">❌ Error creating letter template. Please try again.</div>';
            } else {
                echo '<div class="alert alert-success" role="alert">🎉 Letter template created successfully! You can now preview it in the "Preview My Letter" tab.</div>';
            }
        }
        else {
            echo '<div class="alert alert-danger" role="alert">❌ No fields provided! Please add at least one field to your letter.</div>';
        }
    }
    else {
?>

    <div class="form-container">
        <div class="form-header">
            <h2>✉️ Create Your Letter to Santa Template</h2>
            <p class="form-subtitle">Define the customizable fields for your letter (name, age, wished gifts, etc.)</p>
        </div>

        <div class="form-card">
            <form action="/?action=add" method="POST">
                <div class="form-section">
                    <label for="contentTemplate" class="form-label">Letter Fields</label>
                    <p class="form-hint">Add the variables you want to customize in your letter template</p>
                    <div class="example-tags">
                        <span class="tag">child_name</span>
                        <span class="tag">age</span>
                        <span class="tag">city</span>
                        <span class="tag">wished_gift</span>
                        <span class="tag">message</span>
                    </div>
                </div>

                <div class="form-section">
                    <div id="params" class="fields-container"></div>
                </div>

                <div class="form-actions">
                    <button class="btn btn-primary" id="new-var" type="button">➕ Add Field</button>
                    <button id="submit" type="submit" class="btn btn-success">💾 Create Template</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const newVarButton = document.getElementById("new-var");
        newVarButton.onclick = () => {
            var n = document.createElement("input");
            n.name = "parameters[]";
            n.type = "text";
            n.classList.add("form-control");
            n.classList.add("field-input");
            n.placeholder = "e.g., child_name, age, wished_gift...";

            document.getElementById("params").appendChild(n);
        }
    </script>

<?php } ?>