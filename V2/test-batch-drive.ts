import {HsyExtractor as HsyExtractorV2} from "../V2/extractor";
import {HsyExtractor as HsyExtractorV1} from "../extractor";

let csv = require('csv-parse');
let fs = require('fs');
let path = require('path');
let useV2 = true;
let HsyExtractor;
var PLACEHOLDER = "____";

if (useV2) {
  HsyExtractor = HsyExtractorV2;
} else {
  HsyExtractor = HsyExtractorV1;
}

function putPlaceholderIfNull(value:String) {
    return value === null ? PLACEHOLDER : value;
}

function main(msg:String) {
    console.log(" --- argv: ", process.argv);
    console.log(" --- START --- ");

    var output_filename = "../output/output_" + formatDate(new Date())+ ".csv";
    var content = "";

    var csv_data = fs.readFileSync('../input/testdata.csv');
    var line = 0;
    var zipcodeTotal = 0;
    var zipcodeCorrect = 0;
    var cityTotal = 0;
    var cityCorrect = 0;
    var addressTotal = 0;
    var addressCorrect = 0;
    var priceTotal = 0;
    var priceCorrect = 0;
    var phoneTotal = 0;
    var phoneCorrect = 0;
    var emailTotal = 0;
    var emailCorrect = 0;
    var wechatTotal = 0;
    var wechatCorrect = 0;
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
                let case_data = null;
                try {
                    case_data = fs.readFileSync("../testdata/" + case_filename, 'utf8');
                } catch (err) {
                    return;
                }
                // pre-process
                case_data = preProcess(case_data);

                let correct_count = 0;

                let title = putPlaceholderIfNull(HsyExtractor.extractTitle(case_data));
                if (title) {
                    row[2] = '"' + title + '"';
                }

                let zipcode = putPlaceholderIfNull(HsyExtractor.extractZipcode(case_data));
                if (zipcode) {
                    row[4] = zipcode;
                }
                if (row[3] !== PLACEHOLDER) {
                    zipcodeTotal++;
                }
                if (row[4] == row[3]) {
                    correct_count++;
                    if (row[3] !== PLACEHOLDER) {
                        zipcodeCorrect++;
                    }
                }

                let city = putPlaceholderIfNull(HsyExtractor.extractCity(case_data));
                row[6] = city;
                if (row[5] !== PLACEHOLDER) {
                    cityTotal++;
                }
                if (row[6] == row[5]) {
                    correct_count++;
                    if (row[5] !== PLACEHOLDER) {
                        cityCorrect++;
                    }
                }

                let fullAddr = putPlaceholderIfNull(HsyExtractor.extractFullAddr(case_data));
                row[7] = '"' + row[7] + '"';
                if (fullAddr) {
                    row[8] = '"' + fullAddr + '"';
                }
                if (row[7] !== PLACEHOLDER) {
                    addressTotal++;
                }
                if (row[8] == row[7]) {
                    correct_count++;
                    if (row[7] !== PLACEHOLDER) {
                        addressCorrect++;
                    }
                }

                let phone = putPlaceholderIfNull(HsyExtractor.extractPhone(case_data));
                if (phone) {
                    row[10] = phone;
                }
                if (row[9] !== PLACEHOLDER) {
                    phoneTotal++;
                }
                if (row[10] == row[9]) {
                    correct_count++;
                    if (row[9] !== PLACEHOLDER) {
                        phoneCorrect++;
                    }
                }

                let email = putPlaceholderIfNull(HsyExtractor.extractEmail(case_data));
                if (email) {
                    row[12] = email;
                }
                if (row[11] !== PLACEHOLDER) {
                    emailTotal++;
                }
                if (row[12] == row[11]) {
                    correct_count++;
                    if (row[11] !== PLACEHOLDER) {
                        emailCorrect++;
                    }
                }

                let price = putPlaceholderIfNull(HsyExtractor.extractPrice(case_data));
                if (price) {
                    row[16] = price;
                }
                if (row[15] !== PLACEHOLDER) {
                    priceTotal++;
                }
                if (row[16] == row[15]) {
                    correct_count++;
                    if (row[15] !== PLACEHOLDER) {
                        priceCorrect++;
                    }
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
            console.log(' ---   priceTotal: %d,     priceCorrect: %d', priceTotal, priceCorrect);
            console.log(' --- zipcodeTotal: %d,   zipcodeCorrect: %d', zipcodeTotal, zipcodeCorrect);
            console.log(' ---    cityTotal: %d,      cityCorrect: %d', cityTotal, cityCorrect);
            console.log(' --- addressTotal: %d,   addressCorrect: %d', addressTotal, addressCorrect);
            console.log(' ---   phoneTotal: %d,     phoneCorrect: %d', phoneTotal, phoneCorrect);
            console.log(' ---   emailTotal: %d,     emailCorrect: %d', emailTotal, emailCorrect);
            console.log(' ---  wechatTotal: %d,    wechatCorrect: %d', wechatTotal, wechatCorrect);
        });
}

function preProcess(data:String) {
    // id: 54f22135-f6c7-4350-80d9-9f7caf0481b8
    return data.replace(/id: [0-9a-z]{8}(-[0-9a-z]{4}){3}-[0-9a-z]{12}\n/g, "");
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

