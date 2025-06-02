import * as fs from "node:fs";
import * as path from "node:path";
import { rmSync, mkdirSync, readFile } from "fs";
import { cp, copyFile } from "fs/promises";

interface Config {
    testVault: string;
}

function _loadConfig(): Config {
    const data = fs.readFileSync("src/dkani/test/config.json", "utf8");
    return JSON.parse(data) as Config;
}

export async function deploy() {
    const { testVault } = _loadConfig();
    const pluginDir = `${testVault}/.obsidian/plugins/obsidian-git`;

    mkdirSync("dist", { recursive: true });

    const assets = [
        ["main.js", "dist/main.js"],
        ["manifest.json", "dist/manifest.json"],
        ["styles.css", "dist/styles.css"],
    ];
    assets.push(["dkani/config/obsidian_askpass.sh", "dist/obsidian_askpass.sh"]);
    assets.push(["dkani/config/data.json", "dist/data.json"]);
    assets.push(["dkani/config/settings-en.json", "dist/settings-en.json"]);
    assets.push(["dkani/config/settings-de.json", "dist/settings-de.json"]);
    assets.push(["dkani/config/settings-pl.json", "dist/settings-pl.json"]);

    await Promise.all(assets.map(([src, dest]) => copyFile(src, dest)));

    rmSync(pluginDir, { recursive: true, force: true });
    mkdirSync(pluginDir, { recursive: true });
    await _deployFolder("dist", pluginDir);
    const now = new Date().toLocaleString();
    console.log(`✅ Deployment completed. [${now}]`);
}

async function _deployFolder(sourceDir: string, targetDir: string) {
    console.log("deploying ...");
    console.log(`from: './${sourceDir}'`);
    console.log(`to  : ${targetDir}:`);
    await cp(sourceDir, targetDir, {
        recursive: true,
        filter: (source) => {
            const stat = fs.statSync(source);
            if (stat.isFile()) {
                console.log(`      ${path.basename(source)}`);
            }
            return true;
        },
    });
}
