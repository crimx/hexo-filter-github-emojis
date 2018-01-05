'use strict'
/* global hexo */

var _ = require('lodash')

var options = _.assign({
  enable: true,
  unicode: false,
  version: 'latest',
  className: 'github-emoji'
}, hexo.config.githubEmojis)

if (options.enable !== false) {
  var path = require('path')
  var url = require('url')
  var fs = require('fs')
  var request = require('request')
  var randomUa = require('random-ua')

  // fallback
  var fallbackEmojis = require('./emojis.json')

  // load custom emojis
  var localEmojis = options.localEmojis
  // JSON string
  if (_.isString(localEmojis)) {
    try {
      localEmojis = JSON.parse(localEmojis)
      Object.keys(localEmojis).forEach(function (name) {
        if (_.isString(localEmojis[name])) {
          localEmojis[name] = {
            src: localEmojis[name]
          }
        }
      })
    } catch (SyntaxError) {
      localEmojis = {}
      console.warn('filter-github-emojis: local emojis error')
    }
  }
  if (!_.isObject(localEmojis)) {
    localEmojis = {}
  }
  Object.keys(localEmojis).forEach(function (name) {
    var codepoints = localEmojis[name].codepoints
    if (codepoints && !_.isArray(codepoints)) {
      localEmojis[name].codepoints = codepoints.split(' ')
    }
  })

  var emojis = _.assign(fallbackEmojis, localEmojis)

  // get the latest github version
  request({
    url: 'https://api.github.com/emojis',
    headers: {
      'User-Agent': randomUa.generate()
    },
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if (_.isObject(body)) {
        var latestEmojis = {}
        Object.keys(body).forEach(function (name) {
          latestEmojis[name] = { src: body[name] }
          if (body[name].indexOf('unicode') !== -1) {
            // list of unicode code points
            latestEmojis[name].codepoints = path.parse(url.parse(body[name]).pathname).name.split('-')
          }
        })
        var githubEmojis = _.assign(fallbackEmojis, latestEmojis)
        emojis = _.assign(githubEmojis, localEmojis)
        // update local backup
        fs.writeFile(
          path.join(__dirname, 'emojis.json'),
          JSON.stringify(githubEmojis, null, '\t'),
          function (err) { err && console.warn(err) }
        )
      }
    }
  })

  hexo.extend.filter.register('before_post_render', function (data) {
    if (data['no-emoji']) { return data }
    data.content = data.content.replace(/:(\w+):/ig, function (match, p1) {
      if (emojis[p1]) {
        return getRender(p1);
      } else {
        return match
      }
    })
    return data
  })

  hexo.extend.helper.register('github_emoji', function (name) {
    return getRender(name)
  })

  hexo.extend.tag.register('github_emoji', function(args){
    return getRender(args[0])
  })

  function getRender (emojiName) {
    emojiName = String(emojiName)
    if (!emojis[emojiName]) { return emojiName }

    var styles = ''
    if (_.isObject(options.styles)) {
      // inline styles
      styles = 'style="' +
        Object.keys(options.styles)
        .filter(function (k) { return _.isString(options.styles[k]) })
        .map(function (k) { return k + ':' + options.styles[k] })
        .join(';') +
        '"'
    }

    var codepoints = emojis[emojiName].codepoints
    if (options.unicode && codepoints) {
      codepoints = codepoints.map(function (code) {
        return '&#x' + code + ';'
      }).join('')

      return '<span class="' + options.className + '" ' +
        styles +
        ' title="' + emojiName +
        '" data-src="' + emojis[emojiName].src +
        '">' + codepoints + '</span>'
    } else {
      return '<img class="' + options.className + '" ' +
        styles +
        ' title="' + emojiName + '" alt="' + emojiName + '" src="' +
        emojis[emojiName].src + '" height="20" width="20" />'
    }
  }
}
