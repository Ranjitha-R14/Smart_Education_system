/* Install-as-app + offline support. Adds a floating "Install app" button to every page. */
(function () {
  var isWeb = /^https?:$/.test(location.protocol);
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;

  // Offline cache
  if ("serviceWorker" in navigator && isWeb) {
    var base = document.currentScript.src.replace(/js\/pwa\.js.*$/, "");
    navigator.serviceWorker.register(base + "sw.js").catch(function () {});
  }
  if (!isWeb || standalone) return;   // already installed, or opened as a plain file

  var deferred = null, btn, box;
  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isFirefox = /Firefox/.test(ua);
  var isEdge = /Edg\//.test(ua);

  function css() {
    var s = document.createElement("style");
    s.textContent =
      "#sep-install{position:fixed;right:16px;bottom:16px;z-index:99999;display:flex;align-items:center;gap:8px;" +
      "padding:12px 18px;border:0;border-radius:999px;background:#1d4ed8;color:#fff;font:700 15px 'Segoe UI',system-ui,sans-serif;" +
      "box-shadow:0 6px 20px rgba(29,78,216,.45);cursor:pointer}" +
      "#sep-install:hover{background:#1e3a8a}" +
      "#sep-install-box{position:fixed;right:16px;bottom:72px;z-index:99999;max-width:320px;padding:16px 18px;background:#fff;color:#0f172a;" +
      "border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.25);font:14px/1.5 'Segoe UI',system-ui,sans-serif;display:none}" +
      "#sep-install-box b{display:block;margin-bottom:6px;color:#1e3a8a}" +
      "@media print{#sep-install,#sep-install-box{display:none!important}}";
    document.head.appendChild(s);
  }

  function help() {
    if (isIOS) return "On iPhone/iPad: tap the <b style='display:inline'>Share</b> button in Safari, then <b style='display:inline'>Add to Home Screen</b>.";
    if (isFirefox) return "Firefox cannot install web apps on desktop. Please open this link in <b style='display:inline'>Chrome</b> or <b style='display:inline'>Edge</b>, then click Install app.";
    return "Click the <b style='display:inline'>install icon</b> at the right end of the address bar, or open the browser menu (&#8942; / &#8943;) and choose <b style='display:inline'>" +
      (isEdge ? "Apps &rarr; Install this site as an app" : "Install Smart Education Portal") + "</b>.";
  }

  function build() {
    css();
    btn = document.createElement("button");
    btn.id = "sep-install"; btn.type = "button";
    btn.innerHTML = "&#11015; Install app";
    box = document.createElement("div");
    box.id = "sep-install-box";
    btn.onclick = function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; });
      } else {
        box.innerHTML = "<b>Install Smart Education Portal</b>" + help();
        box.style.display = box.style.display === "block" ? "none" : "block";
      }
    };
    document.body.appendChild(box);
    document.body.appendChild(btn);
  }

  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", function () {
    if (btn) btn.remove(); if (box) box.remove();
  });
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
