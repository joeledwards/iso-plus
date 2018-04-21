import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { geolocation } from "geolocation";

import {monoDigits} from "../common/utils";

// Update the clock every minute
clock.granularity = "seconds";

// Heart Rate Sensor
let hrm = new HeartRateSensor();
let hrSummary = hrError();

// Get a handle on the <text> element
let dateLabel = document.getElementById("dateLabel");
let timeLabel = document.getElementById("timeLabel");
let utcLabel = document.getElementById("utcLabel");
let unixLabel = document.getElementById("unixLabel");
let hrLabel = document.getElementById("hrLabel");

function utcTime(date) {
  let year = monoDigits(date.getUTCFullYear());
  let month = monoDigits(date.getUTCMonth() + 1);
  let day = monoDigits(date.getUTCDate());
  let hour = monoDigits(date.getUTCHours());
  let minute = monoDigits(date.getUTCMinutes());
  let second = monoDigits(date.getUTCSeconds());

  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function unixTime(date) {
  return monoDigits((date.getTime() / 1000) | 0);
}

function localTime(date) {
  let year = monoDigits(date.getFullYear());
  let month = monoDigits(date.getMonth() + 1);
  let day = monoDigits(date.getDate());
  let hour = monoDigits(date.getHours());
  let minute = monoDigits(date.getMinutes());
  let second = monoDigits(date.getSeconds());
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:${second}`
  };
}

// Update the <text> element with the current time
function updateClock(ts) {
  //let start = Date.now();
  
  let now = (ts instanceof Date) ? ts : new Date();
  let {date, time} = localTime(now);
  let utc = utcTime(now);
  let unix = unixTime(now);

  dateLabel.text = date;
  timeLabel.text = time;
  utcLabel.text = utc;
  unixLabel.text = unix;
  hrLabel.text = hrSummary;
  
  //unixLabel.text = `⏱ ${(Date.now() - start) / 1000} s`;
}

// Update the clock every tick event
clock.ontick = ({date}) => updateClock(date);

function hrReport() {
  lastHrUpdate = Date.now();
  let heartRate = monoDigits(hrm.heartRate);
  //let heartRate = hrm.heartRate;
  return `❤️ ${heartRate} ❤️`;
}

function hrError() {
  return `❤️ -- ❤️`;
}

let lastHrUpdate = 0;
setInterval(() => {
  if (Date.now() - lastHrUpdate > 5000) {
    hrSummary = hrError();
  }
}, );

// Store the Heart Rate reading; update on clock tick
hrm.onreading = reading => {
  hrSummary = hrReport();
};
hrm.onerror = error => {
  hrSummary = hrError();
};

// Don't start with a blank screen
updateClock();

// Read heart rate
hrm.start();