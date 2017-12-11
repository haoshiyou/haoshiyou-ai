import {HsyExtractor} from "./extractor";

let csv = require('csv-parse');
let fs = require('fs');

function main() {
  let c = 0;
  fs.createReadStream('testdata/prod-snapshot.csv')
      .pipe(csv({
            raw: false,     // do not decode to utf-8 strings
            separator: ',', // specify optional cell separator
            quote: '"',     // specify optional quote character
            escape: '\\',    // specify optional escape character (defaults to quote value)
            newline: '\n',  // specify a newline character
          }
      ))
      .on('data', (data) => {
        let msg = data[4];
        // extractPrice(msg, data);
        let ret = HsyExtractor.extractCity(msg, data);
        if (ret){
          c++;
          console.log(`Count: ${c}`);
        }

      });
}

main();


