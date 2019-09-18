const express = require("serverless-express/express");
var app = express();

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const Parser = require("rss-parser");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { sortBy } = require("lodash");

const parser = new Parser();

const handlebars = require("handlebars");
const wrapXml = inp =>
  'var Template = function() { return `<?xml version="1.0" encoding="UTF-8" ?>' +
  inp +
  "`}";

const readFile = promisify(fs.readFile);

app.get("/tvos", async (req, res) => {
  const p = path.resolve("./templates/index.html");
  const contents = await readFile(p);
  const template = handlebars.compile(contents.toString());

  res.send(wrapXml(template()));
});

app.get("/live", async (req, res) => {
  const p = path.resolve("./templates/live.html");
  const contents = await readFile(p);
  const template = handlebars.compile(contents.toString());

  res.send(wrapXml(template()));
});

app.get("/items", async (req, res) => {
  const p = path.resolve("./templates/items.html");
  const contents = await readFile(p);
  const template = handlebars.compile(contents.toString());
  const baseUrl = req.query.baseUrl;
  let feed = await parser.parseURL("https://atv.be/rss");
  const items = feed.items.map(item => {
    return {
      ...item,
      url: `${baseUrl}video?uid=${item.guid.replace(
        "https://atv.be/nieuws/",
        ""
      )}&type=nieuws`
    };
  });

  res.send(wrapXml(template({ items: items })));
});

app.get("/programs", async (req, res) => {
  const p = path.resolve("./templates/programmas.html");
  const contents = await readFile(p);
  const template = handlebars.compile(contents.toString());
  const baseUrl = req.query.baseUrl;

  const r = await fetch("https://atv.be/programmas/");
  const text = await r.text();
  const $ = cheerio.load(text);
  const programs = $("article");

  let items = [];
  programs.each(function() {
    items.push({
      title: $("h1", this).text(),
      image: $("img", this).length
        ? $("img", this).attr("src")
        : $(".height300", this).length &&
          $(".height300", this).css("background")
        ? $(".height300", this)
            .css("background")
            .replace("url(", "")
            .replace(")", "")
        : false,
      url: `${baseUrl}video?uid=${$("a", this)
        .attr("href")
        .replace("/programmas/", "")}&type=programmas`
    });
  });

  const sorted = sortBy(items, "title").filter(i => (i.image ? true : false));
  res.send(wrapXml(template({ items: sorted })));
});

app.get("/video", async (req, res) => {
  const uid = req.query.uid;
  const type = req.query.type;
  const r = await fetch(`https://atv.be/${type}/${uid}`);
  const contents = await r.text();
  const results = contents.match(/videoId: \"([0-9A-z]+)\"/);
  if (results && results.length >= 2) {
    res.redirect(
      `https://media.mediahuisvideo.be/hls/account=JIJgfIEK1MQE/item=${
        results[1]
      }/${results[1]}.m3u8?v=20190917191104_5`
    );
  } else {
    res.send("404");
  }
});

module.exports = app;
