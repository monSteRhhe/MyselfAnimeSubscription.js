// ==UserScript==
// @name         Myself-bbs追番列表
// @namespace    http://tampermonkey.net/
// @version      23.02.20
// @description  给Myself-bbs加入追番功能。
// @author       monSteRhhe
// @match        https://myself-bbs.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @require      https://code.jquery.com/jquery-3.6.3.min.js
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    /** 添加样式 */
    GM_addStyle(`
        .popup {
            font-size: .8rem;
            padding: 7px;
            position: absolute;
            font-weight: bold;
            cursor: pointer;
            margin-left: 5px;
            text-decoration: underline;
            user-select: none;
        }
        .btn-follow {
            display: inline-block;
            font-size: 14px;
            float: right;
            height: 32px;
            width: 72px;
            text-align: center;
            background-color: #fb7299;
            color: #fff;
            cursor: pointer;
            border-radius: 2px;
        }
        .btn-follow > span {
            line-height: 32px;
            margin-left: 5px;
        }
        .active {
            background-color: #e7e7e7 !important;
            color: #999;
        }
        .iconfont:before {
            content: "❤";
        }
        .popup-container {
            position: absolute;
            inset: 0px auto auto 0px;
            margin: 0px;
            transform: translate(-130px, 30px);
            max-height: 550px;
            min-height: 300px;
            overflow: auto;
            width: 300px;
            font-size: 12px;
            display: none;
            flex-flow: column nowrap;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            background-color: white;
            cursor: auto;
            box-shadow: 0 4px 12px 0 rgb(0 0 0 / 5%);
            scrollbar-width: none;
        }
        .popup-container::-webkit-scrollbar {
            display: none;
        }
        .subs-list {
            padding: 12px 12px 1px;
        }
        .subs-card {
            cursor: pointer;
            margin-bottom: 12px;
            cursor: pointer;
            border-radius: 8px;
            box-shadow: 0 4px 12px 0 rgb(0 0 0 / 5%);
            border: 1px solid rgba(136,136,136,0.13333);
            display: grid;
            grid-template: "cover title" 2fr;
            height: 91px;
        }
        .subs-card > a {
            padding: 0;
            margin: 0;
            background: none;
            width: fit-content;
            height: fit-content;
            color: #000 !important;
            text-decoration: none;
        }
        .cover-content {
            grid-area: cover;
            width: 65px;
            height: 91px;
        }
        .cover-content > img {
            width: 65px;
            height: 91px;
        }
        .title-content {
            width: 186px !important;
            grid-area: title;
            font-size: 13px;
            font-weight: bold;
            padding: 10px !important;
            white-space: normal;
            text-overflow: ellipsis;
            word-break: break-all;
            line-height: 1.5;
            max-height: 3em;
        }
        .nosub {
            color: #000;
            line-height: 300px;
            font-size: 14px;
            text-align: center;
        }
        .panel {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            position: fixed;
            background-color: rgba(0,0,0,.7);
            display: none;
            user-select: none;
            overflow: auto;
            scrollbar-width: none;
        }
        .panel::-webkit-scrollbar {
            display: none;
        }
        .container {
            position: fixed;
            width: 65rem;
            top: 0;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            background: #fff;
        }
        .sub-tab {
            line-height: 20px;
            font-size: 20px;
            font-weight: bold;
            margin: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #000;
        }
        .close {
            font-size: 20px;
            font-weight: bold;
            position: fixed;
            right: 0;
            top: 0;
            line-height: 20px;
            padding: 20px;
            cursor: pointer;
            background-color: #fff;
        }
        .close:hover {
            background-color: #efefef;
        }
        .b-section {
            padding: 0 30px;
            height: 85%;
            overflow-y: auto;
        }
        .item {
            display: block;
            position: relative;
            width: 33.33%;
            height: 168px;
            float: left;
            margin-bottom: 30px;
            padding-right: 20px;
            box-sizing: border-box;
        }
        .item-cover {
            position: relative;
            display: block;
            float: left;
            width: 120px;
            height: 168px;
            overflow: hidden;
            text-decoration: none;
            border-radius: 4px;
            box-shadow: 0 0 2px 0 rgb(0 0 0 / 10%);
        }
        .item-cover > img {
            width: 120px;
            height: 168px;
        }
        .item-info {
            display: block;
            position: relative;
            padding-left: 130px;
            height: 168px;
        }
        .item-info:hover {
            text-decoration: none;
        }
        .item-title {
            font-size: 15px;
            font-weight: bold;
        }
        .item-desc {
            width: inherit;
            text-overflow: ellipsis;
            overflow: hidden;
            font-size: 12px;
            line-height: 20px;
            height: 60px;
        }
        .item-opt {
            position: absolute;
            width: 25px;
            height: 25px;
            font-size: 20px;
            color: #d8d8d8;
            cursor: pointer;
            right: 20px;
            bottom: 6px;
            text-align: center;
        }
        .opticon:before {
            content: "⋮";
        }
        .opt-list {
            position: absolute;
            right: 0;
            bottom: 0;
            list-style: none;
            padding: 6px 0;
            border: 1px solid #e5e9ef;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
            transform: scaleY(0);
            visibility: hidden;
            opacity: 0;
            transition: all .3s;
            background-color: #fff;
        }
        .shown {
            transform: none;
            visibility: visible;
            opacity: 1;
        }
        .opt-list li {
            width: auto;
            height: 35px;
            line-height: 35px;
            padding: 0 15px;
            white-space: nowrap;
            cursor: pointer;
            font-size: 15px;
            color: #aaa;
        }
        .opt-list li:hover {
            background-color: #efefef;
        }
        /* Elegant Scrollbar */
        html ::-webkit-scrollbar {
            width: 5px !important;
            height: 5px !important;
        }
        html ::-webkit-scrollbar-corner,
        html ::-webkit-scrollbar-track {
            background: transparent !important;
        }
        html ::-webkit-resizer,
        html ::-webkit-scrollbar-thumb {
            background: #aaa;
            border-radius: 3px;
        }
        html ::-webkit-scrollbar-thumb:hover {
            background: #888;
        }
        html,
        html * {
            scrollbar-color: #aaa transparent;
            scrollbar-width: thin !important;
        }
    `);


    /** 添加界面 */
    $('body').append(`
        <div class="panel">
            <div class="container">
                <div class="sub-tab">★ 追番列表</div>
                <div class="close">×</div>
                <div class="b-section">
                    <ul class="follow-list"></ul>
                </div>
            </div>
        </div>
    `);

    /** 关闭按钮 */
    $('.close').click(function() {
        $('.panel').fadeOut();
    })

    /** 点击旁边关闭界面 */
    $('.panel').click(function(e) {
        if (e.target == e.currentTarget) {
            $('.panel').fadeOut();
        }
    })

    /** 取消追番按钮 */
    $('div.item-opt').on('click', function() {
        if($(this).find('.opt-list').css('visibility') == 'hidden') $(this).find('.opt-list').addClass('shown');
    })
    $(document).click(function() {
        $('.opt-list').each(function() {
            if($(this).css('visibility') != 'hidden') $('.opt-list').removeClass('shown');
        })
    })
    
    $('li.opt-list-unfollow').on('click', function() {
        var title = $(this).parents('li.item').find('a.item-info').find('div.item-title').text();
        GM_deleteValue(title);

        loadData();
    })


    /** 个人资料栏添加追番列表按钮 */
    $('.mb_2').append('<span class="popup">追番列表</span>');

    $('.popup').click(function(e) {
        if (e.target == e.currentTarget) {
            shwoPanel();
        }
    })

    /** 添加弹出窗口 */
    $('.popup').append(`
        <div class="popup-container">
            <div class="subs-list"></div>
        </div>
    `);

    $('.popup').hover(function() {
        loadData();
        $('.popup-container').show();
    }, function() {
        $('.popup-container').hide();
    })


    /** 读取追番数据 */
    function loadData() {
        // 清空
        $('.subs-list').empty();
        $('.follow-list').empty();

        var subs_list = GM_listValues();
        for(var count = 0; count < subs_list.length; count++) {
            var data = GM_getValue(subs_list[count]);
            
            // 弹出窗口
            $('.subs-list').append(`
                <div class="subs-card">
                    <a target="_blank" href="` + data[2] + `" class="cover-content">
                        <img src="` + data[1] + `"/>
                    </a>
                    <a target="_blank" href="` + data[2] + `" class="title-content">` + data[0] + `</a>
                </div>
            `);
            if($('.subs-list').children().length == 0) {
                $('.subs-list').append('<div class="nosub">什麽都沒有哦~</div>');
            }

            // 追番界面
            $('.follow-list').append(`
                <li class="item">
                    <a target="_blank" href="` + data[2] + `" class="item-cover">
                        <img src="` + data[1] + `"/>
                    </a>
                    <a target="_blank" href="` + data[2] + `" class="item-info">
                        <div class="item-title">` + data[0] + `</div>
                        <div class="item-desc">` + data[3] + `</div>
                    </a>
                    <div class="item-opt">
                        <i class="opticon"></i>
                        <ul class="opt-list">
                            <li class="opt-list-unfollow">取消追番</li>
                        </ul>
                    </div>
                </li>
            `)
        }
    }


    /** 显示追番列表界面 */
    function shwoPanel() {
        loadData();
        $('.panel').fadeIn();
    }


    /** 动画页面添加追番按钮 */
    if(window.location.href.indexOf('myself-bbs.com/') != -1 && document.getElementsByClassName('info_box fl')[0] != null) {
        $('#info_introduction').append(`
            <div class="btn-follow">
                <i class="iconfont"></i>
                <span>追番</span>
            </div>
        `);
    }


    /** 获取标题 */
    $('.z > a').each(function() {
        if($(this).attr('href').indexOf('thread-') != -1) {
            var title = $(this).html().split('【')[0];
            window.title = title;
        }
    });

    /** 获取封面图链接 */
    var cover = $('.info_img_box').find('img').attr('src');

    /** 获取描述文本 */
    var description = $('.info_introduction').find('p').text().replace(/\s+/g, '');


    /** 判断是否已追番 */
    if(GM_listValues().indexOf(title) != -1) {
        wasSubed();
    }


    /** 按钮动作 */
    $('.btn-follow').click(function() {
        var check = $(this).hasClass('active');
        if(check) {
            GM_deleteValue(title);

            $('.btn-follow').removeClass('active');
            $('.btn-follow').empty();
            $('.btn-follow').append('<i class="iconfont"></i><span>追番</span>');
        }
        else {
            var value = new Array();
            value.push(title); // 标题
            value.push(cover); // 封面
            value.push(window.location.href); // 链接
            value.push(description); // 描述

            GM_setValue(title, value);
            wasSubed();
        }
    })


    /** 已追番按钮 */
    function wasSubed() {
        $('.btn-follow').addClass('active');
        $('.btn-follow > .iconfont').remove();
        $('.active > span').text('已追番');
        $('.active').hover(function() {
            $('.active > span').text('取消追番');
        }, function() {
            $('.active > span').text('已追番');
        })
    }
})();
