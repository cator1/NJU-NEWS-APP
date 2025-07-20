<template>
  <view class="lecture-detail">
    <!-- 骨架屏占位（加载中） -->
    <view v-if="!loaded" class="skeleton">
      <view class="skeleton-title"></view>
      <view class="skeleton-line" v-for="n in 4" :key="n"></view>
      <view class="skeleton-link"></view>
    </view>

    <!-- 正式内容 -->
    <view v-else>
      <view v-if="lecture">
        <text class="title" user-select>{{ lecture.title }}</text>
        <view class="desc">
          <text user-select>{{ lecture.description }}</text>
        </view>
        <view v-if="lecture.link" class="link">
          <text @click="openInBrowser(lecture.link)">查看原文链接</text>
        </view>
      </view>

      <!-- 加载完成但未找到讲座 -->
      <view v-else class="error">
        <text>讲座不存在</text>
      </view>
    </view>
  </view>
</template>


<script>
import { useUserStore } from '../../../store/user'

export default {
  data() {
    return {
      lecture: null,
	  loaded: false,
	  id:null
    };
  },
  // computed: {
  //   userStore() {
  //     return useUserStore()
  //   }
  // },
  methods:{
    fetchLectureById(id) {
      if (!id) return;
      const url = `http://52.184.65.42/api/query?id=${id}`;
      uni.showLoading({ title: '加载中...' });

      uni.request({
        url,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            const row = res.data[0];
            this.lecture = {
              title: row[3],
              link: row[4],
              description: row[5]
            };
          } else {
            uni.showToast({ title: '讲座未找到', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '请求失败，启用备用地址', icon: 'none' });
      
          // 获取备用地址
          uni.request({
            url: 'https://nik-nul.github.io/keep/url.txt',
            method: 'GET',
            success: (backres) => {
              const newBaseurl = backres.data.trim();
			  if(!newBaseurl){
				  console.error('备用地址为空');
				  return;
			  }
			  
              const newurl = `http://${newBaseurl}/api/query?id=${id}`;
              uni.request({
                url: newurl,
                method: 'GET',
                success: (res2) => {
                  if (res2.statusCode === 200 && Array.isArray(res2.data) && res2.data.length > 0) {
                    const row = res2.data[0];
                    this.lecture = {
                      title: row[3],
                      link: row[4],
                      description: row[5]
                    };
                  } else {
                    uni.showToast({ title: '备用地址查询失败', icon: 'none' });
                  }
                },
                fail: () => {
                  uni.showToast({ title: '备用地址请求失败', icon: 'none' });
                },
                complete: () => {
                  uni.hideLoading();
                  this.loaded = true;
                }
              });
            },
            fail: () => {
              uni.showToast({ title: '无法获取备用地址', icon: 'none' });
              uni.hideLoading();
              this.loaded = true;
            }
          });
        },
        complete: () => {
          if (!this.loaded) {
            uni.hideLoading();
            this.loaded = true;
          }
        }
      });

    },
    openInBrowser(link) {
      // #ifdef APP-PLUS
      if (link) {
        plus.runtime.openURL(link, function (res) {
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
  },
  onLoad(options) {
    if (options?.id) {
      this.id = options.id;
      this.fetchLectureById(this.id);
    } else {
      uni.showToast({ title: '参数缺失', icon: 'none' });
      this.loaded = true;
    }
  }
}
</script>

<style>
.lecture-detail {
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

/* 骨架屏结构样式 */
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
