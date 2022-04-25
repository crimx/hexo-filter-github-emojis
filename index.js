"use strict";
/* global hexo */

const { JSDOM } = require("jsdom");

const options = Object.assign(
  {
    enable: true,
    inject: true,
    version: "latest",
    className: "github-emoji",
  },
  hexo.theme.githubEmojis || {},
  hexo.config.githubEmojis || {}
);

const emojis = Object.assign(
  {},
  require("./emojis.json"),
  loadCustomEmojis(options.customEmojis || options.localEmojis)
);

hexo.extend.helper.register("github_emoji", (name) => renderEmoji(name));
hexo.extend.tag.register("github_emoji", (args) => renderEmoji(args[0]));

if (options.inject !== false) {
  hexo.extend.filter.register("after_render:html", (str) =>
    str.replace("</head>", `\n<style>${getEmojiStyles()}</style>\n</head>`)
  );
}

if (options.enable) {
  hexo.extend.filter.register("after_post_render", (data) => {
    if (!data["no-emoji"]) {
      const $content = new JSDOM(data.content);
      const $excerpt = new JSDOM(data.excerpt);

      replaceColons($content.window.document.body);
      replaceColons($excerpt.window.document.body);

      data.content = $content.window.document.body.innerHTML;
      data.excerpt = $excerpt.window.document.body.innerHTML;
    }

    return data;
  });
}

function replaceColons(node) {
  if (!node || !node.childNodes) {
    return;
  }
  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const child = node.childNodes[i];
    if (child.tagName === "PRE" || child.tagName === "CODE") {
      continue;
    }
    if (child.nodeType === 3) {
      const content = child.data.replace(/:(\w+):/gi, (match, p1) =>
        emojis[p1] ? renderEmoji(p1) : match
      );
      if (content !== child.data) {
        child.replaceWith(JSDOM.fragment(content));
      }
    } else {
      replaceColons(child);
    }
  }
}

function loadCustomEmojis(customEmojis) {
  // JSON string
  if (typeof customEmojis === "string") {
    try {
      customEmojis = JSON.parse(customEmojis);
      Object.keys(customEmojis).forEach((name) => {
        if (typeof customEmojis[name] === "string") {
          customEmojis[name] = {
            src: customEmojis[name],
          };
        }
      });
    } catch (err) {
      customEmojis = {};
      console.warn(
        "hexo-filter-github-emojis: Custom emojis not valid. Skipped."
      );
    }
  }

  if (typeof customEmojis !== "object" || customEmojis === null) {
    customEmojis = {};
  }

  return Object.keys(customEmojis).reduce((emojis, name) => {
    const emoji = customEmojis[name];
    emojis[name] = Object.assign(
      {},
      emoji,
      emoji.codepoints && !Array.isArray(emoji.codepoints)
        ? { codepoints: emoji.codepoints.split(" ") }
        : {}
    );
    return emojis;
  }, {});
}

function renderEmoji(name) {
  if (!emojis[name]) return name;

  const styles = typeof options.styles === "object" && options.styles !== null
    ? ` style="${Object.keys(options.styles)
        .map((k) => k + ":" + options.styles[k])
        .join(";")}"`
    : "";

  const codepoints = emojis[name].codepoints
    ? emojis[name].codepoints.map((c) => `&#x${c};`).join("")
    : " ";

  return (
    `<span class="${options.className}"${styles}>` +
    `<span>${codepoints}</span>` +
    `<img src="${emojis[name].src}" aria-hidden="true" onerror="this.parent.classList.add('${options.className}-fallback')">` +
    `</span>`
  );
}

function getEmojiStyles() {
  const rules = `.${options.className} {
    position: relative;
    display: inline-block;
    width: 1.2em;
    min-height: 1.2em;
    overflow: hidden;
    vertical-align: top;
    color: transparent;
  }
  
  .${options.className} > span {
    position: relative;
    z-index: 10;
  }
  
  .${options.className} img,
  .${options.className} .fancybox {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    outline: none !important;
    text-decoration: none !important;
    user-select: none !important;
    cursor: auto !important;
  }
  
  .${options.className} img {
    height: 1.2em !important;
    width: 1.2em !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    user-select: none !important;
    cursor: auto !important;
  }

  .${options.className}-fallback {
    color: inherit;
  }

  .${options.className}-fallback img {
    opacity: 0 !important;
  }`;

  return rules.replace(/^ +/gm, " ").replace(/\n/g, "");
}
