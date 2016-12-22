'use strict'
/* global hexo */

var _ = require('lodash')

var options = _.assign({
  enable: true,
  className: 'github-emoji'
}, hexo.config.githubEmojis)

if (options.enable !== false) {
  var request = require('request')
  var randomUa = require('random-ua')

  // fallback
  var fallbackEmojis = require('./emojis.json')

  var localEmojis = options.localEmojis
  if (_.isString(localEmojis)) {
    try {
      localEmojis = JSON.parse(localEmojis)
    } catch (SyntaxError) {
      localEmojis = {}
      throw new Error('filter-github-emojis: local emojis parsing error')
    }
  }

  var githubEmojis = _.assign(fallbackEmojis, localEmojis)

  // get the lastest github version
  request({
    url: 'https://api.github.com/emojis',
    headers: {
      'User-Agent': randomUa.generate()
    },
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if (_.isObject(body)) {
        githubEmojis = _.assign(fallbackEmojis, body, localEmojis)
      }
    }
  })

  hexo.extend.filter.register('before_post_render', function (data) {
    data.content = data.content.replace(/:(\w+):/ig, function (match, p1) {
      if (githubEmojis[p1]) {
        return '<img class="' + options.className +
        '" title="' + match + '" alt="' + match + '" src="' +
        githubEmojis[p1] + '" height="20" width="20" />'
      } else {
        return match
      }
    })
    return data
  })
}
