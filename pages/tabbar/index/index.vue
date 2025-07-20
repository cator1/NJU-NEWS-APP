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
	
    <!-- swiper 内容区 -->
    <swiper
      class="tab-box"
      :current="tabIndex"
      :duration="300"
      @change="onswiperchange"
    >
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
	              <text class="desc">{{ getTextContent(item.description) }}</text>
	            </view>
	          </template>
	        </uni-list-item>
	      </uni-list>
	      <view v-else class="empty-tip">暂无内容</view>
	    </scroll-view>
	  </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { useUserStore } from '../../../store/user'
import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update'


	
export default {
  data() {
    return {
      tabList: [
        { id: 'tab01', name: '校级活动' },
        { id: 'tab02', name: '院级活动' },
		{ id: 'tab03', name: '社团活动' },
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
	  const info = this.userStore.userInfo?.data || {}
	  if (index === 0) return info.other || []
	  if (index === 1) return info.college || []
	  if (index === 2) return info.club || []
	  return []
	},
	getTextContent(descList) {
	  if (!Array.isArray(descList)) return ''
	  return descList
	    // .filter(d => d.type === 'text')
	    .map(d => d.content)
	    .join('\n') // 用换行符拼接（也可用空格或其它符号）
	},
	goToDetail(item) {
	  if (!item?.id) return
	  uni.navigateTo({
	    url: `/pages/tabbar/index/indexDetail?id=${item.id}`
	  })
	}

  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  onReady() {
  	checkUpdate()
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

/* 顶部导航栏（非滚动） */
.tab-bar {
  height: 42px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #ddd;
  background-color: #f8f8f8;
}

.uni-tab-item {
  flex: 1; /* 平均分布宽度 */
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

/* 内容区域 */
.tab-box {
  flex: 1;
  height: 100%;
  overflow: hidden; /* 可选，加上更安全 */
}

.swiper-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
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
  white-space: pre-wrap; /* 支持换行 */
}

.scroll-list {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
}

.empty-tip {
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-top: 40rpx;
}

.scroll-list {
  height: 100%;
  padding: 16rpx;
  box-sizing: border-box;
}

.swiper-item {
  height: 100%;
}
</style>
