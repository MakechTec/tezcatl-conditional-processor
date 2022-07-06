import { ConditionalProcessor } from "../index.js";
import fs from "node:fs";

let processor = new ConditionalProcessor();

let text = fs.readFileSync("./test/templates/default/jscomponent.tzl", "utf8");

let newText = processor.parse(text);

console.log(newText);
