import {HsyExtractor} from "./extractor";

function loadInput(input:String) {
    var price = HsyExtractor.extractPrice(input);
    console.log('price: ', price);
    var zipcode = HsyExtractor.extractZipcode(input);
    console.log('zipcode: ', zipcode);
    var title = HsyExtractor.extractTitle(input);
    console.log('title: ', title);
}

/*
 * How to use:
 * ts-node test-function.ts '地址1220 N FAIR OAKS AVE, #13074, SUNNYVALE, CA; 价格: $5,000(1000元 utility); 电话: 481-880-0123'
 */
function main(msg:String) {
    console.log(" --- START --- ");
    console.log(" --- argv: ", process.argv);
    var msg = process.argv[2]; // 输入参数必须用 单引号''包起来, 否则可能出现转义错误

    loadInput(msg);

    console.log(" --- STOP --- ");
}

main();
