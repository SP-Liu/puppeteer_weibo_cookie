const puppeteer = require('puppeteer');

class Weibo_cookies {
    constructor(cookies) {
        this.cookies = cookies;
        this.keep_running = false;
    }
    async gen_cookie(username, password){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080});
        await page.goto('https://weibo.com');
        console.log({username, password});
        const login_btn = await page.waitForSelector('a[node-type=loginBtn]');
        await page.type('input#loginname', username, {delay:300});
        await page.type('input[type=password][name=password]', password, {delay:300});
        // TODO 破解验证码（真香预警）
        await (await page.$('.login_btn a[action-type=btn_submit]')).click();
        await page.waitForSelector('.gn_nav .gn_nav_list a.gn_name');
        const web_cookies = await page.cookies();

        const mpage = await browser.newPage();
        await mpage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1');
        await mpage.setViewport({width: 414, height: 736, deviceScaleFactor: 3, isMobile: true, hasTouch: true});
        await mpage.goto('https://m.weibo.cn');
        await mpage.waitForSelector('a.nav-search');
        const wap_cookies = await mpage.cookies();
        this.cookies = {web_cookies,wap_cookies};
        await browser.close();
        return this.cookies;
    }

    async refresh_cookie(){
        let {web_cookies,wap_cookies} = this.cookies;
        let status = {web: false, wap:false};
        const browser = await puppeteer.launch();
        // PC、WAP逻辑设计为阻塞，本意是防止二者cookie相互干扰，以PC端cookie为主导
        // PC
        const web_page = await browser.newPage();
        await web_page.setViewport({
            width: 1920,
            height: 1080
        });
        await web_page.setCookie(...web_cookies);
        // WAP
        const wap_page = await browser.newPage();
        await wap_page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1');
        await wap_page.setViewport({width: 414, height: 736, deviceScaleFactor: 3, isMobile: true, hasTouch: true});
        await wap_page.setCookie(...wap_cookies);

        await web_page.goto('http://weibo.com');
        try{
            await web_page.waitForSelector('.gn_nav .gn_nav_list a.gn_name');
            web_cookies = await web_page.cookies();
            status.web = true;
        }catch(e){
            console.log(e);
        }
        await wap_page.goto('http://weibo.com');
        try{
            await wap_page.waitForSelector('a.nav-search');
            wap_cookies = await wap_page.cookies();
            status.wap = true;
        }catch(e){
            console.log(e);
        }
        this.cookies = {web_cookies, wap_cookies};
        await browser.close();
        return {web_cookies, wap_cookies, status};
    }

    async start_monitor(ondata = ()=>{}, sleep_time = 15000){
        if(this.keep_running){
            throw new Error('Weibo_cookies monitor has already launched.');
            return ;
        }
        this.keep_running = true;
        let {web_cookies,wap_cookies} = this.cookies;
        const browser = await puppeteer.launch();
        // PC
        const web_page = await browser.newPage();
        await web_page.setViewport({
            width: 1920,
            height: 1080
        });
        await web_page.setCookie(...web_cookies);
        // WAP
        const wap_page = await browser.newPage();
        await wap_page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1');
        await wap_page.setViewport({width: 414, height: 736, deviceScaleFactor: 3, isMobile: true, hasTouch: true});
        await wap_page.setCookie(...wap_cookies);
        while(this.keep_running){
            let status = {web: false, wap:false};
            await web_page.goto('http://weibo.com');
            try{
                await web_page.waitForSelector('.gn_nav .gn_nav_list a.gn_name');
                web_cookies = await web_page.cookies();
                status.web = true;
            }catch(e){
                console.log(e);
            }

            await wap_page.goto('http://weibo.com');
            try{
                await wap_page.waitForSelector('a.nav-search');
                wap_cookies = await wap_page.cookies();
                status.wap = true;
            }catch(e){
                console.log(e);
            }
            this.cookies = {web_cookies, wap_cookies};
            ondata({web_cookies, wap_cookies, status});
            await wap_page.waitFor(sleep_time);
        }
        await browser.close();
    }

    stop_monitor(){
        this.keep_running = false;
    }

    get_cookies(){
        return this.cookies;
    }
}

module.exports = Weibo_cookies;
