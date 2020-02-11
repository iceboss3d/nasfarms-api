var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var packageRouter = require("./package");
var investmentRouter = require("./invest");
var userRouter = require("./user");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/package/", packageRouter);
app.use("/invest/", investmentRouter);
app.use("/user/", userRouter);

module.exports = app;