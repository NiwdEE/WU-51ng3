import express from "express";
import rateLimit from "express-rate-limit";

import { visit, challenge } from "./conf.js";

const app = express();

app.use(express.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", {
    name: challenge.name,
    appUrl: challenge.appUrl,
  });
});

app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: challenge.rateLimit,
  })
);

app.post("/api/report", async (req, res) => {
  const { url } = req.body;
  if (
    typeof url !== "string" ||
    (!url.startsWith(`${challenge.appUrl}view_card?data=`))
  ) {
    return res.status(400).send("Invalid url");
  }

  try {
    await visit(url);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong");
  }
});

app.listen(80);
