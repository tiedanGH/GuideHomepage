document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const allCategories = document.querySelectorAll('.category');
    const allButtons = document.querySelectorAll('.button-grid a');

    // 搜索功能
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
            searchClear.classList.remove('visible');
            applyStarFilter();
            return;
        }

        searchClear.classList.add('visible');
        allCategories.forEach(category => category.style.display = 'none');
        searchResultsContainer.style.display = 'block';
        resultsGrid.innerHTML = '';

        const matchedButtons = [];

        // 查找并添加匹配的按钮到结果网格
        allButtons.forEach(button => {
            const buttonText = button.textContent.toLowerCase();
            const buttonTitle = button.querySelector('small') ?
                button.textContent.replace(button.querySelector('small').textContent, '') :
                button.textContent;

            const matchesSearch = buttonText.includes(searchTerm) || buttonTitle.toLowerCase().includes(searchTerm);
            if (starFilterActive) {
                const hasStar = button.querySelector('.star') !== null;
                if (matchesSearch && hasStar) {
                    matchedButtons.push(button);
                }
            } else {
                if (matchesSearch) {
                    matchedButtons.push(button);
                }
            }
        });

        // 对匹配的按钮进行排序
        const sortedMatchedButtons = sortButtons(matchedButtons);

        resultsGrid.innerHTML = '';
        sortedMatchedButtons.forEach(button => {
            const clonedButton = button.cloneNode(true);
            resultsGrid.appendChild(clonedButton);
        });

        // 搜索结果计数
        let countText;
        if (starFilterActive) {
            countText = matchedButtons.length > 0 ?
                `找到 ${matchedButtons.length} 个匹配的精选应用` : '未找到匹配的精选应用';
        } else {
            countText = matchedButtons.length > 0 ?
                `找到 ${matchedButtons.length} 个匹配的应用` : '未找到匹配的应用';
        }
        resultCount.textContent = countText;
    }
    window.performSearch = performSearch;

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
