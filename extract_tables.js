const puppeteer = require('puppeteer');

async function extract_tables(page) {
  const resultsSelector = "#conteudo_divMensal"
  await page.waitForSelector(resultsSelector);
  await page.screenshot({ path: 'selector_loaded.png' });
  const extracted_tables = await page.evaluate(() => {
    var anos = [...document.querySelectorAll(".Anos")].map(val => val.textContent)
    var tables = [...document.querySelectorAll("table")].map(table => {
      var rows = [...table.querySelectorAll("tr")]
      var headers = [...rows[0].querySelectorAll("th")].map(col => col.textContent)
      var data = rows.slice(1).map( row => {
        return [...row.querySelectorAll("td")].map(col => col.textContent)
      })
      var array_table = [headers]
      array_table.push(...data)
      return array_table;
    })
    table_object = {}
    for (let index = 0; index < anos.length; index++) {
      const element = anos[index];
      table_object[element] = tables[index]  
    }
    return table_object;
  });
  return extracted_tables
}

const max_level = 2


async function crawl(page, item, level){
  const level_object = {}
  if (level <= max_level){
    // step into item
    const item_name = await item.evaluate((node) => node.textContent)
    console.log(item_name);
    await page.click(item);
    // get current level items
    const selector = "#conteudo_lbTipo"
    await page.waitForSelector(selector);
    let content_type = document.querySelector(selector);
    const level_name = content_type.textContent; 
    const level_items = [...content_type.parentElement.querySelectorAll(".list-group-item")].slice(1);
    // crawl over items
    for (let index = 0; index < level_items.length; index++) {
      const level_item = level_items[index];
      crawl(page, level_item, level+1);
      var tables = await extract_tables(page);
      level_object[level_item.textContent] = tables;
    }
  }
  page.goBack();
  return level_object;
}


(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://www.ssp.sp.gov.br/Estatistica/Pesquisa.aspx');
  await page.waitForSelector("#conteudo_lbTipo")
  // start crawl
  // get current level items
  const statistics = {}
  const statistic_name = await page.$eval("#conteudo_lbInfo", (node) => node.textContent);

  let content_type = await page.$("#conteudo_lbTipo");
  const level_name = await content_type.evaluate((node) => node.textContent);
  console.log(level_name);
  const data_tree = {};
  var tables = await extract_tables(page);
  data_tree[level_name] = tables;

  const level = 0
  const parent = await content_type.$x("..")
  const level_items = await parent[0].$$(".list-group-item")
  for (let index = 13; index < level_items.length; index++) {
    const level_item = level_items[index];
    const item_name = await level_item.evaluate((node) => node.textContent);
    console.log(item_name);
    // craw over items
    // const subtree = crawl(page, level_item, level);
    // data_tree[item_name] = subtree
  }
  statistics[statistic_name] = {
    tree: data_tree
  }
  console.log(statistics)
  await browser.close();
})();