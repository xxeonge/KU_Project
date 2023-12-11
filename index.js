import express from "express";
const server = express();
import path from "path";

//__dirname 선언
const __dirname = path.resolve();

server.use(express.static(`${__dirname}/public`));

server.get("/", (req, res) => {
  res.sendFile(`${__dirname}/view/index.html`);
});

server.get("/join", (req, res) => {
  res.sendFile(`${__dirname}/view/join.html`);
});

server.get("/service", (req, res) => {
  res.sendFile(`${__dirname}/view/service.html`);
});

server.listen(3000, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 3000");
});
