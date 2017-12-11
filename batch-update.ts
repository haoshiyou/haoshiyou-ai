import {HsyListing} from "./loopbacksdk/models/HsyListing";
import {HsyUser} from "./loopbacksdk/models/HsyUser";
import {HsyExtractor} from "./extractor";

const config = {
  "loopback": {
    "http://haoshiyou-server-dev.herokuapp.com": {
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

async function main() {
  let req = loopback
      .get('HsyListings')
      .qs({filter: {
            order: 'lastUpdated DESC',
            where: {
              // ownerId: {
              //   like: "group-collected-%"
              // },
              // content: '%招租，详情见图片'
            },
            limit: 3000,
            include: ["owner"]
          }
      })
      .request();

  let result = await req
      .catch((err) => {
        console.log(JSON.stringify(err));
      });
  let toUpdate:HsyListing[] = [];
  let errorListing: HsyListing[] = [];
  let updateCount = {
    phone :0,
    city: 0,
    zipcode: 0,
    price: 0,
    email: 0,
  };
  let imageOnly:HsyListing[] = [];
  let claimed:HsyListing[] = [];
  result[0].body.forEach(listObj => {
    let hsyListing:HsyListing = <HsyListing>listObj;
    if (hsyListing) {
      if (!/^group-collected-/.test(hsyListing.ownerId)) {
        claimed.push(hsyListing);
        return;
      }
      if (!hsyListing.content || /.*招租，详情见图片^/.test(hsyListing.content)) {
        imageOnly.push(hsyListing);
        return;
      }

      let phone = HsyExtractor.extractPhone(hsyListing.content, listObj);
      let city = HsyExtractor.extractCity(hsyListing.content, listObj);
      let zipcode = HsyExtractor.extractZipcode(hsyListing.content, listObj);
      let price = HsyExtractor.extractPrice(hsyListing.content, listObj);
      let email = HsyExtractor.extractEmail(hsyListing.content, listObj);
      let flagDirty:boolean = false;
      if (hsyListing.owner && phone) {
        hsyListing.owner.contactPhone = phone;
        console.log(`Update phone for ${hsyListing.uid}`);
        flagDirty = true;
        updateCount.phone++;
      }
      if (city) {
        hsyListing.addressCity = city;
        console.log(`Update city for ${hsyListing.uid}`);
        flagDirty = true;
        updateCount.city++;

      }
      if (zipcode) {
        hsyListing.addressZipcode = zipcode;
        console.log(`Update zipcode for ${hsyListing.uid}`);
        flagDirty = true;
        updateCount.zipcode++;
      }
      if (price) {
        hsyListing.price = price;
        console.log(`Update price for ${hsyListing.uid}`);
        flagDirty = true;
        updateCount.price++;
      }
      if (hsyListing.owner && email) {
        hsyListing.owner.contactEmail = email;
        console.log(`Update contactEmail for ${hsyListing.uid}`);
        flagDirty = true;
        updateCount.email++;
      }
      if (flagDirty) {
        toUpdate.push(hsyListing);
      }
    }
  });

  console.log(`Total: ${result[0].body.length}
  To Update: ${toUpdate.length}
  Erorr: ${errorListing.length}
  Claimed: ${claimed.length},
  Image Only: ${imageOnly.length},
  Detailed count: 
  ${JSON.stringify(updateCount, null, '  ')}`);

}

main()
    .then(() => {
      console.log('Done');
    })
    .catch(e => console.log(e));


