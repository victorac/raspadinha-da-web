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

export default extract_tables;