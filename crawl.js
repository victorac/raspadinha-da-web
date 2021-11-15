import puppeteer from "puppeteer"
import extract_tables from "./extract_tables.js"

const delay = ms => new Promise(res => setTimeout(res, ms));

async function get_level_info(selector, page) {
    await page.waitForSelector(selector)
    let content_type = await page.$(selector);
    const level_name = await content_type.evaluate(node => node.textContent);
    const parent = await content_type.$x("..")
    const level_items = await parent[0].$$(".list-group-item")
    const n_items = level_items.length
    return [level_name, n_items];
}

async function get_item(index, selector, page) {
    await page.screenshot( {"path":`get_item_${index}.png`})
    await page.waitForSelector(selector)
    let content_type = await page.$(selector);
    const parent = await content_type.$x("..")
    const level_items = await parent[0].$$(".list-group-item")
    return level_items[index];
}

async function crawl(selector, page, level) {
    if (level > max_level) {
        console.log (`max level = ${level}; goBack`);
        return {};
    } 
    const data = {}
    await page.screenshot({"path": "crawl.png"})
    const tables = await extract_tables(page)
    data["tables"] = tables;
    const [level_name, n_items] = await get_level_info(selector, page)
    console.log(`level name: ${level_name}`);
    for (let index = 1; index < n_items; index++) {
        console.log(`index: ${index}; level name: ${level_name}; n_items: ${n_items}`)
        const item = await get_item(index, selector, page)
        const item_name = await item.evaluate(node => node.textContent);
        console.log(`item name: ${item_name}`);
        await item.click();
        await crawl(selector, page, level + 1);
        console.log(`back from crawl - current level ${level}; current index ${index}`);
        await page.goBack();
        await page.screenshot({"path": "goBack.png"})
        await delay(5000);
    }
    return data;
}

const max_level = 1;
const link = 'http://www.ssp.sp.gov.br/Estatistica/Pesquisa.aspx';
(async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    await page.goto(link);
    // entrypoint
    const tables = await extract_tables(page)
    const selector = "#conteudo_lbTipo"
    const [level_name, n_items] = await get_level_info(selector, page)
    let level = 0
    for (let index = 1; index < n_items; index++) {
        console.log(`index: ${index}; level name: ${level_name}; n_items: ${n_items}`)
        await page.screenshot({"path": "main_loop.png"})
        const item = await get_item(index, selector, page)
        const item_name = await item.evaluate(node => node.textContent);
        console.log(`item name: ${item_name}`);
        await item.click();
        await crawl(selector, page, level + 1);
        console.log(`back from crawl - current level ${level}; current index ${index}`);
        await page.goto(link);
    }
    // const item_name = await level_items[1].evaluate(node => node.textContent);
    // console.log(item_name);
    // await level_items[1].click();
    // const tables2 = await extract_tables(page)
    // console.log(tables2);
    await browser.close();
  })();