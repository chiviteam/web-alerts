//@ts-check
const {firefox} = require('playwright');
const fs = require('fs');
const TurndownService = require('turndown');

async function grab(turndownService, context, page, scrapeUrl, selector, folder) {
    
    await context.clearCookies();
    await page.goto(scrapeUrl);

    const elementHandle = await page.$(selector);
    await elementHandle.screenshot({ path: `${folder}/screenshot.png` });
    const innerHtml = await elementHandle.innerHTML();
    
    fs.writeFileSync(`${folder}/article.md`, turndownService.turndown(`<div><div>${innerHtml}</div><img src="screenshot.png"><p><a href="${scrapeUrl}">Source</a></p></div>`));
}

(async () => {

    console.log("Starting...")

    var turndownService = new TurndownService({emDelimiter: '*'}).remove('script');

    let browser = null;
    try {
        browser = await firefox.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        await grab(turndownService, context, page, 'https://bruvax.brussels.doctena.be/', 'article', 'bruvax');

    } catch (e) {
        console.error("Something failed", e);
        return process.exit(1);
    } finally {
        if (browser != null) {
            await browser.close();
        }
        console.log("Finished.");
    }
})();