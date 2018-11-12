import * as fs from 'fs';
import * as csv from 'csv-parse';

/**
 * Get time and format to MMDDYYYYhhmmss
 *
 * @returns {string}
 */
function get_now(): string
{
  let clock: Date = new Date()
  return clock.toLocaleString('en-US', {
    hour12: false,
    year: "numeric", day: "2-digit", month: "2-digit",
    minute: "2-digit", second: "2-digit", hour: "2-digit"
  }).replace(/[\/ ,:]/g, '');
}

/**
 * A program read haoshiyou database csv file and parsing to labeling csv file
 *
 * @param {string} [inFilePath]
 * @param {string} [outFilePath]
 * @author William Chen
 */
function main(inFilePath?: string, outFilePath?: string): void
{
  let prevID: string = "",
    list: string[] = [],
    contentIndex: number = undefined,
    ownerIdIndex: number = undefined;
  inFilePath = inFilePath || 'testdata/prod-snapshot.csv';
  outFilePath = outFilePath || `output/labeling-data-${get_now()}.csv`;

  fs.createReadStream(inFilePath)
    .pipe(csv(
      {
        raw: false,          // do not decode to utf-8 strings
        delimiter: ',',      // specify optional cell separator
        quote: '"',          // specify optional quote character
        escape: '\\',        // specify optional escape character (defaults to quote value)
        rowDelimiter: '\n',  // specify a newline character
      }))
    .once("data", (data: string[]) =>
    {
      contentIndex = data.indexOf('content');
      ownerIdIndex = data.indexOf('ownerId');
    })
    .on('data', (data: string[]) =>
    {
      const content = data[contentIndex].replace(/"/g, ' ').replace(/<br ?\/>/g, '\n');
      if (prevID != data[ownerIdIndex])
      {
        prevID = data[ownerIdIndex];
        list.push(content);
      }
      else
        list[list.length - 1] += `\n${content}`;
    })
    .on("end", () =>
    {
      list = list.slice(1).filter(d => d && d != 'NULL');
      const outFile: fs.WriteStream = fs.createWriteStream(outFilePath);
      outFile.write(`content,price,full address,city,zipcode,phone,wechat,email,note\n`);
      for (const content of list)
        outFile.write(`"${content}",,,,,,,,\n`);
      outFile.close();
    })
}

main(process.argv[2], process.argv[3]);