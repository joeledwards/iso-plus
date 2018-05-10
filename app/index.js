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
function localDate(date) {
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

  return cachedLocalDay;
}

// Local Time
let cachedLocalHour;
let cachedLocalMinute;
let lastLocalHour;
let lastLocalMinute;
function localTime(date) {
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

  return `${cachedLocalMinute}:${monoDigits(second)}`;
}

// Get a handle on the <text> element
let dateLabel = document.getElementById("dateLabel");
let timeLabel = document.getElementById("timeLabel");
let utcLabel = document.getElementById("utcLabel");
let powerLabel = document.getElementById("powerLabel");
let hrLabel = document.getElementById("hrLabel");

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
function utcTime(date) {
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

  return `${cachedUtcMinute}:${monoDigits(second)}Z`;
}

// Update the <text> element with the current time
function updateClock(ts) {
  //let start = Date.now();
  let now = (ts instanceof Date) ? ts : new Date();

  dateLabel.text = localDate(now);
  timeLabel.text = localTime(now);
  utcLabel.text = utcTime(now);
  
  // Update power info
  powerLabel.text = getPower(now);

  // Update the heart rate
  updateHeartRate();
}

// Update the clock every tick event
clock.ontick = ({date}) => updateClock(date);

function getPower(start) {
  let powerInfo = `⚡️${monoDigits(battery.chargeLevel)}%`;
  powerInfo += ` | ${(today.local.distance / 1000).toFixed(1)} km`;
  powerInfo += ` | ${today.local.steps}`;
  //powerInfo += ` | ⏱ ${monoDigits(((Date.now() - start) / 1000).toFixed(3))} s`;
  return powerInfo;
}

const emptyHr = `❤️ -- ❤️`;
let lastHrUpdate = 0;
let lastHeartRate;
let heartRate;

function updateHeartRate() {
  if (heartRate == null || Date.now() - lastHrUpdate > 5000) {
    hrLabel.text = emptyHr;
  } else if (lastHeartRate !== heartRate) {
    lastHeartRate = heartRate;
    hrLabel.text = `❤️ ${monoDigits(heartRate)} ❤️`;
  }
}

// Store the Heart Rate reading; update on clock tick
hrm.onreading = reading => {
  lastHrUpdate = Date.now();
  heartRate = hrm.heartRate;
};
hrm.onerror = error => {
  heartRate = null;
};

// Don't start with a blank screen
updateClock();

// Read heart rate
hrm.start();
