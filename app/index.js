import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { geolocation } from "geolocation";
import { battery, charger } from "power";
import { today } from "user-activity";

import {monoDigits} from "../common/utils";

// Update the clock every minute
clock.granularity = "seconds";

// Heart Rate Sensor
let hrm = new HeartRateSensor();

// Local Date
let cachedLocalYear;
let cachedLocalMonth;
let cachedLocalDay;
let lastLocalYear;
let lastLocalMonth;
let lastLocalDay;
function getLocalDate(date, context) {
  let yearUpdated = false;
  let monthUpdated = false;

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (year !== lastLocalYear) {
    yearUpdated = true;
    lastLocalYear = year;
    cachedLocalYear = monoDigits(year);
  }
  if (yearUpdated || month !== lastLocalMonth) {
    monthUpdated = true;
    lastLocalMonth = month;
    cachedLocalMonth = `${cachedLocalYear}-${monoDigits(month)}`;
  }
  if (monthUpdated || day !== lastLocalDay) {
    lastLocalDay = day;
    cachedLocalDay = `${cachedLocalMonth}-${monoDigits(day)}`;
  }

  let localDate = cachedLocalDay;

  return Promise.resolve(context ? {...context, localDate} : {localDate});
}

// Local Time
let cachedLocalHour;
let cachedLocalMinute;
let lastLocalHour;
let lastLocalMinute;
function getLocalTime(date, context) {
  let hourUpdated = false;

  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  if (hour !== lastLocalHour) {
    hourUpdated = true;
    lastLocalHour = hour;
    cachedLocalHour = monoDigits(hour);
  }

  if (hourUpdated || minute != lastLocalMinute) {
    lastLocalMinute = minute;
    cachedLocalMinute = `${cachedLocalHour}:${monoDigits(minute)}`;
  }

  const localTime = `${cachedLocalMinute}:${monoDigits(second)}`;

  return Promise.resolve(context ? {...context, localTime} : {localTime});
}

// UTC Time
let cachedUtcYear;
let cachedUtcMonth;
let cachedUtcDay;
let cachedUtcHour;
let cachedUtcMinute;
let lastUtcYear;
let lastUtcMonth;
let lastUtcDay;
let lastUtcHour;
let lastUtcMinute;
function getUtcTime(date, context) {
  let yearUpdated = false;
  let monthUpdated = false;
  let dayUpdated = false;
  let hourUpdated = false;

  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  let day = date.getUTCDate();
  let hour = date.getUTCHours();
  let minute = date.getUTCMinutes();
  let second = date.getUTCSeconds();

  if (year !== lastUtcYear) {
    yearUpdated = true;
    lastUtcYear = year;
    cachedUtcYear = monoDigits(year);
  }

  if (yearUpdated || month !== lastUtcMonth) {
    monthUpdated = true;
    lastUtcMonth = month;
    cachedUtcMonth = `${cachedUtcYear}-${monoDigits(month)}`;
  }

  if (monthUpdated || day !== lastUtcDay) {
    dayUpdated = true;
    lastUtcDay = day;
    cachedUtcDay = `${cachedUtcMonth}-${monoDigits(day)}`;
  }

  if (dayUpdated || hour !== lastUtcHour) {
    hourUpdated = true;
    lastUtcHour = hour;
    cachedUtcHour = `${cachedUtcDay}T${monoDigits(hour)}`;
  }

  if (hourUpdated || minute !== lastUtcMinute) {
    lastUtcMinute = minute;
    cachedUtcMinute = `${cachedUtcHour}:${monoDigits(minute)}`;
  }

  let utcTime = `${cachedUtcMinute}:${monoDigits(second)}Z`;

  return Promise.resolve(context ? {...context, utcTime} : {utcTime});
}

function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Get a handle on the <text> elements
let dateLabel = document.getElementById("dateLabel");
let timeLabel = document.getElementById("timeLabel");
let utcLabel = document.getElementById("utcLabel");
let powerLabel = document.getElementById("powerLabel");
let hrLabel = document.getElementById("hrLabel");

function getUpdatedValues(ts) {
  let now = (ts instanceof Date) ? ts : new Date();

  return Promise.resolve({now})
  .then(getLocalDate.bind(now))
  .then(getLocalTime.bind(now))
  .then(getUtcTime.bind(now))
  .then(getPower.bind(now))
  .then(getHeartRate.bind(now))
  .catch(error => console.error(error));
}

// Update the <text> element with the current time
function updateClock(ts) {
  getUpdatedValues(ts)
  .then(({now, localDate, localTime, utcTime, powerInfo, heartRate}) => {
    dateLabel.text = localDate;
    timeLabel.text = localTime;
    utcLabel.text = utcTime;
    powerLabel.text = powerInfo;

    if (heartRate) {
      hrLabel.text = heartRate;
    }

    //powerLabel.text = `⏱ ${Date.now() - now.getTime()} ms`;
  });
}

// Update the clock every tick event
clock.ontick = ({date}) => updateClock(date);

// Get additional metrics
function getPower(start, context) {
  let powerInfo = `⚡️${monoDigits(battery.chargeLevel)}%`;
  powerInfo += ` | ${(today.local.distance / 1000).toFixed(1)}km`;
  powerInfo += ` | ${today.local.steps}`;

  //powerInfo = ` | ⏱ ${monoDigits(((Date.now() - start) / 1000).toFixed(3))} s`;

  return Promise.resolve(context ? {...context, powerInfo} : {powerInfo});
}

// Heart Rate tracking
const emptyHr = `❤️ -- ❤️`;
let lastHrUpdate = 0;
let lastHr;
let nextHr;

function getHeartRate(date, context) {
  let heartRate;

  if (nextHr == null || Date.now() - lastHrUpdate > 5000) {
    heartRate = emptyHr;
  } else if (lastHr !== nextHr) {
    lastHr = nextHr;
    heartRate = `❤️ ${monoDigits(nextHr)} ❤️`;
  }

  return Promise.resolve(context ? {...context, heartRate} : {heartRate});
}

// Store the Heart Rate reading; update on clock tick
hrm.onreading = reading => {
  lastHrUpdate = Date.now();
  nextHr = hrm.heartRate;
};
hrm.onerror = error => {
  nextHr = null;
};

// Don't start with a blank screen
updateClock();

// Read heart rate
hrm.start();
