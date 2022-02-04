require('dotenv').config();
const express = require("express");
const fs = require("fs");

const app = express();

// Request an available pilot for a given datetime and location
// Example GET
// localhost/pilots/availability?location=Munich&depDateTime=2025-08-01T00:00:00Z&returnDateTime=2025-08-02T00:00:00Z
app.get("/pilots/availability", (req, res) => {
  const filters = req.query;
  console.log(filters);
  const filterDepDate = new Date(filters["depDateTime"]);
  const filterRetDate = new Date(filters["returnDateTime"]);
  if (filterDepDate > filterRetDate) {
    return res.status(400).send({
      message: "Departure Date cannot be later than Return Date",
    });
  }
  const days = getDays(filterDepDate, filterRetDate);
  fs.readFile("availability.json", function (err, data1) {
    data1 = JSON.parse(data1);

    const filteredPilots = data1["Crew"].filter((pilot) => {
      let isValid = true;

      // Check location / Base
      isValid = isValid && pilot["Base"] == filters["location"];

      // Check WorkDays
      days.forEach((day) => {
        isValid = isValid && pilot["WorkDays"].includes(day);
      });

      //Check if pilot is already scheduled to fly
      const jsonData = fs.readFileSync("flights.json");
      data2 = JSON.parse(jsonData);
      const scheduledFlights = data2["Flight"].filter(
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

      return isValid;
    });
    res.send(filteredPilots);
  });
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to ${port}`));
