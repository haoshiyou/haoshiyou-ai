import { csvOption } from './config';
import { HsyExtractor } from '../src/extractor';
import * as fs from 'fs';
import * as csv from 'csv-parse';

/*
REF: https://blog.argcv.com/articles/1036.c
精确率(precision)的公式是P = \frac{TP}{TP+FP}, 它计算的是所有"正确被检索的结果(TP)"占所有"实际被检索到的(TP+FP)"的比例.
在例子中就是希望知道此君得到的所有人中, 正确的人(也就是女生)占有的比例. 所以其 precision 也就是40%(20女生/(20女生+30误判为女生的男生)).

召回率(recall)的公式是R = \frac{TP}{TP+FN} , 它计算的是所有"正确被检索的结果(TP)"占所有"应该检索到的结果(TP+FN)"的比例.
在例子中就是希望知道此君得到的女生占本班中所有女生的比例, 所以其 recall 也就是100%(20女生/(20女生+ 0 误判为男生的女生))
*/

/**
 * Get time and format to MMDDYYYYhhmmss
 *
 * @returns {string}
 */

function getNow(): string
{
  let clock: Date = new Date()
  return clock.toLocaleString('en-US', {
    hour12: false,
    year: "numeric", day: "2-digit", month: "2-digit",
    minute: "2-digit", second: "2-digit", hour: "2-digit"
  }).replace(/[\/ ,:]/g, '');
}


/**
 * A record of data correctness
 *
 * @interface DataStat
 */
interface Record
{
  Content: string,
  Price: CompareRecord,
  FullAddr: CompareRecord,
  City: CompareRecord,
  Zipcode: CompareRecord,
  Phone: CompareRecord,
  Wechat: CompareRecord,
  Email: CompareRecord,
  CorrectRate:number,
}

/**
 * contain correct and extraction result to compare
 *
 * @interface CompareRecord
 */
interface CompareRecord
{
  correct: string,
  hsyExtraction: string,
}

/**
 * contain stats for a record
 *
 * @interface Stat
 */
interface Stat
{
  Price: StatRecord,
  FullAddr: StatRecord,
  City: StatRecord,
  Zipcode: StatRecord,
  Phone: StatRecord,
  Wechat: StatRecord,
  Email: StatRecord,
}

/**
 * contain stats record for stat field
 *
 * @interface StatRecord
 */
interface StatRecord
{
  rate: number,
  count: number,
}

/**
 * compare two string data only compare letters and number. (tirm out other character)
 *
 * @param {string} left
 * @param {string} right
 * @returns {boolean}
 */
function extractionSoftEquals(left:string, right:string):boolean
{
  left = left.trim().toUpperCase().replace(/[^A-Za-z0-9@]/gmi,"");
  right = right.trim().toUpperCase().replace(/[^A-Za-z0-9@]/gmi, "");
  return left == right;
}

/**
 * create empty empty data Stats
 *
 * @returns {Stat}
 */
function createStat() :Stat
{
  return {
    Price: {
      rate: 0,
      count: 0,
    },
    FullAddr: {
      rate: 0,
      count: 0,
    },
    City: {
      rate: 0,
      count: 0,
    },
    Zipcode: {
      rate: 0,
      count: 0,
    },
    Phone: {
      rate: 0,
      count: 0,
    },
    Wechat: {
      rate: 0,
      count: 0,
    },
    Email: {
      rate: 0,
      count: 0,
    },
  }
}


/**
 * This will do data comparison with data extraction
 * 1 argv in correct testing file path. default is 'testdata/labeling-data-10252018205253_Done.csv'
 * 2 argv is output csv file path for extration from extractor. default is 'output/extractor-data-${get_now()}.csv'
 * 3 arge is output stats file path. default is 'output/extractor-stats-${get_now()}'
 * 
 * Note: 
 * 1. get_now() will create local time.
 * 2. diff correct testing file and output csv file can compare different since they are same format file.
 * 
 * @param {string} [correctFilePath]
 * @param {string} [outFilePath]
 * @param {string} [statsFilePath]
 */
function main(correctFilePath?: string, outFilePath?: string,statsFilePath?:string ): void
{
  correctFilePath = correctFilePath || 'testdata/labeling-data-10252018205253_Done.csv';
  outFilePath = outFilePath || `output/extractor-data-${getNow()}.csv`;
  statsFilePath = statsFilePath || `output/extractor-stats-${getNow()}`;

  const list: Record[] = [];
  let contentIndex: number,
    correctPriceIndex: number,
    correctFullAddrIndex: number,
    correctCityIndex: number,
    correctZipcodeIndex: number,
    correctPhoneIndex: number,
    correctWechatIndex: number,
    correctEmailIndex: number,
    dataCount: number = -1;  // avoid header, so start from -1

  contentIndex = correctPriceIndex = correctFullAddrIndex =
    correctCityIndex = correctZipcodeIndex = correctPhoneIndex =
    correctWechatIndex = correctEmailIndex = undefined;

  fs.createReadStream(correctFilePath)
    .pipe(csv(csvOption))
    .once("data", (data: string[]) =>
    {
      contentIndex = data.indexOf('content');
      correctPriceIndex = data.indexOf('price');
      correctFullAddrIndex = data.indexOf('full address');
      correctCityIndex = data.indexOf('city');
      correctZipcodeIndex = data.indexOf('zipcode');
      correctPhoneIndex = data.indexOf('phone');
      correctWechatIndex = data.indexOf('wechat');
      correctEmailIndex = data.indexOf('email');
    })
    .on('data', (data: string[]) =>
    {
      if (dataCount != -1)
      {
        const content = data[contentIndex];
        const record: Record = {
          Content: content,
          Price : 
          {
            correct: data[correctPriceIndex],
            hsyExtraction: HsyExtractor.extractPrice(content),
          },
          FullAddr : 
          {
            correct: data[correctFullAddrIndex],
            hsyExtraction: HsyExtractor.extractFullAddr(content),
          },
          City : 
          {
            correct: data[correctCityIndex],
            hsyExtraction: HsyExtractor.extractCity(content),
          },
          Zipcode : 
          {
            correct: data[correctZipcodeIndex],
            hsyExtraction: HsyExtractor.extractZipcode(content),
          },
          Phone : 
          { 
            correct: data[correctPhoneIndex],
            hsyExtraction: HsyExtractor.extractPhone(content),
          },
          Wechat :
          {
            correct: data[correctWechatIndex],
            hsyExtraction: HsyExtractor.extractWeChat(content),
          },
          Email : 
          {
            correct: data[correctEmailIndex],
            hsyExtraction: HsyExtractor.extractEmail(content),
          },
          CorrectRate :0,
        }
        let correctCount = 0, totalCount = 0;
        for (const key of Object.keys(record).filter(key=>key != "CorrectRate" && key != "Content"))
        {
          if (extractionSoftEquals(record[key].correct, record[key].hsyExtraction))
            correctCount++;
          totalCount++;
        }
        record.CorrectRate = correctCount / totalCount;
        
        list.push(record);
      }
      dataCount++;
    })
    .on("end", () =>
    {
      const outFile: fs.WriteStream = fs.createWriteStream(outFilePath);
      outFile.write(`content,price,full address,city,zipcode,phone,wechat,email,correct rate,\n`); 
      // add one more field for csv to avoid reading issue 
      for (const record of list)
        outFile.write(`"${record.Content}",${record.Price.hsyExtraction},${record.FullAddr.hsyExtraction},${record.City.hsyExtraction},${record.Zipcode.hsyExtraction},${record.Phone.hsyExtraction},${record.Wechat.hsyExtraction},${record.Email.hsyExtraction},${record.CorrectRate},\n`);
      outFile.close();
      
      const correctStats: Stat = createStat();
      const precisionStats = createStat();
      const recallStats = createStat();

      for(const record of list)
      { 
        for (const key of Object.keys(record).filter(key => (key != 'Content' && key != 'CorrectRate')))
        {
          if (!extractionSoftEquals(record[key].correct, 'N/A') || !extractionSoftEquals(record[key].hsyExtraction,'N/A'))
          {
            if (extractionSoftEquals(record[key].correct, record[key].hsyExtraction))
              correctStats[key].rate++;
            correctStats[key].count++;
          }
          
          if(!extractionSoftEquals(record[key].correct, 'N/A'))
          {
            if (extractionSoftEquals(record[key].correct, record[key].hsyExtraction))
              recallStats[key].rate++;
            recallStats[key].count++;
          }
          
          if (!extractionSoftEquals(record[key].hsyExtraction, 'N/A'))
          {
            if (extractionSoftEquals(record[key].correct, record[key].hsyExtraction))
              precisionStats[key].rate++;
            precisionStats[key].count++;
          }
        }
      }
      const statsFile: fs.WriteStream = fs.createWriteStream(statsFilePath);
      statsFile.write(`total data:${dataCount}\n\n`);
      statsFile.write(`Correct Stats:\n`);
      for (const key in correctStats)
        statsFile.write(`${key}:${correctStats[key].rate / correctStats[key].count}\n`);
      statsFile.write(`\nPrecision Stats:\n`);
      for (const key in precisionStats)
        statsFile.write(`${key}:${precisionStats[key].rate / precisionStats[key].count}\n`);
      statsFile.write(`\nRecall Stats:\n`);
      for (const key in recallStats)
        statsFile.write(`${key}:${recallStats[key].rate / recallStats[key].count}\n`);
    })
}

main(process.argv[2], process.argv[3], process.argv[4]);
