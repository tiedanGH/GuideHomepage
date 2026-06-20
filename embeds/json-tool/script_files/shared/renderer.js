// ============================================================
// 共享渲染引擎 - A4页面创建、预览、下载
// ============================================================

/**
 * 创建全屏预览容器
 * @param {string} id - 容器ID
 */
function createPreviewContainer(id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = id;
    container.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 99999;
        display: flex; flex-direction: column; align-items: center;
        justify-content: flex-start; overflow-y: auto; padding: 20px 0;
    `;
    return container;
}

/**
 * 创建按钮容器（下载 + 关闭）
 * @param {string} downloadText - 下载按钮文字
 * @param {Function} onDownload - 下载回调
 * @param {Function} onClose - 关闭回调
 */
function createButtonContainer(downloadText, onDownload, onClose) {
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex; gap: 12px; margin-bottom: 16px; flex-shrink: 0;
    `;

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = downloadText || '下载图片';
    downloadBtn.style.cssText = `
        padding: 10px 24px; background: #38a169; color: white; border: none;
        border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;
    `;
    downloadBtn.onclick = onDownload;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        padding: 10px 24px; background: #e53e3e; color: white; border: none;
        border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;
    `;
    closeBtn.onclick = onClose;

    btnContainer.appendChild(downloadBtn);
    btnContainer.appendChild(closeBtn);
    return btnContainer;
}

/**
 * 创建固定 A4 尺寸的页面元素（百分比布局基于 A4_WIDTH=1240）
 * @param {Object} options
 * @param {string} options.html - 内部 HTML 内容（使用百分比单位）
 * @param {string} options.bgColor - 背景色，如 '#f6f6f4'
 * @param {number} options.bgOpacity - 背景透明度 0-1
 */
function createA4Page(options) {
    const { html, bgColor, bgOpacity } = options;
    const mobile = isMobileDevice();
    const bg = bgColor || '#f6f6f4';
    const alpha = bgOpacity != null ? bgOpacity : 1;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        width: ${mobile ? A4_WIDTH + 'px' : '8.27in'};
        height: ${mobile ? A4_HEIGHT + 'px' : '11.69in'};
        background-color: ${hexToRgba(bg, alpha)};
        overflow: hidden; position: relative;
        font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
        box-sizing: border-box; margin: 0 auto;
        flex-shrink: 0;
    `;

    // 百分比容器（所有子元素使用%单位，基于A4_WIDTH=1240px）
    const pctContainer = document.createElement('div');
    pctContainer.style.cssText = `
        width: 100%; height: 100%; position: relative;
        font-size: 0; /* 消除行内元素间隙 */
    `;
    pctContainer.innerHTML = html;

    wrapper.appendChild(pctContainer);
    return wrapper;
}

/**
 * 将外部图片转换为 Base64（跳过项目内角色图片）
 * @param {HTMLElement} element
 */
async function convertExternalImages(element) {
    const imgs = element.querySelectorAll('img');
    const promises = [];
    imgs.forEach(img => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:') || src.startsWith('images/')) return;
        promises.push(
            fetch(src)
                .then(r => r.blob())
                .then(blob => new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => { img.src = reader.result; resolve(); };
                    reader.readAsDataURL(blob);
                }))
                .catch(() => {})
        );
    });
    await Promise.all(promises);
}

/**
 * 渲染并下载 A4 页面为 PNG
 * @param {HTMLElement} pageElement - A4 页面 DOM 元素
 * @param {Object} options
 * @param {string} options.filename - 下载文件名
 */
async function renderAndDownload(pageElement, options) {
    const { filename } = options;
    const mobile = isMobileDevice();

    // 转换为外部图片
    await convertExternalImages(pageElement);

    // 获取内容实际高度
    const pctContainer = pageElement.querySelector('div');
    const scrollHeight = pctContainer ? pctContainer.scrollHeight : A4_HEIGHT;

    // 使用 html-to-image 渲染
    if (typeof htmlToImage !== 'undefined') {
        const canvas = await htmlToImage.toCanvas(pageElement, {
            width: A4_WIDTH,
            height: mobile ? Math.ceil(scrollHeight) : Math.ceil(A4_WIDTH * A4_RATIO),
            pixelRatio: 2
        });
        canvas.toBlob(blob => {
            downloadFile(blob, filename);
        }, 'image/png');
    } else if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(pageElement, {
            width: A4_WIDTH,
            height: mobile ? Math.ceil(scrollHeight) : Math.ceil(A4_WIDTH * A4_RATIO),
            scale: 2,
            useCORS: true
        });
        canvas.toBlob(blob => {
            downloadFile(blob, filename);
        }, 'image/png');
    } else {
        alert('图片渲染库未加载，请刷新页面后重试');
    }
}

/**
 * 显示预览并绑定下载
 * @param {HTMLElement} pageElement - A4 页面
 * @param {Object} options
 * @param {string} options.filename - 文件名
 * @param {string} options.containerId - 容器ID
 */
function showPreview(pageElement, options) {
    const { filename, containerId } = options;
    const container = createPreviewContainer(containerId || 'script-preview');

    let downloadClicked = false;
    const btnContainer = createButtonContainer(
        '下载剧本图',
        async () => {
            if (downloadClicked) return;
            downloadClicked = true;
            await renderAndDownload(pageElement, { filename: filename || 'script.png' });
        },
        () => container.remove()
    );

    container.appendChild(btnContainer);
    container.appendChild(pageElement);
    document.body.appendChild(container);

    container.addEventListener('click', (e) => {
        if (e.target === container) container.remove();
    });
}
