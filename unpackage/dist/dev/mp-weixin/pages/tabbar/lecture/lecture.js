"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_user = require("../../../store/user.js");
const _sfc_main = {
  data() {
    return {
      tabList: [
        { id: "tab01", name: "今日讲座" },
        { id: "tab02", name: "近期上新" }
      ],
      tabIndex: 0,
      descriptionMap: {}
      // 仅用于 index=0
    };
  },
  computed: {
    userStore() {
      return store_user.useUserStore();
    },
    todayLectures() {
      var _a;
      const list = ((_a = this.userStore.userInfo) == null ? void 0 : _a.due.lecture) || [];
      const todayList = list.filter((item) => item.due_time === this.todayStr);
      this.enrichDescriptions(todayList);
      return todayList;
    },
    todayStr() {
      const now = /* @__PURE__ */ new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
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
        return this.todayLectures || [];
      if (index === 1)
        return info.lecture || [];
      return [];
    },
    renderDescription(item, index) {
      if (index === 0) {
        const cached = this.descriptionMap[item.id];
        return cached ? cached.map((d) => d.content).join("\n") : "加载中...";
      } else {
        return this.getTextContent(item.description);
      }
    },
    getTextContent(descList) {
      if (!Array.isArray(descList))
        return "";
      return descList.filter((d) => d.type === "text").map((d) => d.content).join("\n");
    },
    enrichDescriptions(list) {
      list.forEach((item) => {
        const id = item.id;
        if (!id || this.descriptionMap[id])
          return;
        const cacheKey = `lecture_desc_${id}`;
        const cached = common_vendor.index.getStorageSync(cacheKey);
        if (cached) {
          this.$set(this.descriptionMap, id, [{ content: cached }]);
          return;
        }
        const backupUrlFetcher = "https://nik-nul.github.io/keep/url.txt";
        common_vendor.index.request({
          url: `http://52.184.65.42/api/query?id=${id}`,
          method: "GET",
          success: (res2) => {
            if (res2.statusCode === 200 && Array.isArray(res2.data) && res2.data.length > 0) {
              const desc = res2.data[0][5];
              this.$set(this.descriptionMap, id, [{ content: desc }]);
              common_vendor.index.setStorageSync(cacheKey, desc);
            }
          },
          fail: () => {
            common_vendor.index.__f__("warn", "at pages/tabbar/lecture/lecture.vue:137", `讲座 ${id} 请求失败,尝试备用地址`);
            common_vendor.index.request({
              url: backupUrlFetcher,
              method: "GET",
              success(backres) {
                const newBaseurl = backres.data.trim();
                if (!newBaseurl) {
                  common_vendor.index.__f__("error", "at pages/tabbar/lecture/lecture.vue:145", "备用地址为空");
                  return;
                }
                const newurl = `http://${newBaseurl}/api/query?id=${id}`;
                common_vendor.index.request({
                  url: newurl,
                  method: "GET",
                  success: (res2) => {
                    if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
                      const desc = res.data[0][5];
                      this.$set(this.descriptionMap, id, [{ content: desc }]);
                      common_vendor.index.setStorageSync(cacheKey, desc);
                    }
                  },
                  fail: () => {
                    common_vendor.index.__f__("error", "at pages/tabbar/lecture/lecture.vue:160", "备用服务器请求失败");
                  }
                });
              },
              fail: () => {
                common_vendor.index.__f__("error", "at pages/tabbar/lecture/lecture.vue:165", "备用地址请求失败");
              }
            });
          }
        });
      });
    },
    goToDetail(item) {
      if (!(item == null ? void 0 : item.id))
        return;
      common_vendor.index.navigateTo({
        url: `/pages/tabbar/lecture/lectureDetail?id=${item.id}`
      });
    }
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
            b: common_vendor.t($options.renderDescription(item, index)),
            c: i,
            d: common_vendor.o(($event) => $options.goToDetail(item), i),
            e: "48048590-1-" + i0 + "-" + i1 + "," + ("48048590-0-" + i0)
          };
        }),
        c: common_vendor.p({
          showArrow: true,
          clickable: true
        }),
        d: "48048590-0-" + i0
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
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/lecture/lecture.js.map
