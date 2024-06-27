// ==UserScript==
// @name         bilibili禁止首页视频自动预览
// @namespace    http://tampermonkey.net/
// @version      2024-06-27
// @description  禁止bilibili首页鼠标悬停时自动预览视频
// @author       v
// @match        https://www.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  // div class="bili-video-card__image--wrap" mouseenter
  document.addEventListener('mouseenter', function(event) {
    event.stopPropagation()
    event.stopImmediatePropagation()
    return
  }, true)
})()