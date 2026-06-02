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

// 恶魔的游戏：点击展开二维码 + 复制小程序口令
document.querySelectorAll(".demon-group").forEach(group => {
    const btn = group.querySelector(".button.demon");
    const panel = group.querySelector(".demon-qr-panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.toggle("open");
        copyMiniProgramToken(btn.dataset.token);
    });

    document.addEventListener("click", (e) => {
        if (!group.contains(e.target)) {
            panel.classList.remove("open");
        }
    });
});

function copyMiniProgramToken(token) {
    if (!token) return;

    const successMsg = "小程序口令已复制，请前往微信打开";

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(token)
            .then(() => alert(successMsg))
            .catch(() => fallbackCopy(token));
    } else {
        fallbackCopy(token);
    }

    function fallbackCopy(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            document.execCommand("copy");
            alert(successMsg);
        } catch (e) {
            prompt("请手动复制以下内容：", text);
        }

        document.body.removeChild(textarea);
    }
}
