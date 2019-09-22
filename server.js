const express = require("express");
const socketIo = require("socket.io");
const getVideoId = require("get-video-id");

const app = express();

// Middleware

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded());

app.set("view engine", "ejs");

const server = app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

//io

const io = socketIo(server);

//handle input

var url;

app.get("/", (req, res) => {
  if (url == undefined || url == false) {
    res.render("pages/index");
  } else {
    res.redirect("/player");
  }
});

app.post("/input", (req, res) => {
  url = getVideoId(req.body.urlInput).id;
  io.sockets.emit("input", url);
  res.redirect("/player");
});

app.get("/player", (req, res) => {
  if (url == undefined || url == false) {
    res.render("pages/index");
  } else {
    res.render("pages/watch", { url: url });
  }
});

app.get("/back", (req, res) => {
  url = undefined;
  io.sockets.emit("goBack");
  res.redirect("/");
});

//io

io.on("connection", socket => {
  console.log("Connected...");
  socket.on("play", () => {
    socket.broadcast.emit("play");
  });
  socket.on("pause", () => {
    socket.broadcast.emit("pause");
  });
  socket.on("slider", currentTime => {
    socket.broadcast.emit("slider", currentTime);
  });
  socket.on("update", time => {
    socket.broadcast.emit("update", time);
  });
});
