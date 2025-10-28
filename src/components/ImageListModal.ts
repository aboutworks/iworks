import { App, Modal } from 'obsidian';

interface ImageInfo {
	src: string;
	alt: string;
	lineNumber: number;
}

export default class ImageListModal extends Modal {
	images: ImageInfo[];

	constructor(app: App, images: ImageInfo[]) {
		super(app);
		this.images = images;
	}

	onOpen() {
		const { contentEl } = this;
		
		// 设置标题
		contentEl.createEl('h2', { text: `图片列表 (共 ${this.images.length} 张)` });

		// 创建图片列表容器
		const listContainer = contentEl.createDiv({ cls: 'image-list-container' });

		this.images.forEach((image, index) => {
			const imageItem = listContainer.createDiv({ cls: 'image-list-item' });
			
			// 图片编号
			const indexEl = imageItem.createEl('div', { 
				cls: 'image-index',
				text: `#${index + 1}` 
			});

			// 图片预览
			const imgContainer = imageItem.createDiv({ cls: 'image-preview' });
			const img = imgContainer.createEl('img', {
				attr: { src: image.src, alt: image.alt || '无描述' }
			});
			img.style.maxWidth = '100%';
			img.style.maxHeight = '200px';
			img.style.objectFit = 'contain';

			// 图片信息
			const infoContainer = imageItem.createDiv({ cls: 'image-info' });
			infoContainer.createEl('div', { 
				cls: 'image-alt',
				text: `描述: ${image.alt || '无'}` 
			});
			infoContainer.createEl('div', { 
				cls: 'image-src',
				text: `路径: ${image.src}` 
			});
			infoContainer.createEl('div', { 
				cls: 'image-line',
				text: `行号: ${image.lineNumber}` 
			});
		});

		// 添加样式
		contentEl.addClass('image-list-modal');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
