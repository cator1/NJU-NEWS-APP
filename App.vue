<script>
	import { useUserStore } from './store/user';
	
	export default {
		onLaunch: function() {
			console.log('App Launch');
			
			const userStore = useUserStore();
			
			// 获取当前日期，格式为 yyyy-mm-dd
			const today = new Date();
			const year = today.getFullYear();
			const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份从0开始
			const day = String(today.getDate() - 1).padStart(2, '0');
			const dateStr = `${year}-${month}-${day}`;
			//console.log(dateStr); // 打印日期字符串
			
			const backupUrlFetcher = 'https://nik-nul.github.io/keep/url.txt'; // 备用地址获取接口

			const url = `http://52.184.65.42/typst/${dateStr}`;
			const testurl = `http://52.184.65.42/typst/2025-06-25`
			// console.log(date);
			uni.request({
				url:url,
				method:'GET',
				success(res){
					userStore.setUserInfo(res.data)
				},
				fail(err) {
					console.error('请求失败,尝试备用地址');
					uni.request({
						url:backupUrlFetcher,
						method:'GET',
						success(backres) {
							const newBaseurl = backres.data.trim();
							if(!newBaseurl){
								console.error('备用地址为空');
								return;
							}
							
							const newurl = `http://${newBaseurl}/typst/${dateStr}`;
							uni.request({
								url:newurl,
								method:'GET',
								success(res2) {
									userStore.setUserInfo(res2.data)
								},
								fail(err2) {
									console.error('备用服务器请求失败:', err2);
								}
							})
						},
						fail(err3) {
							console.error('备用地址请求失败');
						}
					});
				}
			});
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		created() {
			const userStore = useUserStore()
			console.log(userStore.userInfo)
		}
	}
</script>

<style>
	/*每个页面公共css */
	body{
		background-color: #f8f8f8;
	}
</style>
