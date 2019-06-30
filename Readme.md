# Haoshiyou AI

[![Build Status](https://travis-ci.com/xinbenlv/haoshiyou-ai.svg?branch=master)](https://travis-ci.com/xinbenlv/haoshiyou-ai)  
This is the extraction algorithm that extracts data from the message.

## Developer Instructon

### Installation

You should have Node and NPM installed. We also recommend NVM to manage multiple node version environment.

```bash
npm i # this install all packages indeed.
```

##` for test function only
```bash
npx ts-node extractor.ts '地址1220 N FAIR OAKS AVE, #13074, SUNNYVALE, CA; 价格: $5,000(1000元 utility); 电话: 481-880-0123'
```
##` for batch test

```bash
npx ts-node test-batch-drive.ts
```

It reads the csv mapping file from "../input/testdata.csv", then fetches each test case from "../testdata/<filename>",applies the rules to fetch the attributes of that test case.

##` Bugs

1. when price not provided, any number can be a price in result;
