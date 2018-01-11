/**
 * @file mip-yuanxiaoku-zhuanyedetails 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();
    var viewport = require('viewport');
    var util = require('util');
    var CustomStorage = util.customStorage;
    var customStorage = new CustomStorage(0);

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var element = this.element;
        var $element = $(element);

        var zhuanyeId = getRequest().Id;

        var zhuanyeName = urlEncode(base64('decode', getRequest().name));
        var category = (customStorage.get('xuanZhuanYeCategory')
            ? customStorage.get('xuanZhuanYeCategory') : getRequest().category);

        var page = 1;
        var currentPage = 1;
        var pageCount = 1;

        switch (category) {
            case 'details':
                details();
                loadDetails();
                loadCollege('https://data.api.ppkao.com/Interface/YXK/SchoolSpecialtyApi.ashx', {
                    action: 'SpecialtyOpneSchool',
                    specialname: zhuanyeName,
                    Page: page
                });
                break;
            case 'college':
                college();
                loadCollege('https://data.api.ppkao.com/Interface/YXK/SchoolSpecialtyApi.ashx', {
                    action: 'SpecialtyOpneSchool',
                    specialname: zhuanyeName,
                    Page: page
                });
                loadDetails();
                break;
            default:
                details();
                loadDetails();
                loadCollege('https://data.api.ppkao.com/Interface/YXK/SchoolSpecialtyApi.ashx', {
                    action: 'SpecialtyOpneSchool',
                    specialname: zhuanyeName,
                    Page: page
                });
                break;
        }

        // 专业详情
        function details() {
            $element.find('.details-container .title ul .title-details')
            .addClass('current').siblings('li').removeClass('current');
            $element.find('.details-container .content').css({transform: 'translateX(0)'}).addClass('transition');
        }
        function loadDetails() {
            $element.find('.details-container .content-details .load-info .loading').show();
            $element.find('.details-container .content-details .zanwu-shuju').hide();

            fetch('https://data.api.ppkao.com/Interface/YXK/SchoolSpecialtyApi.ashx?action=SelectProfessionalByid&zid=' + zhuanyeId)
            .then(function (res) {
                return res.json();
            }).then(function (json) {
                console.log(decode(json));
                if (decode(json).S === '0') {
                    $element.find('.details-container .content-details .load-info .loading').hide();
                    $element.find('.details-container .content-details .zanwu-shuju').show();
                    return;
                }
                var list = decode(json).pList;
                $element.find('.top-title h1').html(list[0].specialname);
                $element.find('.details-container .content-details .jianjie h2').html(list[0].specialname);
                $element.find('.details-container .content-details .jianjie ul').html(
                    list.map(function (item, index) {
                        return (
                            '<li>'
                            +    '专业代码：<span>' + (item.code ? item.code : '--') + '</span>'
                            + '</li>'
                            + '<li>'
                            +    '开设院校：<span>' + (item.schoolNum ? item.schoolNum : '暂时没有一') + '所</span>'
                            + '</li>'
                            + '<li>'
                            +    '主干学科：<span>' + (item.zytype ? item.zytype : '--') + '</span>'
                            + '</li>'
                        );
                    })
                );
                $element.find('.details-container .content-details .gaikuo ul').html(
                    list.map(function (item, index) {
                        return (
                            '<li>'
                            +    '<h3>专业介绍</h3>'
                            +    '<article>' + item.jieshao + '</article>'
                            + '</li>'
                            + '<li>'
                            +    '<h3>就业方向</h3>'
                            +    '<article>' + (item.jiuyefangxiang ? item.jiuyefangxiang : '--') + '</article>'
                            + '</li>'
                            + '<li>'
                            +    '<h3>培养目标</h3>'
                            +    '<article>' + (item.peiyangmubiao ? item.peiyangmubiao : '--') + '</article>'
                            + '</li>'
                        );
                    })
                );

                $element.find('.details-container .content-details .load-info .loading').hide();
            });
        }

        // 开设院校
        function college() {
            $element.find('.details-container .title ul .title-college')
            .addClass('current').siblings('li').removeClass('current');
            $element.find('.details-container .content').css({transform: 'translateX(-50%)'});
        }
        var loadInfo = true;
        function loadCollege(url, argu) {
            $element.find('.content-college .load-info .none').hide();
            $element.find('.content-college .load-info .loading').show();

            for (var key in argu) {
                // console.log(key);
                url = url + '&' + key + '=' + argu[key];
            }
            url = url.replace(/&/, '?');
            // console.log(url);

            fetch(url)
            .then(function (res) {
                return res.json();
            }).then(function (json) {
                console.log(decode(json));
                var list = decode(json);

                if (list.S === '0') {
                    $element.find('.content-college .load-info .loading').hide();
                    $element.find('.content-college .load-info .none').show();
                    return;
                }

                var schoolList = list.SchoolList;

                currentPage = parseInt(list.CurrentPage, 10);
                pageCount = parseInt(list.PageCount, 10);
                console.log(currentPage, pageCount);

                $element.find('.details-container .content-college ul').append(
                    schoolList.map(function (item, index) {
                        return (
                            '<li>'
                            +    '<h2>'
                            +        '<section>'
                            +            '<span>'
                            +                '<mip-img src=\"' + (item.Logo
                                                ? item.Logo : '../static/images/none.png') + '\"></mip-img>'
                            +            '</span>'
                            +            '<h4>' + item.schoolname + '</h4>'
                            +        '</section>'
                            +        '<p></p>'
                            +    '</h2>'
                            +    '<div class=\"details\">'
                            +        '<article>'
                            +            '<span>'
                            +                '院校所在地：<b>' + item.City + '</b>'
                            +            '</span>'
                            +            '<span>'
                            +                '院校性质：<b>' + item.schoolnature + '</b>'
                            +            '</span>'
                            +            '<span>'
                            +                '院校代码：<b>' + item.schoolcode + '</b>'
                            +            '</span>'
                            +        '</article>'
                            +        '<aside>'
                            +            '<a class=\"red\" href=\"schooldetails.html?ID=' + item.ID + '\">学校详情</a>'
                            +        '</aside>'
                            +    '</div>'
                            + '</li>'
                        );
                    })
                );

                $element.find('.content-college .load-info .loading').hide();

                if (currentPage === pageCount) {
                    $element.find('.content-college .load-info .none').show();
                    return;
                }

                loadInfo = true;
            });
        }
        $element.find('.details-container .content-college').on('click', 'ul li h2', function () {
            $(this).find('p').toggleClass('active');
            $(this).parent().find('.details').toggle();
        });

        // 页面 scroll 事件
        $element.find('.details-container .content-college').on('scroll', function () {
            var height = $(this).height();
            var scrTop = $(this).scrollTop();
            var scrHeight = $(this)[0].scrollHeight;
            if (height >= scrHeight - scrTop - 100) {
                // console.log(height, scrTop, scrHeight)
                // console.log(currentPage, pageCount, loadInfo)
                // console.log(currentPage < pageCount)
                if (currentPage < pageCount && loadInfo) {
                    loadInfo = false;
                    page++;
                    loadCollege('https://data.api.ppkao.com/Interface/YXK/SchoolSpecialtyApi.ashx', {
                        action: 'SpecialtyOpneSchool',
                        specialname: zhuanyeName,
                        Page: page
                    });
                }
            }
        });

        // 单击切换导航和内容
        $element.on('click', '.details-container .title ul .title-details', function () {
            customStorage.set('xuanZhuanYeCategory', 'details');
            $(this).addClass('current').siblings('li').removeClass('current');
            $element.find('.details-container .content').css({transform: 'translateX(0)'}).addClass('transition');
        });
        $element.on('click', '.details-container .title ul .title-college', function () {
            customStorage.set('xuanZhuanYeCategory', 'college');
            $(this).addClass('current').siblings('li').removeClass('current');
            $element.find('.details-container .content').css({transform: 'translateX(-50%)'}).addClass('transition');
        });

        function getRequest() {
            var url = location.href;    // 获取url中"?"符后的字串
            var theRequest = {};
            var strs;
            if (url) {
                var str = url.substr(url.indexOf('?') + 1);
                strs = str.split('&');
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
                }
            }
            // console.log(url, theRequest);

            return theRequest;
        }
        function decode(obj) {
            var res = {};
            Object.keys(obj).forEach(function (i) {
                var val = obj[i];
                if (Array.isArray(val)) {
                    res[i] = [];
                    val.forEach(function (item) {
                        res[i].push(decode(item));
                    });
                } else {
                    if (val instanceof Object) {
                        res[i] = decode(val);
                    } else {
                        res[i] = base64('decode', val);
                    }
                }
            });
            return res;
        }
        function base64(fun, val) {
            // private property
            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

            // public method for encoding
            function encode(input) {
                var output = '';
                var chr1;
                var chr2;
                var chr3;
                var enc1;
                var enc2;
                var enc3;
                var enc4;
                var i = 0;
                input = utf8Encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output
                        + keyStr.charAt(enc1) + keyStr.charAt(enc2)
                        + keyStr.charAt(enc3) + keyStr.charAt(enc4);
                }
                return output;
            }

            // public method for decoding
            function decode(input) {
                if (input === 'undefined' || input === null || undefined === '' || input === '0') {
                    return input;
                }
                var output = '';
                var chr1;
                var chr2;
                var chr3;
                var enc1;
                var enc2;
                var enc3;
                var enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
                while (i < input.length) {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 !== 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 !== 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = utf8Decode(output);
                return output;
            }

            // private method for UTF-8 encoding
            function utf8Encode(string) {
                string = string.replace(/\r\n/g, '\n');
                var utftext = '';
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }
                return utftext;
            }

            // private method for UTF-8 decoding
            function utf8Decode(utftext) {
                var string = '';
                var i = 0;
                var c = 0;
                var c1 = 0;
                var c2 = 0;
                var c3 = 0;
                while (i < utftext.length) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }

            switch (fun) {
                case 'encode':
                    return encode(val);
                    break;
                case 'decode':
                    return decode(val);
                    break;
                default:
                    break;
            }
        }
        function urlEncode(str) {
            function gb2312Codec(val) {
                var utf8Chars = '3000,3001,3002,30fb,02c9,02c7,00a8,3003,3005,2014,ff5e,2016,2026,2018,2019,201c,201d,'
                + '3014,3015,3008,3009,300a,300b,300c,300d,300e,300f,3016,3017,3010,3011,00b1,00d7,00f7,2236,2227,2228,'
                + '2211,220f,222a,2229,2208,2237,221a,22a5,2225,2220,2312,2299,222b,222e,2261,224c,2248,223d,221d,2260,'
                + '226e,226f,2264,2265,221e,2235,2234,2642,2640,00b0,2032,2033,2103,ff04,00a4,ffe0,ffe1,2030,00a7,2116,'
                + '2606,2605,25cb,25cf,25ce,25c7,25c6,25a1,25a0,25b3,25b2,203b,2192,2190,2191,2193,3013,2170,2171,2172,'
                + '2173,2174,2175,2176,2177,2178,2179,e766,e767,e768,e769,e76a,e76b,2488,2489,248a,248b,248c,248d,248e,'
                + '248f,2490,2491,2492,2493,2494,2495,2496,2497,2498,2499,249a,249b,2474,2475,2476,2477,2478,2479,247a,'
                + '247b,247c,247d,247e,247f,2480,2481,2482,2483,2484,2485,2486,2487,2460,2461,2462,2463,2464,2465,2466,'
                + '2467,2468,2469,e76c,e76d,3220,3221,3222,3223,3224,3225,3226,3227,3228,3229,e76e,e76f,2160,2161,2162,'
                + '2163,2164,2165,2166,2167,2168,2169,216a,216b,e770,e771,ff01,ff02,ff03,ffe5,ff05,ff06,ff07,ff08,ff09,'
                + 'ff0a,ff0b,ff0c,ff0d,ff0e,ff0f,ff10,ff11,ff12,ff13,ff14,ff15,ff16,ff17,ff18,ff19,ff1a,ff1b,ff1c,ff1d,'
                + 'ff1e,ff1f,ff20,ff21,ff22,ff23,ff24,ff25,ff26,ff27,ff28,ff29,ff2a,ff2b,ff2c,ff2d,ff2e,ff2f,ff30,ff31,'
                + 'ff32,ff33,ff34,ff35,ff36,ff37,ff38,ff39,ff3a,ff3b,ff3c,ff3d,ff3e,ff3f,ff40,ff41,ff42,ff43,ff44,ff45,'
                + 'ff46,ff47,ff48,ff49,ff4a,ff4b,ff4c,ff4d,ff4e,ff4f,ff50,ff51,ff52,ff53,ff54,ff55,ff56,ff57,ff58,ff59,'
                + 'ff5a,ff5b,ff5c,ff5d,ffe3,3041,3042,3043,3044,3045,3046,3047,3048,3049,304a,304b,304c,304d,304e,304f,'
                + '3050,3051,3052,3053,3054,3055,3056,3057,3058,3059,305a,305b,305c,305d,305e,305f,3060,3061,3062,3063,'
                + '3064,3065,3066,3067,3068,3069,306a,306b,306c,306d,306e,306f,3070,3071,3072,3073,3074,3075,3076,3077,'
                + '3078,3079,307a,307b,307c,307d,307e,307f,3080,3081,3082,3083,3084,3085,3086,3087,3088,3089,308a,308b,'
                + '308c,308d,308e,308f,3090,3091,3092,3093,e772,e773,e774,e775,e776,e777,e778,e779,e77a,e77b,e77c,30a1,'
                + '30a2,30a3,30a4,30a5,30a6,30a7,30a8,30a9,30aa,30ab,30ac,30ad,30ae,30af,30b0,30b1,30b2,30b3,30b4,30b5,'
                + '30b6,30b7,30b8,30b9,30ba,30bb,30bc,30bd,30be,30bf,30c0,30c1,30c2,30c3,30c4,30c5,30c6,30c7,30c8,30c9,'
                + '30ca,30cb,30cc,30cd,30ce,30cf,30d0,30d1,30d2,30d3,30d4,30d5,30d6,30d7,30d8,30d9,30da,30db,30dc,30dd,'
                + '30de,30df,30e0,30e1,30e2,30e3,30e4,30e5,30e6,30e7,30e8,30e9,30ea,30eb,30ec,30ed,30ee,30ef,30f0,30f1,'
                + '30f2,30f3,30f4,30f5,30f6,e77d,e77e,e77f,e780,e781,e782,e783,e784,0391,0392,0393,0394,0395,0396,0397,'
                + '0398,0399,039a,039b,039c,039d,039e,039f,03a0,03a1,03a3,03a4,03a5,03a6,03a7,03a8,03a9,e785,e786,e787,'
                + 'e788,e789,e78a,e78b,e78c,03b1,03b2,03b3,03b4,03b5,03b6,03b7,03b8,03b9,03ba,03bb,03bc,03bd,03be,03bf,'
                + '03c0,03c1,03c3,03c4,03c5,03c6,03c7,03c8,03c9,e78d,e78e,e78f,e790,e791,e792,e793,fe35,fe36,fe39,fe3a,'
                + 'fe3f,fe40,fe3d,fe3e,fe41,fe42,fe43,fe44,e794,e795,fe3b,fe3c,fe37,fe38,fe31,e796,fe33,fe34,e797,e798,'
                + 'e799,e79a,e79b,e79c,e79d,e79e,e79f,0410,0411,0412,0413,0414,0415,0401,0416,0417,0418,0419,041a,041b,'
                + '041c,041d,041e,041f,0420,0421,0422,0423,0424,0425,0426,0427,0428,0429,042a,042b,042c,042d,042e,042f,'
                + 'e7a0,e7a1,e7a2,e7a3,e7a4,e7a5,e7a6,e7a7,e7a8,e7a9,e7aa,e7ab,e7ac,e7ad,e7ae,0430,0431,0432,0433,0434,'
                + '0435,0451,0436,0437,0438,0439,043a,043b,043c,043d,043e,043f,0440,0441,0442,0443,0444,0445,0446,0447,'
                + '0448,0449,044a,044b,044c,044d,044e,044f,e7af,e7b0,e7b1,e7b2,e7b3,e7b4,e7b5,e7b6,e7b7,e7b8,e7b9,e7ba,'
                + 'e7bb,0101,00e1,01ce,00e0,0113,00e9,011b,00e8,012b,00ed,01d0,00ec,014d,00f3,01d2,00f2,016b,00fa,01d4,'
                + '00f9,01d6,01d8,01da,01dc,00fc,00ea,0251,e7c7,0144,0148,e7c8,0261,e7c9,e7ca,e7cb,e7cc,3105,3106,3107,'
                + '3108,3109,310a,310b,310c,310d,310e,310f,3110,3111,3112,3113,3114,3115,3116,3117,3118,3119,311a,311b,'
                + '311c,311d,311e,311f,3120,3121,3122,3123,3124,3125,3126,3127,3128,3129,e7cd,e7ce,e7cf,e7d0,e7d1,e7d2,'
                + 'e7d3,e7d4,e7d5,e7d6,e7d7,e7d8,e7d9,e7da,e7db,e7dc,e7dd,e7de,e7df,e7e0,e7e1,e7fe,e7ff,e800,2500,2501,'
                + '2502,2503,2504,2505,2506,2507,2508,2509,250a,250b,250c,250d,250e,250f,2510,2511,2512,2513,2514,2515,'
                + '2516,2517,2518,2519,251a,251b,251c,251d,251e,251f,2520,2521,2522,2523,2524,2525,2526,2527,2528,2529,'
                + '252a,252b,252c,252d,252e,252f,2530,2531,2532,2533,2534,2535,2536,2537,2538,2539,253a,253b,253c,253d,'
                + '253e,253f,2540,2541,2542,2543,2544,2545,2546,2547,2548,2549,254a,254b,e801,e802,e803,e804,e805,e806,'
                + 'e807,e808,e809,e80a,e80b,e80c,e80d,e80e,e80f,e000,e001,e002,e003,e004,e005,e006,e007,e008,e009,e00a,'
                + 'e00b,e00c,e00d,e00e,e00f,e010,e011,e012,e013,e014,e015,e016,e017,e018,e019,e01a,e01b,e01c,e01d,e01e,'
                + 'e01f,e020,e021,e022,e023,e024,e025,e026,e027,e028,e029,e02a,e02b,e02c,e02d,e02e,e02f,e030,e031,e032,'
                + 'e033,e034,e035,e036,e037,e038,e039,e03a,e03b,e03c,e03d,e03e,e03f,e040,e041,e042,e043,e044,e045,e046,'
                + 'e047,e048,e049,e04a,e04b,e04c,e04d,e04e,e04f,e050,e051,e052,e053,e054,e055,e056,e057,e058,e059,e05a,'
                + 'e05b,e05c,e05d,e05e,e05f,e060,e061,e062,e063,e064,e065,e066,e067,e068,e069,e06a,e06b,e06c,e06d,e06e,'
                + 'e06f,e070,e071,e072,e073,e074,e075,e076,e077,e078,e079,e07a,e07b,e07c,e07d,e07e,e07f,e080,e081,e082,'
                + 'e083,e084,e085,e086,e087,e088,e089,e08a,e08b,e08c,e08d,e08e,e08f,e090,e091,e092,e093,e094,e095,e096,'
                + 'e097,e098,e099,e09a,e09b,e09c,e09d,e09e,e09f,e0a0,e0a1,e0a2,e0a3,e0a4,e0a5,e0a6,e0a7,e0a8,e0a9,e0aa,'
                + 'e0ab,e0ac,e0ad,e0ae,e0af,e0b0,e0b1,e0b2,e0b3,e0b4,e0b5,e0b6,e0b7,e0b8,e0b9,e0ba,e0bb,e0bc,e0bd,e0be,'
                + 'e0bf,e0c0,e0c1,e0c2,e0c3,e0c4,e0c5,e0c6,e0c7,e0c8,e0c9,e0ca,e0cb,e0cc,e0cd,e0ce,e0cf,e0d0,e0d1,e0d2,'
                + 'e0d3,e0d4,e0d5,e0d6,e0d7,e0d8,e0d9,e0da,e0db,e0dc,e0dd,e0de,e0df,e0e0,e0e1,e0e2,e0e3,e0e4,e0e5,e0e6,'
                + 'e0e7,e0e8,e0e9,e0ea,e0eb,e0ec,e0ed,e0ee,e0ef,e0f0,e0f1,e0f2,e0f3,e0f4,e0f5,e0f6,e0f7,e0f8,e0f9,e0fa,'
                + 'e0fb,e0fc,e0fd,e0fe,e0ff,e100,e101,e102,e103,e104,e105,e106,e107,e108,e109,e10a,e10b,e10c,e10d,e10e,'
                + 'e10f,e110,e111,e112,e113,e114,e115,e116,e117,e118,e119,e11a,e11b,e11c,e11d,e11e,e11f,e120,e121,e122,'
                + 'e123,e124,e125,e126,e127,e128,e129,e12a,e12b,e12c,e12d,e12e,e12f,e130,e131,e132,e133,e134,e135,e136,'
                + 'e137,e138,e139,e13a,e13b,e13c,e13d,e13e,e13f,e140,e141,e142,e143,e144,e145,e146,e147,e148,e149,e14a,'
                + 'e14b,e14c,e14d,e14e,e14f,e150,e151,e152,e153,e154,e155,e156,e157,e158,e159,e15a,e15b,e15c,e15d,e15e,'
                + 'e15f,e160,e161,e162,e163,e164,e165,e166,e167,e168,e169,e16a,e16b,e16c,e16d,e16e,e16f,e170,e171,e172,'
                + 'e173,e174,e175,e176,e177,e178,e179,e17a,e17b,e17c,e17d,e17e,e17f,e180,e181,e182,e183,e184,e185,e186,'
                + 'e187,e188,e189,e18a,e18b,e18c,e18d,e18e,e18f,e190,e191,e192,e193,e194,e195,e196,e197,e198,e199,e19a,'
                + 'e19b,e19c,e19d,e19e,e19f,e1a0,e1a1,e1a2,e1a3,e1a4,e1a5,e1a6,e1a7,e1a8,e1a9,e1aa,e1ab,e1ac,e1ad,e1ae,'
                + 'e1af,e1b0,e1b1,e1b2,e1b3,e1b4,e1b5,e1b6,e1b7,e1b8,e1b9,e1ba,e1bb,e1bc,e1bd,e1be,e1bf,e1c0,e1c1,e1c2,'
                + 'e1c3,e1c4,e1c5,e1c6,e1c7,e1c8,e1c9,e1ca,e1cb,e1cc,e1cd,e1ce,e1cf,e1d0,e1d1,e1d2,e1d3,e1d4,e1d5,e1d6,'
                + 'e1d7,e1d8,e1d9,e1da,e1db,e1dc,e1dd,e1de,e1df,e1e0,e1e1,e1e2,e1e3,e1e4,e1e5,e1e6,e1e7,e1e8,e1e9,e1ea,'
                + 'e1eb,e1ec,e1ed,e1ee,e1ef,e1f0,e1f1,e1f2,e1f3,e1f4,e1f5,e1f6,e1f7,e1f8,e1f9,e1fa,e1fb,e1fc,e1fd,e1fe,'
                + 'e1ff,e200,e201,e202,e203,e204,e205,e206,e207,e208,e209,e20a,e20b,e20c,e20d,e20e,e20f,e210,e211,e212,'
                + 'e213,e214,e215,e216,e217,e218,e219,e21a,e21b,e21c,e21d,e21e,e21f,e220,e221,e222,e223,e224,e225,e226,'
                + 'e227,e228,e229,e22a,e22b,e22c,e22d,e22e,e22f,e230,e231,e232,e233,554a,963f,57c3,6328,54ce,5509,54c0,'
                + '7691,764c,853c,77ee,827e,788d,7231,9698,978d,6c28,5b89,4ffa,6309,6697,5cb8,80fa,6848,80ae,6602,76ce,'
                + '51f9,6556,71ac,7ff1,8884,50b2,5965,61ca,6fb3,82ad,634c,6252,53ed,5427,7b06,516b,75a4,5df4,62d4,8dcb,'
                + '9776,628a,8019,575d,9738,7f62,7238,767d,67cf,767e,6446,4f70,8d25,62dc,7a17,6591,73ed,642c,6273,822c,'
                + '9881,677f,7248,626e,62cc,4f34,74e3,534a,529e,7eca,90a6,5e2e,6886,699c,8180,7ed1,68d2,78c5,868c,9551,'
                + '508d,8c24,82de,80de,5305,8912,5265,8584,96f9,4fdd,5821,9971,5b9d,62b1,62a5,66b4,8c79,9c8d,7206,676f,'
                + '7891,60b2,5351,5317,8f88,80cc,8d1d,94a1,500d,72c8,5907,60eb,7119,88ab,5954,82ef,672c,7b28,5d29,7ef7,'
                + '752d,6cf5,8e66,8ff8,903c,9f3b,6bd4,9119,7b14,5f7c,78a7,84d6,853d,6bd5,6bd9,6bd6,5e01,5e87,75f9,95ed,'
                + '655d,5f0a,5fc5,8f9f,58c1,81c2,907f,965b,97ad,8fb9,7f16,8d2c,6241,4fbf,53d8,535e,8fa8,8fa9,8fab,904d,'
                + '6807,5f6a,8198,8868,9cd6,618b,522b,762a,5f6c,658c,6fd2,6ee8,5bbe,6448,5175,51b0,67c4,4e19,79c9,997c,'
                + '70b3,75c5,5e76,73bb,83e0,64ad,62e8,94b5,6ce2,535a,52c3,640f,94c2,7b94,4f2f,5e1b,8236,8116,818a,6e24,'
                + '6cca,9a73,6355,535c,54fa,8865,57e0,4e0d,5e03,6b65,7c3f,90e8,6016,64e6,731c,88c1,6750,624d,8d22,776c,'
                + '8e29,91c7,5f69,83dc,8521,9910,53c2,8695,6b8b,60ed,60e8,707f,82cd,8231,4ed3,6ca7,85cf,64cd,7cd9,69fd,'
                + '66f9,8349,5395,7b56,4fa7,518c,6d4b,5c42,8e6d,63d2,53c9,832c,8336,67e5,78b4,643d,5bdf,5c94,5dee,8be7,'
                + '62c6,67f4,8c7a,6400,63ba,8749,998b,8c17,7f20,94f2,4ea7,9610,98a4,660c,7316,573a,5c1d,5e38,957f,507f,'
                + '80a0,5382,655e,7545,5531,5021,8d85,6284,949e,671d,5632,6f6e,5de2,5435,7092,8f66,626f,64a4,63a3,5f7b,'
                + '6f88,90f4,81e3,8fb0,5c18,6668,5ff1,6c89,9648,8d81,886c,6491,79f0,57ce,6a59,6210,5448,4e58,7a0b,60e9,'
                + '6f84,8bda,627f,901e,9a8b,79e4,5403,75f4,6301,5319,6c60,8fdf,5f1b,9a70,803b,9f7f,4f88,5c3a,8d64,7fc5,'
                + '65a5,70bd,5145,51b2,866b,5d07,5ba0,62bd,916c,7574,8e0c,7a20,6101,7b79,4ec7,7ef8,7785,4e11,81ed,521d,'
                + '51fa,6a71,53a8,8e87,9504,96cf,6ec1,9664,695a,7840,50a8,77d7,6410,89e6,5904,63e3,5ddd,7a7f,693d,4f20,'
                + '8239,5598,4e32,75ae,7a97,5e62,5e8a,95ef,521b,5439,708a,6376,9524,5782,6625,693f,9187,5507,6df3,7eaf,'
                + '8822,6233,7ef0,75b5,8328,78c1,96cc,8f9e,6148,74f7,8bcd,6b64,523a,8d50,6b21,806a,8471,56f1,5306,4ece,'
                + '4e1b,51d1,7c97,918b,7c07,4fc3,8e7f,7be1,7a9c,6467,5d14,50ac,8106,7601,7cb9,6dec,7fe0,6751,5b58,5bf8,'
                + '78cb,64ae,6413,63aa,632b,9519,642d,8fbe,7b54,7629,6253,5927,5446,6b79,50a3,6234,5e26,6b86,4ee3,8d37,'
                + '888b,5f85,902e,6020,803d,62c5,4e39,5355,90f8,63b8,80c6,65e6,6c2e,4f46,60ee,6de1,8bde,5f39,86cb,5f53,'
                + '6321,515a,8361,6863,5200,6363,8e48,5012,5c9b,7977,5bfc,5230,7a3b,60bc,9053,76d7,5fb7,5f97,7684,8e6c,'
                + '706f,767b,7b49,77aa,51f3,9093,5824,4f4e,6ef4,8fea,654c,7b1b,72c4,6da4,7fdf,5ae1,62b5,5e95,5730,8482,'
                + '7b2c,5e1d,5f1f,9012,7f14,98a0,6382,6ec7,7898,70b9,5178,975b,57ab,7535,4f43,7538,5e97,60e6,5960,6dc0,'
                + '6bbf,7889,53fc,96d5,51cb,5201,6389,540a,9493,8c03,8dcc,7239,789f,8776,8fed,8c0d,53e0,4e01,76ef,53ee,'
                + '9489,9876,9f0e,952d,5b9a,8ba2,4e22,4e1c,51ac,8463,61c2,52a8,680b,4f97,606b,51bb,6d1e,515c,6296,6597,'
                + '9661,8c46,9017,75d8,90fd,7763,6bd2,728a,72ec,8bfb,5835,7779,8d4c,675c,9540,809a,5ea6,6e21,5992,7aef,'
                + '77ed,953b,6bb5,65ad,7f0e,5806,5151,961f,5bf9,58a9,5428,8e72,6566,987f,56e4,949d,76fe,9041,6387,54c6,'
                + '591a,593a,579b,8eb2,6735,8dfa,8235,5241,60f0,5815,86fe,5ce8,9e45,4fc4,989d,8bb9,5a25,6076,5384,627c,'
                + '904f,9102,997f,6069,800c,513f,8033,5c14,9975,6d31,4e8c,8d30,53d1,7f5a,7b4f,4f10,4e4f,9600,6cd5,73d0,'
                + '85e9,5e06,756a,7ffb,6a0a,77fe,9492,7e41,51e1,70e6,53cd,8fd4,8303,8d29,72af,996d,6cdb,574a,82b3,65b9,'
                + '80aa,623f,9632,59a8,4eff,8bbf,7eba,653e,83f2,975e,5561,98de,80a5,532a,8bfd,5420,80ba,5e9f,6cb8,8d39,'
                + '82ac,915a,5429,6c1b,5206,7eb7,575f,711a,6c7e,7c89,594b,4efd,5fff,6124,7caa,4e30,5c01,67ab,8702,5cf0,'
                + '950b,98ce,75af,70fd,9022,51af,7f1d,8bbd,5949,51e4,4f5b,5426,592b,6577,80a4,5b75,6276,62c2,8f90,5e45,'
                + '6c1f,7b26,4f0f,4fd8,670d,6d6e,6daa,798f,88b1,5f17,752b,629a,8f85,4fef,91dc,65a7,812f,8151,5e9c,8150,'
                + '8d74,526f,8986,8d4b,590d,5085,4ed8,961c,7236,8179,8d1f,5bcc,8ba3,9644,5987,7f1a,5490,5676,560e,8be5,'
                + '6539,6982,9499,76d6,6e89,5e72,7518,6746,67d1,7aff,809d,8d76,611f,79c6,6562,8d63,5188,521a,94a2,7f38,'
                + '809b,7eb2,5c97,6e2f,6760,7bd9,768b,9ad8,818f,7f94,7cd5,641e,9550,7a3f,544a,54e5,6b4c,6401,6208,9e3d,'
                + '80f3,7599,5272,9769,845b,683c,86e4,9601,9694,94ec,4e2a,5404,7ed9,6839,8ddf,8015,66f4,5e9a,7fb9,57c2,'
                + '803f,6897,5de5,653b,529f,606d,9f9a,4f9b,8eac,516c,5bab,5f13,5de9,6c5e,62f1,8d21,5171,94a9,52fe,6c9f,'
                + '82df,72d7,57a2,6784,8d2d,591f,8f9c,83c7,5495,7b8d,4f30,6cbd,5b64,59d1,9f13,53e4,86ca,9aa8,8c37,80a1,'
                + '6545,987e,56fa,96c7,522e,74dc,5250,5be1,6302,8902,4e56,62d0,602a,68fa,5173,5b98,51a0,89c2,7ba1,9986,'
                + '7f50,60ef,704c,8d2f,5149,5e7f,901b,7470,89c4,572d,7845,5f52,9f9f,95fa,8f68,9b3c,8be1,7678,6842,67dc,'
                + '8dea,8d35,523d,8f8a,6eda,68cd,9505,90ed,56fd,679c,88f9,8fc7,54c8,9ab8,5b69,6d77,6c26,4ea5,5bb3,9a87,'
                + '9163,61a8,90af,97e9,542b,6db5,5bd2,51fd,558a,7f55,7ff0,64bc,634d,65f1,61be,608d,710a,6c57,6c49,592f,'
                + '676d,822a,58d5,568e,8c6a,6beb,90dd,597d,8017,53f7,6d69,5475,559d,8377,83cf,6838,79be,548c,4f55,5408,'
                + '76d2,8c89,9602,6cb3,6db8,8d6b,8910,9e64,8d3a,563f,9ed1,75d5,5f88,72e0,6068,54fc,4ea8,6a2a,8861,6052,'
                + '8f70,54c4,70d8,8679,9e3f,6d2a,5b8f,5f18,7ea2,5589,4faf,7334,543c,539a,5019,540e,547c,4e4e,5ffd,745a,'
                + '58f6,846b,80e1,8774,72d0,7cca,6e56,5f27,864e,552c,62a4,4e92,6caa,6237,82b1,54d7,534e,733e,6ed1,753b,'
                + '5212,5316,8bdd,69d0,5f8a,6000,6dee,574f,6b22,73af,6853,8fd8,7f13,6362,60a3,5524,75ea,8c62,7115,6da3,'
                + '5ba6,5e7b,8352,614c,9ec4,78fa,8757,7c27,7687,51f0,60f6,714c,6643,5e4c,604d,8c0e,7070,6325,8f89,5fbd,'
                + '6062,86d4,56de,6bc1,6094,6167,5349,60e0,6666,8d3f,79fd,4f1a,70e9,6c47,8bb3,8bf2,7ed8,8364,660f,5a5a,'
                + '9b42,6d51,6df7,8c41,6d3b,4f19,706b,83b7,6216,60d1,970d,8d27,7978,51fb,573e,57fa,673a,7578,7a3d,79ef,'
                + '7b95,808c,9965,8ff9,6fc0,8ba5,9e21,59ec,7ee9,7f09,5409,6781,68d8,8f91,7c4d,96c6,53ca,6025,75be,6c72,'
                + '5373,5ac9,7ea7,6324,51e0,810a,5df1,84df,6280,5180,5b63,4f0e,796d,5242,60b8,6d4e,5bc4,5bc2,8ba1,8bb0,'
                + '65e2,5fcc,9645,5993,7ee7,7eaa,5609,67b7,5939,4f73,5bb6,52a0,835a,988a,8d3e,7532,94be,5047,7a3c,4ef7,'
                + '67b6,9a7e,5ac1,6b7c,76d1,575a,5c16,7b3a,95f4,714e,517c,80a9,8270,5978,7f04,8327,68c0,67ec,78b1,7877,'
                + '62e3,6361,7b80,4fed,526a,51cf,8350,69db,9274,8df5,8d31,89c1,952e,7bad,4ef6,5065,8230,5251,996f,6e10,'
                + '6e85,6da7,5efa,50f5,59dc,5c06,6d46,6c5f,7586,848b,6868,5956,8bb2,5320,9171,964d,8549,6912,7901,7126,'
                + '80f6,4ea4,90ca,6d47,9a84,5a07,56bc,6405,94f0,77eb,4fa5,811a,72e1,89d2,997a,7f34,7ede,527f,6559,9175,'
                + '8f7f,8f83,53eb,7a96,63ed,63a5,7686,79f8,8857,9636,622a,52ab,8282,6854,6770,6377,776b,7aed,6d01,7ed3,'
                + '89e3,59d0,6212,85c9,82a5,754c,501f,4ecb,75a5,8beb,5c4a,5dfe,7b4b,65a4,91d1,4eca,6d25,895f,7d27,9526,'
                + '4ec5,8c28,8fdb,9773,664b,7981,8fd1,70ec,6d78,5c3d,52b2,8346,5162,830e,775b,6676,9cb8,4eac,60ca,7cbe,'
                + '7cb3,7ecf,4e95,8b66,666f,9888,9759,5883,656c,955c,5f84,75c9,9756,7adf,7ade,51c0,70af,7a98,63ea,7a76,'
                + '7ea0,7396,97ed,4e45,7078,4e5d,9152,53a9,6551,65e7,81fc,8205,548e,5c31,759a,97a0,62d8,72d9,75bd,5c45,'
                + '9a79,83ca,5c40,5480,77e9,4e3e,6cae,805a,62d2,636e,5de8,5177,8ddd,8e1e,952f,4ff1,53e5,60e7,70ac,5267,'
                + '6350,9e43,5a1f,5026,7737,5377,7ee2,6485,652b,6289,6398,5014,7235,89c9,51b3,8bc0,7edd,5747,83cc,94a7,'
                + '519b,541b,5cfb,4fca,7ae3,6d5a,90e1,9a8f,5580,5496,5361,54af,5f00,63e9,6977,51ef,6168,520a,582a,52d8,'
                + '574e,780d,770b,5eb7,6177,7ce0,625b,6297,4ea2,7095,8003,62f7,70e4,9760,5777,82db,67ef,68f5,78d5,9897,'
                + '79d1,58f3,54b3,53ef,6e34,514b,523b,5ba2,8bfe,80af,5543,57a6,6073,5751,542d,7a7a,6050,5b54,63a7,62a0,'
                + '53e3,6263,5bc7,67af,54ed,7a9f,82e6,9177,5e93,88e4,5938,57ae,630e,8de8,80ef,5757,7b77,4fa9,5feb,5bbd,'
                + '6b3e,5321,7b50,72c2,6846,77ff,7736,65f7,51b5,4e8f,76d4,5cbf,7aa5,8475,594e,9b41,5080,9988,6127,6e83,'
                + '5764,6606,6346,56f0,62ec,6269,5ed3,9614,5783,62c9,5587,8721,814a,8fa3,5566,83b1,6765,8d56,84dd,5a6a,'
                + '680f,62e6,7bee,9611,5170,6f9c,8c30,63fd,89c8,61d2,7f06,70c2,6ee5,7405,6994,72fc,5eca,90ce,6717,6d6a,'
                + '635e,52b3,7262,8001,4f6c,59e5,916a,70d9,6d9d,52d2,4e50,96f7,956d,857e,78ca,7d2f,5121,5792,64c2,808b,'
                + '7c7b,6cea,68f1,695e,51b7,5398,68a8,7281,9ece,7bf1,72f8,79bb,6f13,7406,674e,91cc,9ca4,793c,8389,8354,'
                + '540f,6817,4e3d,5389,52b1,783e,5386,5229,5088,4f8b,4fd0,75e2,7acb,7c92,6ca5,96b6,529b,7483,54e9,4fe9,'
                + '8054,83b2,8fde,9570,5ec9,601c,6d9f,5e18,655b,8138,94fe,604b,70bc,7ec3,7cae,51c9,6881,7cb1,826f,4e24,'
                + '8f86,91cf,667e,4eae,8c05,64a9,804a,50da,7597,71ce,5be5,8fbd,6f66,4e86,6482,9563,5ed6,6599,5217,88c2,'
                + '70c8,52a3,730e,7433,6797,78f7,9716,4e34,90bb,9cde,6dcb,51db,8d41,541d,62ce,73b2,83f1,96f6,9f84,94c3,'
                + '4f36,7f9a,51cc,7075,9675,5cad,9886,53e6,4ee4,6e9c,7409,69b4,786b,998f,7559,5218,7624,6d41,67f3,516d,'
                + '9f99,804b,5499,7b3c,7abf,9686,5784,62e2,9647,697c,5a04,6402,7bd3,6f0f,964b,82a6,5362,9885,5e90,7089,'
                + '63b3,5364,864f,9c81,9e93,788c,9732,8def,8d42,9e7f,6f5e,7984,5f55,9646,622e,9a74,5415,94dd,4fa3,65c5,'
                + '5c65,5c61,7f15,8651,6c2f,5f8b,7387,6ee4,7eff,5ce6,631b,5b6a,6ee6,5375,4e71,63a0,7565,62a1,8f6e,4f26,'
                + '4ed1,6ca6,7eb6,8bba,841d,87ba,7f57,903b,9523,7ba9,9aa1,88f8,843d,6d1b,9a86,7edc,5988,9ebb,739b,7801,'
                + '8682,9a6c,9a82,561b,5417,57cb,4e70,9ea6,5356,8fc8,8109,7792,9992,86ee,6ee1,8513,66fc,6162,6f2b,8c29,'
                + '8292,832b,76f2,6c13,5fd9,83bd,732b,8305,951a,6bdb,77db,94c6,536f,8302,5192,5e3d,8c8c,8d38,4e48,73ab,'
                + '679a,6885,9176,9709,7164,6ca1,7709,5a92,9541,6bcf,7f8e,6627,5bd0,59b9,5a9a,95e8,95f7,4eec,840c,8499,'
                + '6aac,76df,9530,731b,68a6,5b5f,772f,919a,9761,7cdc,8ff7,8c1c,5f25,7c73,79d8,89c5,6ccc,871c,5bc6,5e42,'
                + '68c9,7720,7ef5,5195,514d,52c9,5a29,7f05,9762,82d7,63cf,7784,85d0,79d2,6e3a,5e99,5999,8511,706d,6c11,'
                + '62bf,76bf,654f,60af,95fd,660e,879f,9e23,94ed,540d,547d,8c2c,6478,6479,8611,6a21,819c,78e8,6469,9b54,'
                + '62b9,672b,83ab,58a8,9ed8,6cab,6f20,5bde,964c,8c0b,725f,67d0,62c7,7261,4ea9,59c6,6bcd,5893,66ae,5e55,'
                + '52df,6155,6728,76ee,7766,7267,7a46,62ff,54ea,5450,94a0,90a3,5a1c,7eb3,6c16,4e43,5976,8010,5948,5357,'
                + '7537,96be,56ca,6320,8111,607c,95f9,6dd6,5462,9981,5185,5ae9,80fd,59ae,9713,502a,6ce5,5c3c,62df,4f60,'
                + '533f,817b,9006,6eba,852b,62c8,5e74,78be,64b5,637b,5ff5,5a18,917f,9e1f,5c3f,634f,8042,5b7d,556e,954a,'
                + '954d,6d85,60a8,67e0,72de,51dd,5b81,62e7,6cde,725b,626d,94ae,7ebd,8113,6d53,519c,5f04,5974,52aa,6012,'
                + '5973,6696,8650,759f,632a,61e6,7cef,8bfa,54e6,6b27,9e25,6bb4,85d5,5455,5076,6ca4,556a,8db4,722c,5e15,'
                + '6015,7436,62cd,6392,724c,5f98,6e43,6d3e,6500,6f58,76d8,78d0,76fc,7554,5224,53db,4e53,5e9e,65c1,802a,'
                + '80d6,629b,5486,5228,70ae,888d,8dd1,6ce1,5478,80da,57f9,88f4,8d54,966a,914d,4f69,6c9b,55b7,76c6,7830,'
                + '62a8,70f9,6f8e,5f6d,84ec,68da,787c,7bf7,81a8,670b,9e4f,6367,78b0,576f,7812,9739,6279,62ab,5288,7435,'
                + '6bd7,5564,813e,75b2,76ae,5339,75de,50fb,5c41,8b6c,7bc7,504f,7247,9a97,98d8,6f02,74e2,7968,6487,77a5,'
                + '62fc,9891,8d2b,54c1,8058,4e52,576a,82f9,840d,5e73,51ed,74f6,8bc4,5c4f,5761,6cfc,9887,5a46,7834,9b44,'
                + '8feb,7c95,5256,6251,94fa,4ec6,8386,8461,83e9,84b2,57d4,6734,5703,666e,6d66,8c31,66dd,7011,671f,6b3a,'
                + '6816,621a,59bb,4e03,51c4,6f06,67d2,6c8f,5176,68cb,5947,6b67,7566,5d0e,8110,9f50,65d7,7948,7941,9a91,'
                + '8d77,5c82,4e5e,4f01,542f,5951,780c,5668,6c14,8fc4,5f03,6c7d,6ce3,8bab,6390,6070,6d3d,7275,6266,948e,'
                + '94c5,5343,8fc1,7b7e,4edf,8c26,4e7e,9ed4,94b1,94b3,524d,6f5c,9063,6d45,8c34,5811,5d4c,6b20,6b49,67aa,'
                + '545b,8154,7f8c,5899,8537,5f3a,62a2,6a47,9539,6572,6084,6865,77a7,4e54,4fa8,5de7,9798,64ac,7fd8,5ced,'
                + '4fcf,7a8d,5207,8304,4e14,602f,7a83,94a6,4fb5,4eb2,79e6,7434,52e4,82b9,64d2,79bd,5bdd,6c81,9752,8f7b,'
                + '6c22,503e,537f,6e05,64ce,6674,6c30,60c5,9877,8bf7,5e86,743c,7a77,79cb,4e18,90b1,7403,6c42,56da,914b,'
                + '6cc5,8d8b,533a,86c6,66f2,8eaf,5c48,9a71,6e20,53d6,5a36,9f8b,8da3,53bb,5708,98a7,6743,919b,6cc9,5168,'
                + '75ca,62f3,72ac,5238,529d,7f3a,7094,7638,5374,9e4a,69b7,786e,96c0,88d9,7fa4,7136,71c3,5189,67d3,74e4,'
                + '58e4,6518,56b7,8ba9,9976,6270,7ed5,60f9,70ed,58ec,4ec1,4eba,5fcd,97e7,4efb,8ba4,5203,598a,7eab,6254,'
                + '4ecd,65e5,620e,8338,84c9,8363,878d,7194,6eb6,5bb9,7ed2,5197,63c9,67d4,8089,8339,8815,5112,5b7a,5982,'
                + '8fb1,4e73,6c5d,5165,8925,8f6f,962e,854a,745e,9510,95f0,6da6,82e5,5f31,6492,6d12,8428,816e,9cc3,585e,'
                + '8d5b,4e09,53c1,4f1e,6563,6851,55d3,4e27,6414,9a9a,626b,5ac2,745f,8272,6da9,68ee,50e7,838e,7802,6740,'
                + '5239,6c99,7eb1,50bb,5565,715e,7b5b,6652,73ca,82eb,6749,5c71,5220,717d,886b,95ea,9655,64c5,8d61,81b3,'
                + '5584,6c55,6247,7f2e,5892,4f24,5546,8d4f,664c,4e0a,5c1a,88f3,68a2,634e,7a0d,70e7,828d,52fa,97f6,5c11,'
                + '54e8,90b5,7ecd,5962,8d4a,86c7,820c,820d,8d66,6444,5c04,6151,6d89,793e,8bbe,7837,7533,547b,4f38,8eab,'
                + '6df1,5a20,7ec5,795e,6c88,5ba1,5a76,751a,80be,614e,6e17,58f0,751f,7525,7272,5347,7ef3,7701,76db,5269,'
                + '80dc,5723,5e08,5931,72ee,65bd,6e7f,8bd7,5c38,8671,5341,77f3,62fe,65f6,4ec0,98df,8680,5b9e,8bc6,53f2,'
                + '77e2,4f7f,5c4e,9a76,59cb,5f0f,793a,58eb,4e16,67ff,4e8b,62ed,8a93,901d,52bf,662f,55dc,566c,9002,4ed5,'
                + '4f8d,91ca,9970,6c0f,5e02,6043,5ba4,89c6,8bd5,6536,624b,9996,5b88,5bff,6388,552e,53d7,7626,517d,852c,'
                + '67a2,68b3,6b8a,6292,8f93,53d4,8212,6dd1,758f,4e66,8d4e,5b70,719f,85af,6691,66d9,7f72,8700,9ecd,9f20,'
                + '5c5e,672f,8ff0,6811,675f,620d,7ad6,5885,5eb6,6570,6f31,6055,5237,800d,6454,8870,7529,5e05,6813,62f4,'
                + '971c,53cc,723d,8c01,6c34,7761,7a0e,542e,77ac,987a,821c,8bf4,7855,6714,70c1,65af,6495,5636,601d,79c1,'
                + '53f8,4e1d,6b7b,8086,5bfa,55e3,56db,4f3a,4f3c,9972,5df3,677e,8038,6002,9882,9001,5b8b,8bbc,8bf5,641c,'
                + '8258,64de,55fd,82cf,9165,4fd7,7d20,901f,7c9f,50f3,5851,6eaf,5bbf,8bc9,8083,9178,849c,7b97,867d,968b,'
                + '968f,7ee5,9ad3,788e,5c81,7a57,9042,96a7,795f,5b59,635f,7b0b,84d1,68ad,5506,7f29,7410,7d22,9501,6240,'
                + '584c,4ed6,5b83,5979,5854,736d,631e,8e4b,8e0f,80ce,82d4,62ac,53f0,6cf0,915e,592a,6001,6c70,574d,644a,'
                + '8d2a,762b,6ee9,575b,6a80,75f0,6f6d,8c2d,8c08,5766,6bef,8892,78b3,63a2,53f9,70ad,6c64,5858,642a,5802,'
                + '68e0,819b,5510,7cd6,5018,8eba,6dcc,8d9f,70eb,638f,6d9b,6ed4,7ee6,8404,6843,9003,6dd8,9676,8ba8,5957,'
                + '7279,85e4,817e,75bc,8a8a,68af,5254,8e22,9511,63d0,9898,8e44,557c,4f53,66ff,568f,60d5,6d95,5243,5c49,'
                + '5929,6dfb,586b,7530,751c,606c,8214,8146,6311,6761,8fe2,773a,8df3,8d34,94c1,5e16,5385,542c,70c3,6c40,'
                + '5ef7,505c,4ead,5ead,633a,8247,901a,6850,916e,77b3,540c,94dc,5f64,7ae5,6876,6345,7b52,7edf,75db,5077,'
                + '6295,5934,900f,51f8,79c3,7a81,56fe,5f92,9014,6d82,5c60,571f,5410,5154,6e4d,56e2,63a8,9893,817f,8715,'
                + '892a,9000,541e,5c6f,81c0,62d6,6258,8131,9e35,9640,9a6e,9a7c,692d,59a5,62d3,553e,6316,54c7,86d9,6d3c,'
                + '5a03,74e6,889c,6b6a,5916,8c4c,5f2f,6e7e,73a9,987d,4e38,70f7,5b8c,7897,633d,665a,7696,60cb,5b9b,5a49,'
                + '4e07,8155,6c6a,738b,4ea1,6789,7f51,5f80,65fa,671b,5fd8,5984,5a01,5dcd,5fae,5371,97e6,8fdd,6845,56f4,'
                + '552f,60df,4e3a,6f4d,7ef4,82c7,840e,59d4,4f1f,4f2a,5c3e,7eac,672a,851a,5473,754f,80c3,5582,9b4f,4f4d,'
                + '6e2d,8c13,5c09,6170,536b,761f,6e29,868a,6587,95fb,7eb9,543b,7a33,7d0a,95ee,55e1,7fc1,74ee,631d,8717,'
                + '6da1,7a9d,6211,65a1,5367,63e1,6c83,5deb,545c,94a8,4e4c,6c61,8bec,5c4b,65e0,829c,68a7,543e,5434,6bcb,'
                + '6b66,4e94,6342,5348,821e,4f0d,4fae,575e,620a,96fe,6664,7269,52ff,52a1,609f,8bef,6614,7199,6790,897f,'
                + '7852,77fd,6670,563b,5438,9521,727a,7a00,606f,5e0c,6089,819d,5915,60dc,7184,70ef,6eaa,6c50,7280,6a84,'
                + '88ad,5e2d,4e60,5ab3,559c,94e3,6d17,7cfb,9699,620f,7ec6,778e,867e,5323,971e,8f96,6687,5ce1,4fa0,72ed,'
                + '4e0b,53a6,590f,5413,6380,9528,5148,4ed9,9c9c,7ea4,54b8,8d24,8854,8237,95f2,6d8e,5f26,5acc,663e,9669,'
                + '73b0,732e,53bf,817a,9985,7fa1,5baa,9677,9650,7ebf,76f8,53a2,9576,9999,7bb1,8944,6e58,4e61,7fd4,7965,'
                + '8be6,60f3,54cd,4eab,9879,5df7,6a61,50cf,5411,8c61,8427,785d,9704,524a,54ee,56a3,9500,6d88,5bb5,6dc6,'
                + '6653,5c0f,5b5d,6821,8096,5578,7b11,6548,6954,4e9b,6b47,874e,978b,534f,631f,643a,90aa,659c,80c1,8c10,'
                + '5199,68b0,5378,87f9,61c8,6cc4,6cfb,8c22,5c51,85aa,82af,950c,6b23,8f9b,65b0,5ffb,5fc3,4fe1,8845,661f,'
                + '8165,7329,60fa,5174,5211,578b,5f62,90a2,884c,9192,5e78,674f,6027,59d3,5144,51f6,80f8,5308,6c79,96c4,'
                + '718a,4f11,4fee,7f9e,673d,55c5,9508,79c0,8896,7ee3,589f,620c,9700,865a,5618,987b,5f90,8bb8,84c4,9157,'
                + '53d9,65ed,5e8f,755c,6064,7d6e,5a7f,7eea,7eed,8f69,55a7,5ba3,60ac,65cb,7384,9009,7663,7729,7eda,9774,'
                + '859b,5b66,7a74,96ea,8840,52cb,718f,5faa,65ec,8be2,5bfb,9a6f,5de1,6b89,6c5b,8bad,8baf,900a,8fc5,538b,'
                + '62bc,9e26,9e2d,5440,4e2b,82bd,7259,869c,5d16,8859,6daf,96c5,54d1,4e9a,8bb6,7109,54bd,9609,70df,6df9,'
                + '76d0,4e25,7814,8712,5ca9,5ef6,8a00,989c,960e,708e,6cbf,5944,63a9,773c,884d,6f14,8273,5830,71d5,538c,'
                + '781a,96c1,5501,5f66,7130,5bb4,8c1a,9a8c,6b83,592e,9e2f,79e7,6768,626c,4f6f,75a1,7f8a,6d0b,9633,6c27,'
                + '4ef0,75d2,517b,6837,6f3e,9080,8170,5996,7476,6447,5c27,9065,7a91,8c23,59da,54ac,8200,836f,8981,8000,'
                + '6930,564e,8036,7237,91ce,51b6,4e5f,9875,6396,4e1a,53f6,66f3,814b,591c,6db2,4e00,58f9,533b,63d6,94f1,'
                + '4f9d,4f0a,8863,9890,5937,9057,79fb,4eea,80f0,7591,6c82,5b9c,59e8,5f5d,6905,8681,501a,5df2,4e59,77e3,'
                + '4ee5,827a,6291,6613,9091,5c79,4ebf,5f79,81c6,9038,8084,75ab,4ea6,88d4,610f,6bc5,5fc6,4e49,76ca,6ea2,'
                + '8be3,8bae,8c0a,8bd1,5f02,7ffc,7fcc,7ece,8335,836b,56e0,6bb7,97f3,9634,59fb,541f,94f6,6deb,5bc5,996e,'
                + '5c39,5f15,9690,5370,82f1,6a31,5a74,9e70,5e94,7f28,83b9,8424,8425,8367,8747,8fce,8d62,76c8,5f71,9896,'
                + '786c,6620,54df,62e5,4f63,81c3,75c8,5eb8,96cd,8e0a,86f9,548f,6cf3,6d8c,6c38,607f,52c7,7528,5e7d,4f18,'
                + '60a0,5fe7,5c24,7531,90ae,94c0,72b9,6cb9,6e38,9149,6709,53cb,53f3,4f51,91c9,8bf1,53c8,5e7c,8fc2,6de4,'
                + '4e8e,76c2,6986,865e,611a,8206,4f59,4fde,903e,9c7c,6109,6e1d,6e14,9685,4e88,5a31,96e8,4e0e,5c7f,79b9,'
                + '5b87,8bed,7fbd,7389,57df,828b,90c1,5401,9047,55bb,5cea,5fa1,6108,6b32,72f1,80b2,8a89,6d74,5bd3,88d5,'
                + '9884,8c6b,9a6d,9e33,6e0a,51a4,5143,57a3,8881,539f,63f4,8f95,56ed,5458,5706,733f,6e90,7f18,8fdc,82d1,'
                + '613f,6028,9662,66f0,7ea6,8d8a,8dc3,94a5,5cb3,7ca4,6708,60a6,9605,8018,4e91,90e7,5300,9668,5141,8fd0,'
                + '8574,915d,6655,97f5,5b55,531d,7838,6742,683d,54c9,707e,5bb0,8f7d,518d,5728,54b1,6512,6682,8d5e,8d43,'
                + '810f,846c,906d,7cdf,51ff,85fb,67a3,65e9,6fa1,86a4,8e81,566a,9020,7682,7076,71e5,8d23,62e9,5219,6cfd,'
                + '8d3c,600e,589e,618e,66fe,8d60,624e,55b3,6e23,672d,8f67,94e1,95f8,7728,6805,69a8,548b,4e4d,70b8,8bc8,'
                + '6458,658b,5b85,7a84,503a,5be8,77bb,6be1,8a79,7c98,6cbe,76cf,65a9,8f97,5d2d,5c55,8638,6808,5360,6218,'
                + '7ad9,6e5b,7efd,6a1f,7ae0,5f70,6f33,5f20,638c,6da8,6756,4e08,5e10,8d26,4ed7,80c0,7634,969c,62db,662d,'
                + '627e,6cbc,8d75,7167,7f69,5146,8087,53ec,906e,6298,54f2,86f0,8f99,8005,9517,8517,8fd9,6d59,73cd,659f,'
                + '771f,7504,7827,81fb,8d1e,9488,4fa6,6795,75b9,8bca,9707,632f,9547,9635,84b8,6323,7741,5f81,72f0,4e89,'
                + '6014,6574,62ef,6b63,653f,5e27,75c7,90d1,8bc1,829d,679d,652f,5431,8718,77e5,80a2,8102,6c41,4e4b,7ec7,'
                + '804c,76f4,690d,6b96,6267,503c,4f84,5740,6307,6b62,8dbe,53ea,65e8,7eb8,5fd7,631a,63b7,81f3,81f4,7f6e,'
                + '5e1c,5cd9,5236,667a,79e9,7a1a,8d28,7099,75d4,6ede,6cbb,7a92,4e2d,76c5,5fe0,949f,8877,7ec8,79cd,80bf,'
                + '91cd,4ef2,4f17,821f,5468,5dde,6d32,8bcc,7ca5,8f74,8098,5e1a,5492,76b1,5b99,663c,9aa4,73e0,682a,86db,'
                + '6731,732a,8bf8,8bdb,9010,7af9,70db,716e,62c4,77a9,5631,4e3b,8457,67f1,52a9,86c0,8d2e,94f8,7b51,4f4f,'
                + '6ce8,795d,9a7b,6293,722a,62fd,4e13,7816,8f6c,64b0,8d5a,7bc6,6869,5e84,88c5,5986,649e,58ee,72b6,690e,'
                + '9525,8ffd,8d58,5760,7f00,8c06,51c6,6349,62d9,5353,684c,7422,8301,914c,5544,7740,707c,6d4a,5179,54a8,'
                + '8d44,59ff,6ecb,6dc4,5b5c,7d2b,4ed4,7c7d,6ed3,5b50,81ea,6e0d,5b57,9b03,68d5,8e2a,5b97,7efc,603b,7eb5,'
                + '90b9,8d70,594f,63cd,79df,8db3,5352,65cf,7956,8bc5,963b,7ec4,94bb,7e82,5634,9189,6700,7f6a,5c0a,9075,'
                + '6628,5de6,4f50,67de,505a,4f5c,5750,5ea7,e810,e811,e812,e813,e814,4e8d,4e0c,5140,4e10,5eff,5345,4e15,'
                + '4e98,4e1e,9b32,5b6c,5669,4e28,79ba,4e3f,5315,4e47,592d,723b,536e,6c10,56df,80e4,9997,6bd3,777e,9f17,'
                + '4e36,4e9f,9f10,4e5c,4e69,4e93,8288,5b5b,556c,560f,4ec4,538d,539d,53a3,53a5,53ae,9765,8d5d,531a,53f5,'
                + '5326,532e,533e,8d5c,5366,5363,5202,5208,520e,522d,5233,523f,5240,524c,525e,5261,525c,84af,527d,5282,'
                + '5281,5290,5293,5182,7f54,4ebb,4ec3,4ec9,4ec2,4ee8,4ee1,4eeb,4ede,4f1b,4ef3,4f22,4f64,4ef5,4f25,4f27,'
                + '4f09,4f2b,4f5e,4f67,6538,4f5a,4f5d,4f5f,4f57,4f32,4f3d,4f76,4f74,4f91,4f89,4f83,4f8f,4f7e,4f7b,4faa,'
                + '4f7c,4fac,4f94,4fe6,4fe8,4fea,4fc5,4fda,4fe3,4fdc,4fd1,4fdf,4ff8,5029,504c,4ff3,502c,500f,502e,502d,'
                + '4ffe,501c,500c,5025,5028,507e,5043,5055,5048,504e,506c,507b,50a5,50a7,50a9,50ba,50d6,5106,50ed,50ec,'
                + '50e6,50ee,5107,510b,4edd,6c3d,4f58,4f65,4fce,9fa0,6c46,7c74,516e,5dfd,9ec9,9998,5181,5914,52f9,530d,'
                + '8a07,5310,51eb,5919,5155,4ea0,5156,4eb3,886e,88a4,4eb5,8114,88d2,7980,5b34,8803,7fb8,51ab,51b1,51bd,'
                + '51bc,51c7,5196,51a2,51a5,8ba0,8ba6,8ba7,8baa,8bb4,8bb5,8bb7,8bc2,8bc3,8bcb,8bcf,8bce,8bd2,8bd3,8bd4,'
                + '8bd6,8bd8,8bd9,8bdc,8bdf,8be0,8be4,8be8,8be9,8bee,8bf0,8bf3,8bf6,8bf9,8bfc,8bff,8c00,8c02,8c04,8c07,'
                + '8c0c,8c0f,8c11,8c12,8c14,8c15,8c16,8c19,8c1b,8c18,8c1d,8c1f,8c20,8c21,8c25,8c27,8c2a,8c2b,8c2e,8c2f,'
                + '8c32,8c33,8c35,8c36,5369,537a,961d,9622,9621,9631,962a,963d,963c,9642,9649,9654,965f,9667,966c,9672,'
                + '9674,9688,968d,9697,96b0,9097,909b,909d,9099,90ac,90a1,90b4,90b3,90b6,90ba,90b8,90b0,90cf,90c5,90be,'
                + '90d0,90c4,90c7,90d3,90e6,90e2,90dc,90d7,90db,90eb,90ef,90fe,9104,9122,911e,9123,9131,912f,9139,9143,'
                + '9146,520d,5942,52a2,52ac,52ad,52be,54ff,52d0,52d6,52f0,53df,71ee,77cd,5ef4,51f5,51fc,9b2f,53b6,5f01,'
                + '755a,5def,574c,57a9,57a1,587e,58bc,58c5,58d1,5729,572c,572a,5733,5739,572e,572f,575c,573b,5742,5769,'
                + '5785,576b,5786,577c,577b,5768,576d,5776,5773,57ad,57a4,578c,57b2,57cf,57a7,57b4,5793,57a0,57d5,57d8,'
                + '57da,57d9,57d2,57b8,57f4,57ef,57f8,57e4,57dd,580b,580d,57fd,57ed,5800,581e,5819,5844,5820,5865,586c,'
                + '5881,5889,589a,5880,99a8,9f19,61ff,8279,827d,827f,828f,828a,82a8,8284,828e,8291,8297,8299,82ab,82b8,'
                + '82be,82b0,82c8,82ca,82e3,8298,82b7,82ae,82cb,82cc,82c1,82a9,82b4,82a1,82aa,829f,82c4,82ce,82a4,82e1,'
                + '8309,82f7,82e4,830f,8307,82dc,82f4,82d2,82d8,830c,82fb,82d3,8311,831a,8306,8314,8315,82e0,82d5,831c,'
                + '8351,835b,835c,8308,8392,833c,8334,8331,839b,835e,832f,834f,8347,8343,835f,8340,8317,8360,832d,833a,'
                + '8333,8366,8365,8368,831b,8369,836c,836a,836d,836e,83b0,8378,83b3,83b4,83a0,83aa,8393,839c,8385,837c,'
                + '83b6,83a9,837d,83b8,837b,8398,839e,83a8,83ba,83bc,83c1,8401,83e5,83d8,5807,8418,840b,83dd,83fd,83d6,'
                + '841c,8438,8411,8406,83d4,83df,840f,8403,83f8,83f9,83ea,83c5,83c0,8426,83f0,83e1,845c,8451,845a,8459,'
                + '8473,8487,8488,847a,8489,8478,843c,8446,8469,8476,848c,848e,8431,846d,84c1,84cd,84d0,84e6,84bd,84d3,'
                + '84ca,84bf,84ba,84e0,84a1,84b9,84b4,8497,84e5,84e3,850c,750d,8538,84f0,8539,851f,853a,8556,853b,84ff,'
                + '84fc,8559,8548,8568,8564,855e,857a,77a2,8543,8572,857b,85a4,85a8,8587,858f,8579,85ae,859c,8585,85b9,'
                + '85b7,85b0,85d3,85c1,85dc,85ff,8627,8605,8629,8616,863c,5efe,5f08,593c,5941,8037,5955,595a,5958,530f,'
                + '5c22,5c25,5c2c,5c34,624c,626a,629f,62bb,62ca,62da,62d7,62ee,6322,62f6,6339,634b,6343,63ad,63f6,6371,'
                + '637a,638e,63b4,636d,63ac,638a,6369,63ae,63bc,63f2,63f8,63e0,63ff,63c4,63de,63ce,6452,63c6,63be,6445,'
                + '6441,640b,641b,6420,640c,6426,6421,645e,6484,646d,6496,647a,64b7,64b8,6499,64ba,64c0,64d0,64d7,64e4,'
                + '64e2,6509,6525,652e,5f0b,5fd2,7519,5f11,535f,53f1,53fd,53e9,53e8,53fb,5412,5416,5406,544b,5452,5453,'
                + '5454,5456,5443,5421,5457,5459,5423,5432,5482,5494,5477,5471,5464,549a,549b,5484,5476,5466,549d,54d0,'
                + '54ad,54c2,54b4,54d2,54a7,54a6,54d3,54d4,5472,54a3,54d5,54bb,54bf,54cc,54d9,54da,54dc,54a9,54aa,54a4,'
                + '54dd,54cf,54de,551b,54e7,5520,54fd,5514,54f3,5522,5523,550f,5511,5527,552a,5567,558f,55b5,5549,556d,'
                + '5541,5555,553f,5550,553c,5537,5556,5575,5576,5577,5533,5530,555c,558b,55d2,5583,55b1,55b9,5588,5581,'
                + '559f,557e,55d6,5591,557b,55df,55bd,55be,5594,5599,55ea,55f7,55c9,561f,55d1,55eb,55ec,55d4,55e6,55dd,'
                + '55c4,55ef,55e5,55f2,55f3,55cc,55cd,55e8,55f5,55e4,8f94,561e,5608,560c,5601,5624,5623,55fe,5600,5627,'
                + '562d,5658,5639,5657,562c,564d,5662,5659,565c,564c,5654,5686,5664,5671,566b,567b,567c,5685,5693,56af,'
                + '56d4,56d7,56dd,56e1,56f5,56eb,56f9,56ff,5704,570a,5709,571c,5e0f,5e19,5e14,5e11,5e31,5e3b,5e3c,5e37,'
                + '5e44,5e54,5e5b,5e5e,5e61,5c8c,5c7a,5c8d,5c90,5c96,5c88,5c98,5c99,5c91,5c9a,5c9c,5cb5,5ca2,5cbd,5cac,'
                + '5cab,5cb1,5ca3,5cc1,5cb7,5cc4,5cd2,5ce4,5ccb,5ce5,5d02,5d03,5d27,5d26,5d2e,5d24,5d1e,5d06,5d1b,5d58,'
                + '5d3e,5d34,5d3d,5d6c,5d5b,5d6f,5d5d,5d6b,5d4b,5d4a,5d69,5d74,5d82,5d99,5d9d,8c73,5db7,5dc5,5f73,5f77,'
                + '5f82,5f87,5f89,5f8c,5f95,5f99,5f9c,5fa8,5fad,5fb5,5fbc,8862,5f61,72ad,72b0,72b4,72b7,72b8,72c3,72c1,'
                + '72ce,72cd,72d2,72e8,72ef,72e9,72f2,72f4,72f7,7301,72f3,7303,72fa,72fb,7317,7313,7321,730a,731e,731d,'
                + '7315,7322,7339,7325,732c,7338,7331,7350,734d,7357,7360,736c,736f,737e,821b,5925,98e7,5924,5902,9963,'
                + '9967,9968,9969,996a,996b,996c,9974,9977,997d,9980,9984,9987,998a,998d,9990,9991,9993,9994,9995,5e80,'
                + '5e91,5e8b,5e96,5ea5,5ea0,5eb9,5eb5,5ebe,5eb3,8d53,5ed2,5ed1,5edb,5ee8,5eea,81ba,5fc4,5fc9,5fd6,5fcf,'
                + '6003,5fee,6004,5fe1,5fe4,5ffe,6005,6006,5fea,5fed,5ff8,6019,6035,6026,601b,600f,600d,6029,602b,600a,'
                + '603f,6021,6078,6079,607b,607a,6042,606a,607d,6096,609a,60ad,609d,6083,6092,608c,609b,60ec,60bb,60b1,'
                + '60dd,60d8,60c6,60da,60b4,6120,6126,6115,6123,60f4,6100,610e,612b,614a,6175,61ac,6194,61a7,61b7,61d4,'
                + '61f5,5fdd,96b3,95e9,95eb,95f1,95f3,95f5,95f6,95fc,95fe,9603,9604,9606,9608,960a,960b,960c,960d,960f,'
                + '9612,9615,9616,9617,9619,961a,4e2c,723f,6215,6c35,6c54,6c5c,6c4a,6ca3,6c85,6c90,6c94,6c8c,6c68,6c69,'
                + '6c74,6c76,6c86,6ca9,6cd0,6cd4,6cad,6cf7,6cf8,6cf1,6cd7,6cb2,6ce0,6cd6,6cfa,6ceb,6cee,6cb1,6cd3,6cef,'
                + '6cfe,6d39,6d27,6d0c,6d43,6d48,6d07,6d04,6d19,6d0e,6d2b,6d4d,6d2e,6d35,6d1a,6d4f,6d52,6d54,6d33,6d91,'
                + '6d6f,6d9e,6da0,6d5e,6d93,6d94,6d5c,6d60,6d7c,6d63,6e1a,6dc7,6dc5,6dde,6e0e,6dbf,6de0,6e11,6de6,6ddd,'
                + '6dd9,6e16,6dab,6e0c,6dae,6e2b,6e6e,6e4e,6e6b,6eb2,6e5f,6e86,6e53,6e54,6e32,6e25,6e44,6edf,6eb1,6e98,'
                + '6ee0,6f2d,6ee2,6ea5,6ea7,6ebd,6ebb,6eb7,6ed7,6eb4,6ecf,6e8f,6ec2,6e9f,6f62,6f46,6f47,6f24,6f15,6ef9,'
                + '6f2f,6f36,6f4b,6f74,6f2a,6f09,6f29,6f89,6f8d,6f8c,6f78,6f72,6f7c,6f7a,6fd1,6fc9,6fa7,6fb9,6fb6,6fc2,'
                + '6fe1,6fee,6fde,6fe0,6fef,701a,7023,701b,7039,7035,704f,705e,5b80,5b84,5b95,5b93,5ba5,5bb8,752f,9a9e,'
                + '6434,5be4,5bee,8930,5bf0,8e47,8b07,8fb6,8fd3,8fd5,8fe5,8fee,8fe4,8fe9,8fe6,8ff3,8fe8,9005,9004,900b,'
                + '9026,9011,900d,9016,9021,9035,9036,902d,902f,9044,9051,9052,9050,9068,9058,9062,905b,66b9,9074,907d,'
                + '9082,9088,9083,908b,5f50,5f57,5f56,5f58,5c3b,54ab,5c50,5c59,5b71,5c63,5c66,7fbc,5f2a,5f29,5f2d,8274,'
                + '5f3c,9b3b,5c6e,5981,5983,598d,59a9,59aa,59a3,5997,59ca,59ab,599e,59a4,59d2,59b2,59af,59d7,59be,5a05,'
                + '5a06,59dd,5a08,59e3,59d8,59f9,5a0c,5a09,5a32,5a34,5a11,5a23,5a13,5a40,5a67,5a4a,5a55,5a3c,5a62,5a75,'
                + '80ec,5aaa,5a9b,5a77,5a7a,5abe,5aeb,5ab2,5ad2,5ad4,5ab8,5ae0,5ae3,5af1,5ad6,5ae6,5ad8,5adc,5b09,5b17,'
                + '5b16,5b32,5b37,5b40,5c15,5c1c,5b5a,5b65,5b73,5b51,5b53,5b62,9a75,9a77,9a78,9a7a,9a7f,9a7d,9a80,9a81,'
                + '9a85,9a88,9a8a,9a90,9a92,9a93,9a96,9a98,9a9b,9a9c,9a9d,9a9f,9aa0,9aa2,9aa3,9aa5,9aa7,7e9f,7ea1,7ea3,'
                + '7ea5,7ea8,7ea9,7ead,7eb0,7ebe,7ec0,7ec1,7ec2,7ec9,7ecb,7ecc,7ed0,7ed4,7ed7,7edb,7ee0,7ee1,7ee8,7eeb,'
                + '7eee,7eef,7ef1,7ef2,7f0d,7ef6,7efa,7efb,7efe,7f01,7f02,7f03,7f07,7f08,7f0b,7f0c,7f0f,7f11,7f12,7f17,'
                + '7f19,7f1c,7f1b,7f1f,7f21,7f22,7f23,7f24,7f25,7f26,7f27,7f2a,7f2b,7f2c,7f2d,7f2f,7f30,7f31,7f32,7f33,'
                + '7f35,5e7a,757f,5ddb,753e,9095,738e,7391,73ae,73a2,739f,73cf,73c2,73d1,73b7,73b3,73c0,73c9,73c8,73e5,'
                + '73d9,987c,740a,73e9,73e7,73de,73ba,73f2,740f,742a,745b,7426,7425,7428,7430,742e,742c,741b,741a,7441,'
                + '745c,7457,7455,7459,7477,746d,747e,749c,748e,7480,7481,7487,748b,749e,74a8,74a9,7490,74a7,74d2,74ba,'
                + '97ea,97eb,97ec,674c,6753,675e,6748,6769,67a5,6787,676a,6773,6798,67a7,6775,67a8,679e,67ad,678b,6777,'
                + '677c,67f0,6809,67d8,680a,67e9,67b0,680c,67d9,67b5,67da,67b3,67dd,6800,67c3,67b8,67e2,680e,67c1,67fd,'
                + '6832,6833,6860,6861,684e,6862,6844,6864,6883,681d,6855,6866,6841,6867,6840,683e,684a,6849,6829,68b5,'
                + '688f,6874,6877,6893,686b,68c2,696e,68fc,691f,6920,68f9,6924,68f0,690b,6901,6957,68e3,6910,6971,6939,'
                + '6960,6942,695d,6984,696b,6980,6998,6978,6934,69cc,6987,6988,69ce,6989,6966,6963,6979,699b,69a7,69bb,'
                + '69ab,69ad,69d4,69b1,69c1,69ca,69df,6995,69e0,698d,69ff,6a2f,69ed,6a17,6a18,6a65,69f2,6a44,6a3e,6aa0,'
                + '6a50,6a5b,6a35,6a8e,6a79,6a3d,6a28,6a58,6a7c,6a91,6a90,6aa9,6a97,6aab,7337,7352,6b81,6b82,6b87,6b84,'
                + '6b92,6b93,6b8d,6b9a,6b9b,6ba1,6baa,8f6b,8f6d,8f71,8f72,8f73,8f75,8f76,8f78,8f77,8f79,8f7a,8f7c,8f7e,'
                + '8f81,8f82,8f84,8f87,8f8b,8f8d,8f8e,8f8f,8f98,8f9a,8ece,620b,6217,621b,621f,6222,6221,6225,6224,622c,'
                + '81e7,74ef,74f4,74ff,750f,7511,7513,6534,65ee,65ef,65f0,660a,6619,6772,6603,6615,6600,7085,66f7,661d,'
                + '6634,6631,6636,6635,8006,665f,6654,6641,664f,6656,6661,6657,6677,6684,668c,66a7,669d,66be,66db,66dc,'
                + '66e6,66e9,8d32,8d33,8d36,8d3b,8d3d,8d40,8d45,8d46,8d48,8d49,8d47,8d4d,8d55,8d59,89c7,89ca,89cb,89cc,'
                + '89ce,89cf,89d0,89d1,726e,729f,725d,7266,726f,727e,727f,7284,728b,728d,728f,7292,6308,6332,63b0,643f,'
                + '64d8,8004,6bea,6bf3,6bfd,6bf5,6bf9,6c05,6c07,6c06,6c0d,6c15,6c18,6c19,6c1a,6c21,6c29,6c24,6c2a,6c32,'
                + '6535,6555,656b,724d,7252,7256,7230,8662,5216,809f,809c,8093,80bc,670a,80bd,80b1,80ab,80ad,80b4,80b7,'
                + '80e7,80e8,80e9,80ea,80db,80c2,80c4,80d9,80cd,80d7,6710,80dd,80eb,80f1,80f4,80ed,810d,810e,80f2,80fc,'
                + '6715,8112,8c5a,8136,811e,812c,8118,8132,8148,814c,8153,8174,8159,815a,8171,8160,8169,817c,817d,816d,'
                + '8167,584d,5ab5,8188,8182,8191,6ed5,81a3,81aa,81cc,6726,81ca,81bb,81c1,81a6,6b24,6b37,6b39,6b43,6b46,'
                + '6b59,98d1,98d2,98d3,98d5,98d9,98da,6bb3,5f40,6bc2,89f3,6590,9f51,6593,65bc,65c6,65c4,65c3,65cc,65ce,'
                + '65d2,65d6,7080,709c,7096,709d,70bb,70c0,70b7,70ab,70b1,70e8,70ca,7110,7113,7116,712f,7131,7173,715c,'
                + '7168,7145,7172,714a,7178,717a,7198,71b3,71b5,71a8,71a0,71e0,71d4,71e7,71f9,721d,7228,706c,7118,7166,'
                + '71b9,623e,623d,6243,6248,6249,793b,7940,7946,7949,795b,795c,7953,795a,7962,7957,7960,796f,7967,797a,'
                + '7985,798a,799a,79a7,79b3,5fd1,5fd0,603c,605d,605a,6067,6041,6059,6063,60ab,6106,610d,615d,61a9,619d,'
                + '61cb,61d1,6206,8080,807f,6c93,6cf6,6dfc,77f6,77f8,7800,7809,7817,7818,7811,65ab,782d,781c,781d,7839,'
                + '783a,783b,781f,783c,7825,782c,7823,7829,784e,786d,7856,7857,7826,7850,7847,784c,786a,789b,7893,789a,'
                + '7887,789c,78a1,78a3,78b2,78b9,78a5,78d4,78d9,78c9,78ec,78f2,7905,78f4,7913,7924,791e,7934,9f9b,9ef9,'
                + '9efb,9efc,76f1,7704,770d,76f9,7707,7708,771a,7722,7719,772d,7726,7735,7738,7750,7751,7747,7743,775a,'
                + '7768,7762,7765,777f,778d,777d,7780,778c,7791,779f,77a0,77b0,77b5,77bd,753a,7540,754e,754b,7548,755b,'
                + '7572,7579,7583,7f58,7f61,7f5f,8a48,7f68,7f74,7f71,7f79,7f81,7f7e,76cd,76e5,8832,9485,9486,9487,948b,'
                + '948a,948c,948d,948f,9490,9494,9497,9495,949a,949b,949c,94a3,94a4,94ab,94aa,94ad,94ac,94af,94b0,94b2,'
                + '94b4,94b6,94b7,94b8,94b9,94ba,94bc,94bd,94bf,94c4,94c8,94c9,94ca,94cb,94cc,94cd,94ce,94d0,94d1,94d2,'
                + '94d5,94d6,94d7,94d9,94d8,94db,94de,94df,94e0,94e2,94e4,94e5,94e7,94e8,94ea,94e9,94eb,94ee,94ef,94f3,'
                + '94f4,94f5,94f7,94f9,94fc,94fd,94ff,9503,9502,9506,9507,9509,950a,950d,950e,950f,9512,9513,9514,9515,'
                + '9516,9518,951b,951d,951e,951f,9522,952a,952b,9529,952c,9531,9532,9534,9536,9537,9538,953c,953e,953f,'
                + '9542,9535,9544,9545,9546,9549,954c,954e,954f,9552,9553,9554,9556,9557,9558,9559,955b,955e,955f,955d,'
                + '9561,9562,9564,9565,9566,9567,9568,9569,956a,956b,956c,956f,9571,9572,9573,953a,77e7,77ec,96c9,79d5,'
                + '79ed,79e3,79eb,7a06,5d47,7a03,7a02,7a1e,7a14,7a39,7a37,7a51,9ecf,99a5,7a70,7688,768e,7693,7699,76a4,'
                + '74de,74e0,752c,9e20,9e22,9e28,9e29,9e2a,9e2b,9e2c,9e32,9e31,9e36,9e38,9e37,9e39,9e3a,9e3e,9e41,9e42,'
                + '9e44,9e46,9e47,9e48,9e49,9e4b,9e4c,9e4e,9e51,9e55,9e57,9e5a,9e5b,9e5c,9e5e,9e63,9e66,9e67,9e68,9e69,'
                + '9e6a,9e6b,9e6c,9e71,9e6d,9e73,7592,7594,7596,75a0,759d,75ac,75a3,75b3,75b4,75b8,75c4,75b1,75b0,75c3,'
                + '75c2,75d6,75cd,75e3,75e8,75e6,75e4,75eb,75e7,7603,75f1,75fc,75ff,7610,7600,7605,760c,7617,760a,7625,'
                + '7618,7615,7619,761b,763c,7622,7620,7640,762d,7630,763f,7635,7643,763e,7633,764d,765e,7654,765c,7656,'
                + '766b,766f,7fca,7ae6,7a78,7a79,7a80,7a86,7a88,7a95,7aa6,7aa0,7aac,7aa8,7aad,7ab3,8864,8869,8872,887d,'
                + '887f,8882,88a2,88c6,88b7,88bc,88c9,88e2,88ce,88e3,88e5,88f1,891a,88fc,88e8,88fe,88f0,8921,8919,8913,'
                + '891b,890a,8934,892b,8936,8941,8966,897b,758b,80e5,76b2,76b4,77dc,8012,8014,8016,801c,8020,8022,8025,'
                + '8026,8027,8029,8028,8031,800b,8035,8043,8046,804d,8052,8069,8071,8983,9878,9880,9883,9889,988c,988d,'
                + '988f,9894,989a,989b,989e,989f,98a1,98a2,98a5,98a6,864d,8654,866c,866e,867f,867a,867c,867b,86a8,868d,'
                + '868b,86ac,869d,86a7,86a3,86aa,8693,86a9,86b6,86c4,86b5,86ce,86b0,86ba,86b1,86af,86c9,86cf,86b4,86e9,'
                + '86f1,86f2,86ed,86f3,86d0,8713,86de,86f4,86df,86d8,86d1,8703,8707,86f8,8708,870a,870d,8709,8723,873b,'
                + '871e,8725,872e,871a,873e,8748,8734,8731,8729,8737,873f,8782,8722,877d,877e,877b,8760,8770,874c,876e,'
                + '878b,8753,8763,877c,8764,8759,8765,8793,87af,87a8,87d2,87c6,8788,8785,87ad,8797,8783,87ab,87e5,87ac,'
                + '87b5,87b3,87cb,87d3,87bd,87d1,87c0,87ca,87db,87ea,87e0,87ee,8816,8813,87fe,880a,881b,8821,8839,883c,'
                + '7f36,7f42,7f44,7f45,8210,7afa,7afd,7b08,7b03,7b04,7b15,7b0a,7b2b,7b0f,7b47,7b38,7b2a,7b19,7b2e,7b31,'
                + '7b20,7b25,7b24,7b33,7b3e,7b1e,7b58,7b5a,7b45,7b75,7b4c,7b5d,7b60,7b6e,7b7b,7b62,7b72,7b71,7b90,7ba6,'
                + '7ba7,7bb8,7bac,7b9d,7ba8,7b85,7baa,7b9c,7ba2,7bab,7bb4,7bd1,7bc1,7bcc,7bdd,7bda,7be5,7be6,7bea,7c0c,'
                + '7bfe,7bfc,7c0f,7c16,7c0b,7c1f,7c2a,7c26,7c38,7c41,7c40,81fe,8201,8202,8204,81ec,8844,8221,8222,8223,'
                + '822d,822f,8228,822b,8238,823b,8233,8234,823e,8244,8249,824b,824f,825a,825f,8268,887e,8885,8888,88d8,'
                + '88df,895e,7f9d,7f9f,7fa7,7faf,7fb0,7fb2,7c7c,6549,7c91,7c9d,7c9c,7c9e,7ca2,7cb2,7cbc,7cbd,7cc1,7cc7,'
                + '7ccc,7ccd,7cc8,7cc5,7cd7,7ce8,826e,66a8,7fbf,7fce,7fd5,7fe5,7fe1,7fe6,7fe9,7fee,7ff3,7cf8,7d77,7da6,'
                + '7dae,7e47,7e9b,9eb8,9eb4,8d73,8d84,8d94,8d91,8db1,8d67,8d6d,8c47,8c49,914a,9150,914e,914f,9164,9162,'
                + '9161,9170,9169,916f,917d,917e,9172,9174,9179,918c,9185,9190,918d,9191,91a2,91a3,91aa,91ad,91ae,91af,'
                + '91b5,91b4,91ba,8c55,9e7e,8db8,8deb,8e05,8e59,8e69,8db5,8dbf,8dbc,8dba,8dc4,8dd6,8dd7,8dda,8dde,8dce,'
                + '8dcf,8ddb,8dc6,8dec,8df7,8df8,8de3,8df9,8dfb,8de4,8e09,8dfd,8e14,8e1d,8e1f,8e2c,8e2e,8e23,8e2f,8e3a,'
                + '8e40,8e39,8e35,8e3d,8e31,8e49,8e41,8e42,8e51,8e52,8e4a,8e70,8e76,8e7c,8e6f,8e74,8e85,8e8f,8e94,8e90,'
                + '8e9c,8e9e,8c78,8c82,8c8a,8c85,8c98,8c94,659b,89d6,89de,89da,89dc,89e5,89eb,89ef,8a3e,8b26,9753,96e9,'
                + '96f3,96ef,9706,9701,9708,970f,970e,972a,972d,9730,973e,9f80,9f83,9f85,9f86,9f87,9f88,9f89,9f8a,9f8c,'
                + '9efe,9f0b,9f0d,96b9,96bc,96bd,96ce,96d2,77bf,96e0,928e,92ae,92c8,933e,936a,93ca,938f,943e,946b,9c7f,'
                + '9c82,9c85,9c86,9c87,9c88,7a23,9c8b,9c8e,9c90,9c91,9c92,9c94,9c95,9c9a,9c9b,9c9e,9c9f,9ca0,9ca1,9ca2,'
                + '9ca3,9ca5,9ca6,9ca7,9ca8,9ca9,9cab,9cad,9cae,9cb0,9cb1,9cb2,9cb3,9cb4,9cb5,9cb6,9cb7,9cba,9cbb,9cbc,'
                + '9cbd,9cc4,9cc5,9cc6,9cc7,9cca,9ccb,9ccc,9ccd,9cce,9ccf,9cd0,9cd3,9cd4,9cd5,9cd7,9cd8,9cd9,9cdc,9cdd,'
                + '9cdf,9ce2,977c,9785,9791,9792,9794,97af,97ab,97a3,97b2,97b4,9ab1,9ab0,9ab7,9e58,9ab6,9aba,9abc,9ac1,'
                + '9ac0,9ac5,9ac2,9acb,9acc,9ad1,9b45,9b43,9b47,9b49,9b48,9b4d,9b51,98e8,990d,992e,9955,9954,9adf,9ae1,'
                + '9ae6,9aef,9aeb,9afb,9aed,9af9,9b08,9b0f,9b13,9b1f,9b23,9ebd,9ebe,7e3b,9e82,9e87,9e88,9e8b,9e92,93d6,'
                + '9e9d,9e9f,9edb,9edc,9edd,9ee0,9edf,9ee2,9ee9,9ee7,9ee5,9eea,9eef,9f22,9f2c,9f2f,9f39,9f37,9f3d,9f3e,'
                + '9f44';
                var mapping = [];
                var hasInited = false;
                function initMapping() {
                    if (hasInited)
                    {
                        return;
                    }
                    var utf8s = utf8Chars.split(',');
                    var l = utf8s.length;
                    for (var i = 0; i < l; i++)
                    {
                        var lOffset = i % 0x5e;
                        var hOffset = (i - lOffset) / 0x5e;
                        var gbCode = '%' + (hOffset + 0xa1).toString(16) + '%' + (lOffset + 0xa1).toString(16);
                        var gbChar = unescape('%u' + utf8s[i]);
                        mapping[gbChar] = gbCode.toUpperCase();
                    }
                    hasInited = true;
                }
                function encode(cn) {
                    initMapping();
                    return (cn == null) ? null : mapping[cn];
                }
                return encode(val);
            }
            var i;
            var c;
            var p;
            var q;
            var ret = '';
            var strSpecial = '!\"#$%&\'()*+,\/:;<=>?@[\\]^`{|}~';
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i).match(/[^\x00-\xff]/g)) {
                    ret += gb2312Codec(str.charAt(i));
                } else {
                    c = str.charAt(i);
                    if (c === ' ') {
                        ret += '+';
                    } else if (strSpecial.indexOf(c) !== -1) {
                        ret += '%' + str.charCodeAt(i).toString(16);
                    } else {
                        ret += c;
                    }
                }
            }
            return ret;
        }
    };

    return customElement;
});
