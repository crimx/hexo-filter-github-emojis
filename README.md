# hexo-filter-github-emojis

[![Build Status](https://travis-ci.org/crimx/hexo-filter-github-emojis.svg?branch=master)](https://travis-ci.org/crimx/hexo-filter-github-emojis)
[![Coverage Status](https://img.shields.io/coveralls/crimx/hexo-filter-github-emojis.svg)](https://coveralls.io/r/crimx/hexo-filter-github-emojis?branch=master)
[![Npm Version](https://img.shields.io/npm/v/hexo-filter-github-emojis.svg)](https://npmjs.org/package/hexo-filter-github-emojis) 
[![Npm Downloads Month](https://img.shields.io/npm/dm/hexo-filter-github-emojis.svg)](https://npmjs.org/package/hexo-filter-github-emojis)
[![Npm Downloads Total](https://img.shields.io/npm/dt/hexo-filter-github-emojis.svg)](https://npmjs.org/package/hexo-filter-github-emojis)
[![License](https://img.shields.io/npm/l/hexo-filter-github-emojis.svg)](https://npmjs.org/package/hexo-filter-github-emojis)

A Hexo plugin that adds emoji support, using [Github Emojis API][ghemojis].

Check out the [Emoji Cheat Sheet](http://www.webpagefx.com/tools/emoji-cheat-sheet/) for all the emojis it supports.

## Installation

``` bash
$ npm install hexo-filter-github-emojis --save
```

## Options

You can configure this plugin in `_config.yml`. Default options:

``` yaml
githubEmojis:
  enable: true
  className: github-emoji
  localEmojis:
```

The filter will try to download the latest version of [Github Emojis][ghemojis] list. If the network is unavailable or too slow it will use the backup version.

- **className** - Image class name. For `:sparkles:` the filter will generate something like this:

  ```html
  <img class="github-emoji" title=":sparkles:" alt=":sparkles:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/2728.png" height="20" width="20">
  ```

- **localEmojis** - You can specify your own list. An object or JSON string is valid. The filter will first check the `localEmojis` then fallback to the [Github Emojis][ghemojis] list.

  For example:
  
  ``` yaml
  githubEmojis:
    localEmojis:
      arrow_left: https://path/tp/arrow_left.png
      arrow_right: https://path/tp/arrow_right.png
  ```

[ghemojis]: https://api.github.com/emojis
