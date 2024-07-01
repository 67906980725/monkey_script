// ==UserScript==
// @name         网页翻译-快捷键聚焦输入框
// @namespace    http://tampermonkey.net/
// @version      2024-07-01
// @description  在百度/有道翻译/DeepL等页面按快捷键聚焦输入框
// @author       v
// @match        https://fanyi.baidu.com/*
// @match        https://fanyi.youdao.com/*
// @match        https://www.deepl.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @grant        GM_log
// ==/UserScript==

(function () {
  'use strict'
  window.onload = function () {
    var host = window.location.hostname
    var get_el_fns = {
      'fanyi.baidu.com': function () {
        return document.getElementById('baidu_translate_input')
      },
      'fanyi.youdao.com': function () {
        return document.getElementById('js_fanyi_input')
      },
      'www.deepl.com': function () {
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
        // 聚焦方法
        function select_all(_el) {
          _el.focus()
          var tag = _el.tagName.toLowerCase()
          if (tag == 'div') {
            var range = document.createRange()
            range.selectNodeContents(_el)
            var selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)
          } else if (tag == 'textarea') {
            _el.setSelectionRange(0, _el.value.length)
          }
        }
        select_all(el)
        document.addEventListener('keydown', function (event) {
          //GM_log('按下按键:' + event.key)
          // 同时按下ctrl+alt聚焦
          if (event.ctrlKey && event.altKey) {
            select_all(el)
          }
        })
      }
    })()
  }
})()