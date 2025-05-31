import type { SettingsConfig } from ".yalc/@dkani/obsidian-settings-ui/dist/lib/renderer/types-api";
import type ObsidianGit from "src/main";
import type { ObsidianGitSettingsTab } from "src/setting/settings";
import type { ObsidianGitSettings } from "src/types";
import type { ObsidianNewGitSettingsTab } from "./setting-tab";

export function createSettingsConfig(settingsTab: ObsidianNewGitSettingsTab, plugin: ObsidianGit): SettingsConfig<ObsidianGitSettings> {
    return {
        elements: [],
    };
}
