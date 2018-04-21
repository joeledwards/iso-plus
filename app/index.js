import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { geolocation } from "geolocation";

import * as util from "../common/utils";

// Update the clock every minute
clock.granularity = "seconds";

// Heart Rate Sensor
var hrm = new HeartRateSensor();

// Get a handle on the <text> element
let dateLabel = document.getElementById("dateLabel");
let timeLabel = document.getElementById("timeLabel");
let geoLabel = document.getElementById("geoLabel");
let coordLabel = document.getElementById("coordLabel");
let hrLabel = document.getElementById("hrLabel");

// Update the <text> element with the current time
function updateClock() {
  let now = new Date();
  let year = util.monoDigits(now.getYear() + 1900);
  let month = util.monoDigits(util.zeroPad(now.getMonth() + 1));
  let day = util.monoDigits(util.zeroPad(now.getDay()));
  let hour = util.monoDigits(util.zeroPad(now.getHours()));
  let minute = util.monoDigits(util.zeroPad(now.getMinutes()));
  let second = util.monoDigits(util.zeroPad(now.getSeconds()));
  
  let heartRate = 60;

  dateLabel.text = `${year}-${month}-${day}`;
  timeLabel.text = `${hour}:${minute}:${second}`;
}

// Update the clock every tick event
clock.ontick = () => updateClock();

function geoReport(position) {
  let {accuracy, altitude, heading, latitude, longitude} = position.coords
  let headingEmoji = '⬆️';
  if (accuracy < 1) {
    headingEmoji = '⏺';
  } else if (heading > 340 || heading < 20) {
    headingEmoji = '⬆️';
  } else if (heading > 290) {
    headingEmoji = '↖️';
  } else if (heading > 250) {
    headingEmoji = '⬅️';
  } else if (heading > 200) {
    headingEmoji = '↙️';
  } else if (heading > 160) {
    headingEmoji = '⬇️';
  } else if (heading > 110) {
    headingEmoji = '↘️';
  } else if (heading > 70) {
    headingEmoji = '➡️';
  } else {
    headingEmoji = '↗️';
  }
  let geoInfo = `${headingEmoji} ${heading}°, ${altitude}m`;
  let coordinates = `${latitude}, ${longitude}`;
  //console.log(geoInfo);
  //console.log(coordinates);
  geoLabel.text = geoInfo;
  coordLabel.text = coordinates;
}

function geoError(error) {
  geoLabel.text = `⏹ --°, --m`;
  coordLabel.text = `--, --`
}

function checkLocation() {
  let start = Date.now();
  geolocation.getCurrentPosition(
    reading => {
      geoReport(reading);
      setTimeout(checkLocation, 1000);
    },
    error => {
      geoError(error);
      setTimeout(checkLocation, 1000);
    }
  )
}

function hrReport(reading) {
  lastHrUpdate = Date.now();
  let heartRate = util.monoDigits(hrm.heartRate);
  hrLabel.text = `❤️ ${heartRate} ❤️`;
}

function hrError(error) {
  hrLabel.text = `❤️ -- ❤️`;
}

let lastHrUpdate = 0;
setInterval(() => {
  if (Date.now() - lastHrUpdate > 5000) {
    hrError();
  }
}, );

hrm.onreading = reading => hrReport(reading);
hrm.onerror = error => hrError(error);

// Don't start with a blank screen
updateClock();
hrError();
geoError();
checkLocation();

hrm.start();