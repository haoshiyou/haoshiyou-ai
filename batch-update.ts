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
            // limit: 500,
            include: ["owner"]
          }
      })
      .request();

  let result = await req
      .catch((err) => {
        console.log(JSON.stringify(err));
      });
  let listingToUpdate:HsyListing[] = [];
  let ownerToUpdate:HsyUser[] = [];
  let errorListing: HsyListing[] = [];
  let updateCount = {
    phone :0,
    city: 0,
    zipcode: 0,
    price: 0,
    email: 0,
    fullAddr: 0,
    wechat: 0,
    location: 0,
  };
  let imageOnly:HsyListing[] = [];
  let claimed:HsyListing[] = [];
  // console.log(`Result = ${JSON.stringify(result, null, '  ')}`);
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


      let city = HsyExtractor.extractCity(hsyListing.content, listObj);
      let fullAddr = HsyExtractor.extractFullAddr(hsyListing.content, listObj);
      let zipcode = HsyExtractor.extractZipcode(hsyListing.content, listObj);
      let price = HsyExtractor.extractPrice(hsyListing.content, listObj);
      let email = HsyExtractor.extractEmail(hsyListing.content, listObj);
      let phone = HsyExtractor.extractPhone(hsyListing.content, listObj);
      let wechat = HsyExtractor.extractWeChat(hsyListing.content, listObj);

      let dirtyListing = false;
      let dirtyOwner = false;
      if (city) {
        hsyListing.addressCity = city;
        updateCount.city++;
        dirtyListing = true;
      }
      if (zipcode) {
        hsyListing.addressZipcode = zipcode;
        updateCount.zipcode++;
        dirtyListing = true;
      }

      if (fullAddr) {
        hsyListing.addressLine = price;
        updateCount.fullAddr++;
        dirtyListing = true;
      }
      if (price) {
        hsyListing.price = price;
        updateCount.price++;
        dirtyListing = true;
      }
      if (hsyListing.owner && phone) {
        hsyListing.owner.contactPhone = phone;
        updateCount.phone++;
        dirtyOwner = true;
      }
      if (hsyListing.owner && email) {
        hsyListing.owner.contactEmail = email;
        updateCount.email++;
        dirtyOwner = true;
      }

      if (hsyListing.owner && wechat) {
        hsyListing.owner.weixin = wechat;
        updateCount.wechat++;
        dirtyOwner = true;
      }
      if (dirtyListing) listingToUpdate.push(hsyListing);
      if (dirtyOwner) ownerToUpdate.push(hsyListing.owner);
    }
  });
  let iii = 0;
  for (let listing of listingToUpdate) {
    if (listing.addressLine || listing.addressCity || listing.addressZipcode) {
      let georaw = await HsyExtractor.maybeExtractGeoPoint(
          listing.addressLine,
          listing.addressCity,
          listing.addressZipcode
      );
      let geopoint = <GeoPoint>georaw;
      listing.location = geopoint;
      listing.location_lat = geopoint.lat;
      listing.location_lng = geopoint.lng;
      updateCount.location++;
      console.log(`Updated location ${updateCount.location}, at ${iii} of ${listingToUpdate.length}`);
    }
    iii++;
  }

  console.log(`Total: ${result[0].body.length}
  Listing To Update: ${listingToUpdate.length}
  Owner To Update: ${ownerToUpdate.length}
  Erorr: ${errorListing.length}
  Claimed: ${claimed.length},
  Image Only: ${imageOnly.length},
  Detailed count: 
  ${JSON.stringify(updateCount, null, '  ')}`);


  if (realRun) {
    console.log(`Warning: real update!`);
    let success = 0;
    let failure = 0;
    let successOwner = 0;
    let failureOwner = 0;
    let listingProcesses = listingToUpdate.map(async l =>
        loopback.put('HsyListings')
        .json(l)
        .request()
        .then(result => {
          let l = result[0].body;
          if(!l || !l.uid) {
            // console.log(`Updated failure result = ${JSON.stringify(result, null, '  ')}`);
            failure ++;
          }
          else {
            // console.log(`Updated uid = ${l.uid}`);
            success ++;
          }
          return l;
        })
        .catch(e => {
          failure ++;
          console.log(e);
          return e;
        })
    );

    let ownerProcesses = ownerToUpdate.map(async u =>
        loopback.put('HsyUsers')
            .json(u)
            .request()
            .then(result => {
              let u = result[0].body;
              if(!u || !u.id) {
                // console.log(`Updated failure result = ${JSON.stringify(result, null, '  ')}`);
                failureOwner ++;
              }
              else {
                // console.log(`Updated user.id = ${u.id}`);
                successOwner ++;
              }
              return u;
            })
            .catch(e => {
              failureOwner ++;
              console.log(e);
              return e;
            })
    );
    await Promise.all(listingProcesses.concat(ownerProcesses));
    console.log(`Success ${success}, Failure ${failure}`);
    console.log(`SuccessOwner ${successOwner}, FailureOwner ${failureOwner}`);
  } else {
    console.log(`Not real run, just for fun!`);
  }
}

main()
    .then(() => {
      console.log('Done');
    })
    .catch(e => console.log(e));


