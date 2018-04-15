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
        if (line > 0 && row[0].length > 0) {
                let case_filename = row[0];
                let case_data = fs.readFileSync("../testdata/" + case_filename, 'utf8');
                let correct_count = 0;

                let title = HsyExtractor.extractTitle(case_data);
                if (title) {
                    row[2] = '"' + title + '"';
                }

                let zipcode = HsyExtractor.extractZipcode(case_data);
                if (zipcode) {
                    row[4] = zipcode;
                }
                if (row[4] == row[3]) {
                    correct_count++;
                }

                let addr = HsyExtractor.extractFullAddr(case_data);
                row[7] = '"' + row[7] + '"';
                console.log(' --- case %s addr: %s', case_filename, addr);

                let phone = HsyExtractor.extractPhone(case_data);
                if (phone) {
                    row[10] = phone;
                }
                if (row[10] == row[9]) {
                    correct_count++;
                }

                let email = HsyExtractor.extractEmail(case_data);
                if (email) {
                    row[12] = email;
                }
                if (row[12] == row[11]) {
                    correct_count++;
                }

                let price = HsyExtractor.extractPrice(case_data);
                if (price) {
                    row[16] = price;
                }
                if (row[16] == row[15]) {
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
