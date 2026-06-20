// ============================================================
// 共享工具模块 - 颜色、图片、下载
// ============================================================

const A4_WIDTH = 1240;
const A4_HEIGHT = 1754;
const A4_RATIO = Math.SQRT2; // ≈1.414

/** 十六进制颜色 → rgba */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

/** dataURL → Blob */
function dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
}

/** 将远程路径转为本地相对路径 */
function convertToLocalPath(url) {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) {
        const filename = url.split('/').pop();
        return `images/${filename}`;
    }
    return url;
}

/** 判断是否为移动设备 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/** 统一下载函数（桌面端 & 移动端） */
function downloadFile(blob, filename) {
    if (isMobileDevice()) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
