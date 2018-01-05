# hexo-filter-github-emojis

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
  unicode: false
  styles:
  localEmojis:
```

The filter will try to download the latest version of [Github Emojis][ghemojis] list. If the network is unavailable or too slow it will use the backup version.

- **className** - Image class name. For :sparkles: `:sparkles:` the filter will generate something like this:

  ```html
  <img class="github-emoji" title=":sparkles:" alt=":sparkles:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/2728.png" height="20" width="20">
  ```

- **unicode** - If you set this option to true, the filter will generate something like this:

  ```html
  <span class="github-emoji" title=":sparkles:" data-src="https://assets-cdn.github.com/images/icons/emoji/unicode/2728.png">&#x2728;</span>
  ```
  Then you can fallback to image with JavaScript. For example, with jQuery:

  ```javascript
    $('span.github-emoji').each(function (i, emoji) {
      var $emoji = $(emoji)
      var codepoint = $emoji.html()
      $('<img height="20" width="20">')
        .on('error', function () {
          // image loading failed
          $emoji.html(codepoint)
        })
        .prop('alt', $emoji.attr('title'))
        .prop('src', $emoji.data('src'))
        .appendTo($emoji.empty())
    })
  ```

- **styles** - inline styles for the images. For example:

  ```yaml
  githubEmojis:
    styles:
      display: inline
      vertical-align: bottom
  ```

  outputs:

  ```html
  <img class="github-emoji" style="display:inline;vertical-align:bottom" ...>
  ```

- **localEmojis** - You can specify your own list. An object or JSON string is valid. The filter will first check the `localEmojis` then fallback to the [Github Emojis][ghemojis] list.

  For example:

  ```yaml
  githubEmojis:
    localEmojis:
      arrow_left: https://path/to/arrow_left.png
      arrow_right: https://path/to/arrow_right.png
  ```

  If you need to add code points that are not in the Github list, you can do this:

  ```yaml
  githubEmojis:
    localEmojis:
      man_juggling:
        src: https://path/to/man_juggling.png
        codepoints: ["1f939", "2642"]
      arrow_right: https://path/to/arrow_right.png
  ```

## Tag

If you do not like the `::`-style keywords, you can always use tags:

```html
{% github_emoji sparkles %}
```

Add `no-emoji: true` to front-matter to stop replacing `::`:

```md
---
title: Hello World
no-emoji: true
---

:tada: as it is.

{% github_emoji tada %} still works.
```

## Helper

You can also render a GitHub emoji from a template using the `github_emoji` helper:

```html
<h1><% github_emoji('octocat') %></h1>
```

[ghemojis]: https://api.github.com/emojis
