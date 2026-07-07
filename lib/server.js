// Zero Dependencies Node.js HTTP Server for running static on localhost
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('cwd', __dirname);

const index = fs.readFileSync(
    path.resolve(__dirname, "../index.html"),
    "utf8"
);

const favicon = fs.readFileSync(path.join(__dirname, "favicon.ico"));

const app = fs.readFileSync(path.join(__dirname, "todo-app.js"));
const elmish = fs.readFileSync(path.join(__dirname, "elmish.js"));
const auth = fs.readFileSync(path.join(__dirname, "auth.js"));

const appcss = fs.readFileSync(path.join(__dirname, "todomvc-app.css"));
const basecss = fs.readFileSync(path.join(__dirname, "todomvc-common-base.css"));

http.createServer((req, res) => {
  console.log("URL:", req.url);
  if (req.url.includes("favicon")) {
        res.writeHead(200, { "Content-Type": "image/x-icon" });
        return res.end(favicon);
    }

    if (req.url.endsWith(".js")) {
        res.writeHead(200, { "Content-Type": "application/javascript" });

        if (req.url.includes("elmish")) {
            return res.end(elmish);
        }

        if (req.url.includes("auth")) {
            return res.end(auth);
        }

        return res.end(app);
    }

    if (req.url.endsWith(".css")) {
        res.writeHead(200, { "Content-Type": "text/css" });

        if (req.url.includes("base")) {
            return res.end(basecss);
        }

        return res.end(appcss);
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(index);

}).listen(process.env.PORT || 8000, () => {
    console.log("Server started: http://localhost:8000");
});