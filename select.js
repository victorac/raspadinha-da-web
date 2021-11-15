import puppeteer from "puppeteer"
import extract_tables from "./extract_tables.js"
import fs from "fs"

const delay = ms => new Promise(res => setTimeout(res, ms));

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
    const region_select_id = "#conteudo_ddlRegioes"
    const municipio_select_id = "#conteudo_ddlMunicipios"
    await page.waitForSelector(region_select_id)
    const region_options = await page.$eval(region_select_id, (element) => [...element.options].map(option => option.text).slice(1));
    const data = {}
    for (let region_index = 0; region_index < region_options.length; region_index++) {
        const region_option = region_options[region_index];
        console.log(region_option);
        data[region_option] = {}
        await page.waitForSelector(region_select_id)
        const region_select = await page.$(region_select_id);
        await region_select.select(region_option);
        await delay(5000);
        await page.screenshot({"path":"select_region.png"})
        await page.waitForSelector(municipio_select_id);
        const municipio_options = await page.$eval(municipio_select_id, (element) => [...element.options].map(option => option.text).slice(1));
        for (let index_municipio = 0; index_municipio < municipio_options.length; index_municipio++) {
            const municipio_option = municipio_options[index_municipio];
            console.log(municipio_option);
            await page.waitForSelector(municipio_select_id)
            const municipio_select = await page.$(municipio_select_id);
            await municipio_select.select(municipio_option);
            await delay(5000);
            await page.screenshot({"path":"select_municipio.png"})
            const municipio_tables = await extract_tables(page)
            data[region_option][municipio_option] = municipio_tables;
            const jsonContent = JSON.stringify(data);
            fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
                console.log("JSON file has been saved.");
            });
        }
    }
    await browser.close();
  })();