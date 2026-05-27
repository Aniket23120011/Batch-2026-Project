const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:/Users/saksh/scm-app/public/SAI test.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
