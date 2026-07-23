import { odtToHtml } from "./reader.js";
import { readFileSync } from "fs";
const inputFilename = process.argv[2];
const bytes = new Uint8Array(readFileSync(inputFilename));
const html = odtToHtml(bytes);
process.stdout.write(html);