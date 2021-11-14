const puppeteer = require('puppeteer');

const extract_tables = (page) => {
  const resultsSelector = "#conteudo_divMensal"
  await page.waitForSelector(resultsSelector);
  await page.screenshot({ path: 'selector_loaded.png' });
  const extracted_tables = await page.evaluate((resultsSelector) => {
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

const crawl = (page, item, level) => {
  const level_object = {}
  if (level <= max_level){
    // step into item
    await page.waitForSelector(item);
    await page.click(item);
    // get current level items
    let content_type = document.querySelector("#conteudo_lbTipo");
    const level_name = content_type.textContent; 
    const level_items = [...content_type.parentElement.querySelectorAll(".list-group-item")].slice(1);
    // craw over items
    level_items.forEach( item => {
      craw(page, item);
      var tables = extract_tables(page);
      level_object[item.textContent] = tables;
    })
  }
  page.goBack();
  return level_object;
}

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://www.ssp.sp.gov.br/Estatistica/Pesquisa.aspx');
  
  // start crawl
  // get current level items
  let content_type = document.querySelector("#conteudo_lbTipo");
  const level_name = content_type.textContent; 
  const level_items = [...content_type.parentElement.querySelectorAll(".list-group-item")].slice(1);
  let initial_value = {}
  level_object = level_items.reduce( (previous, current) => ({...previous, [current.textContent]: undefined}), initial_value)
  // craw over items
  level_items.forEach( item => {
    crawl(page, item);
    var tables = extract_tables(page);
    level_object[item.textContent] = tables;
  })


  


  var allResultsSelector = '#conteudo_repLateral_lkLateral_0';
  await page.waitForSelector(allResultsSelector);
  await page.click(allResultsSelector);

  console.log(extracted_tables["2021"]);
  await browser.close();
})();