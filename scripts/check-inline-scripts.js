const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const file = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(file, "utf8");
const scriptTag = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const executableType = /^(?:module|text\/javascript|application\/javascript|text\/ecmascript|application\/ecmascript)?$/i;
let checked = 0;
let match;

while ((match = scriptTag.exec(html))) {
  const attributes = match[1];
  if (/(?:^|\s)src\s*=/i.test(attributes)) continue;

  const type = attributes.match(/(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const scriptType = type ? (type[1] || type[2] || type[3] || "").split(";", 1)[0].trim() : "";
  if (!executableType.test(scriptType)) continue;

  const body = match[2];
  if (!body.trim()) continue;

  const lineOffset = html.slice(0, match.index + match[0].indexOf(body)).split("\n").length - 1;
  try {
    new vm.Script(body, { filename: path.basename(file), lineOffset });
    checked++;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
    break;
  }
}

if (process.exitCode !== 1) {
  process.stdout.write(`Validated ${checked} inline script${checked === 1 ? "" : "s"} in index.html.\n`);
}
