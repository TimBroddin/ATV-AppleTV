const handler = require("serverless-express/handler");
const express = require("express");
const app = require("./app");

app.use(express.static("public"));

exports.api = handler(app);
