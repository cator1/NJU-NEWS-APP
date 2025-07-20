"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_user = require("../../../store/user.js");
const uni_modules_uniUpgradeCenterApp_utils_checkUpdate = require("../../../uni_modules/uni-upgrade-center-app/utils/check-update.js");
const _sfc_main = {
  data() {
    return {
      tabList: [
        { id: "tab01", name: "校级活动" },
        { id: "tab02", name: "院级活动" },
        { id: "tab03", name: "社团活动" }
      ],
      tabIndex: 0
    };
  },
  methods: {
    ontabtap(e) {
      const index = Number(e.currentTarget.dataset.current);
      this.tabIndex = index;
    },
    onswiperchange(e) {
      this.tabIndex = e.detail.current;
    },
    getListByIndex(index) {
      var _a;
      const info = ((_a = this.userStore.userInfo) == null ? void 0 : _a.data) || {};
      if (index === 0)
        return info.other || [];
      if (index === 1)
        return info.college || [];
      if (index === 2)
        return info.club || [];
      return [];
    },
    getTextContent(descList) {
      if (!Array.isArray(descList))
        return "";
      return descList.map((d) => d.content).join("\n");
    },
    goToDetail(item) {
      if (!(item == null ? void 0 : item.id))
        return;
      common_vendor.index.navigateTo({
        url: `/pages/tabbar/index/indexDetail?id=${item.id}`
      });
    }
  },
  computed: {
    userStore() {
      return store_user.useUserStore();
    }
  },
  onReady() {
    uni_modules_uniUpgradeCenterApp_utils_checkUpdate.checkUpdate();
  }
};
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_list_item = () => "../../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.tabList, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: tab.id,
        c: index,
        d: common_vendor.o((...args) => $options.ontabtap && $options.ontabtap(...args), tab.id),
        e: $data.tabIndex == index ? 1 : ""
      };
    }),
    b: common_vendor.f($data.tabList, (tab, index, i0) => {
      return common_vendor.e({
        a: $options.getListByIndex(index).length > 0
      }, $options.getListByIndex(index).length > 0 ? {
        b: common_vendor.f($options.getListByIndex(index), (item, i, i1) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t($options.getTextContent(item.description)),
            c: i,
            d: common_vendor.o(($event) => $options.goToDetail(item), i),
            e: "0b1ddbc0-1-" + i0 + "-" + i1 + "," + ("0b1ddbc0-0-" + i0)
          };
        }),
        c: common_vendor.p({
          showArrow: true,
          clickable: true
        }),
        d: "0b1ddbc0-0-" + i0
      } : {}, {
        e: tab.id
      });
    }),
    c: $data.tabIndex,
    d: common_vendor.o((...args) => $options.onswiperchange && $options.onswiperchange(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/index/index.js.map
