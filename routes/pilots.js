const express = require("express");
const pilotsRoutes = express.Router();
const fs = require("fs");

const dataPath = "./database/pilots.json";

// const savePilotsData = (data) => {
//   const stringifyData = JSON.stringify(data);
//   fs.writeFileSync(dataPath, stringifyData);
// };

const getPilotsData = () => {
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

// Request an available pilot for a given datetime and location
// Example GET
// localhost/pilots/availability?location=Munich&depDateTime=2025-08-01T00:00:00Z&returnDateTime=2025-08-02T00:00:00Z
pilotsRoutes.get("/availability", (req, res) => {
  const filters = req.query;
  let hasLocationFilter = filters["location"] !== undefined;
  let hasDateTimeFilter =
    filters["depDateTime"] !== undefined &&
    filters["returnDateTime"] !== undefined;
  let hasPilotIdFilter = filters["ID"] !== undefined;

  let days = [];
  let filterDepDate;
  let filterRetDate;
  if (hasDateTimeFilter) {
    filterDepDate = new Date(filters["depDateTime"]);
    filterRetDate = new Date(filters["returnDateTime"]);
    if (filterDepDate > filterRetDate) {
      return res.status(400).send({
        message: "Departure Date cannot be later than Return Date",
      });
    }
    days = getDays(filterDepDate, filterRetDate);
  }

  const pilotsData = getPilotsData();

  const filteredPilots = pilotsData["Crew"].filter((pilot) => {
    let isValid = true;

    // Check pilot id
    if (hasPilotIdFilter) {
        if (pilot["ID"] !== parseInt(filters["ID"])) {
            return false
        }
    }

    // Check location / Base
    if (hasLocationFilter) {
      isValid = isValid && pilot["Base"] == filters["location"];
    }

    // Check WorkDays
    if (hasDateTimeFilter) {
      days.forEach((day) => {
        isValid = isValid && pilot["WorkDays"].includes(day);
      });
    }

    //Check if pilot is already scheduled to fly
    if (hasDateTimeFilter) {
      const flightDataPath = "./database/flights.json";
      const jsonData = fs.readFileSync(flightDataPath);
      const flightsData = JSON.parse(jsonData);
      const scheduledFlights = flightsData["Flight"].filter(
        (p) => p["pilotId"] === pilot["ID"]
      );
      scheduledFlights.forEach((flight) => {
        const flightDepDate = new Date(flight["depDateTime"]);
        const flightRetDate = new Date(flight["returnDateTime"]);
        console.log(flightDepDate, filterRetDate, flightRetDate, filterDepDate);
        const isOverlap =
          flightDepDate <= filterRetDate && flightRetDate >= filterDepDate;
        isValid = isValid && !isOverlap;
      });
    }

    return isValid;
  });
  res.send(filteredPilots);
});

// Function that get the days of week between depDate and retDate
function getDays(depDate, retDate) {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let res = [];
  const daysInAWeek = 7;
  const curDate = new Date(depDate);
  while (curDate <= retDate && res.length < daysInAWeek) {
    const dayOfWeek = curDate.getDay();
    res.push(dayNames[dayOfWeek]);
    curDate.setDate(curDate.getDate() + 1);
  }
  return res;
}

module.exports = pilotsRoutes;
