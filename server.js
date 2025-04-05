const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const marked = require("marked");
const showdown = require("showdown");
const hljs = require("highlight.js");

const Marked = require("marked").Marked;
const markedHighlight = require("marked-highlight").markedHighlight;

const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

const app = express();
const PORT = 3000;
const WRITEUPS_DIR = path.join(__dirname, "writeups");


// Configuration de Multer pour l'upload
const storage = multer.diskStorage({
  destination: WRITEUPS_DIR,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Middleware

app.set("view engine", "ejs"); // Définir EJS comme moteur de rendu
app.set("views", path.join(__dirname, "views")); // Dossier des templates
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));





// Pages


// Route pour afficher la liste des writeups
app.get("/", (req, res) => {
  fs.readdir(WRITEUPS_DIR, (err, files) => {
    if (err) return res.status(500).send("Erreur lors de la lecture des writeups.");
    res.send(`
      <h1>Writeups de la team 51ng3</h1>
      <ul>
        ${files
          .map((file) => `<li><a href="/writeup/${file}">${file}</a></li>`)
          .join("")}
      </ul>
      <h2>Uploader un writeup</h2>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="writeup" accept=".md" required />
        <button type="submit">Envoyer</button>
      </form>
    `);
  });
});

// Route pour afficher un writeup
app.get("/writeup/:filename", (req, res) => {
  const filePath = path.join(WRITEUPS_DIR, req.params.filename);
  let content = fs.readFileSync(filePath, "utf-8");

  res.render("writeup", { title: req.params.filename, filename: req.params.filename, content: marked.parse(content) })
});


app.get("/team", (req, res) => {
  res.render("team");
});



// Route pour uploader un writeup
app.post("/upload", upload.single("writeup"), (req, res) => {
  res.redirect("/");
});

// Démarrer le serveur
app.listen(PORT, () => {
  if (!fs.existsSync(WRITEUPS_DIR)) fs.mkdirSync(WRITEUPS_DIR);
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
