'use strict'
/* global hexo */

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const { JSDOM } = require('jsdom')

var options = _.assign({
  enable: true,
  inject: true,
  version: 'latest',
  className: 'github-emoji',
}, hexo.config.githubEmojis)

if (options.enable !== false) {
  const emojis = _.assign(
    {},
    require('./emojis.json'),
    loadCustomEmojis(options.customEmojis || options.localEmojis),
  )

  fs.writeFile(
    path.join(__dirname, 'emojis.json'),
    JSON.stringify(emojis, null, '  '),
    function (err) { err && console.warn(err) },
  )

  hexo.extend.filter.register('after_post_render', data => {
    if (!options.inject && data['no-emoji']) { return data }

    const $content = new JSDOM(data.content)
    const $excerpt = new JSDOM(data.excerpt)

    if (options.inject) {
      const $script = $content.window.document.createElement('script')
      $script.innerHTML = `
        document.querySelectorAll('.${options.className}')
          .forEach(el => {
            if (!el.dataset.src) { return; }
            const img = document.createElement('img');
            img.style = 'display:none !important;';
            img.src = el.dataset.src;
            img.addEventListener('error', () => {
              img.remove();
              el.style.color = 'inherit';
              el.style.backgroundImage = 'none';
              el.style.background = 'none';
            });
            img.addEventListener('load', () => {
              img.remove();
            });
            document.body.appendChild(img);
          });
      `
      $content.window.document.body.appendChild($script)
    }

    if (!data['no-emoji']) {
      replaceColons($content.window.document.body, emojis)
      replaceColons($excerpt.window.document.body, emojis)
    }

    data.content = $content.window.document.body.innerHTML
    data.excerpt = $excerpt.window.document.body.innerHTML
    return data
  })

  hexo.extend.helper.register('github_emoji', name => renderEmoji(emojis, name))
  hexo.extend.tag.register('github_emoji', args => renderEmoji(emojis, args[0]))
}

function replaceColons (node, emojis) {
  if (!node || !node.childNodes) { return }
  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const child = node.childNodes[i]
    if (child.tagName === 'PRE' || child.tagName === 'CODE') { return }
    if (child.nodeType === 3) {
      const content = child.data.replace(
        /:(\w+):/ig,
        (match, p1) => emojis[p1] ? renderEmoji(emojis, p1) : match,
      )
      if (content !== child.data) {
        child.replaceWith(JSDOM.fragment(content))
      }
    } else {
      replaceColons(child, emojis)
    }
  }
}

function loadCustomEmojis (customEmojis) {
  // JSON string
  if (_.isString(customEmojis)) {
    try {
      customEmojis = JSON.parse(customEmojis)
      Object.keys(customEmojis).forEach(name => {
        if (_.isString(customEmojis[name])) {
          customEmojis[name] = {
            src: customEmojis[name],
          }
        }
      })
    } catch (err) {
      customEmojis = {}
      console.warn('hexo-filter-github-emojis: Custom emojis not valid. Skipped.')
    }
  }

  if (!_.isObject(customEmojis)) {
    customEmojis = {}
  }

  Object.values(customEmojis).forEach(emoji => {
    if (emoji.codepoints && !_.isArray(emoji.codepoints)) {
      emoji.codepoints = emoji.codepoints.split(' ')
    }
  })
}

function renderEmoji (emojis, name) {
  if (!emojis[name]) { return name }

  const styles = _.isObject(options.styles)
    ? Object.keys(options.styles)
      .filter(k => _.isString(options.styles[k]))
      .map(k => k + ':' + options.styles[k])
    : []

  if (options.inject) {
    styles.push(
      'color: transparent',
      `background:no-repeat url(${emojis[name].src}) center/contain`,
    )
  } else {
    styles.push(`background-image:url(${emojis[name].src})`)
  }

  const codepoints = emojis[name].codepoints
    ? emojis[name].codepoints.map(c => `&#x${c};`).join('')
    : ' '

  return `<span class="${options.className}" style="${styles.join(';')}" data-src="${emojis[name].src}">${codepoints}</span>`
}
