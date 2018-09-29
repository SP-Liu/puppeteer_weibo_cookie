const Weibo_cookies = require('./index');
(async ()=>{
    const w = new Weibo_cookies();
    // 只需要在项目最初始时调用gen_cookie即可
    // 将cookie存储下来后，通过new Weibo_cookies(cookies)进行cookie持续更新
    const tmp1 = await w.gen_cookie('weibo_username','weibo_password');
    console.log({tmp1: JSON.stringify(tmp1)});

    const tmp2 = await w.refresh_cookie();
    console.log({tmp2: JSON.stringify(tmp2.status)});

    let cnt = 0;
    w.start_monitor((tmp3)=>{
        cnt ++;
        console.log({tmp3: JSON.stringify(tmp3.status), cnt});
        if(cnt === 3){
            console.log('stop monitor');
            w.stop_monitor();
        }
    }, 5000);

    const tmp4 = w.get_cookies();
    console.log({tmp4: JSON.stringify(tmp4)});
})();
