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
  inject: true
  styles:
  customEmojis:
```

- **enable** `boolean=true` - Enable `::` emoji parsing. If off the [tag](#tag) and [helper](#helper) still work.

- **className** `string="github-emoji"` - Emoji class name.  
  For example :sparkles: `:sparkles:` the filter will generate something like this:

  ```html
  <span class="github-emoji"><span>&#x2728;</span><img src="https://assets-cdn.github.com/images/icons/emoji/unicode/2728.png?v8"></span>
  ```

- **inject** `boolean=true` - Inject emoji styles and fallback script.  
  If `true`, the filter will inject a `<style>` to the html.  
  If `false`, the filter will not inject any style. If you can modify source style files you may turn this off and add them yourself.  
  
  Below are the injected styles. The class name changes according to option.

  ```css
  .github-emoji {
    position: relative;
    display: inline-block;
    width: 1.2em;
    min-height: 1.2em;
    overflow: hidden;
    vertical-align: top;
    color: transparent;
  }

  .github-emoji > span {
    position: relative;
    z-index: 10;
  }

  .github-emoji img,
  .github-emoji .fancybox {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    outline: none !important;
    text-decoration: none !important;
    user-select: none !important;
    cursor: auto !important;
  }

  .github-emoji img {
    height: 1.2em !important;
    width: 1.2em !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    user-select: none !important;
    cursor: auto !important;
  }

  .github-emoji-fallback {
    color: inherit;
  }

  .github-emoji-fallback img {
    opacity: 0 !important;
  }
  ```

- **styles** `object={}` - inline styles. For example:

  ```yaml
  githubEmojis:
    styles:
      font-size: 2em
      font-weight: bold
  ```

  outputs:

  ```html
  <span class="github-emoji" style="font-size:2em;font-weight:bold" ...>
  ```

- **customEmojis** `object={}` - You can specify your own list. An object or JSON string is valid. The filter will first check the `customEmojis` then fallback to the [Github Emojis][ghemojis] list.

  For example:

  ```yaml
  githubEmojis:
    customEmojis:
      arrow_left: https://path/to/arrow_left.png
      arrow_right: https://path/to/arrow_right.png
  ```

  If you need to add code points that are not in the Github list, you can do this:

  ```yaml
  githubEmojis:
    customEmojis:
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
<h1><%- github_emoji('octocat') %></h1>
```

## Fancybox

If you are using theme that enables fancybox(e.g. the default landscape theme) it is recommended to skip the github emoji imgs.

Edit `themes/landscape/source/script.js`

```diff
   // Caption
   $('.article-entry').each(function(i){
     $(this).find('img').each(function(){
       if ($(this).parent().hasClass('fancybox')) return;
+      if ($(this).parent().hasClass('github-emoji')) return;
 
       var alt = this.alt;
 
       if (alt) $(this).after('<span class="caption">' + alt + '</span>');
 
       $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
     });
 
     $(this).find('.fancybox').each(function(){
       $(this).attr('rel', 'article' + i);
     });
   });
```

[ghemojis]: https://api.github.com/emojis
