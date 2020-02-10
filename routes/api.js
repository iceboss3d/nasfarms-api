var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var packageRouter = require("./package");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/package/", packageRouter);

module.exports = app;