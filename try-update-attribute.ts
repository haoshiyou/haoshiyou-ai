import {HsyListing} from "./loopbacksdk/models/HsyListing";
import {HsyUser} from "./loopbacksdk/models/HsyUser";
import {HsyExtractor} from "./extractor";
import {GeoPoint} from "./loopbacksdk/models/BaseModels";
// haoshiyou-server-dev.herokuapp.com
let config = {
  "loopback": {
    "http://localhost:3000": {
      "__domain": {
        "auth": {
          "auth": {"bearer": "[0]"}
        }
      },
      "api/{endpoint}": {
        "__path": {
          "alias": "__default",
        }
      }
    }
  },
};

const request = require('request');
const promise = require('bluebird');
const purest = require('purest')({request, promise});
const loopback = purest({provider: 'loopback', config});

const realRun = process.env['REAL_RUN'] || false;

async function main() {
  let userId = 'facebook|10153622995632596';
  let kv = {
    'name': 'Zainan Victor Zhou Cool'
  };
  let req = loopback.put(`HsyUsers/${userId}`)
      .json(kv)
      .request();

  let result = await req
      .catch((err) => {
        console.log(JSON.stringify(err));
      });
  let users:HsyUser[] = result[0].body;
  console.log(JSON.stringify(users));
  return result;


}

main()
    .then(() => {
      console.log('Done');
    })
    .catch(e => console.log(e));



