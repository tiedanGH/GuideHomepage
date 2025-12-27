document.addEventListener("DOMContentLoaded", () => {
    // 未分类为空自动隐藏
    const uncategorized = document.querySelector('.category .category-title.uncategorized')?.parentElement;
    if (uncategorized) {
        const grid = uncategorized.querySelector('.button-grid');
        if (!grid || grid.querySelectorAll('a').length === 0) {
            uncategorized.style.display = 'none';
        }
    }

    // 对按钮进行自动排序
    const grids = document.querySelectorAll('.button-grid');
    grids.forEach(grid => {
        const buttons = Array.from(grid.querySelectorAll('a'));

        buttons.sort((a, b) => {
            const getTitle = el => {
                const clone = el.cloneNode(true);
                const small = clone.querySelector('small');
                if (small) small.remove();
                return clone.innerText.trim();
            };
            return getTitle(a).localeCompare(getTitle(b), 'zh-CN');
        });

        grid.innerHTML = '';
        buttons.forEach(btn => grid.appendChild(btn));
    });

    // 设置所有按钮链接在新标签页打开
    document.querySelectorAll('.button-grid a').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
});
