import { App, PluginSettingTab } from "obsidian";
import type ObsidianGit from "src/main";

export class ObsidianNewGitSettingsTab extends PluginSettingTab {
    constructor(
        app: App,
        private plugin: ObsidianGit
    ) {
        super(app, plugin);
    }
    display(): void {
        const { containerEl } = this;
        const plugin: ObsidianGit = this.plugin;

        let commitOrSync: string;
        if (plugin.settings.differentIntervalCommitAndPush) {
            commitOrSync = "commit";
        } else {
            commitOrSync = "commit-and-sync";
        }

        const gitReady = plugin.gitReady;

        containerEl.empty();
        if (!gitReady) {
            containerEl.createEl("p", {
                text: "Git is not ready. When all settings are correct you can configure commit-sync, etc.",
            });
            containerEl.createEl("br");
        }
    }
}
