// ==UserScript==
// @name         网页翻译-总是聚焦输入框
// @namespace    http://tampermonkey.net/
// @version      2024-07-01
// @description  将百度/有道翻译/DeepL等页面总是聚焦在输入框
// @author       v
// @match        https://fanyi.baidu.com/*
// @match        https://fanyi.youdao.com/*
// @match        https://www.deepl.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @grant        GM_log
// ==/UserScript==

(function() {
  'use strict'
  window.onload = function() {
    var host = window.location.hostname
    var get_el_fns = {
      'fanyi.baidu.com': function() {
        return document.getElementById('baidu_translate_input')
      },
      'fanyi.youdao.com': function () {
        return document.getElementById('js_fanyi_input')
      },
      // vimium-c似乎对聚焦有影响?
      'www.deepl.com': function() {
        return document.querySelector('div[_d-id="1"]')
      }
    }

    // 异步等待与循环方法
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    async function asyncWhile(conditionFunc, actionFunc, interval = 1000) {
      while (await conditionFunc()) {
        await actionFunc()
        await sleep(interval)
      }
    }

    // 异步循环5次获取目标元素
    var el = null
    var try_count = 0
    async function condition() {
      return try_count < 5 && !el
    }
    async function try_get_el() {
      el = get_el_fns[host]()
      try_count++
    }
    (async () => {
      await asyncWhile(condition, try_get_el, 1000)
      // 循环结束
      if (!el) {
        GM_log('未获取到元素')
      } else {
        el.click()
        el.focus()
        el.addEventListener('blur', function() {
          setTimeout(function() {
            el.click()
            el.focus()
          }, 2000)
        })
      }
    })()
  }
})()