import { diff } from "deep-diff";

import * as path from "node:path";
import * as fs from "node:fs";

try {
    const originPath = path.resolve("D:/Developer/Obsidian-Test/UI-GitOriginal/.obsidian/plugins/obsidian-git/data.json");
    const newPath = path.resolve("D:/Developer/Obsidian-Test/UI-GitNew/.obsidian/plugins/obsidian-git/data.json");

    const json1 = JSON.parse(fs.readFileSync(path.resolve(originPath), "utf-8"));
    const json2 = JSON.parse(fs.readFileSync(path.resolve(newPath), "utf-8"));

    const differences = diff(json1, json2);
    console.log(differences); // array of changes
} catch (err) {
    console.error("Error reading or parsing JSON files:", err.message);
    process.exit(1);
}
