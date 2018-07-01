import {HsyExtractor} from "./extractor";

async function loadInput(input:String) {
    var price = HsyExtractor.extractPrice(input);
    console.log('price: ', price);
    var zipcode = HsyExtractor.extractZipcode(input);
    console.log('zipcode: ', zipcode);
    var title = HsyExtractor.extractTitle(input);
    console.log('title: ', title);
    await HsyExtractor.extractCityWithZipcode(input, zipcode)
        .then((city) => {
            console.log('city: ', city);
        });
    await HsyExtractor.extractCityWithZipcode(input)
        .then((city_2) => {
            console.log('city_2:', city_2);
        });
    var addr = HsyExtractor.extractFullAddr(input);
    console.log('addr: ', addr);
}

/*
 * How to use:
 * ts-node test-function.ts '地址1220 N FAIR OAKS AVE, #1307, SUNNYVALE, CA; 价格: $5,000(1000元 utility); 电话: 481-880-0123'
 */
async function main(msg:String) {
    console.log(" --- START --- ");
    console.log(" --- argv: ", process.argv);
    var msg = process.argv[2]; // 输入参数必须用 单引号''包起来, 否则可能出现转义错误

    await loadInput(msg);
    console.log(" --- STOP --- ");
}

main();
