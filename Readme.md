# Haoshiyou AI

[![Build Status](https://travis-ci.com/haoshiyou/haoshiyou-ai.svg?branch=master)](https://travis-ci.com/haoshiyou/haoshiyou-ai)  
This is the extraction algorithm that extracts data from the message.

## Developer Instructon

### Installation

You should have Node and NPM installed. We also recommend NVM to manage multiple node version environment.

```bash
npm i # this install all packages indeed.
```

It reads the csv mapping file from "../input/testdata.csv", then fetches each test case from "../testdata/<filename>",applies the rules to fetch the attributes of that test case.

## Known Bugs

1. when price not provided, any number can be a price in result;

## Reference Readings 
* This NPM package is based on the instruction of [Step by step: Building and publishing an NPM Typescript package.](https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c)

