const express = require("express");
const fs = require("fs");

const app = express();

// Request an available pilot for a given datetime and location
// Example GET
// localhost/pilots/availability?location=Munich&depDateTime=2025-08-01T00:00:00Z&returnDateTime=2025-08-02T00:00:00Z
app.get("/pilots/availability", (req, res) => {
  const filters = req.query;
  console.log(filters);
  const depDate = new Date(filters["depDateTime"]);
  const retDate = new Date(filters["returnDateTime"]);
  if (depDate > retDate) {
    return res.status(400).send({
      message: "Departure Date cannot be later than Return Date",
    });
  }
  const days = getDays(depDate, retDate);
  fs.readFile("availability.json", function (err, data) {
    data = JSON.parse(data);

    const filteredPilots = data["Crew"].filter((pilot) => {
      let isValid = true;

      // Check location / Base
      isValid = isValid && pilot["Base"] == filters["location"];

      // Check WorkDays
      days.forEach((day) => {
        isValid = isValid && pilot["WorkDays"].includes(day);
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
  const curDate = depDate;
  while (curDate <= retDate && res.length < daysInAWeek) {
    const dayOfWeek = curDate.getDay();
    res.push(dayNames[dayOfWeek]);
    curDate.setDate(curDate.getDate() + 1);
  }
  console.log(res);
  return res;
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to ${port}`));
