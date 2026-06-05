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

// 恶魔的游戏：按钮纯当开关切换二维码；二维码点击复制小程序口令并询问是否跳转微信，长按交给浏览器原生保存
document.querySelectorAll(".demon-group").forEach(group => {
    const btn = group.querySelector(".button.demon");
    const panel = group.querySelector(".demon-qr-panel");
    const qr = group.querySelector(".demon-qr-img");
    if (!btn || !panel) return;

    // 按钮：切换二维码展开/收起（等同血染按钮二级菜单逻辑）
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.toggle("open");
    });

    // 二维码图片：点击复制口令并询问是否跳转微信。长按由浏览器原生菜单接管（不拦截 contextmenu / touchstart）
    if (qr) {
        qr.addEventListener("click", (e) => {
            e.stopPropagation();
            copyTokenAndPromptWechat(qr.dataset.token);
        });
    }

    // 点击外部关闭二维码
    document.addEventListener("click", (e) => {
        if (!group.contains(e.target)) {
            panel.classList.remove("open");
        }
    });
});

function copyTokenAndPromptWechat(token) {
    if (!token) return;

    const askLaunch = () => {
        const go = confirm("小程序口令已复制，是否跳转微信？");
        if (go) window.location.href = "weixin://";
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(token)
            .then(askLaunch)
            .catch(() => fallbackCopy(token, askLaunch));
    } else {
        fallbackCopy(token, askLaunch);
    }

    function fallbackCopy(text, after) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            document.execCommand("copy");
            after();
        } catch (e) {
            prompt("请手动复制以下内容：", text);
        }

        document.body.removeChild(textarea);
    }
}
