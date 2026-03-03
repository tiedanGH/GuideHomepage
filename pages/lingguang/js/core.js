
let starFilterActive = false;

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById('searchInput');
    const allCategories = document.querySelectorAll('.category');

    // 应用筛选函数
    function applyStarFilter() {
        allCategories.forEach(category => {
            const buttons = category.querySelectorAll('.button-grid a');
            let hasVisibleButtons = false;

            buttons.forEach(button => {
                const hasStar = button.querySelector('.star') !== null;
                const visible = !starFilterActive || hasStar;

                button.style.display = visible ? 'block' : 'none';
                if (visible) hasVisibleButtons = true;
            });

            category.style.display = hasVisibleButtons ? '' : 'none';
        });
    }

    // 按钮排序函数
    function sortButtons(buttons) {
        return buttons.sort((a, b) => {
            const aHasStar = a.querySelector('.star') !== null;
            const bHasStar = b.querySelector('.star') !== null;
            if (aHasStar && !bHasStar) return -1;
            if (!aHasStar && bHasStar) return 1;

            const getTitle = el => {
                const clone = el.cloneNode(true);
                const small = clone.querySelector('small');
                if (small) small.remove();
                const star = clone.querySelector('.star');
                if (star) star.remove();
                return clone.innerText.trim();
            };
            return getTitle(a).localeCompare(getTitle(b), 'zh-CN');
        });
    }

    window.applyStarFilter = applyStarFilter;
    window.sortButtons = sortButtons;

    // 初始化：分类为空自动隐藏
    applyStarFilter();

    // 初始化：对按钮进行自动排序
    const grids = document.querySelectorAll('.button-grid');
    grids.forEach(grid => {
        const buttons = Array.from(grid.querySelectorAll('a'));
        const sortedButtons = sortButtons(buttons);
        grid.innerHTML = '';
        sortedButtons.forEach(btn => grid.appendChild(btn));
    });

    // 初始化：设置所有按钮链接在新标签页打开
    document.querySelectorAll('.button-grid a').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    // 星星筛选功能
    const starFilter = document.getElementById('starFilter');
    function toggleStarFilter() {
        starFilterActive = !starFilterActive;
        starFilter.classList.toggle('active', starFilterActive);

        applyStarFilter();
        if (searchInput.value.trim()) {
            performSearch();
        }
    }
    starFilter.addEventListener('click', toggleStarFilter);

    const urlParams = new URLSearchParams(window.location.search);
    const showAll = urlParams.get('show') === 'all';

    // 分类标题点击收起 / 展开
    document.querySelectorAll('.category').forEach(category => {
        const title = category.querySelector('.category-title');
        const grid = category.querySelector('.button-grid');

        // 默认全部收起，除非show=all
        if (!showAll) {
            category.classList.add('collapsed');
            grid.style.maxHeight = '0';
        } else {
            grid.style.maxHeight = grid.scrollHeight + 'px';
        }

        title.addEventListener('click', () => {
            const isCollapsed = category.classList.toggle('collapsed');
            if (isCollapsed) {
                grid.style.maxHeight = grid.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    grid.style.maxHeight = '0';
                });
            } else {
                grid.style.maxHeight = grid.scrollHeight + 'px';
            }
        });
    });

    // 一键展开 / 收起全部
    const toggleBtn = document.getElementById('toggleAll');

    function updateToggleButtonText() {
        const collapsedCount = document.querySelectorAll('.category.collapsed').length;
        toggleBtn.textContent = collapsedCount > 0 ? '展开全部' : '收起全部';
    }

    // 初始化按钮文字
    updateToggleButtonText();

    toggleBtn.addEventListener('click', () => {
        const collapsedCategories = document.querySelectorAll('.category.collapsed');

        if (collapsedCategories.length > 0) {
            // 有收起的 → 展开全部
            collapsedCategories.forEach(cat => {
                cat.querySelector('.category-title').click();
            });
        } else {
            // 全部展开 → 收起全部
            document.querySelectorAll('.category:not(.collapsed)')
                .forEach(cat => {
                    cat.querySelector('.category-title').click();
                });
        }

        requestAnimationFrame(updateToggleButtonText);
    });
});
