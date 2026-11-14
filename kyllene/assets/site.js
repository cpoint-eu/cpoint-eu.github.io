// Kyllene instruction pages: copy buttons + the newest release on the download button.
// Without JavaScript (or when the GitHub API is unreachable) the button simply opens the latest release page.
(function () {
  "use strict";
  var REPO = "cpoint-eu/kyllene-releases";
  var lang = document.documentElement.lang === "cs" ? "cs" : "en";
  var T = {
    en: { copy: "Copy", copied: "Copied", latest: "Latest version {v}, released {d} · AppImage {s} MB", none: "" },
    cs: { copy: "Kopírovat", copied: "Zkopírováno", latest: "Nejnovější verze {v}, vydaná {d} · AppImage {s} MB", none: "" },
  }[lang];

  // Copy buttons next to every command block.
  document.querySelectorAll(".cmd").forEach(function (box) {
    var pre = box.querySelector("pre");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = T.copy;
    btn.addEventListener("click", function () {
      var text = Array.prototype.map.call(pre.querySelectorAll("code"), function (c) { return c.textContent; }).join("\n");
      var done = function () {
        btn.textContent = T.copied;
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = T.copy; btn.classList.remove("done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    });
    box.appendChild(btn);
  });

  // Newest release: direct AppImage / .msi links + version line.
  var info = document.querySelector("[data-release-info]");
  var links = document.querySelectorAll("[data-download]");
  if (!links.length && !info) return;
  fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rel) {
      if (!rel || !rel.assets) return;
      var pick = function (re) { return rel.assets.filter(function (a) { return re.test(a.name); })[0]; };
      var asset = pick(/_amd64\.AppImage$/);
      var msi = pick(/_x64_en-US\.msi$/);
      // data-download="msi" = the Windows installer, a bare data-download = the AppImage
      links.forEach(function (a) {
        var hit = a.getAttribute("data-download") === "msi" ? msi : asset;
        if (hit) a.href = hit.browser_download_url;
      });
      if (!asset) return;
      if (info) {
        var d = new Date(rel.published_at).toLocaleDateString(lang === "cs" ? "cs-CZ" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
        info.textContent = T.latest
          .replace("{v}", rel.tag_name)
          .replace("{d}", d)
          .replace("{s}", Math.round(asset.size / 1048576));
      }
    })
    .catch(function () {});
})();
