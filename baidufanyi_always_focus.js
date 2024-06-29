// ==UserScript==
// @name         百度翻译-总是聚焦输入框
// @namespace    http://tampermonkey.net/
// @version      2024-06-29
// @description  将百度翻译页面总是聚焦在输入框
// @author       v
// @match        https://fanyi.baidu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict'
  window.onload = function() {
    var textarea = document.getElementById('baidu_translate_input')
    var select_all = function() {
      textarea.setSelectionRange(0, textarea.value.length)
    }
    select_all()
    textarea.addEventListener('blur', function() {
      setTimeout(function() {
        textarea.focus()
        select_all()
      }, 2000)
    })
  }
})()