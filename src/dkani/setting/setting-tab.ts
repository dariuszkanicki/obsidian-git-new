import { App } from "obsidian";
import type ObsidianGit from "src/main";
import type { ObsidianGitSettings } from "src/types";
import { DEFAULT_SETTINGS } from "src/constants";
import { renderSettings } from ".yalc/@dkani/obsidian-settings-ui/dist/lib";
import { replaceAndDisplay } from "./setting-util";
import { createSettingsConfig } from "./setting-config";
import { ConversionHelper } from "./setting-conversion-helper";

export class ObsidianNewGitSettingsTab extends ConversionHelper {
    constructor(app: App, plugin: ObsidianGit) {
        super(app, plugin);
    }
    refreshDisplayWithDelay(timeout = 80): void {
        setTimeout(() => this.display(), timeout);
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

            if (!this.plugin.gitReady) {
                containerEl.createEl("p", {
                    text: "Git is not ready. When all settings are correct you can configure commit-sync, etc.",
                });
                containerEl.createEl("br");
            }

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
