import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { marked } from 'marked'; // 使用 marked 库解析 Markdown

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		 // WebSocket 连接
		this.connectWebSocket();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Jimmy Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice! From Jimmy Plugin');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('iWorks');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		 // 添加一个命令，用于高亮 Markdown
		this.addCommand({
			id: 'highlight-markdown',
			name: 'Highlight Jimmy Markdown',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				console.log("Highlight Markdown command triggered"); // 调试日志
				// 获取当前编辑器中的 Markdown 内容
				const markdownContent = editor.getValue();

				// 使用 marked 解析 Markdown 为 HTML
				const htmlContent = await marked(markdownContent);

				// 创建一个 Modal 来显示高亮后的内容
				const modal = new MarkdownHighlightModal(this.app, htmlContent);
				modal.open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerDomEvent(document, 'DOMContentLoaded', () => {
			const styleEl = document.createElement('link');
			styleEl.rel = 'stylesheet';
			styleEl.href = this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/styles.css`);
			document.head.appendChild(styleEl);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('Unloading MyPlugin...');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 添加 WebSocket 连接方法
	connectWebSocket() {
		const socket = new WebSocket("ws://localhost:30725");

		// 监听 WebSocket 打开事件
		socket.onopen = () => {
			console.log("WebSocket connection established");

			// 发送 JSON 格式的消息
			const message = JSON.stringify({ message: "Hello from Obsidian plugin!" });
			socket.send(message);
		};

		// 监听 WebSocket 消息事件
		socket.onmessage = (event) => {
			console.log("Message from server:", event.data);
			new Notice(`Message from server: ${event.data}`);
		};

		// 监听 WebSocket 错误事件
		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			new Notice("WebSocket error occurred. Check console for details.");
		};

		// 监听 WebSocket 关闭事件
		socket.onclose = () => {
			console.log("WebSocket connection closed");
			new Notice("WebSocket connection closed");
		};
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

// Modal 用于显示高亮后的 Markdown 内容
class MarkdownHighlightModal extends Modal {
	htmlContent: string;

	constructor(app: App, htmlContent: string) {
		super(app);
		this.htmlContent = htmlContent;
	}

	onOpen() {
		const { contentEl } = this;

		// 设置 Modal 的内容为解析后的 HTML
		contentEl.innerHTML = this.htmlContent;

		// 添加样式类以便自定义样式
		contentEl.addClass('markdown-highlight-modal');
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
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
