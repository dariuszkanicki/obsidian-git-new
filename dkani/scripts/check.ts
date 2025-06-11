import { diff } from "deep-diff";

import * as path from "node:path";
import * as fs from "node:fs";
import * as readline from "readline";

// try {
//     const originPath = path.resolve("D:/Developer/Obsidian-Test/UI-GitOriginal/.obsidian/plugins/obsidian-git/data.json");
//     const newPath = path.resolve("D:/Developer/Obsidian-Test/UI-GitNew/.obsidian/plugins/obsidian-git/data.json");

//     const json1 = JSON.parse(fs.readFileSync(path.resolve(originPath), "utf-8"));
//     const json2 = JSON.parse(fs.readFileSync(path.resolve(newPath), "utf-8"));

//     const differences = diff(json1, json2);
//     console.log(differences); // array of changes
// } catch (err) {
//     console.error("Error reading or parsing JSON files:", err.message);
//     process.exit(1);
// }

type IdLineMap = Map<string, number>;
type MultiFileIdLines = Map<string, [number?, number?, number?]>;

async function extractIds(filePath: string): Promise<IdLineMap> {
    const idMap: IdLineMap = new Map();
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let lineNumber = 0;
    for await (const line of rl) {
        lineNumber++;
        const match = line.match(/"id"\s*:\s*"([^"]+)"/);
        if (match) {
            idMap.set(match[1], lineNumber);
        }
    }

    return idMap;
}

// Example usage:
const filePath = "dkani/config/settings-en.json"; // Replace with your actual file path
// extractIds(filePath).then((idMap) => {
//     for (const [id, line] of idMap) {
//         console.log(`ID: ${id} found at line: ${line}`);
//     }
// });

function mergeAndCompare(map1: IdLineMap, map2: IdLineMap, map3: IdLineMap): MultiFileIdLines {
    const allIds = new Set<string>([...map1.keys(), ...map2.keys(), ...map3.keys()]);
    const result: MultiFileIdLines = new Map();

    for (const id of allIds) {
        const lines: [number?, number?, number?] = [map1.get(id), map2.get(id), map3.get(id)];
        if (new Set(lines).size > 1) {
            result.set(id, lines);
        }
    }

    return result;
}

async function compareFiles(paths: [string, string, string]) {
    const [file1, file2, file3] = paths;
    const [map1, map2, map3] = await Promise.all([extractIds(file1), extractIds(file2), extractIds(file3)]);

    const differences = mergeAndCompare(map1, map2, map3);

    if (differences.size === 0) {
        console.log("✅ All 'id' entries are on the same lines in all files.");
    } else {
        console.log("⚠️ Mismatched line numbers for IDs:");
        for (const [id, [line1, line2, line3]] of differences) {
            console.log(`ID: "${id}" → File1: ${line1 ?? "-"} | File2: ${line2 ?? "-"} | File3: ${line3 ?? "-"}`);
        }
    }
}

const file1 = "dkani/config/settings-en.json";
const file2 = "dkani/config/settings-de.json";
const file3 = "dkani/config/settings-pl.json";

// Example usage: replace with your actual files
compareFiles([file1, file2, file3]);
