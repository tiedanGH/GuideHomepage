// 非IP直连时隐藏警告
(function() {
    const host = window.location.hostname.trim().toLowerCase();
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || /^\[?[a-f0-9:]+]?$/i.test(host);
    if (!isIP) {
        const style = document.createElement("style");
        style.setAttribute("data-hide-warning", "1");
        style.textContent = ".warning { display: none !important; }";
        if (document.head) {
            document.head.insertBefore(style, document.head.firstChild);
        } else {
            document.documentElement.insertBefore(style, document.documentElement.firstChild);
        }
    }
})();

document.querySelectorAll(".menu-group").forEach(group => {
    const toggle = group.querySelector(".button.menu");
    const panel = group.querySelector(".menu-panel");

    toggle.addEventListener("click", () => {
        panel.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (!group.contains(e.target)) {
            panel.classList.remove("open");
        }
    });
});