<template>
  <view class="tabs">
    <!-- 顶部固定导航栏 -->
    <view class="tab-bar">
      <view
        class="uni-tab-item"
        v-for="(tab, index) in tabList"
        :key="tab.id"
        :data-current="index"
        @click="ontabtap"
        :class="{ 'uni-tab-item-active': tabIndex == index }"
      >
        <text class="uni-tab-item-title">{{ tab.name }}</text>
      </view>
    </view>

    <!-- 内容区 -->
    <swiper class="tab-box" :current="tabIndex" :duration="300" @change="onswiperchange">
      <swiper-item
        class="swiper-item"
        v-for="(tab, index) in tabList"
        :key="tab.id"
      >
        <scroll-view scroll-y class="scroll-list">
          <uni-list v-if="getListByIndex(index).length > 0">
            <uni-list-item
              v-for="(item, i) in getListByIndex(index)"
              :key="i"
              showArrow
              clickable
              @click="goToDetail(item)"
            >
              <template v-slot:body>
                <view class="list-item-box">
                  <text class="title">{{ item.title }}</text>
                  <text class="desc">{{ renderDescription(item, index) }}</text>
                </view>
              </template>
            </uni-list-item>
          </uni-list>
          <view v-else class="empty-tip">暂无内容</view>

          <!-- 底部占位，避免无法滚动 -->
          <view class="bottom-spacer"></view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { useUserStore } from '../../../store/user';

export default {
  data() {
    return {
      tabList: [
        { id: 'tab01', name: '今日讲座' },
        { id: 'tab02', name: '近期上新' }
      ],
      tabIndex: 0,
      descriptionMap: {} // 仅用于 index=0
    };
  },
  computed: {
    userStore() {
      return useUserStore();
    },
    todayLectures() {
      const list = this.userStore.userInfo?.due.lecture || [];
      const todayList = list.filter(item => item.due_time === this.todayStr);
      this.enrichDescriptions(todayList); // 异步加载 description
      return todayList;
    },
    todayStr() {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
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
      const info = this.userStore.userInfo?.data || {};
      if (index === 0) return this.todayLectures || [];
      if (index === 1) return info.lecture || [];
      return [];
    },
    renderDescription(item, index) {
      if (index === 0) {
        const cached = this.descriptionMap[item.id];
        return cached
          ? cached.map(d => d.content).join('\n')
          : '加载中...';
      } else {
        return this.getTextContent(item.description);
      }
    },
    getTextContent(descList) {
      if (!Array.isArray(descList)) return '';
      return descList
        .filter(d => d.type === 'text')
        .map(d => d.content)
        .join('\n');
    },
    enrichDescriptions(list) {
      list.forEach(item => {
        const id = item.id;
        if (!id || this.descriptionMap[id]) return;

        const cacheKey = `lecture_desc_${id}`;
        const cached = uni.getStorageSync(cacheKey);
        if (cached) {
          this.$set(this.descriptionMap, id, [{ content: cached }]);
          return;
        }
		const backupUrlFetcher = 'https://nik-nul.github.io/keep/url.txt';
        uni.request({
          url: `http://52.184.65.42/api/query?id=${id}`,
          method: 'GET',
          success: (res) => {
            if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
              const desc = res.data[0][5];
              this.$set(this.descriptionMap, id, [{ content: desc }]);
              uni.setStorageSync(cacheKey, desc);
            }
          },
          fail: () => {
            console.warn(`讲座 ${id} 请求失败,尝试备用地址`);
			
			uni.request({
				url:backupUrlFetcher,
				method:'GET',
				success(backres) {
					const newBaseurl = backres.data.trim();
					if(!newBaseurl){
						console.error('备用地址为空');
						return;
					}
					const newurl = `http://${newBaseurl}/api/query?id=${id}`;
					uni.request({
						url:newurl,
						method:'GET',
						success:(res2) => {
							if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0){
								const desc = res.data[0][5];
								this.$set(this.descriptionMap, id, [{ content: desc }]);
								uni.setStorageSync(cacheKey, desc);				
							}
						},
						fail: () => {
							console.error('备用服务器请求失败');
						}
					});
				},
				fail:() => {
					console.error('备用地址请求失败');
				}
			});
          }
        });
      });
    },
    goToDetail(item) {
      if (!item?.id) return;
      uni.navigateTo({
        url: `/pages/tabbar/lecture/lectureDetail?id=${item.id}`
      });
    }
  }
};
</script>

<style>
.tabs {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}
.tab-bar {
  height: 42px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #ddd;
  background-color: #f8f8f8;
}
.uni-tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.uni-tab-item-title {
  font-size: 15px;
  color: #555;
  line-height: 40px;
}
.uni-tab-item-active .uni-tab-item-title {
  color: #aa00ff;
  font-weight: bold;
  border-bottom: 2px solid #aa00ff;
}
.tab-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.swiper-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}
.scroll-list {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20rpx;
}
.list-item-box {
  display: flex;
  flex-direction: column;
}
.title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4rpx;
  color: #333;
}
.desc {
  font-size: 14px;
  color: #666;
  white-space: pre-wrap;
}
.empty-tip {
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-top: 40rpx;
}
.bottom-spacer {
  height: 80rpx; /* 占位以避免底部被遮挡 */
  flex-shrink: 0;
}
</style>
