<template>
  <view class="activity-detail">
    <!-- 骨架屏（加载中） -->
    <view v-if="!loaded" class="skeleton">
      <view class="skeleton-title"></view>
      <view class="skeleton-line" v-for="n in 4" :key="n"></view>
      <view class="skeleton-link"></view>
    </view>

    <!-- 正式内容 -->
    <view v-else>
      <view v-if="activity">
        <text class="title" user-select>{{ activity.title }}</text>
        <view class="desc">
          <template v-for="(block, index) in (activity.description || [])" :key="index">
            <text v-if="block" user-select>
              {{ block.content }}
            </text>
          </template>
        </view>
        <view v-if="activity.link" class="link">
          <text @click="openInBrowser(activity.link)">查看原文链接</text>
        </view>
      </view>

      <view v-else class="error">
        <text>活动不存在</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '../../../store/user'

export default {
  data() {
    return {
      activity: null,
      loaded: false
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  watch: {
    'userStore.userInfo': {
      handler() {
        this.tryFindActivity()
      },
      immediate: true,
      deep: true
    }
  },
  onLoad(options) {
    this.options = options
    this.tryFindActivity()
  },
  methods: {
    tryFindActivity() {
      const id = Number(this.options?.id)
      const all =
        [
          ...(this.userStore.userInfo?.data?.college || []),
          ...(this.userStore.userInfo?.data?.club || []),
          ...(this.userStore.userInfo?.data?.other || [])
        ]
      const found = all.find(a => a.id === id)
      if (found) {
        this.activity = found
      }
      this.loaded = true
    },
    openInBrowser(link) {
      // #ifdef APP-PLUS
      if (link) {
        plus.runtime.openURL(link, function(res) {
          console.log('打开外链失败', res);
        });
      }
      // #endif

      // #ifndef APP-PLUS
      uni.showToast({
        title: '仅支持App中打开外链',
        icon: 'none'
      });
      // #endif
    }
  }
}
</script>

<style>
.activity-detail {
  padding: 20rpx;
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16rpx;
}
.desc {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}
.link {
  margin-top: 20rpx;
  color: #00007f;
}
.error {
  color: red;
  font-size: 16px;
  text-align: center;
  margin-top: 100rpx;
}

/* 骨架屏样式 */
.skeleton {
  padding: 20rpx;
}
.skeleton-title {
  width: 70%;
  height: 28rpx;
  background-color: #eee;
  border-radius: 6rpx;
  margin-bottom: 24rpx;
}
.skeleton-line {
  width: 100%;
  height: 18rpx;
  background-color: #eee;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
}
.skeleton-link {
  width: 40%;
  height: 24rpx;
  background-color: #ddd;
  border-radius: 6rpx;
  margin-top: 20rpx;
}

</style>
