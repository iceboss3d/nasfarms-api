var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var packageRouter = require("./package");
var investmentRouter = require("./invest");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/package/", packageRouter);
app.use("/invest/", investmentRouter);

module.exports = app;