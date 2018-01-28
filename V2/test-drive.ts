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
    var filename = process.argv[2]; // 输入参数必须用 单引号''包起来, 否则可能出现转义错误

    for (var i = 1; i <= 2; i++) {
        fs.readFile(filename + i, 'utf8', (error, data) => {
            let ret = HsyExtractor.extractPrice(data);
            if (ret){
              console.log(`Price: ${ret}`);
            }
        });
    }
    console.log(" --- STOP --- ");
}

main();
