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
    req.metadata = {};

    res.locals = {
        path: req.path
    };

    next();
});

app.use("/writeups/:path", (req, res, next)=>{
    req.metadata.writeup = WRITEUPS.find(writeup => writeup.path === req.params.path);
    if (!req.metadata.writeup) return res.status(404).send("Writeup non trouvé.");

    res.locals.breadcrumbs = [];
    res.locals.breadcrumbs.push({ name: "Home", path: "/" });
    res.locals.breadcrumbs.push({ name: "Writeups", path: "/writeups" });

    let path = req.path.split('/').filter(x=>x!='').reverse();
    res.locals.breadcrumbs.push({ name: req.metadata.writeup.name, path: `/writeups/${req.metadata.writeup.path}` });

    if(!path.length) return next();
    let action = path.pop();
    let file = req.query.file
    if(file)
        res.locals.breadcrumbs.push({ name: `${file} (${action})`, path: `/writeups/${req.metadata.writeup.path}/${action}` + file?`?file=${file}`:''})

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
    let mdPath = path.join(__dirname, '/static/writeups', req.metadata.writeup.path, req.metadata.writeup.root);

    let content = fs.readFileSync(mdPath, "utf-8");

    return res.render("writeup", { writeup: req.metadata.writeup, content: marked.parse(content)});
});

app.get("/writeups/:path/preview", (req, res) => {
    let file = req.query.file

    let previewPath = path.join(__dirname, '/static/writeups', req.metadata.writeup.path, file);

    let mimeType = mime.lookup(previewPath);

    let view_params = {
        writeup: req.metadata.writeup,
        type: undefined,
        content: null,
        filename: file
    }

    let mimeAppRender = [
        "application/json",
        "application/xml",
        "application/javascript",
        "application/typescript",
        "application/xhtml+xml"
    ]

    if(file.includes("..")){
        view_params.type = "alert";
    } else if(!fs.existsSync(previewPath)){
        view_params.type = "notfound";
    }else if(!mimeType){
        view_params.type = "unknown";
        view_params.content = fs.readFileSync(previewPath, "utf-8");
    } else if(mimeType.startsWith("image/")) {
        view_params.type = "image";
        view_params.content = file;
    } else if(mimeType === "text/markdown") {
        let content = fs.readFileSync(previewPath, "utf-8");
        view_params.content = marked.parse(content);
        view_params.type = "render";
    } else if(mimeType.startsWith("text/") || mimeAppRender.includes(mimeType)) {
        view_params.type = "render";
        let content = fs.readFileSync(previewPath, "utf-8");
        let ext = mimeType.split("/")[1];
        view_params.content = marked.parse("```"+ext+"\n"+content+"\n```");
    } else if (mimeType == "application/pdf"){
        let stream = fs.createReadStream(previewPath);
        res.setHeader("Content-disposition", `inline; filename="${previewPath.split('/').at(-1)}"`);
        res.setHeader("Content-type", "application/pdf");
        stream.pipe(res);
        return;
    } else {
        view_params.type = "unable";
    }

    res.render("file_preview", view_params);
});


app.get("/writeups/:path/download", (req, res) => {
    let file = req.query.file
    let filePath = path.join(__dirname, '/static/writeups', req.metadata.writeup.path, file);
    res.download(filePath)
})


app.get("/team", (req, res) => {
    res.render("team");
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
