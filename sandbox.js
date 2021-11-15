const max_level = 1
const link = 'http://www.ssp.sp.gov.br/Estatistica/Pesquisa.aspx'

const data_tree = {};
const page = await browser.newPage();
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
await page.goto(link);
const selector = "#conteudo_lbTipo"
await page.waitForSelector(selector)
let content_type = await page.$(selector);
const level_name = await content_type.evaluate((node) => node.textContent);
console.log(level_name);
// extract level tables
var tables = await extract_tables(page);
data_tree[level_name] = tables;


async function crawl(page, item_name, level){
  const data_tree = {};
  if (level <= max_level){
    // step into item
    console.log(item_name);
    // get current level items
    const selector = "#conteudo_lbTipo"
    await page.waitForSelector(selector)
    let content_type = await page.$(selector);
    const level_name = await content_type.evaluate((node) => node.textContent);
    console.log(level_name);
    // extract level tables
    var tables = await extract_tables(page);
    data_tree[level_name] = tables;
    
    // get level items
    const parent = await content_type.$x("..")
    const level_items = await parent[0].$$(".list-group-item")
    for (let index = 1; index < level_items.length; index++) {
      const level_item = level_items[index];
      const item_name = await level_item.evaluate((node) => node.textContent);
      console.log(item_name);
      // craw over items
      // await page.click(item);
      // const subtree = crawl(page, level_item, level + 1);
      // await page.goBack();
      // data_tree[item_name] = subtree
    }
  }
  return data_tree;
}



(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  await page.goto(link);
  const selector = "#conteudo_lbTipo"
  await page.waitForSelector(selector)
  // start crawl
  // get current level items
  const statistics = {}
  const statistic_name = await page.$eval("#conteudo_lbInfo", (node) => node.textContent);

  let content_type = await page.$(selector);
  const level_name = await content_type.evaluate((node) => node.textContent);
  console.log(level_name);
  const data_tree = {};
  var tables = await extract_tables(page);
  data_tree[level_name] = tables;

  const level = 0
  const parent = await content_type.$x("..")
  const level_items = await parent[0].$$(".list-group-item")
  console.log(level_items.length)
  for (let index = 1; index < level_items.length-2; index++) {
    let content_type = await page.$(selector);
    const parent = await content_type.$x("..")
    const level_items = await parent[0].$$(".list-group-item")
    const level_item = level_items[index];
    const item_name = await level_item.evaluate((node) => node.textContent);
    // craw over items
    level_item.click();
    const subtree = await crawl(page, item_name, level+1);
    await page.goBack();
    // data_tree[item_name] = subtree
  }
  statistics[statistic_name] = {
    tree: data_tree
  }
  console.log(statistics)
  await browser.close();
})();