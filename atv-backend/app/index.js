const express = require("serverless-express/express");
var app = express();

const fs = require("fs");
const path = require("path");
const {
  promisify
} = require("util");
const Parser = require("rss-parser");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const {
  sortBy
} = require("lodash");
const {
  request,
  gql
} = require("graphql-request");

const parser = new Parser();

const handlebars = require("handlebars");
const wrapXml = (inp) =>
  'var Template = function() { return `<?xml version="1.0" encoding="UTF-8" ?>' +
  inp +
  "`}";

const readFile = promisify(fs.readFile);



const itemsQuery = gql `
    fragment article on Article {
        id
        articleBrand: brand
        articleType: type
        subTitle: subtitle
        subLabel: sublabel
        teaserTitle
        teaserIntro
        title
        webcms {
            id
            relativeUrl
        }
        intro
        videos
        type
        publishedAt: published_at
        premium
        keywords {
            name
        }
        sections {
            webcmsId
            name
            subsections {
                name
            }
            sequence
            brand
            type
        }

        images {
            url
            id
            xsmall: smartCrop(width: 120, height: 80) {
                url
                height
                width
            }
            small: smartCrop(width: 160, height: 107) {
                url
                height
                width
            }
            smallMobile: smartCrop(width: 240, height: 160) {
                url
                height
                width
            }
            medium: smartCrop(width: 320, height: 213) {
                url
                height
                width
            }
            large: smartCrop(width: 640, height: 427) {
                url
                height
                width
            }
            xlarge: smartCrop(width: 960, height: 640) {
                url
                height
                width
            }
            xxlarge: smartCrop(width: 1280, height: 853) {
                url
                height
                width
            }
            xsmall_cropped: cropped(
                width: 120
                height: 80
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
            small_cropped: cropped(
                width: 160
                height: 107
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
            smallMobile_cropped: cropped(
                width: 240
                height: 160
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
            medium_cropped: cropped(
                width: 320
                height: 213
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
            large_cropped: cropped(
                width: 640
                height: 427
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
            xlarge_cropped: cropped(
                width: 960
                height: 640
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
            xxlarge_cropped: cropped(
                width: 1280
                height: 853
                resizeMode: $resizeMode
            ) {
                url
                height
                width
            }
        }

        desking @include(if: $includeDesking) {
            teaserTitle
            teaserImage {
                url
                xsmall: smartCrop(width: 120, height: 80) {
                    url
                    height
                    width
                }
                small: smartCrop(width: 160, height: 107) {
                    url
                    height
                    width
                }
                smallMobile: smartCrop(width: 240, height: 160) {
                    url
                    height
                    width
                }
                medium: smartCrop(width: 320, height: 213) {
                    url
                    height
                    width
                }
                large: smartCrop(width: 640, height: 427) {
                    url
                    height
                    width
                }
                xlarge: smartCrop(width: 960, height: 640) {
                    url
                    height
                    width
                }
                xxlarge: smartCrop(width: 1280, height: 853) {
                    url
                    height
                    width
                }
            }
            label: teaserCategory
        }
    }
    query webv2_Articles_gva_3_2(
        $skip: Int
        $type: String
        $brand: String!
        $count: Int!
        $keyword_ids: String
        $keywords: String
        $ordering: String
        $sections: String!
        $premium: Boolean
        $includeDesking: Boolean!
        $after: String
        $usePagination: Boolean!
        $resizeMode: ResizeMode
        $excludedArticles: String
    ) {
        articles(
            type: $type
            brand: $brand
            skip: $skip
            count: $count
            keyword_ids: $keyword_ids
            keywords: $keywords
            ordering: $ordering
            sections: $sections
            premium: $premium
            external_ids: [["!webcms", $excludedArticles]]
        ) @skip(if: $usePagination) {
            ...article
        }
        articlesConnection(
            type: $type
            brand: $brand
            first: $count
            after: $after
            skip: $skip
            keyword_ids: $keyword_ids
            keywords: $keywords
            ordering: $ordering
            sections: $sections
            premium: $premium
            external_ids: [["!webcms", $excludedArticles]]
        ) @include(if: $usePagination) {
            pageInfo {
                endCursor
                hasNextPage
            }
            edges {
                node {
                    ...article
                }
            }
        }
    }
`;


const getItems = async (count = 50) => {
  const data = await request("https://graphql.gva.be/graphql", itemsQuery, {
    skip: 0,
    brand: "gva.be",
    count: 50,
    keyword_ids: "f981eb4e-9a80-42f3-b6df-7d1ee1bd8ca6",
    sections: "",
    ordering: null,
    includeDesking: false,
    type: "video",
    usePagination: true,
    resizeMode: "SmartCrop",
  });

  const items = data.articlesConnection?.edges.map((item) => ({
    _id: item.node.id,
    title: item.node.title,
    description: item.node.intro[0]?.p,
    image: item.node.images[0]?.url,
    url: `https://redir-tmg.samgcloud.nepworldwide.nl/provider/tmg/platform/JIJgfIEK1MQE/profile/hls/stream/${item.node.videos[0]?.streamone.id}`,
  }));
  return items;
}

app.get("/tvos", async (req, res) => {
  const p = path.resolve("./templates/index.html");
  const contents = await readFile(p);
  const template = handlebars.compile(contents.toString());

  res.send(wrapXml(template()));
});

app.get("/topshelf", async (req, res) => {
  console.log("Request for topshelf");
  const items = await getItems(5);


  res.json({
    items: items.slice(0, 5)
  });
});

app.get("/live", async (req, res) => {
  const p = path.resolve("./templates/live.html");
  const contents = await readFile(p);

  const template = handlebars.compile(contents.toString());

  res.send(wrapXml(template({
    url: 'https://live.zendzend.com/streams/29375_107244/playlist.m3u8'
  })));
});

app.get("/items", async (req, res) => {
  const p = path.resolve("./templates/items.html");
  const contents = await readFile(p);
  const template = handlebars.compile(contents.toString());
  const baseUrl = req.query.baseUrl;
  const items = await getItems();

  res.send(wrapXml(template({
    items: items
  })));
});

module.exports = app;