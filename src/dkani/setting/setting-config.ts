import type { SettingsConfig } from ".yalc/@dkani/obsidian-settings-ui/dist/lib/renderer/types-api";
import type ObsidianGit from "src/main";
import type { ObsidianGitSettingsTab } from "src/setting/settings";
import type { ObsidianGitSettings } from "src/types";
import type { ObsidianNewGitSettingsTab } from "./setting-tab";

export function createSettingsConfig(settingsTab: ObsidianNewGitSettingsTab, plugin: ObsidianGit): SettingsConfig<ObsidianGitSettings> {
    return {
        elements: [
            {
                type: "Message",
                id: "isGitReady",
                message: "Git is not ready. When all settings are correct you can configure commit-sync, etc.",
                showIf: !plugin.gitReady,
            },
            // historyView
            {
                type: "SettingGroup",
                id: "settingGroup.historyView",
                label: "History view",
                tooltip: ["Decide what to show in the history view of the commit."],
                items: [
                    {
                        type: "Dropdown",
                        path: "authorInHistoryView",
                        label: "Show Author",
                        items: [
                            { id: "hide", label: "Hide" },
                            { id: "full", label: "Full" },
                            { id: "initials", label: "Initials" },
                        ],
                    },
                    {
                        type: "Toggle",
                        path: "dateInHistoryView",
                        label: "Show Date",
                        tooltip: ["The {{date}} placeholder format is used to display the date."],
                    },
                ],
            },
        ],
        support: {
            kofiId: "F1F195IQ5",
        },
    };
}
