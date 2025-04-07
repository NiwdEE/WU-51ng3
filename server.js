const express = require("express");
const fs = require("fs");
const path = require("path");
const hljs = require("highlight.js");
const mime = require("mime-types");

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


const WRITEUPS = require("./writeups.json");

// Middlewares

app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "views")); 
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.locals = {
        path: req.path
    };

    next();
});



// Pages


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/writeups", (req, res) => {
    res.render("writeups", { writeups: WRITEUPS });
});


app.get("/writeups/:path", (req, res) => {
    let writeup = WRITEUPS.find(writeup => writeup.path === req.params.path);
    if (!writeup) return res.status(404).send("Writeup non trouvé.");

    let breadcrumbs = [];
    breadcrumbs.push({ name: "Home", path: "/" });
    breadcrumbs.push({ name: "Writeups", path: "/writeups" });
    breadcrumbs.push({ name: writeup.name, path: `/writeups/${writeup.path}` });

    let preview = req.query.preview;
    if (!preview){
        let mdPath = path.join(__dirname, '/static/writeups', writeup.path, writeup.root);

        let content = fs.readFileSync(mdPath, "utf-8");

        return res.render("writeup", { writeup, content: marked.parse(content), breadcrumbs});
    }

    breadcrumbs.push({ name: preview, path: `/writeups/${writeup.path}?preview=${preview}` });

    let previewPath = path.join(__dirname, '/static/writeups', writeup.path, preview);

    let mimeType = mime.lookup(previewPath);

    let view_params = {
        breadcrumbs,
        writeup,
        type: undefined,
        content: null,
        filename: preview
    }

    if(preview.includes("..")){
        view_params.type = "alert";
    } else if(!fs.existsSync(previewPath)){
        view_params.type = "notfound";
    }else if(!mimeType){
        view_params.type = "unknown";
        view_params.content = fs.readFileSync(previewPath, "utf-8");
    } else if(mimeType.startsWith("image/")) {
        view_params.type = "image";
        view_params.content = preview;
    } else if(mimeType === "text/markdown") {
        let content = fs.readFileSync(previewPath, "utf-8");
        view_params.content = marked.parse(content);
        view_params.type = "render";
    } else if(mimeType.startsWith("text/") || mimeType.startsWith("application/")) {
        view_params.type = "render";
        let content = fs.readFileSync(previewPath, "utf-8");
        let ext = mimeType.split("/")[1];
        view_params.content = marked.parse("```"+ext+"\n"+content+"\n```");
    } 

    res.render("file_preview", view_params);
});


app.get("/team", (req, res) => {
    res.render("team");
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
