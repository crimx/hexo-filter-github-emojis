'use strict'
/* global hexo */

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')

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

    const $ = cheerio.load(data.content)
    const excerpt = cheerio.load(data.excerpt)

    if (options.inject) {
      $('body').append(`<script>
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
      </script>`)
    }

    if (!data['no-emoji']) {
      replaceColons($('body')[0], $, emojis)
      replaceColons(excerpt('body')[0], excerpt, emojis)
    }

    data.content = $('body').html()
    data.excerpt = excerpt('body').html()
    return data
  })

  hexo.extend.helper.register('github_emoji', name => renderEmoji(emojis, name))
  hexo.extend.tag.register('github_emoji', args => renderEmoji(emojis, args[0]))
}

function replaceColons (node, $, emojis) {
  node.children.forEach(child => {
    if (child.type === 'text') {
      const content = child.data.replace(
        /:(\w+):/ig,
        (match, p1) => emojis[p1] ? renderEmoji(emojis, p1) : match,
      )
      if (content !== child.data) {
        $(child).replaceWith($.parseHTML(content))
      }
    } else if (child.type === 'tag') {
      if (child.name !== 'pre' && child.name !== 'code') {
        replaceColons(child, $, emojis)
      }
    }
  })
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
