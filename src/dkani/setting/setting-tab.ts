import { App, Notice, moment, type RGB } from "obsidian";
import { colord } from "colord";

import type ObsidianGit from "src/main";
import type { ObsidianGitSettings } from "src/types";
import { DEFAULT_SETTINGS } from "src/constants";
import { renderSettings } from ".yalc/@dkani/obsidian-settings-ui/dist/lib";
import { replaceAndDisplay } from "./setting-utils";
import { createSettingsConfig } from "./setting-config";
import { ConversionHelper } from "./setting-conversion-helper";
import type { LineAuthorSettings } from "src/lineAuthor/model";

export class ObsidianNewGitSettingsTab extends ConversionHelper {
    constructor(app: App, plugin: ObsidianGit) {
        super(app, plugin);
    }
    refreshDisplayWithDelay(timeout = 80): void {
        setTimeout(() => this.display(), timeout);
    }
    setGitPath(value: string) {
        this.plugin.gitManager.updateGitPath(value);
        this.plugin.localStorage.setGitPath(value);
    }
    async setBasePath(value: string) {
        this.plugin.settings.basePath = value;
        await this.plugin.saveSettings();
        this.plugin.gitManager.updateBasePath(value || "").catch((e) => this.plugin.displayError(e));
    }
    setPluginDisabled(value: boolean) {
        this.plugin.localStorage.setPluginDisabled(value);
        if (value) {
            this.plugin.unloadPlugin();
        } else {
            this.plugin.init({ fromReload: true }).catch((e) => this.plugin.displayError(e));
        }
        new Notice("Obsidian must be restarted for the changes to take affect.");
    }
    isAutoPushEnabled(): boolean {
        return (
            this.plugin.settings.autoPushInterval > 0 ||
            (!this.plugin.settings.differentIntervalCommitAndPush && this.plugin.settings.autoSaveInterval > 0)
        );
    }

    autoSaveIntervalReplacements = () => {
        const text = this.plugin.settings.differentIntervalCommitAndPush ? "`commit`" : "`commit` & `push`";
        return [
            { name: "action", text: text },
            { name: "interval", text: String(this.plugin.settings.autoSaveInterval) },
        ];
    };
    async onClickPreviewCommitMessage(): Promise<void> {
        const commitMessagePreview = await this.plugin.gitManager.formatCommitMessage(this.plugin.settings.commitMessage);
        new Notice(`${commitMessagePreview}`);
        // new Notice(`Preview using template: ${this.plugin.settings.commitMessage}`);
    }
    setLineAuthor(value: boolean): void {
        if (value === true) {
            // this.plugin.settings.lineAuthor = { ...DEFAULT_SETTINGS_LineAuthorSettings };
            this.plugin.lineAuthoringFeature.activateFeature();
            console.log("lineAuthor", this.plugin.settings.lineAuthor);
        } else {
            // this.plugin.settings.lineAuthor = undefined;
            this.plugin.lineAuthoringFeature.deactivateFeature();
            console.log("lineAuthor", this.plugin.settings.lineAuthor);
        }
    }
    // private previewCustomDateTimeDescriptionHtml(dateTimeFormatCustomString: string) {
    customLineAuthorDatetimeFormatPreview = () => {
        const formattedDateTime = moment().format(this.plugin.settings.lineAuthor!.dateTimeFormatCustomString);
        return [{ name: "format", text: `${formattedDateTime}` }];
    };
    customLineAuthorDatetimeFormat(): boolean | undefined {
        return this.plugin.settings.lineAuthor?.dateTimeFormatOptions === "custom";
    }
    coloringMaxAgeReplacements = () => {
        return [{ name: "age", text: String(this.plugin.settings.lineAuthor!.coloringMaxAge) }];
    };
    validateColoringMaxAge(coloringMaxAge: string) {
        console.log("validateColoringMaxAge", coloringMaxAge);
        const duration = this.parseDuration(coloringMaxAge);
        const durationString = duration !== undefined ? `${duration.asDays()} days` : "invalid!";
        if (duration !== undefined) {
            return { valid: true }; //, data: duration.asDays() + 'd' }
        } else {
            return { valid: false };
        }
    }
    private parseDuration(durationString: string): moment.Duration | undefined {
        // https://momentjs.com/docs/#/durations/creating/
        const duration = moment.duration("P" + durationString.toUpperCase());
        return duration.isValid() && duration.asDays() && duration.asDays() >= 1 ? duration : undefined;
    }
    previewColor(key: keyof LineAuthorSettings) {
        const rgb = this.plugin.settings.lineAuthor![key] as RGB;
        const color = colord(rgb);
        const colorString = color.toRgbString();
        return `<label class='line-author-settings-preview' style='background-color: ${colorString}'>abcdef Author Name 2025-05-04</label>`;
    }

    validateColorNewestCommits(value: any): { valid: boolean; data?: any; invalid?: string; preview?: string } {
        const color = colord(value); //?.toRgbaArray();
        if (!color.isValid) {
            return { valid: false }; // data: duration.asDays() + 'd' };
        } else {
            const colorString = color.toRgbString();
            const previewColor = `<div class='line-author-settings-preview' style='background-color: ${colorString}'>abcdef Author Name 2025-05-04</div>`;
            return { valid: true, preview: previewColor };
        }
    }
    updateColors(): void {
        document.body.style.setProperty("--obs-git-gutter-text", this.plugin.settings.lineAuthor!.textColorCss); //#f4f1f1
    }

    private isRendering = false;
    async display(): Promise<void> {
        if (this.isRendering) {
            return;
        }
        this.isRendering = true;
        const scrollTop = this.containerEl.scrollTop;
        const currentContainer = this.containerEl;

        try {
            const { containerEl } = this;

            this.containerEl = await replaceAndDisplay(
                currentContainer,
                async (newContainer) => {
                    await renderSettings(
                        this.app,
                        this.plugin,
                        createSettingsConfig(this, this.plugin),
                        this.plugin.settings,
                        DEFAULT_SETTINGS,
                        newContainer,
                        async (newSettings: ObsidianGitSettings) => {
                            await this.plugin.saveData(newSettings);
                        },
                        async () => {
                            this.refreshDisplayWithDelay();
                        }
                    );
                },
                scrollTop
            );
        } finally {
            this.isRendering = false;
        }
    }
}
