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

    var output_filename = "../output/output_" + formatDate(new Date())+ ".csv";
    var content = "";

    var csv_data = fs.readFileSync('../input/testdata.csv');
    var line = 0;
    var promise = csv(csv_data, {
              raw: false,     // do not decode to utf-8 strings
              separator: ',', // specify optional cell separator
              quote: '"',     // specify optional quote character
              escape: '"',   // specify optional escape character (defaults to quote value)
              newline: '\n',  // specify a newline character
              relax: true,
            }
        )
        .on('data', (row) => {
            console.log("row: " + row);
            if (line > 0) {
                let case_filename = row[0];
                let case_data = fs.readFileSync("../testdata/" + case_filename, 'utf8');
                let correct_count = 0;
                let price = HsyExtractor.extractPrice(case_data);
                if (price) {
                    row[11] = price;
                }
                if (row[11] == row[10]) {
                    correct_count++;
                }

                let zipcode = HsyExtractor.extractZipcode(case_data);
                if (zipcode) {
                    row[5] = zipcode;
                }
                if (row[5] == row[4]) {
                    correct_count++;
                }

                row[1] = correct_count;
            }
            content += row + "\n";
            line++;
        })
        .on('end', () => {
            console.log("output: " + output_filename);
            console.log("content: " + content);
            fs.writeFileSync(output_filename, content, "utf-8");
            console.log(" --- STOP --- ");
        });
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return year + '-' + month + '-' + day + '-' + hour + '-' + minute + '-' + second;
}

main();
