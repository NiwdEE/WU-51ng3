document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const resultBox = document.getElementById("result");
    const output = document.getElementById("output");
    resultBox.classList.add("hidden");
    output.innerText = "Santa Claus is preparing your gift... 🎅✨";

    try {
        const res = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const text = await res.text();
        
        output.innerText = text;
        resultBox.classList.remove("hidden");

    } catch (err) {
        output.innerText = "Oh no! The sleigh crashed 😢";
        resultBox.classList.remove("hidden");
    }
});
