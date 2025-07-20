"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_user = require("../../../store/user.js");
let debounceTimer = null;
const _sfc_main = {
  data() {
    return {
      today: this.getToday(),
      date: this.getToday(),
      searchQuery: "",
      searchResults: [],
      page: 1,
      loadingSearch: false,
      noMoreSearchResults: false,
      qqgroup: "loading...",
      showContact: false,
      //控制弹窗显示
      backupUrlFetcher: "https://nik-nul.github.io/keep/url.txt"
    };
  },
  mounted() {
    this.fetchQQgroup();
  },
  methods: {
    onDateChange(val) {
      this.date = val;
      const prev = this.getYesterday(val);
      this.fetchAndUpdateUserStore(prev);
    },
    fetchAndUpdateUserStore(date) {
      const userStore = store_user.useUserStore();
      const url = `http://52.184.65.42/typst/${date}`;
      common_vendor.index.request({
        url,
        method: "GET",
        success: (res) => {
          userStore.setUserInfo(res.data);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/tabbar/other/other.vue:113", "请求失败", err);
        }
      });
    },
    getToday() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    getYesterday(dateStr) {
      const date = new Date(dateStr);
      date.setDate(date.getDate() - 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    // 搜索功能
    onSearchInput() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.page = 1;
        this.searchResults = [];
        this.noMoreSearchResults = false;
        this.searchLecture(this.searchQuery);
      }, 400);
    },
    searchLecture(keyword) {
      if (!keyword) {
        this.searchResults = [];
        return;
      }
      this.loadingSearch = true;
      common_vendor.index.request({
        url: `http://52.184.65.42/api/search?q=${encodeURIComponent(keyword)}&page=${this.page}`,
        method: "GET",
        success: async (res) => {
          const ids = (res.data || []).map((arr) => arr[0]);
          if (ids.length === 0) {
            this.noMoreSearchResults = true;
          }
          const results = [];
          for (const id of ids) {
            const title = await this.fetchTitleById(id);
            results.push({ id, title });
          }
          this.searchResults = [...this.searchResults, ...results];
        },
        fail: () => {
          common_vendor.index.showToast({ title: "搜索失败", icon: "none" });
        },
        //      // 请求备用地址
        //      uni.request({
        //        url:backupUrlFetcher,
        //        method: 'GET',
        //        success: (backres) => {
        //          const newBackurl = backres.data.trim();
        // if(!newBackurl){
        //  uni.__f__('error','at pages/tabbar/other/other.vue:197','备用地址为空');
        //  return;
        // }
        //          const newurl = `http://${backupBase}/api/search?q=${encodeURIComponent(keyword)}&page=${this.page}`;
        //          // 发起备用请求
        //          uni.request({
        //            url: newurl,
        //            method: 'GET',
        //            success: async (res2) => {
        //              const ids = (res2.data || []).map(arr => arr[0]);
        //              if (ids.length === 0) {
        //                this.noMoreSearchResults = true;
        //              }
        //              const results = [];
        //              for (const id of ids) {
        //                const title = await this.fetchTitleById(id);
        //                results.push({ id, title });
        //              }
        //              this.searchResults = [...this.searchResults, ...results];
        //            },
        //            fail: () => {
        //              uni.showToast({ title: '备用地址请求失败', icon: 'none' });
        //            },
        //            complete: () => {
        //              this.loadingSearch = false;
        //            }
        //          });
        //        },
        //        fail: () => {
        //          uni.showToast({ title: '获取备用地址失败', icon: 'none' });
        //          this.loadingSearch = false;
        //        }
        //      });
        // },
        complete: () => {
          this.loadingSearch = false;
        }
      });
    },
    fetchTitleById(id) {
      const cacheKey = `search_title_${id}`;
      let title = common_vendor.index.getStorageSync(cacheKey);
      if (title)
        return Promise.resolve(title);
      return new Promise((resolve) => {
        common_vendor.index.request({
          url: `http://52.184.65.42/api/query?id=${id}`,
          method: "GET",
          success: (res) => {
            if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
              title = res.data[0][3];
              common_vendor.index.setStorageSync(cacheKey, title);
              resolve(title);
            } else {
              resolve("");
            }
          },
          fail: () => {
          }
        });
      });
    },
    loadMoreResults() {
      if (this.loadingSearch || this.noMoreSearchResults) {
        return;
      }
      this.page += 1;
      this.searchLecture(this.searchQuery);
    },
    goToDetail(item) {
      this.searchResults = [];
      this.searchQuery = "";
      common_vendor.index.navigateTo({
        url: `/pages/tabbar/lecture/lectureDetail?id=${item.id}`
      });
    },
    hideSearchOverlay() {
      this.searchResults = [];
    },
    fetchQQgroup() {
      common_vendor.index.request({
        url: `https://nik-nul.github.io/keep/qqg.txt`,
        method: "GET",
        success: (res) => {
          this.qqgroup = res.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/tabbar/other/other.vue:321", "请求失败", err);
          this.qqgroup = "获取失败";
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  _easycom_uni_datetime_picker2();
}
const _easycom_uni_datetime_picker = () => "../../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
if (!Math) {
  _easycom_uni_datetime_picker();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $data.showContact = true),
    b: $data.showContact
  }, $data.showContact ? {
    c: common_vendor.t($data.qqgroup),
    d: common_vendor.o(($event) => $data.showContact = false),
    e: common_vendor.o(() => {
    })
  } : {}, {
    f: common_vendor.o($options.onDateChange),
    g: common_vendor.o(($event) => $data.date = $event),
    h: common_vendor.p({
      type: "date",
      start: "2024-05-23",
      end: $data.today,
      ["clear-icon"]: false,
      modelValue: $data.date
    }),
    i: common_vendor.o([($event) => $data.searchQuery = $event.detail.value, (...args) => $options.onSearchInput && $options.onSearchInput(...args)]),
    j: common_vendor.o(() => {
    }),
    k: common_vendor.o(() => {
    }),
    l: $data.searchQuery,
    m: $data.searchResults.length || $data.loadingSearch || $data.noMoreSearchResults
  }, $data.searchResults.length || $data.loadingSearch || $data.noMoreSearchResults ? common_vendor.e({
    n: common_vendor.f($data.searchResults, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.title || `ID: ${item.id}`),
        b: item.id,
        c: common_vendor.o(($event) => $options.goToDetail(item), item.id)
      };
    }),
    o: $data.loadingSearch
  }, $data.loadingSearch ? {} : {}, {
    p: !$data.loadingSearch && $data.noMoreSearchResults && $data.searchResults.length === 0
  }, !$data.loadingSearch && $data.noMoreSearchResults && $data.searchResults.length === 0 ? {} : {}, {
    q: common_vendor.o((...args) => $options.loadMoreResults && $options.loadMoreResults(...args))
  }) : {}, {
    r: common_vendor.o((...args) => $options.hideSearchOverlay && $options.hideSearchOverlay(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/other/other.js.map
