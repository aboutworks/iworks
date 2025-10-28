import { App, Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { marked } from 'marked'; // 使用 marked 库解析 Markdown

import SampleModal from './components/SampleModal';
import MarkdownHighlightModal from './components/MarkdownHighlightModal';
import ImageListModal from './components/ImageListModal';
import SampleSettingTab from './views/SampleSettingTab';

interface ImageInfo {
	src: string;
	alt: string;
	lineNumber: number;
}

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

		// 添加一个命令，用于显示图片列表
		this.addCommand({
			id: 'show-image-list',
			name: 'Show Image List',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// 获取当前编辑器的内容
				const content = editor.getValue();
				const lines = content.split('\n');
				
				// 提取所有图片信息
				const images: ImageInfo[] = [];
				const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
				
				lines.forEach((line, index) => {
					let match;
					while ((match = imageRegex.exec(line)) !== null) {
						images.push({
							alt: match[1],
							src: match[2],
							lineNumber: index + 1
						});
					}
				});

				if (images.length === 0) {
					new Notice('当前文档中没有找到图片');
					return;
				}

				// 隐藏文档中的图片（将图片语法注释掉）
				const hiddenContent = content.replace(/!\[(.*?)\]\((.*?)\)/g, '<!-- ![$1]($2) -->');
				editor.setValue(hiddenContent);

				// 显示图片数量通知
				new Notice(`共找到 ${images.length} 张图片，已隐藏图片并在右侧显示列表`);

				// 打开图片列表模态框
				const modal = new ImageListModal(this.app, images);
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
