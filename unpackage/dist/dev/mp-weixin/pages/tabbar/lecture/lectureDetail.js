"use strict";
const common_vendor = require("../../../common/vendor.js");
require("../../../store/user.js");
const _sfc_main = {
  data() {
    return {
      lecture: null,
      loaded: false,
      id: null
    };
  },
  // computed: {
  //   userStore() {
  //     return useUserStore()
  //   }
  // },
  methods: {
    fetchLectureById(id) {
      if (!id)
        return;
      const url = `http://52.184.65.42/api/query?id=${id}`;
      common_vendor.index.showLoading({ title: "加载中..." });
      common_vendor.index.request({
        url,
        method: "GET",
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            const row = res.data[0];
            this.lecture = {
              title: row[3],
              link: row[4],
              description: row[5]
            };
          } else {
            common_vendor.index.showToast({ title: "讲座未找到", icon: "none" });
          }
        },
        fail: () => {
          common_vendor.index.showToast({ title: "请求失败，启用备用地址", icon: "none" });
          common_vendor.index.request({
            url: "https://nik-nul.github.io/keep/url.txt",
            method: "GET",
            success: (backres) => {
              const newBaseurl = backres.data.trim();
              if (!newBaseurl) {
                common_vendor.index.__f__("error", "at pages/tabbar/lecture/lectureDetail.vue:78", "备用地址为空");
                return;
              }
              const newurl = `http://${newBaseurl}/api/query?id=${id}`;
              common_vendor.index.request({
                url: newurl,
                method: "GET",
                success: (res2) => {
                  if (res2.statusCode === 200 && Array.isArray(res2.data) && res2.data.length > 0) {
                    const row = res2.data[0];
                    this.lecture = {
                      title: row[3],
                      link: row[4],
                      description: row[5]
                    };
                  } else {
                    common_vendor.index.showToast({ title: "备用地址查询失败", icon: "none" });
                  }
                },
                fail: () => {
                  common_vendor.index.showToast({ title: "备用地址请求失败", icon: "none" });
                },
                complete: () => {
                  common_vendor.index.hideLoading();
                  this.loaded = true;
                }
              });
            },
            fail: () => {
              common_vendor.index.showToast({ title: "无法获取备用地址", icon: "none" });
              common_vendor.index.hideLoading();
              this.loaded = true;
            }
          });
        },
        complete: () => {
          if (!this.loaded) {
            common_vendor.index.hideLoading();
            this.loaded = true;
          }
        }
      });
    },
    openInBrowser(link) {
      common_vendor.index.showToast({
        title: "仅支持App中打开外链",
        icon: "none"
      });
    }
  },
  onLoad(options) {
    if (options == null ? void 0 : options.id) {
      this.id = options.id;
      this.fetchLectureById(this.id);
    } else {
      common_vendor.index.showToast({ title: "参数缺失", icon: "none" });
      this.loaded = true;
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
    c: $data.lecture
  }, $data.lecture ? common_vendor.e({
    d: common_vendor.t($data.lecture.title),
    e: common_vendor.t($data.lecture.description),
    f: $data.lecture.link
  }, $data.lecture.link ? {
    g: common_vendor.o(($event) => $options.openInBrowser($data.lecture.link))
  } : {}) : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/lecture/lectureDetail.js.map
