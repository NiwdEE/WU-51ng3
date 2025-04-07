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

const WRITEUPS = require("./writeups.json");

// Middleware

app.set("view engine", "ejs"); // Définir EJS comme moteur de rendu
app.set("views", path.join(__dirname, "views")); // Dossier des templates
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.locals = {
        path: req.path
    };

    next();
});



// Pages


// Route pour afficher la liste des writeups
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/writeups", (req, res) => {
    res.render("writeups", { writeups: WRITEUPS });
});


app.get("/writeups/:path", (req, res) => {

    let writeup = WRITEUPS.find(writeup => writeup.path === req.params.path);
    if (!writeup) return res.status(404).send("Writeup non trouvé.");

    let mdPath = path.join(__dirname, '/static/writeups', writeup.path, writeup.root);

    let content = fs.readFileSync(mdPath, "utf-8");

    let breadcrumbs = [];
    breadcrumbs.push({ name: "51ng3", path: "/" });
    breadcrumbs.push({ name: "Writeups", path: "/writeups" });
    breadcrumbs.push({ name: writeup.name, path: `/writeups/${writeup.path}` });

    res.render("writeup", { writeup, content: marked.parse(content), breadcrumbs});
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
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
