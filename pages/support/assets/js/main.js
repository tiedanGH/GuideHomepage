/* 移动端二维码横滑轨道:开屏定位到中间那张(微信),左右各露出一部分邻卡,让用户一眼看出可以左右滑动。
 * 桌面端 .qr-grid 是普通换行 flex(不可滚动),此处会因 scrollWidth 不溢出而自动跳过。 */
(function () {
    'use strict';

    function centerMiddleCard() {
        var grid = document.getElementById('qrGrid');
        if (!grid) return;
        var cards = grid.querySelectorAll('.qr-card');
        if (cards.length < 2) return;
        // 不可横向滚动(桌面端换行布局)→ 无需处理
        if (grid.scrollWidth <= grid.clientWidth + 1) return;

        var mid = cards[Math.floor(cards.length / 2)];   // 3 张 → 索引 1(微信)
        var target = mid.offsetLeft - grid.offsetLeft
            - (grid.clientWidth - mid.clientWidth) / 2;
        // 初始定位不要动画:先关掉 smooth,跳过去,再恢复(后续用户滑动 / snap 仍平滑)
        var prev = grid.style.scrollBehavior;
        grid.style.scrollBehavior = 'auto';
        grid.scrollLeft = Math.max(0, target);
        grid.style.scrollBehavior = prev || '';
    }

    document.addEventListener('DOMContentLoaded', centerMiddleCard);
    // 二维码是 lazy 图,尺寸要等图片布局完成才准 → load 后再校正一次
    window.addEventListener('load', centerMiddleCard);
    // 旋转屏幕 / 跨断点缩放后重新居中(去抖)
    var t = null;
    window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(centerMiddleCard, 200);
    });
})();
