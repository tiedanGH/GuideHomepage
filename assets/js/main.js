// IP 直连时显示警告
(function () {
    const host = window.location.hostname.trim().toLowerCase();
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || /^\[?[a-f0-9:]+]?$/i.test(host);
    if (!isIP) return;

    function showWarnings() {
        document.querySelectorAll(".warning").forEach(el => {
            el.style.setProperty("display", "block", "important");
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showWarnings);
    } else {
        showWarnings();
    }
})();

// 移动端菜单交互
document.querySelectorAll(".menu-group").forEach(group => {
    const toggle = group.querySelector(".button.menu");
    const panel = group.querySelector(".menu-panel");

    // 一级菜单点击展开
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("open");
    });

    // 二级菜单点击展开
    panel.querySelectorAll(".submenu-group").forEach(subGroup => {
        const title = subGroup.querySelector(".button.submenu");
        const subPanel = subGroup.querySelector(".submenu-panel");

        title.addEventListener("click", (e) => {
            e.stopPropagation();
            // 关闭同级其他二级菜单
            panel.querySelectorAll(".submenu-panel.open").forEach(p => {
                if (p !== subPanel) p.classList.remove("open");
            });
            subPanel.classList.toggle("open");
        });
    });

    // 点击外部关闭所有
    document.addEventListener("click", (e) => {
        if (!group.contains(e.target)) {
            panel.classList.remove("open");
            panel.querySelectorAll(".submenu-panel").forEach(p => {
                p.classList.remove("open");
            });
        }
    });
});
