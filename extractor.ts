const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAvTvxqZ2Qx6Em1XdgbIFYa4UOuZ8l85bc'
});

/**
 * return first not null
 *
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @returns
 */
function firstNotNull(a: any, b: any, c: any): any
{
    return a || b || c;
}

/**
 * class use for extracte data from message
 *
 * @export
 * @class HsyExtractor
 */
export class HsyExtractor
{
    private static __DEBUG__: boolean = false;    //Debug flag
    private static YEAR: string = new Date().toLocaleString('en-US', {
        year: "numeric"
    }).toString()

    /**
     *
     *
     * @private
     * @static
     * @param {RegExpMatchArray} matches
     * @param {Array<Number>} priorities
     * @returns {string}
     * @memberof HsyExtractor
     * @author Renjie Weng
     */
    private static pickMaximumPriority(matches: RegExpMatchArray, priorities: number[]): string
    {
        if (HsyExtractor.__DEBUG__)
        {
            console.log(" --- matches: ", matches);
            console.log(" --- priorities: ", priorities);
        }
        let pick: number = 0,
            max: number = priorities[0];
        for (let i = 1; i < priorities.length; i++)
            if (priorities[i] > max)
            {
                pick = i;
                max = priorities[i];
            }
        return matches[pick];
    }

    /**
     * Extract title for a message data
     *
     * @static
     * @param {string} msg: input message
     * @param {*} [data]
     * @returns {string}
     * @memberof HsyExtractor
     * @author Renjie Weng
     */
    public static extractTitle(msg: string, data?:any): string
    {
        // 第一个非空行
        // 不小于10个char
        // 不大于70个char
        let startIndex = 0,
            endIndex = msg.indexOf("\n");
        while (endIndex != - 1)
        {
            let line = msg.substring(startIndex, endIndex).trim();
            if (line.length >= 10)
                return line.length > 70 ? line.substring(0, 70) : line;
            startIndex = endIndex + 1;
            endIndex = msg.indexOf('\n', startIndex);
        }
        return 'N/A';
    }

    /**
     * Extract price for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns {*}
     * @memberof HsyExtractor
     * @author Renjie Weng
     */
    public static extractPrice(msg: string, data?)
    {
        // Not a phone number
        // Not a street number
        // Not a year number, not near 年
        // Not in a URL
        // Range needs to be between 500 - 6000
        // Not Near ["ddd-ddd-dddd", "ddddd"]
        const regFallBack = /(\b\d,\d{3}\b)|(\b\d{3,4}\b)/g;
        const numbers = msg.match(regFallBack);
        if (HsyExtractor.__DEBUG__)
            console.log(`${JSON.stringify(numbers)}`);
        if (!numbers)
            return 'N/A';

        const priorities = Array.from(Array(numbers.length), () => 0)
        for (let i = 0; i < numbers.length; i++)
        {
            const number = numbers[i],
                index = msg.indexOf(number),
                tailIndex = index + number.length,
                veryAfterThese = new Array("$");
            for (let one of veryAfterThese)
                if (msg.lastIndexOf(one, index) != -1 && (index - msg.lastIndexOf(one, index)) <= 3)
                    priorities[i] += 1000;
            const afterThese = new Array("USD", "租", "金", "价格", "月");
            for (let one of afterThese)
                if (msg.lastIndexOf(one, index) != -1 && (index - msg.lastIndexOf(one, index)) <= 5)
                    priorities[i] += 100;

            const veryBeforeThese = new Array("刀", "元", "USD", "月", "month");
            for (let one of veryBeforeThese)
                if (msg.indexOf(one, tailIndex) != -1 && (msg.indexOf(one, tailIndex) - tailIndex) <= 3)
                    priorities[i] += 1000;

            if (HsyExtractor.__DEBUG__)
                console.log(`${JSON.stringify({
                    price: number,
                    substr: msg.substr(Math.max(0, index - 10), Math.min(msg.length, index + 10))
                }, null, ' ')}`);
        }
        const price = this.pickMaximumPriority(numbers, priorities);
        return price == HsyExtractor.YEAR ? 'N/A' : price;
    }

    /**
     * Extract phone number for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns {string}
     * @memberof HsyExtractor
     * @author Renjie Weng, Zainan Victor Zhou
     */
    public static extractPhone(msg: string, data?:any): string
    {
        // Not part of a URL (espectially not in a Craigslist URL)
        const reg = /\b\d{3}[-\ ]?\d{3}[-\ ]?\d{4}\b/g;
        const ret = msg.match(reg);

        if (HsyExtractor.__DEBUG__)
            console.log(' --- phones: ', ret);
        if (!ret)
            return 'N/A';

        if (HsyExtractor.__DEBUG__)
            console.log(`${JSON.stringify({
                phone: ret[0],
                substr: msg.substr(Math.max(0, ret.index - 20), Math.min(msg.length, ret.index + 10))
            }, null, ' ')}`);
        return ret[0];
    }

    /**
     * Extract email for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns {string}
     * @memberof HsyExtractor
     * @author Renjie Weng, Zainan Victor Zhou
     */
    public static extractEmail(msg: string, data?:any): string
    {
        // https://www.regular-expressions.info/email.html
        const reg = /([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)/g;

        const ret = msg.match(reg);
        if (HsyExtractor.__DEBUG__)
            console.log(' --- email: ', ret);
        if (!ret)
            return 'N/A';

        if (HsyExtractor.__DEBUG__)
            console.log(`${JSON.stringify({
                email: ret[0],
                substr: msg.substr(Math.max(0, ret.index - 20), Math.min(msg.length, ret.index + 10))
            }, null, ' ')}`);
        return ret[0];
    }

    /**
     * Extract zipcode for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns {string}
     * @memberof HsyExtractor
     * @author Renjie Weng, Zainan Victor Zhou
     */
    public static extractZipcode(msg: string, data?:any): string
    {
        // 在地址中靠后的
        // 出现过多次的(title, address)
        // 在CA或city后的
        const reg = /\b9[4,5]\d{3}\b/g;
        const numbers = msg.match(reg);

        if (HsyExtractor.__DEBUG__)
            console.log('numbers: ', numbers);

        if (!numbers)
            return 'N/A';

        const priorities = Array.from(Array(numbers.length), () => 0);
        for (let i = 0; i < numbers.length; i++)
        {
            const index = msg.indexOf(numbers[i]),
                veryAfterThese = new Array('CA', 'ca');

            for (let one of veryAfterThese)
                if (msg.lastIndexOf(one, index) != -1 && (index - msg.lastIndexOf(one, index)) <= 3)
                    priorities[i] += 1000;

            // From http://www.bayareacensus.ca.gov/cities/cities.htm
            const afterThere = [
                'north san jose', 'south san jose', 'downtown francisco', 'mtv', 'sv', 'pa', "Alameda", "El Cerrito", "Mountain View", "San Leandro", "Albany", "Emeryville", "Napa", "San Mateo", "American Canyon", "Fairfax", "Newark", "San Pablo", "Antioch", "Fairfield", "Novato", "San Rafael", "Atherton", "Foster City", "Oakland", "San Ramon", "Belmont", "Fremont", "Oakley", "Santa Clara", "Belvedere", "Gilroy", "Orinda", "Santa Rosa", "Benicia", "Half Moon Bay", "Pacifica", "Saratoga", "Berkeley", "Hayward", "Palo Alto", "Sausalito", "Brentwood", "Healdsburg", "Petaluma", "Sebastopol", "Brisbane", "Hercules", "Piedmont", "Sonoma", "Burlingame", "Hillsborough", "Pinole", "South San Francisco", "Calistoga", "Lafayette", "Pittsburg", "St. Helena", "Campbell", "Larkspur", "Pleasant Hill", "Suisun City", "Clayton", "Livermore", "Pleasanton", "Sunnyvale", "Cloverdale", "Los Altos", "Portola Valley", "Tiburon", "Colma", "Los Altos Hills", "Redwood City", "Union City", "Concord", "Los Gatos", "Richmond", "Vacaville", "Corte Madera", "Martinez", "Rio Vista", "Vallejo", "Cotati", "Menlo Park", "Rohnert Park", "Walnut Creek", "Cupertino", "Mill Valley", "Ross", "Windsor", "Daly City", "Millbrae", "San Anselmo", "Woodside", "Danville", "Milpitas", "San Bruno", "Yountville", "Dixon", "Monte Sereno", "San Carlos", "Dublin", "Moraga", "San Francisco", "East Palo Alto", "Morgan Hill", "San Jose", "Stanford"]

            const lowerCaseMsg = msg.toLowerCase();
            for (let one of afterThere)
                if (lowerCaseMsg.lastIndexOf(one.toLowerCase(), index) != -1 &&
                    (index - lowerCaseMsg.lastIndexOf(one.toLowerCase(), index)) <= 5 + one.length)
                    priorities[i] += 800;

        }
        return this.pickMaximumPriority(numbers, priorities);
    }

    /**
     * Extract wechat id for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns {string}
     * @memberof HsyExtractor
     * @author Zainan Victor Zhou
     * @todo clean code, and should return string
     */
    public static extractWeChat(msg: string, data?:any): string
    {
        // let reg = /(微信|WeChat|WeiXin)(\ ?ID)?[:：\ ]*[A-Za-z0-9_]+\b/i;
        // let reg = /(微信|WeChat|Weixin)/i;
        // let reg = /(微信|WeChat|Weixin)(\ *(号码|账号|帳號|號|号|id)\ *)?(\ *(is|是|:|：|联系)\ *)?([A-Za-z0-9_]+)/i;
        const reg = /(微信|WeChat|Weixin)\ *(敬)?(请)?(联系|加)?(或电话)?\ *(号码|账号|帳號|號|号|id)?\ *(:|：)*\ *\W{0,6}([a-zA-Z0-9_-])+/i;
        const firstRet = msg.match(reg);
        if (!firstRet)
            return 'N/A';

        const regSecond = /([a-zA-Z0-9_-]){6,20}$/i;
        const secondRet = firstRet[0].match(regSecond);
        if (!secondRet)
            return 'N/A';

        if (HsyExtractor.__DEBUG__)
            console.log(`${JSON.stringify({
                firstRet: firstRet[0],
                wechat: secondRet[0],
                substr: msg.substr(Math.max(0, firstRet.index - 20), Math.min(msg.length, firstRet.index + 60))
            }, null, ' ')}`);
        return secondRet[0];
    }

    /**
     * Extract city for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns {string}
     * @memberof HsyExtractor
     * @author Zainan Victor Zhou
     */
    public static extractCity(msg: string, data?:any): string
    {
        // if ZIPCODE is provided, not extract CITY
        const chineseCityToEnglish = {
            "斯坦福": 'Stanford',
            "阿拉米达": 'Alameda',
            "山景城": 'Mountain View',
            '芒廷维尔': 'Mountain View',
            '芒廷维儿': 'Mountain View',
            "纳帕": 'Napa',
            "圣马特奥": 'San Mateo',
            "纽瓦克": 'Newark',
            "福斯特城": 'Foster City',
            "奥克兰": 'Oakland',
            "贝尔蒙特": 'Belmont',
            "弗里蒙特": 'Fremont',
            "圣塔克拉拉": 'Santa Clara',
            "半月湾": 'Half Moon Bay',
            "太平洋城": 'Pacifica',
            "萨拉托加": 'Saratoga',
            "伯克利": 'Berkeley',
            "海沃德": 'Hayward',
            "帕罗奥图": 'Palo Alto',
            '帕洛阿托': 'Palo Alto',
            "帕罗奥多": 'Palo Alto',
            "南三番": 'South San Francisco',
            "南旧金山": 'South San Francisco',
            '南三藩': 'South San Francisco',
            "利弗莫尔": 'Livermore',
            "桑尼维尔": 'Sunnyvale',
            '阳谷县': 'Sunnyvale',
            "红木城": 'Redwood City',
            "门罗帕克": 'Menlo Park',
            '门罗公园': 'Menlo Park',
            "库比蒂诺": 'Cupertino',
            "苗必达": 'Milpitas',
            '三番': 'San Francisco',
            '旧金山': 'San Francisco',
            '三藩': 'San Francisco',
            '圣何塞': 'San Jose'
        };

        const cityList = [
            'sunnyvale', 'mountain view', 'north san jose', 'south san jose', 'san jose', 'san bruno', 'daly city', 'south san francisco', 'downtown francisco', 'san francisco', 'palo alto', 'redwood city', 'fremont', 'santa clara', 'mtv', "Alameda", "El Cerrito", "Mountain View", "San Leandro", "Albany", "Emeryville", "Napa", "San Mateo", "American Canyon", "Fairfax", "Newark", "San Pablo", "Antioch", "Fairfield", "Novato", "San Rafael", "Atherton", "Foster City", "Oakland", "San Ramon", "Belmont", "Fremont", "Oakley", "Santa Clara", "Belvedere", "Gilroy", "Orinda", "Santa Rosa", "Benicia", "Half Moon Bay", "Pacifica", "Saratoga", "Berkeley", "Hayward", "Palo Alto", "Sausalito", "Brentwood", "Healdsburg", "Petaluma", "Sebastopol", "Brisbane", "Hercules", "Piedmont", "Sonoma", "Burlingame", "Hillsborough", "Pinole", "South San Francisco", "Calistoga", "Lafayette", "Pittsburg", "St. Helena", "Campbell", "Larkspur", "Pleasant Hill", "Suisun City", "Clayton", "Livermore", "Pleasanton", "Sunnyvale", "Cloverdale", "Los Altos", "Portola Valley", "Tiburon", "Colma", "Los Altos Hills", "Redwood City", "Union City", "Concord", "Los Gatos", "Richmond", "Vacaville", "Corte Madera", "Martinez", "Rio Vista", "Vallejo", "Cotati", "Menlo Park", "Rohnert Park", "Walnut Creek", "Cupertino", "Mill Valley", "Ross", "Windsor", "Daly City", "Millbrae", "San Anselmo", "Woodside", "Danville", "Milpitas", "San Bruno", "Yountville", "Dixon", "Monte Sereno", "San Carlos", "Dublin", "Moraga", "San Francisco", "East Palo Alto", "Morgan Hill", "San Jose", "Stanford", // From http://www.bayareacensus.ca.gov/cities/cities.htm
        ].concat(Object.keys(chineseCityToEnglish))
            .map(s => s.toUpperCase());
        const regStr = `(${cityList.join('|')})`;

        const reg = new RegExp(regStr);
        const ret = msg.toUpperCase().match(reg);
        if(!ret)
            return 'N/A';

        let city = ret[0];
        if (chineseCityToEnglish[city])
            city = chineseCityToEnglish[city];
        if (HsyExtractor.__DEBUG__)
            console.log(`${JSON.stringify({
                city: city,
                substr: msg.substr(Math.max(0, ret.index - 20), Math.min(msg.length, ret.index + 10))
            }, null, ' ')}`);
        return city;   
    }

    /**
     * Extract full address for a message data
     *
     * @static
     * @param {string} msg
     * @param {*} [data]
     * @returns
     * @memberof HsyExtractor
     * @author Renjie Weng, Zainan Victor Zhou
     */
    public static extractFullAddr(msg: string, data?:any): string
    {
        // In address form
        const reg = /\d+.+(?=CA)[A-Z]{2}[, ]+\d{5}(?:-\d{4})?/;
        const ret = msg.toUpperCase().match(reg);

        if (!ret || !ret[0])
            return 'N/A';
        
        if (HsyExtractor.__DEBUG__) 
            console.log(`${JSON.stringify({
                addr: ret[0],
                substr: msg.substr(Math.max(0, ret.index - 20), Math.min(msg.length, ret.index + 10))
            }, null, ' ')}`);
        return ret[0];
    }

    /**
     *
     * @private
     * @static
     * @param {*} msg
     * @param {*} [data]
     * @returns
     * @memberof HsyExtractor
     * @author Renjie Weng
     */
    private static findAddrByCaliforniaAndZip(msg, data?:any)
    {
        let reg = /\d+.+(?=CA|California)[A-Z]{2}[, ]+\d{5}(?:-\d{4})?/;
        let ret = msg.toUpperCase().match(reg);
        if (ret)
        {
            let matchedStr = ret[0];
            let index = ret.index;
            let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
            if (HsyExtractor.__DEBUG__) console.log(`${JSON.stringify({
                addr: matchedStr,
                substr: substr
            }, null, ' ')}`);
            return ret[0];
        }
        return null;
    }

    /**
     * locate geo point from full address, zip code, and city
     *
     * @static
     * @param {*} fullAddr
     * @param {*} zipcode
     * @param {*} city
     * @returns {Promise<object>}
     * @memberof HsyExtractor
     * @author Zainan Victor Zhou
     */
    public static async maybeExtractGeoPoint(fullAddr, zipcode, city): Promise<object>
    {
        let addToQuery = firstNotNull(fullAddr, zipcode, city);
        if (!addToQuery) 
            return null;
        return new Promise((resolve, reject) =>
        {
            googleMapsClient.geocode({
                address: firstNotNull(fullAddr, zipcode, city)
            }, (err, response) =>
                {
                    if (!err)
                    {
                        let lat = response.json.results[0].geometry.location.lat;
                        let lng = response.json.results[0].geometry.location.lng;
                        resolve({ lat: lat, lng: lng });
                    } else
                    {
                        console.log(err);
                        reject(err);
                    }
                });
        });

    }
}

