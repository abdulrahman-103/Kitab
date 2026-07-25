import { htmlToOdt } from "./odt.js";
import { readFileSync, writeFileSync } from "fs";
const outputFilename = process.argv[2];
const html = readFileSync(0, "utf-8");
const odt_data = await htmlToOdt(html);
writeFileSync(outputFilename, odt_data);