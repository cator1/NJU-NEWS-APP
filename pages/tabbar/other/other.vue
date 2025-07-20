<template>
  <!-- 联系我们按钮 -->
  <view class="contact-trigger" @click.stop="showContact = true">
    <text>联系我们</text>
  </view>
  <view v-if="showContact" class="contact-popup" @click.stop>
    <view class="popup-content">
      <text user-select>📮联系我们：3504605396@qq.com</text>
      <text user-select>👥小报订阅QQ群：{{ qqgroup }}</text>
      <view class="popup-close" @click="showContact = false">关闭</view>
    </view>
  </view>

  
  <view class="container" @click="hideSearchOverlay">
    <!-- 日期选择 -->
    <view class="date-picker-box">
      <view class="date-label">日期选择：</view>
      <uni-datetime-picker
        v-model="date"
        type="date"
        start="2024-05-23"
        :end="today"
        @change="onDateChange"
        :clear-icon="false"
      />
    </view>

    <!-- 搜索输入框 -->
    <view class="search-box">
	  <view class="date-label">搜索：</view>
      <input
        v-model="searchQuery"
        placeholder="搜索讲座或活动"
        class="search-input"
        @input="onSearchInput"
        @focus.stop
        @click.stop
      />
    </view>

    <!-- 搜索结果浮层 -->
    <scroll-view
      v-if="searchResults.length || loadingSearch || noMoreSearchResults"
      class="search-results"
      scroll-y
      :style="{ maxHeight: '450rpx' }"
      @scrolltolower="loadMoreResults"
    >
      <view
        v-for="item in searchResults"
        :key="item.id"
        class="search-result-item"
        @click.stop="goToDetail(item)"
      >
        {{ item.title || `ID: ${item.id}` }}
      </view>
      <view v-if="loadingSearch" class="search-loading">加载中...</view>
      <view v-if="!loadingSearch && noMoreSearchResults && searchResults.length === 0" class="search-empty">无结果</view>
    </scroll-view>
	
	<!-- 联系我们 -->
<!-- 	<view class="second-bottom-bar">
	  <text user-select>小报订阅QQ群：</text>
	  <text>{{qqgroup}}</text>
	</view>
	<view class="bottom-bar">
	  <text user-select>联系我们：3504605396@qq.com</text>
	</view> -->

  </view>
</template>

<script>
import { useUserStore } from '@/store/user';
let debounceTimer = null;

export default {
  data() {
    return {
      today: this.getToday(),
      date: this.getToday(),
      searchQuery: '',
      searchResults: [],
      page: 1,
      loadingSearch: false,
      noMoreSearchResults: false,
	  qqgroup: 'loading...',
	  showContact: false, //控制弹窗显示
	  backupUrlFetcher:'https://nik-nul.github.io/keep/url.txt',
	  
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
      const userStore = useUserStore();
      const url = `http://52.184.65.42/typst/${date}`;
      uni.request({
        url,
        method: 'GET',
        success: (res) => {
          userStore.setUserInfo(res.data);
        },
        fail: (err) => {
          console.error('请求失败', err);
		  
		 //  uni.request({
		 //  	url:backupUrlFetcher,
			// method:'GET',
			// success(backres) {
			// 	const newBaseurl = backres.data.trim();
			// 	if(!newBaseurl){
			// 		console.error('备用地址为空');
			// 		return;
			// 	}
				
			// 	const newurl = `http://${newBaseurl}/typst/${date}`;
			// 	uni.request({
			// 		url:newurl,
			// 		method:'GET',
			// 		success(res2) {
			// 			userStore.setUserInfo(res2.data);
			// 		},
			// 		fail() {
			// 			console.error('备用服务器请求失败');
			// 		}
			// 	});
			// },
			// fail() {
			// 	console.error('备用地址请求失败');
			// }
		  // });
        }
      });
    },
    getToday() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    getYesterday(dateStr) {
      const date = new Date(dateStr);
      date.setDate(date.getDate() - 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
      uni.request({
        url: `http://52.184.65.42/api/search?q=${encodeURIComponent(keyword)}&page=${this.page}`,
        method: 'GET',
        success: async (res) => {
          const ids = (res.data || []).map(arr => arr[0]);
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
          uni.showToast({ title: '搜索失败', icon: 'none' });
        },
     //      // 请求备用地址
     //      uni.request({
     //        url:backupUrlFetcher,
     //        method: 'GET',
     //        success: (backres) => {
     //          const newBackurl = backres.data.trim();
			  // if(!newBackurl){
				 //  console.error('备用地址为空');
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
      let title = uni.getStorageSync(cacheKey);
      if (title) return Promise.resolve(title);

      return new Promise(resolve => {
        uni.request({
          url: `http://52.184.65.42/api/query?id=${id}`,
          method: 'GET',
          success: (res) => {
            if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
              title = res.data[0][3];
              uni.setStorageSync(cacheKey, title);
              resolve(title);
            } else {
              resolve('');
            }
          },
          fail: () => {
			 //  uni.request({
			 //  	url:backupUrlFetcher,
				// method:'GET',
				// success(backres) {
				// 	const newBaseurl = backres.data.trim();
				// 	if(!newBaseurl){
				// 		console.error('备用地址为空');
				// 		return;
				// 	}
				// 	const newurl = `http://${newBaseurl}/api/query?id=${id}`;
				// 	uni.request({
				// 		url:newurl,
				// 		method:'GET',
				// 		success(res2) {
				// 			if (res2.statusCode === 200 && Array.isArray(res2.data) && res2.data.length > 0) {
				// 			  title = res2.data[0][3];
				// 			  uni.setStorageSync(cacheKey, title);
				// 			  resolve(title);
				// 			} else {
				// 			  resolve('');
				// 			}
				// 		},
				// 		fail() {
				// 			console.error('备用服务器请求失败');
				// 		}
				// 	});
				// },
				// fail() {
				// 	console.error('备用地址请求失败');
				// }
			  // });
		  }
        });
      });
    },
    loadMoreResults() {
	  // console.log("触底触发，准备加载 page:", this.page + 1);
      if (this.loadingSearch || this.noMoreSearchResults){
		// console.log('不再加载');
		return;  
	  }
      this.page += 1;
	  // console.log("加载第", this.page, "页"); // 检查是否执行
      this.searchLecture(this.searchQuery);
    },
    goToDetail(item) {
      this.searchResults = [];
      this.searchQuery = '';
      uni.navigateTo({
        url: `/pages/tabbar/lecture/lectureDetail?id=${item.id}`
      });
    },
    hideSearchOverlay() {
      this.searchResults = [];
    },
	fetchQQgroup(){
	  uni.request({
	  	url:`https://nik-nul.github.io/keep/qqg.txt`,
		method:'GET',
		success:(res) => {
			this.qqgroup = res.data;
		},
		fail:(err) => {
			console.error('请求失败', err);
			this.qqgroup = '获取失败';
		}
	  })
	}
  }
};
</script>
<style>
.container {
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  height: 100vh;
  box-sizing: border-box;
}
.date-picker-box {
  width: 100%;
  padding: 10px 0;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
}
.date-label {
  font-size: 14px;
  font-weight: normal;
  margin: 0 0px 10px 10px;
}
.search-box {
  margin-top: 10px;
}
.search-input {
  left: 2.5%;
  width: 93%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

.search-results {
  position: static;
  top: 200px;
  left: 2.5%;
  right: 2.5%;
  width: 100%;
  height: calc(100vh - 200px);
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow-y: scroll;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 999;
  padding-bottom: 40px;
}
.search-result-item {
  padding: 16px 20px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
}
.search-result-item:last-child {
  border-bottom: none;
}
.search-loading, .search-empty {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 10px 0;
}
.contact-trigger {
  font-size: 14px;
  padding: 10px;
  text-align: left;
}

.contact-popup {
  position: fixed;
  top: 30%;
  left: 10%;
  right: 10%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 20px;
  z-index: 1000;
}

.popup-content text {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.popup-close {
  margin-top: 10px;
  text-align: right;
  color: #999;
  font-size: 12px;
}


</style>
