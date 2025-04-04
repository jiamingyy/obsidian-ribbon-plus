import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	robbinbarNum: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	robbinbarNum: 2,
};

export default class RobbinPlusPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log("loading plugin", this.manifest.name);

		this.app.workspace.onLayoutReady(() => {
			const robbinbarContainer =
				document.querySelector(".workspace-ribbon");
			// get child element of robbinbarContainer
			if (robbinbarContainer) {
				const robbin_action_bar = robbinbarContainer.querySelector(
					".side-dock-actions"
				) as HTMLElement;
				var actions = robbin_action_bar?.childNodes;
				if (robbin_action_bar) {
					actions = robbin_action_bar.childNodes;
					robbin_action_bar.style.display = "none"; // hide the original robbin_action_bar
				}
				// add more one robbin_action_bar elements to robbinbarContainer
				// 按照设置的数量划分 actions 到不同的 robbin_action_bar 中
				let eachBarActions = Math.ceil(
					actions.length / this.settings.robbinbarNum
				);

				for (let i = 0; i < this.settings.robbinbarNum; i++) {
					const robbin_action_bar_plus =
						document.createElement("div");
					robbin_action_bar_plus.className = "side-dock-actions-plus side-dock-actions";
					// add actions to robbin_action_bar_plus
					robbin_action_bar_plus.style.display = "flex";
					robbin_action_bar_plus.style.flexDirection = "column";
					robbin_action_bar_plus.style.gap = robbin_action_bar.style.gap;
					
					for (
						let j = i * eachBarActions;
						j < eachBarActions * i + eachBarActions &&
						j < actions.length;
						j++
					) {
						const action = actions[j] as HTMLElement;
						// clone the action element
						const robbin_action_bar_plus_child = action.cloneNode(
							true
						) as HTMLElement;
						robbin_action_bar_plus_child.onclick = (e) => {
							if (action.click) {
								action.click();
							} else {
								console.log("action onclick not found");
							}
						};

						robbin_action_bar_plus.appendChild(
							robbin_action_bar_plus_child
						);
					}
					robbinbarContainer.appendChild(robbin_action_bar_plus);
				}
			} else {
				console.log("robbinbarContainer not found");
			}
		});

		// this.app

		//clear the robbinbarContainer when the plugin is unloaded

		// Opearte Dom directly

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload = () => {
		// recover the robbinbarContainer when the plugin is unloaded
		const robbinbarContainer = document.querySelector(
			".workspace-ribbon"
		) as HTMLElement;
		robbinbarContainer
			?.querySelectorAll(".side-dock-actions-plus")
			.forEach((element) => {
				element.remove();
			});

		const robbin_action_bar = robbinbarContainer?.querySelector(
			".side-dock-actions"
		) as HTMLElement;
		robbin_action_bar.style.display = "flex"; // show the original robbin_action_bar
	};

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
