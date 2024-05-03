// ==UserScript==
// @name         多邻国选词快捷键
// @namespace    http://tampermonkey.net/
// @version      2024-05-02
// @description  使用快捷键刷多邻国. 在主页面使用l键快速开始学习;在学习页使用ctrl键播放语音, 使用回车键提交答案时为选词添加序号,退格键删除选词,删除键删除全部选词. 如果官方和脚本的快捷键无法正常使用, 需要在`vimium-c`等快捷键相关插件中排除多邻国网站
// @author       v
// @match        https://www.duolingo.cn/*
// @match        https://www.duolingo.com/*
// @license      MIT
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js
// @require      http://cdn.staticfile.org/jquery/1.8.3/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// @grant        GM_log
// @grant        GM_addStyle
// ==/UserScript==

// 序号样式
// todo GM_addStyle(...) is not a function
// GM_addStyle(".p_item_tip {position: absolute; color: dodgerblue; background-color: greenyellow; border-radius: 5px; !important;}")

(function() {
  'use strict'
  // 选词键顺序
  var chars='abcdefghijklmnopqrstuvwxyz1234567890-=[],./'
  // 题目区元素相关数据对象
  // type -1: 无效 0: 选择题(自带[数字],不需要处理) 1: 组句题 2: 配对题(自带[数字],不需要处理) 3: 填空题(自带[首字母], 不需要处理)
  // el: 主要题目区元素
  // el2: 次要题目区元素
  var question = {type: -1}
  // 始初化题目数据对象方法
  var init_question = function() {
      if (question.type > -1) {
          return question
      }
      // 填空题(自带,不需要处理)
      question.el = document.querySelector('div[data-test="challenge challenge-tapComplete"]')
      if (question.el) {
          question.type = 3
          return
      }
      // 配对题(自带,不需要处理)
      question.el = document.querySelector('div[data-test="challenge challenge-listenMatch"]')
      if (question.el) {
          question.el = question.el.children[0].children[1].children[0]
          question.type = 2
          return
      }
      // 组句题
      question.el = document.querySelector('div[data-test="word-bank"]')
      if (question.el) {
          question.type = 1
          question.el2 = question.el.parentElement.previousElementSibling.children[0].children[0].children[1]
          return
      }
      // 选择题(自带,不需要处理)
      question.el = document.querySelector('div[aria-label="choice"]')
      if (question.el) {
          question.type = 0
          return
      }
      // 未知题型
      question.type = -1
  }

  // 防抖方法
  function debounce(func, delay) {
      let timeout
      return function () {
          const _this = this
          const args = [...arguments]
          if (timeout) {
              clearTimeout(timeout)
          }
          timeout = setTimeout(() => {
              func.apply(_this, args)
          }, delay)
      }
  }

  // 为单词/短语添加序号方法
  var process_order = function() {
      var play_btn = document.querySelector('button[data-test="player-next"]')
      if (!play_btn || play_btn.getAttribute('aria-disabled') != 'true') { return }
      init_question()
      if (question.type == 1) {
          for (var i=0; i< question.el.children.length; i++) {
              var item = question.el.children[i]
              let new_el = document.createElement('span')
              new_el.textContent = chars.charAt(i)
              // new_el.className = 'p_item_tip'
              new_el.setAttribute('style', 'position: absolute; color: dodgerblue; background-color: greenyellow; border-radius: 5px;')
              item.appendChild(new_el)
          }
      }
  }
  // 为单词/短语添加序号方法(防抖)
  var process_order_debounce = debounce(process_order, 500)

  // 按键事件监听
  document.onkeydown = function(event) {
      // GM_log(event.key)
      // 当前页
      var page_name = window.location.pathname
      // 在主页时 按l键直接学习(跳转/lesson页)
      if (page_name == '/learn') {
          if (event.key == 'l') {
              window.location.href = 'lesson'; return
          }
          return
      }

      // 在学习页
      if (page_name == '/lesson') {
          // 初始化题目区数据
          init_question()
          // 回车键: 延时为下一题单词/短语添加序号
          if (event.key == 'Enter') {
              question.type = -1

              process_order_debounce()
              return
          }
          // 退格键, 删除最后一个选词
          if (event.key == 'Backspace') {
              if (question.el2) {
                  var selects = question.el2.children
                  var cnt = selects.length
                  var last_select = selects[cnt - 1]
                  last_select.querySelector('button').click()
              }
              return
          }
          // 删除键, 删除所有选词
          if (event.key == 'Delete') {
              if (question.el2) {
                  var selects = question.el2.children
                  var cnt = selects.length
                  for (var i=cnt; cnt > 0; cnt--) {
                      var select = selects[cnt - 1]
                      select.querySelector('button').click()
                  }
              }
              return
          }
          // 按z键时如果页面有"不,谢谢"按钮, 就点击它
          if (event.key == 'z') {
              var skip_el = document.querySelector('button[data-test="plus-no-thanks"], button[data-test="practice-hub-ad-no-thanks-button"]')
              if (skip_el) {
                  skip_el.click()
                  return
              }
          }

          // Control键, 点击扬声器按钮播放语音
          if (event.key == 'Control') {
              var els = document.getElementsByClassName('fs-exclude')
              if (els) {
                  els[0].click()
              }
              return
          }

          // 到这里已经处理完特殊按键事件
          // 剩下按字母/数字键的情况
          // 将按键转为序号, 未找到时不处理
          var idx = chars.indexOf(event.key)
          if (idx < 0) { return }

          // 选择题
          if (question.type == 0) {
              if (question.el.children.length >= idx) {
                  question.el.children[idx].click()
              }
              return
          }

          // 组句题
          if (question.type == 1) {
              if (question.el.children.length >= idx) {
                  var el = question.el.children[idx]
                  var item = el.children[0].children[0]
                  if (item.getAttribute('aria-disabled') != 'true') {
                      item.click()
                      return
                  }
                  var text = item.querySelector('span[data-test="challenge-tap-token-text"').innerHTML
                  var selects_div = question.el2
                  var selects = selects_div.querySelectorAll('span[data-test="challenge-tap-token-text"]')
                  for (var i= 0; i < selects.length; i++) {
                      var select = selects[i]
                      if (select.innerHTML == text) {
                          select.parentElement.parentElement.click()
                          return
                      }
                  }
              }
          }

          // 配对题(自带,不需要处理)
          // if (question.type == 2) {
          //    var no = Number(event.key)
          //   if (!isNaN(no)) {
          //       idx = no - 1
          //       var length = question.el.children.length
          //     if (idx >=0 && idx < length) {
          //          var el = question.el.children[idx].getElementsByClassName('fs-exclude')
          //         if (el) {
          //           el.click()
          //             return
          //        }
          //        el = question.el.children[idx].querySelector('button').click()
          //    }
          //  }
          //  return
          //    }
      }
  }

  // 页面加载后第一个题就是组句题的情况, 添加序号
  setTimeout(process_order, 2000)

})()