// ==UserScript==
// @name         抖音精简-去除右下角烦人的反馈按钮
// @namespace    http://tampermonkey.net/
// @version      2024-06-25
// @description  抖音在小屏幕电脑上想要全屏时鼠标容易划到右下角的反馈按钮上, 移除它防止自动弹出的反馈菜单遮挡全屏按钮
// @author       v
// @match        https://www.douyin.com/*
// @license      MIT
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js
// @require      http://cdn.staticfile.org/jquery/1.8.3/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// @grant        GM_log
// @grant        GM_addStyle
// ==/UserScript==

; (function () {
  'use strict'

  window.onload = function() {

    function rm_sidebar() {
      setTimeout(function() {
        var el = document.getElementById("douyin-sidebar")
        if (el) {
          el.parentNode.removeChild(el)
        }
      }, 2000)
    }
    rm_sidebar()
    
    function rm_temp_sidebar() {
      setTimeout(function() {
        var el = document.getElementById("douyin-temp-sidebar")
        if (el) {
          el.parentNode.removeChild(el)
        }
      }, 2000)
    }

    function clean() {
      rm_sidebar()
      rm_temp_sidebar()
    }

    // temp_sidebar会自动回来并且全屏按钮添加的事件会自动失效
    // var full_screen_btn = document.getElementsByClassName("xgplayer-fullscreen")[0]
    // full_screen_btn.addEventListener("mouseover", clean)
    // full_screen_btn.addEventListener("click", clean)

    // 改使用死循环每隔5秒移除一次temp_sidebar
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    async function asyncWhile(conditionFunc, actionFunc, interval = 1000) {
      while (await conditionFunc()) {
        await actionFunc()
        await sleep(interval)
      }
    }
    (async () => {
      await asyncWhile(async () => true, clean, 5000)
    })()

  }
})()
