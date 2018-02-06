import {HsyExtractor} from "./extractor";

let csv = require('csv-parse');
let fs = require('fs');
let path = require('path');

// List all files in a directory in Node.js recursively in a synchronous fashion
function loopScanDirectory(directoryPath:String) {
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
}

function main(msg:String) {
    console.log(" --- argv: ", process.argv);
    console.log(" --- START --- ");

    var output_filename = "../output/output_" + new Date().toISOString() + ".csv";
    var content = "case_name,real_price,price" + "\n";

    var csv_data = fs.readFileSync('../output/template.csv');
    var line = 0;
    var promise = csv(csv_data, {
              raw: false,     // do not decode to utf-8 strings
              separator: ',', // specify optional cell separator
              quote: '"',     // specify optional quote character
              escape: '\\',   // specify optional escape character (defaults to quote value)
              newline: '\n',  // specify a newline character
            }
        )
        .on('data', (row) => {
            if (line > 0) {
                let case_filename = row[0];
                let case_data = fs.readFileSync("../testdata/" + case_filename, 'utf8');
                let price = HsyExtractor.extractPrice(case_data);
                if (price) {
                    console.log(`Price: ${price}`);
                    row[11] = price;
                }
            }
            content += row + "\n";
            line++;
        })
        .on('end', () => {
            console.log("output: " + output_filename);
            console.log("content: " + content);
            //fs.writeFileSync(output_filename, content, "utf-8");
            console.log(" --- STOP --- ");
        });
}

main();
