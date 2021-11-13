const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('http://www.ssp.sp.gov.br/Estatistica/Pesquisa.aspx');
  await page.screenshot({ path: 'example2.png' });
  var allResultsSelector = '#conteudo_repLateral_lkLateral_0';
  await page.waitForSelector(allResultsSelector);
  await page.click(allResultsSelector);
  var resultsSelector = "#conteudo_divMensal"
  await page.waitForSelector(resultsSelector);
  await page.screenshot({ path: 'example3.png' });
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  let extracted_tables = await page.evaluate((resultsSelector) => {
    // return Array.from(document.querySelectorAll(resultsSelector))
    var conteudo = [...document.querySelectorAll(resultsSelector)];
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
  console.log(extracted_tables["2021"]);
  await browser.close();
})();