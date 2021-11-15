import { promises as fs_promise } from 'fs';

async function load_output(){
    let data = {}
    try{
        const text_data = await fs_promise.readFile('output.json', 'utf8');
        data = JSON.parse(text_data);
    } catch (error) {
        console.log("file not found")
    }
    return data;
}

export default load_output;
