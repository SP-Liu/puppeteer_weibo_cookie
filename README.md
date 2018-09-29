# 简介
使用puppeteer获取、更新微博cookie（包括PC版以及wap版）

# 环境
由于使用到了async/await语法，需要Node 8.0以上环境使用

# API
`new Weibo_cookies( null | cookies )`

初始化weibo_cookies
参数：{web_cookies, wap_cookies} 或 空，cookies为puppeteer规范的cookie对象
返回：weibo_cookies对象

`async gen_cookie(username, password)`

首次使用用户名密码生成Cookie
参数：用户名，密码
返回：cookies: {web_cookies, wap_cookies}

`async refresh_cookie()`
刷新cookie
返回：{status: {web, wap}, web_cookies, wap_cookies}
status表示当前刷新是否成功

`async start_monitor(ondata, sleep_time)`

开启cookies监控
参数：
ondata：刷新成功后返回的回调函数，传入data与`refresh_cookie`中的一致
sleep_time：第一次刷新成功后至第二次刷新开始的时间间隔（默认15s）

__注：start_monitor函数调用时请勿使用await调用，否则会使得业务函数逻辑阻塞__

`stop_monitor`

停止cookies监控

`get_cookies`

获取当前最新的cookies

# Spider Trick
其实wap版的微博内容无需登录亦可抓取，且数据返回格式比较统一
只是抓取热门评论、转发等内容时，需要使用PC版的请求接口*（这个接口也不需要校验登录）*
