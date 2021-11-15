var fs = require('fs');
// read file sample.html
let parsed;
fs.readFile('output.json',
    // callback function that is called when reading file is done
    function(err, data) {       
        if (err) throw err;
        // data is a buffer containing file content
        parsed = JSON.parse(data.toString('utf8'))
});