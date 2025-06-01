#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { injectPrefixedStyles } from '@dkani/obsidian-settings-ui/inject-css';

const manifestPath = path.resolve('manifest.json');
if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found.');
    process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { id: string };

injectPrefixedStyles({
    pluginDir: process.cwd(),
    pluginId: manifest.id,
    sourceCssPath: path.resolve('node_modules/@dkani/obsidian-settings-ui/styles/source-styles.css'),
    targetCssPath: path.resolve('styles.css'),
});
