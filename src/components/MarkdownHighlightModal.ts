import { App, Modal } from 'obsidian';

export default class MarkdownHighlightModal extends Modal {
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
