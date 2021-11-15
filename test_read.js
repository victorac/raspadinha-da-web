import puppeteer from "puppeteer"
import extract_tables from "./extract_tables.js"
import load_output from "./parse_output.js"
import fs from "fs"

(async () => {
    const data = await load_output()
    console.log(data);
  })();