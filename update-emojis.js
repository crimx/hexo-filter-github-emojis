const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const request = require('request')
const randomUa = require('random-ua')

// get the latest github version
request({
  url: 'https://api.github.com/emojis',
  headers: {
    'User-Agent': randomUa.generate(),
  },
  json: true,
}, function (error, response, json) {
  if (response.statusCode === 304) { return }
  if (error || !_.isObject(json)) {
    console.error('Failded to download Github emojis.')
    console.log(error, response, json)
    process.exit(1)
  }

  const latestEmojis = Object.keys(json).reduce((emojis, name) => {
    emojis[name] = { src: json[name] }

    const match = /\/unicode\/(\S+)\./.exec(json[name])
    if (match) {
      emojis[name].codepoints = match[1].split('-')
    }

    return emojis
  }, {})

  // update local backup
  fs.writeFile(
    path.join(__dirname, 'emojis.json'),
    JSON.stringify(latestEmojis, null, '  '),
    function (err) {
      if (err) {
        console.warn(err)
        process.exit(1)
      } else {
        console.log(`Update ${Object.keys(latestEmojis).length} emojis`)
      }
    },
  )
})
