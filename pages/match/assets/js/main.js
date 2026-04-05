document.querySelectorAll('.section').forEach(section => {
    const grid = section.querySelector('.button-grid');
    if (!grid || grid.querySelectorAll('a').length === 0) {
        if (grid) grid.remove();
        const hint = document.createElement('p');
        hint.className = 'empty-hint';
        hint.textContent = '暂无比赛';
        section.appendChild(hint);
    }
});
