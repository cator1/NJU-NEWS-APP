"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_user = require("../../../store/user.js");
const _sfc_main = {
  data() {
    return {
      activity: null,
      loaded: false
    };
  },
  computed: {
    userStore() {
      return store_user.useUserStore();
    }
  },
  watch: {
    "userStore.userInfo": {
      handler() {
        this.tryFindActivity();
      },
      immediate: true,
      deep: true
    }
  },
  onLoad(options) {
    this.options = options;
    this.tryFindActivity();
  },
  methods: {
    tryFindActivity() {
      var _a, _b, _c, _d, _e, _f, _g;
      const id = Number((_a = this.options) == null ? void 0 : _a.id);
      const all = [
        ...((_c = (_b = this.userStore.userInfo) == null ? void 0 : _b.data) == null ? void 0 : _c.college) || [],
        ...((_e = (_d = this.userStore.userInfo) == null ? void 0 : _d.data) == null ? void 0 : _e.club) || [],
        ...((_g = (_f = this.userStore.userInfo) == null ? void 0 : _f.data) == null ? void 0 : _g.other) || []
      ];
      const found = all.find((a) => a.id === id);
      if (found) {
        this.activity = found;
      }
      this.loaded = true;
    },
    openInBrowser(link) {
      common_vendor.index.showToast({
        title: "仅支持App中打开外链",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loaded
  }, !$data.loaded ? {
    b: common_vendor.f(4, (n, k0, i0) => {
      return {
        a: n
      };
    })
  } : common_vendor.e({
    c: $data.activity
  }, $data.activity ? common_vendor.e({
    d: common_vendor.t($data.activity.title),
    e: common_vendor.f($data.activity.description || [], (block, index, i0) => {
      return common_vendor.e({
        a: block
      }, block ? {
        b: common_vendor.t(block.content)
      } : {}, {
        c: index
      });
    }),
    f: $data.activity.link
  }, $data.activity.link ? {
    g: common_vendor.o(($event) => $options.openInBrowser($data.activity.link))
  } : {}) : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/index/indexDetail.js.map
