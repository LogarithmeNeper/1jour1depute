const got = require("got");
const {Window} = require("happy-dom");
const fs = require("fs");

async function fetchHtml(url) {
  const response = await got(url);
  return response.body;
}

function parseHtml(html) {
  const window = new Window();
  window.document.body.innerHTML = html
  return window.document;
}

function extractIds(document) {
  const regex = /\(num_dept\)\/(\d+)$/
  return [...document.querySelectorAll('table a')]
  .map(anchor => anchor.getAttribute('href').match(regex))
  .filter(x => x != null)
  .map(match => match[1]);
}

function generateUrls(increment=500, nbMax=33) {
  const offsets = Array.from({length: nbMax}, (_, i) => 500*i);
  const urls = offsets.map(offset => `https://www2.assemblee-nationale.fr/sycomore/resultats/(offset)/${offset}/`);
  return urls;
}

async function main() {
  const urls = generateUrls();
  const promises = urls.map(url => 
    fetchHtml(url)
    .then(parseHtml)
    .then(extractIds)
  )
  const results = await Promise.all(promises);
  return Array.prototype.concat([], ...results);
}

main().then(ids => {
  fs.writeFile("./ids.json", JSON.stringify(ids), () => console.log("OK!"))
});