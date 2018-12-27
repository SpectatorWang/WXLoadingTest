require('libs/weapp-adapter/index');
var Parser = require('libs/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('libs/wx-downloader.js');
const __initWXGame__ = function() {
    require('src/settings');
    let settings = window._CCSettings;
    require('main');
    require(settings.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js');
    require('./libs/engine/index.js');
    wxDownloader.REMOTE_SERVER_ROOT = "";
    wxDownloader.SUBCONTEXT_ROOT = "";
    var pipeBeforeDownloader = cc.loader.md5Pipe || cc.loader.assetLoader;
    cc.loader.insertPipeAfter(pipeBeforeDownloader, wxDownloader);

    if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME_SUB) {
        require('./libs/sub-context-adapter');
    } else {
        // Release Image objects after uploaded gl texture
        cc.macro.CLEANUP_IMAGE_CACHE = true;
    }
    window.boot();
}

const downloadSubpackage = function() {
    wx.showLoading({
        title: '下载分包资源...',
    });
    wx.loadSubpackage({
        name: "setting",
        success: () => {
            wx.hideLoading();
            __initWXGame__();
        },
        fail: () => {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: '游戏分包资源下载失败，是否重试？',
                success(res) {
                    if (res.confirm) {
                        downloadSubpackage();
                    } else if (res.cancel) {
                        wx.exitMiniProgram({
                            success: () => {
                                console.log("微信退出游戏成功");
                            }, fail: () => {
                                console.log("微信退出游戏失败");
                            }
                        });
                    } else {
                        downloadSubpackage();
                    }
                }
            });
        }
        // complete: () => {
        //     wx.hideLoading();
        // }
    });
}

const w = 512;
const h = 512;
const data = wx.getSystemInfoSync();
const height = data.screenHeight;
const width = data.screenWidth;
const baseW = 0.8 * width / width ;
const baseH = 0.8 * width / height;
const cof = 1 / 512;
const vertices = new Float32Array([
    -baseW * cof * w, baseH * cof * h, 0.0, 1.0,
    -baseW * cof * w, -baseH * cof * h, 0.0, 0.0,
    baseW * cof * w, baseH * cof * h, 1.0, 1.0,
    baseW * cof * w, -baseH * cof * h, 1.0, 0.0,
]);
const texturedQuad = require("./textured-quad.js");
texturedQuad.drawImg("images/logo.jpg", vertices);
downloadSubpackage();
