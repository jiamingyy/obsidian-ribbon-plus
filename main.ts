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

interface RobbinPlusPluginSettings {
	robbinbarNum: number;
}

const DEFAULT_SETTINGS: RobbinPlusPluginSettings = {
	robbinbarNum: 2,
};

function cloneElementWithEvents<T extends HTMLElement>(element: T, clearChild: boolean): T {
	const clonedElement = element.cloneNode(true) as T;
	if (clearChild) {
		// Clear child elements if needed
		while (clonedElement.firstChild) {
			clonedElement.removeChild(clonedElement.firstChild);
		}
	}
	// Copy event listeners
	getEventListeners(element).forEach(listener => {
		clonedElement.addEventListener(listener.type, listener.listener);
	});

	return clonedElement;
}


function getEventListeners(element: HTMLElement): { type: string; listener: EventListener }[] {
	const eventListeners: { type: string; listener: EventListener }[] = [];
	const eventMap = (element as any).eventListenerList || {};

	for (const type in eventMap) {
		if (eventMap.hasOwnProperty(type)) {
			eventMap[type].forEach((listener: EventListener) => {
				eventListeners.push({ type, listener });
			});
		}
	}

	return eventListeners;
}

export default class RobbinPlusPlugin extends Plugin {
	settings: RobbinPlusPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log("loading plugin", this.manifest.name);

		this.app.workspace.onLayoutReady(() => {
			const robbinbarContainer =
				document.querySelector(".workspace-ribbon") as HTMLElement;
			// get child element of robbinbarContainer
			if (robbinbarContainer) {
				robbinbarContainer.style.justifyContent = "space-between";
				robbinbarContainer.style.flexWrap = "wrap";
				const robbin_action_bar = robbinbarContainer.querySelector(
					".side-dock-actions"
				) as HTMLElement;
				//side-dock-settings
				const side_dock_settings = robbinbarContainer.querySelector(".side-dock-settings") as HTMLElement;
				if (side_dock_settings) {
					side_dock_settings.style.display = "none";
				}
				var actions = robbin_action_bar?.childNodes;

				if (robbin_action_bar) {
					actions = robbin_action_bar.childNodes;
					robbin_action_bar.style.display = "none"; // hide the original robbin_action_bar
				}
				else{
					console.log("robbin_action_bar not found");
					return;
				}
				let eachBarActions = Math.ceil(
					actions.length / this.settings.robbinbarNum
				);


				for (let i = 0; i < this.settings.robbinbarNum; i++) {
					const robbin_action_bar_plus = cloneElementWithEvents(robbin_action_bar, true);
					robbin_action_bar_plus.style.display = "flex";
					robbin_action_bar_plus.style.flexDirection = "column";
					robbin_action_bar_plus.className += " side-dock-actions-plus";

					for (
						let j = i * eachBarActions;
						j < eachBarActions * i + eachBarActions &&
						j < actions.length;
						j++
					) {
						const action = actions[j] as HTMLElement;
						const robbin_action_bar_plus_child = cloneElementWithEvents(action, false);
						robbin_action_bar_plus_child.onclick = (e) => {
							action.click();
							e.stopPropagation();
						}
						robbin_action_bar_plus?.appendChild(
							robbin_action_bar_plus_child
						);
					}

					if (robbin_action_bar_plus)
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
		if (robbin_action_bar)
			robbin_action_bar.style.display = "flex"; // show the original robbin_action_bar

		const side_dock_settings = robbinbarContainer?.querySelector("side-dock-settings") as HTMLElement;
		if (side_dock_settings)
			side_dock_settings.style.display = "none"; // hide the side_dock_settings


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
	plugin: RobbinPlusPlugin;

	constructor(app: App, plugin: RobbinPlusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Ribbon Bar Number #1")
			.setDesc("Set the number of ribbon bars")
			.addText((text) =>
				text
					.setPlaceholder("Enter a number")
					.setValue(this.plugin.settings.robbinbarNum.toString())
					.onChange(async (value) => {
						this.plugin.settings.robbinbarNum = parseInt(value);
						if (isNaN(this.plugin.settings.robbinbarNum)) {
							this.plugin.settings.robbinbarNum = 2;
							new Notice("Please enter a valid number");
						}
						await this.plugin.saveSettings();
					})
			);
	}
}
