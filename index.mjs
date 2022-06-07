import { Processor } from "./src/Processor.mjs";
import fs from "node:fs";

let processor = new Processor();

let text = fs.readFileSync("./templates/default/jscomponent.temp", "utf8");

processor.parse(text);
