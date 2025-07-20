"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_user = require("./store/user.js");
if (!Math) {
  "./pages/tabbar/index/index.js";
  "./pages/tabbar/lecture/lecture.js";
  "./pages/tabbar/other/other.js";
  "./pages/tabbar/lecture/lectureDetail.js";
  "./pages/tabbar/index/indexDetail.js";
  "./uni_modules/uni-upgrade-center-app/pages/upgrade-popup.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
    const userStore = store_user.useUserStore();
    const today = /* @__PURE__ */ new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate() - 1).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const backupUrlFetcher = "https://nik-nul.github.io/keep/url.txt";
    const url = `http://52.184.65.42/typst/${dateStr}`;
    common_vendor.index.request({
      url,
      method: "GET",
      success(res) {
        userStore.setUserInfo(res.data);
      },
      fail(err) {
        common_vendor.index.__f__("error", "at App.vue:30", "请求失败,尝试备用地址");
        common_vendor.index.request({
          url: backupUrlFetcher,
          method: "GET",
          success(backres) {
            const newBaseurl = backres.data.trim();
            if (!newBaseurl) {
              common_vendor.index.__f__("error", "at App.vue:37", "备用地址为空");
              return;
            }
            const newurl = `http://${newBaseurl}/typst/${dateStr}`;
            common_vendor.index.request({
              url: newurl,
              method: "GET",
              success(res2) {
                userStore.setUserInfo(res2.data);
              },
              fail(err2) {
                common_vendor.index.__f__("error", "at App.vue:49", "备用服务器请求失败:", err2);
              }
            });
          },
          fail(err3) {
            common_vendor.index.__f__("error", "at App.vue:54", "备用地址请求失败");
          }
        });
      }
    });
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:61", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:64", "App Hide");
  },
  created() {
    const userStore = store_user.useUserStore();
    common_vendor.index.__f__("log", "at App.vue:68", userStore.userInfo);
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
