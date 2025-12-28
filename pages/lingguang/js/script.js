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


    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const allCategories = document.querySelectorAll('.category');
    const allButtons = document.querySelectorAll('.button-grid a');

    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.className = 'search-results-container';
    const resultCount = document.createElement('div');
    resultCount.className = 'search-result-count';
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'button-grid';

    searchResultsContainer.appendChild(resultCount);
    searchResultsContainer.appendChild(resultsGrid);

    searchInput.closest('.search-container').parentNode.insertBefore(
        searchResultsContainer,
        searchInput.closest('.search-container').nextSibling
    );

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm.length === 0) {
            searchResultsContainer.style.display = 'none';
            resultsGrid.innerHTML = '';
            allCategories.forEach(category => category.style.display = '');
            searchClear.classList.remove('visible');
            if (uncategorized) {
                const grid = uncategorized.querySelector('.button-grid');
                if (!grid || grid.querySelectorAll('a').length === 0) {
                    uncategorized.style.display = 'none';
                }
            }
            return;
        }

        searchClear.classList.add('visible');

        allCategories.forEach(category => category.style.display = 'none');
        searchResultsContainer.style.display = 'block';

        resultsGrid.innerHTML = '';

        let matchCount = 0;

        // 查找并添加匹配的按钮到结果网格
        allButtons.forEach(button => {
            const buttonText = button.textContent.toLowerCase();
            const buttonTitle = button.querySelector('small') ?
                button.textContent.replace(button.querySelector('small').textContent, '') :
                button.textContent;

            if (buttonText.includes(searchTerm) || buttonTitle.toLowerCase().includes(searchTerm)) {
                const clonedButton = button.cloneNode(true);

                clonedButton.setAttribute('target', '_blank');
                clonedButton.setAttribute('rel', 'noopener noreferrer');

                resultsGrid.appendChild(clonedButton);
                matchCount++;
            }
        });

        resultCount.textContent = matchCount > 0 ? `找到 ${matchCount} 个匹配的应用` : '未找到匹配的应用';
    }

    // 输入事件监听
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 150);
    });
    // 清除搜索按钮
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        performSearch();
    });
    // 键盘事件
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.focus();
            performSearch();
        }
    });

    performSearch();
});
