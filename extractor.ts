const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAvTvxqZ2Qx6Em1XdgbIFYa4UOuZ8l85bc'
});

function firstNotNull(a, b, c) {
  if (a) return a;
  if (b) return b;
  return c;
}
export class HsyExtractor {

  private static debug:boolean = false;

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TITLE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  public static extractTitle(msg:string, data):any {
    // Unimplemented intentionally
    return '____';
  }

  public static extractPrice(msg:string, data):any {
    // Not a phone number
    // Not a street number
    // Not a year number, not near 年
    // Not in a URL
    // Range needs to be between 500 - 6000
    // Near ["USD", "$", "租金", "房租", "一个月", "每月", "/月"]
    let regFallBack = /\b\d{3,4}\b/;
    let ret = msg.match(regFallBack);
    if (ret) {
      let matchedStr = ret[0];
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 10), Math.min(msg.length, index + 10));
      if (HsyExtractor.debug) console.log(`${JSON.stringify({
        price: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }

  public static extractPhone(msg, data) {
    // Not part of a URL (espectially not in a Craigslist URL)
    let reg = /\b\d{3}[-\ ]?\d{3}[-\ ]?\d{4}\b/;
    let ret= msg.match(reg);
    if (ret) {
      let matchedStr = ret[0];
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
      if (HsyExtractor.debug) console.log(`${JSON.stringify({
        phone: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }

  public static extractEmail(msg, data) {
    // https://www.regular-expressions.info/email.html
    let reg = /([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)/;
    let ret= msg.match(reg);
    if (ret) {
      let matchedStr = ret[0];
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
      if (HsyExtractor.debug) console.log(`${JSON.stringify({
        email: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }

  public static extractZipcode(msg, data) {
    let reg = /\b\d{5}\b/
    ;let ret= msg.match(reg);
    if (ret) {
      let matchedStr = ret[0];
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
      if (HsyExtractor.debug) console.log(`${JSON.stringify({
        zipcode: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }

  public static extractWeChat(msg, data) {
    // let reg = /(微信|WeChat|WeiXin)(\ ?ID)?[:：\ ]*[A-Za-z0-9_]+\b/i;
    // let reg = /(微信|WeChat|Weixin)/i;
    // let reg = /(微信|WeChat|Weixin)(\ *(号码|账号|帳號|號|号|id)\ *)?(\ *(is|是|:|：|联系)\ *)?([A-Za-z0-9_]+)/i;
    let reg = /(微信|WeChat|Weixin)\ *(敬)?(请)?(联系|加)?(或电话)?\ *(号码|账号|帳號|號|号|id)?\ *(:|：)*\ *\W{0,6}([a-zA-Z0-9_-])+/i;
    let firstRet= msg.match(reg);
    if (!firstRet) return null ;
    let regSecond = /([a-zA-Z0-9_-]){6,20}$/i;
    let secondRet = firstRet[0].match(regSecond);
    if (secondRet) {
      let matchedStr = secondRet[0];
      let index = firstRet.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 60));
      if (HsyExtractor.debug || true) console.log(`${JSON.stringify({
        firstRet: firstRet[0],
        wechat: matchedStr,
        substr: substr,
      }, null, ' ')}`);
      return secondRet[0];
    }
    return null;
  }
  public static extractCity(msg, data) {
    let chineseCityToEnglish = {
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

    let cityList = [

      'sunnyvale',
      'mountain view',
      'north san jose',
      'south san jose',
      'san jose',
      'san bruno',
      'daly city',
      'south san francisco',
      'downtown francisco',
      'san francisco',
      'palo alto',
      'redwood city',
      'fremont',
      'santa clara',
      'mtv',
      "Alameda","El Cerrito","Mountain View","San Leandro","Albany","Emeryville","Napa","San Mateo","American Canyon","Fairfax","Newark","San Pablo","Antioch","Fairfield","Novato","San Rafael","Atherton","Foster City","Oakland","San Ramon","Belmont","Fremont","Oakley","Santa Clara","Belvedere","Gilroy","Orinda","Santa Rosa","Benicia","Half Moon Bay","Pacifica","Saratoga","Berkeley","Hayward","Palo Alto","Sausalito","Brentwood","Healdsburg","Petaluma","Sebastopol","Brisbane","Hercules","Piedmont","Sonoma","Burlingame","Hillsborough","Pinole","South San Francisco","Calistoga","Lafayette","Pittsburg","St. Helena","Campbell","Larkspur","Pleasant Hill","Suisun City","Clayton","Livermore","Pleasanton","Sunnyvale","Cloverdale","Los Altos","Portola Valley","Tiburon","Colma","Los Altos Hills","Redwood City","Union City","Concord","Los Gatos","Richmond","Vacaville","Corte Madera","Martinez","Rio Vista","Vallejo","Cotati","Menlo Park","Rohnert Park","Walnut Creek","Cupertino","Mill Valley","Ross","Windsor","Daly City","Millbrae","San Anselmo","Woodside","Danville","Milpitas","San Bruno","Yountville","Dixon","Monte Sereno","San Carlos","Dublin","Moraga","San Francisco","East Palo Alto","Morgan Hill","San Jose", // From http://www.bayareacensus.ca.gov/cities/cities.htm
      "Stanford",
    ].concat(Object.keys(chineseCityToEnglish))
        .map(s => s.toUpperCase());
    let regStr = `(${cityList.join('|')})`;
    let reg = new RegExp(regStr);
    let ret= msg.toUpperCase().match(reg);
    if (ret) {
      let matchedStr = ret[0];
      let city = matchedStr;
      if (chineseCityToEnglish[matchedStr]) {
        city = chineseCityToEnglish[matchedStr];
      }
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
      if (HsyExtractor.debug)
        console.log(`${JSON.stringify({
          city: city,
          substr: substr
        }, null, ' ')}`);
      return city;
    }
    return null;
  }

  public static extractFullAddr(msg, data) {
    // In address form
    let reg = /\d+.+(?=AL|AK|AS|AZ|AR|CA|CO|CT|DE|DC|FM|FL|GA|GU|HI|ID|IL|IN|IA|KS|KY|LA|ME|MH|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|MP|OH|OK|OR|PW|PA|PR|RI|SC|SD|TN|TX|UT|VT|VI|VA|WA|WV|WI|WY)[A-Z]{2}[, ]+\d{5}(?:-\d{4})?/;
    let ret= msg.toUpperCase().match(reg);
    if (ret) {
      let matchedStr = ret[0];
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
      if (HsyExtractor.debug) console.log(`${JSON.stringify({
        addr: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }

  public static async maybeExtractGeoPoint(fullAddr, zipcode, city):Promise<object> {
    let addToQuery = firstNotNull(fullAddr, zipcode, city);
    if (!addToQuery) return null;
    return new Promise((resolve, reject) => {
      googleMapsClient.geocode({
        address: firstNotNull(fullAddr, zipcode, city)
      }, (err, response) => {
        if (!err) {
          let lat = response.json.results[0].geometry.location.lat;
          let lng = response.json.results[0].geometry.location.lng;
          resolve({lat: lat, lng: lng});
        } else {
          console.log(err);
          reject(err);
        }
      });
    });

  }

}
