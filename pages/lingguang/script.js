// 设置所有按钮链接在新标签页打开
document.querySelectorAll('.button-grid a').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
});
// 对按钮进行自动排序
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector('.button-grid');
    if (!grid) return;

    const buttons = Array.from(grid.querySelectorAll('a'));

    buttons.sort((a, b) => {
        const textA = a.cloneNode(true).querySelector('small')
            ? a.innerText.replace(a.querySelector('small').innerText, '').trim()
            : a.innerText.trim();
        const textB = b.cloneNode(true).querySelector('small')
            ? b.innerText.replace(b.querySelector('small').innerText, '').trim()
            : b.innerText.trim();
        return textA.localeCompare(textB, 'zh-CN');
    });

    grid.innerHTML = '';
    buttons.forEach(btn => grid.appendChild(btn));
});
