"use strict";
const common_vendor = require("../../../common/vendor.js");
const uni_modules_uniUpgradeCenterApp_utils_utils = require("../utils/utils.js");
const common_assets = require("../../../common/assets.js");
const localFilePathKey = "UNI_ADMIN_UPGRADE_CENTER_LOCAL_FILE_PATH";
let downloadTask = null;
let openSchemePromise;
const _sfc_main = {
  emits: ["close", "show"],
  data() {
    return {
      // 从之前下载安装
      installForBeforeFilePath: "",
      // 安装
      installed: false,
      installing: false,
      // 下载
      downloadSuccess: false,
      downloading: false,
      downLoadPercent: 0,
      downloadedSize: 0,
      packageFileSize: 0,
      tempFilePath: "",
      // 要安装的本地包地址
      // 默认安装包信息
      title: "更新日志",
      contents: "",
      version: "",
      is_mandatory: false,
      url: "",
      platform: [],
      store_list: null,
      // 可自定义属性
      subTitle: "发现新版本",
      downLoadBtnTextiOS: "立即跳转更新",
      downLoadBtnText: "立即下载更新",
      downLoadingText: "安装包下载中，请稍后"
    };
  },
  onLoad({ local_storage_key }) {
    if (!local_storage_key) {
      common_vendor.index.__f__("error", "at uni_modules/uni-upgrade-center-app/pages/upgrade-popup.vue:130", "local_storage_key为空，请检查后重试");
      common_vendor.index.navigateBack();
      return;
    }
    const localPackageInfo = common_vendor.index.getStorageSync(local_storage_key);
    if (!localPackageInfo) {
      common_vendor.index.__f__("error", "at uni_modules/uni-upgrade-center-app/pages/upgrade-popup.vue:137", "安装包信息为空，请检查后重试");
      common_vendor.index.navigateBack();
      return;
    }
    this.setLocalPackageInfo(localPackageInfo);
  },
  onBackPress() {
    if (this.is_mandatory)
      return true;
    if (!this.needNotificationProgress)
      downloadTask && downloadTask.abort();
  },
  onHide() {
    openSchemePromise = null;
  },
  computed: {
    isWGT() {
      return this.type === "wgt";
    },
    isNativeApp() {
      return this.type === "native_app";
    },
    isiOS() {
      return this.platform.indexOf(uni_modules_uniUpgradeCenterApp_utils_utils.platform_iOS) !== -1;
    },
    isAndroid() {
      return this.platform.indexOf(uni_modules_uniUpgradeCenterApp_utils_utils.platform_Android) !== -1;
    },
    isHarmony() {
      return this.platform.indexOf(uni_modules_uniUpgradeCenterApp_utils_utils.platform_Harmony) !== -1;
    },
    isApplicationStore() {
      return !this.isWGT && this.isNativeApp && (this.isiOS || this.isHarmony);
    },
    needNotificationProgress() {
      return this.platform.indexOf(uni_modules_uniUpgradeCenterApp_utils_utils.platform_iOS) === -1 && !this.is_mandatory && !this.isHarmony;
    }
  },
  methods: {
    show(shown, localPackageInfo) {
    },
    setLocalPackageInfo(localPackageInfo) {
      const requiredKey = ["version", "url", "type"];
      for (let key in localPackageInfo) {
        if (requiredKey.indexOf(key) !== -1 && !localPackageInfo[key]) {
          common_vendor.index.__f__("error", "at uni_modules/uni-upgrade-center-app/pages/upgrade-popup.vue:195", `参数 ${key} 必填，请检查后重试`);
          return;
        }
      }
      Object.assign(this, localPackageInfo);
      this.checkLocalStoragePackage();
    },
    checkLocalStoragePackage() {
      const localFilePathRecord = common_vendor.index.getStorageSync(localFilePathKey);
      if (localFilePathRecord) {
        const { version, savedFilePath, installed } = localFilePathRecord;
        if (!installed && uni_modules_uniUpgradeCenterApp_utils_utils.compare(version, this.version) === 0) {
          this.downloadSuccess = true;
          this.installForBeforeFilePath = savedFilePath;
          this.tempFilePath = savedFilePath;
        } else {
          this.deleteSavedFile(savedFilePath);
        }
      }
    },
    askAbortDownload() {
      common_vendor.index.showModal({
        title: "是否取消下载？",
        cancelText: "否",
        confirmText: "是",
        success: (res) => {
          if (res.confirm) {
            downloadTask && downloadTask.abort();
            if (this.needNotificationProgress) {
              cancelNotificationProgress();
            }
            common_vendor.index.navigateBack();
          }
        }
      });
    },
    async closeUpdate() {
      if (this.downloading) {
        if (this.is_mandatory) {
          return common_vendor.index.showToast({
            title: "下载中，请稍后……",
            icon: "none",
            duration: 500
          });
        }
        if (!this.needNotificationProgress) {
          this.askAbortDownload();
          return;
        }
      }
      if (!this.needNotificationProgress && this.downloadSuccess && this.tempFilePath) {
        await this.saveFile(this.tempFilePath, this.version);
      }
    },
    updateApp() {
      this.checkStoreScheme().catch(() => {
        this.downloadPackage();
      }).finally(() => {
        openSchemePromise = null;
      });
    },
    // 跳转应用商店
    checkStoreScheme() {
      const storeList = (this.store_list || []).filter((item) => item.enable);
      if (storeList && storeList.length) {
        storeList.sort((cur, next) => next.priority - cur.priority).map((item) => item.scheme).reduce((promise, cur, curIndex) => {
          openSchemePromise = (promise || (promise = Promise.reject())).catch(() => {
            return new Promise((resolve, reject) => {
              plus.runtime.openURL(cur, (err) => {
                reject(err);
              });
            });
          });
          return openSchemePromise;
        }, openSchemePromise);
        return openSchemePromise;
      }
      return Promise.reject();
    },
    downloadPackage() {
      this.downloading = true;
      downloadTask = common_vendor.index.downloadFile({
        url: this.url,
        success: (res) => {
          if (res.statusCode == 200) {
            if (this.isWGT && res.tempFilePath.split(".").slice(-1)[0] !== "wgt") {
              const failCallback = (e) => {
                common_vendor.index.__f__("log", "at uni_modules/uni-upgrade-center-app/pages/upgrade-popup.vue:311", "[FILE RENAME FAIL]：", JSON.stringify(e));
              };
              plus.io.resolveLocalFileSystemURL(
                res.tempFilePath,
                (entry) => {
                  entry.getParent((parent) => {
                    const newName = `new_wgt_${Date.now()}.wgt`;
                    entry.copyTo(
                      parent,
                      newName,
                      (res2) => {
                        this.tempFilePath = res2.fullPath;
                        this.downLoadComplete();
                      },
                      failCallback
                    );
                  }, failCallback);
                },
                failCallback
              );
            } else {
              this.tempFilePath = res.tempFilePath;
              this.downLoadComplete();
            }
          } else {
            common_vendor.index.__f__("log", "at uni_modules/uni-upgrade-center-app/pages/upgrade-popup.vue:341", "下载错误：" + JSON.stringify(res));
            this.downloadFail();
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-upgrade-center-app/pages/upgrade-popup.vue:346", "下载错误：" + JSON.stringify(err));
          this.downloadFail();
        }
      });
      downloadTask.onProgressUpdate((res) => {
        this.downLoadPercent = res.progress;
        this.downloadedSize = (res.totalBytesWritten / Math.pow(1024, 2)).toFixed(2);
        this.packageFileSize = (res.totalBytesExpectedToWrite / Math.pow(1024, 2)).toFixed(2);
        if (this.needNotificationProgress && !this.downloadSuccess) {
          createNotificationProgress({
            title: "升级中心正在下载安装包……",
            content: `${this.downLoadPercent}%`,
            progress: this.downLoadPercent,
            onClick: () => {
              this.askAbortDownload();
            }
          });
        }
      });
      if (this.needNotificationProgress) {
        common_vendor.index.navigateBack();
      }
    },
    downloadFail() {
      const errMsg = "下载失败，请点击重试";
      this.downloadSuccess = false;
      this.downloading = false;
      this.downLoadPercent = 0;
      this.downloadedSize = 0;
      this.packageFileSize = 0;
      this.downLoadBtnText = errMsg;
      downloadTask = null;
      if (this.needNotificationProgress) {
        finishNotificationProgress({
          title: "升级包下载失败",
          content: "请重新检查更新"
        });
      }
    },
    downLoadComplete() {
      this.downloadSuccess = true;
      this.downloading = false;
      this.downLoadPercent = 0;
      this.downloadedSize = 0;
      this.packageFileSize = 0;
      downloadTask = null;
      if (this.needNotificationProgress) {
        finishNotificationProgress({
          title: "安装升级包",
          content: "下载完成"
        });
        this.installPackage();
        return;
      }
      if (this.is_mandatory) {
        this.installPackage();
      }
    },
    installPackage() {
    },
    restart() {
      this.installed = false;
    },
    saveFile(tempFilePath, version) {
      return new Promise((resolve, reject) => {
        common_vendor.index.saveFile({
          tempFilePath,
          success({ savedFilePath }) {
            common_vendor.index.setStorageSync(localFilePathKey, {
              version,
              savedFilePath
            });
          },
          complete() {
            resolve();
          }
        });
      });
    },
    deleteSavedFile(filePath) {
      common_vendor.index.removeStorageSync(localFilePathKey);
      return common_vendor.index.removeSavedFile({
        filePath
      });
    },
    jumpToApplicationStore() {
      plus.runtime.openURL(this.url);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.shown
  }, _ctx.shown ? common_vendor.e({
    b: common_vendor.t($data.title),
    c: common_assets._imports_0,
    d: common_vendor.t($data.subTitle),
    e: common_vendor.t($data.version),
    f: common_vendor.t($data.contents),
    g: $options.isApplicationStore
  }, $options.isApplicationStore ? {
    h: common_vendor.t($data.downLoadBtnTextiOS),
    i: common_vendor.o((...args) => $options.jumpToApplicationStore && $options.jumpToApplicationStore(...args))
  } : common_vendor.e({
    j: !$data.downloadSuccess
  }, !$data.downloadSuccess ? common_vendor.e({
    k: $data.downloading
  }, $data.downloading ? {
    l: $data.downLoadPercent,
    m: common_vendor.t($data.downLoadingText),
    n: common_vendor.t($data.downloadedSize),
    o: common_vendor.t($data.packageFileSize)
  } : {
    p: common_vendor.t($data.downLoadBtnText),
    q: common_vendor.o((...args) => $options.updateApp && $options.updateApp(...args))
  }) : $data.downloadSuccess && !$data.installed ? {
    s: common_vendor.t($data.installing ? "正在安装……" : "下载完成，立即安装"),
    t: $data.installing,
    v: $data.installing,
    w: common_vendor.o((...args) => $options.installPackage && $options.installPackage(...args))
  } : $data.installed && !$options.isWGT ? {
    y: $data.installing,
    z: $data.installing,
    A: common_vendor.o((...args) => $options.installPackage && $options.installPackage(...args))
  } : $data.installed && $options.isWGT ? {
    C: common_vendor.o((...args) => $options.restart && $options.restart(...args))
  } : {}, {
    r: $data.downloadSuccess && !$data.installed,
    x: $data.installed && !$options.isWGT,
    B: $data.installed && $options.isWGT
  }), {
    D: !$data.is_mandatory
  }, !$data.is_mandatory ? {
    E: common_assets._imports_1,
    F: common_vendor.o((...args) => $options.closeUpdate && $options.closeUpdate(...args))
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uni_modules/uni-upgrade-center-app/pages/upgrade-popup.js.map
