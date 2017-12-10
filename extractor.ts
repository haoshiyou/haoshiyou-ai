
export class HsyExtractor {
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
      console.log(`${JSON.stringify({
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
      console.log(`${JSON.stringify({
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
      console.log(`${JSON.stringify({
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
      console.log(`${JSON.stringify({
        zipcode: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }

  public static extractCity(msg, data) {
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

      "阿拉米达","山景城",'芒廷维尔', '芒廷维儿',"纳帕","圣马特奥","纽瓦克","福斯特城","奥克兰","贝尔蒙特","弗里蒙特","圣塔克拉拉","半月湾","太平洋城","萨拉托加","伯克利","海沃德","帕罗奥图", '帕洛阿托', "帕罗奥多","南三番", "南旧金山", '南三藩',"利弗莫尔","桑尼维尔", '阳谷县',"红木城","门罗帕克", '门罗公园',"库比蒂诺","苗必达", '三番', '旧金山', '三藩','圣何塞',
    ]
        .map(s => s.toUpperCase());
    let regStr = `(${cityList.join('|')})`;
    let reg = new RegExp(regStr);
    ;let ret= msg.toUpperCase().match(reg);
    if (ret) {
      let matchedStr = ret[0];
      let index = ret.index;
      let substr = msg.substr(Math.max(0, index - 20), Math.min(msg.length, index + 10));
      console.log(`${JSON.stringify({
        city: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
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
      console.log(`${JSON.stringify({
        addr: matchedStr,
        substr: substr
      }, null, ' ')}`);
      return ret[0];
    }
    return null;
  }
}