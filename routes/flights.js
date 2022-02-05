require("dotenv").config();
const express = require("express");
const flightsRoutes = express.Router();
const fs = require("fs");
const request = require("request");

const dataPath = "./database/flights.json";

const saveFlightsData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};

const getFlightsData = () => {
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

// Schedule a Flight for a Pilot
// Example POST
// localhost/flights {"pilotId": 1823, "depDateTime": "2025-08-01T09:00:00Z", "returnDateTime": "2025-08-01T10:00:00Z"}
flightsRoutes.post("/", (req, res) => {
  const newFlight = req.body;
  console.log(newFlight);
  let existFlights = getFlightsData();

  // Check whether pilot's slot is available
  const port = process.env.PORT || 3000;
  const host = "http://localhost:" + port;
  const url =
    host +
    "/pilots/availability?depDateTime=" +
    newFlight["depDateTime"] +
    "&returnDateTime=" +
    newFlight["returnDateTime"] +
    "&ID=" +
    newFlight["pilotId"];
  console.log(url);
  request(url, function (error, response, body) {
    pilotsData = JSON.parse(body);
    console.log(pilotsData);
    const isAvailable = pilotsData.length > 0;

    if (isAvailable) {
      existFlights["Flight"].push(newFlight);

      saveFlightsData(existFlights);
      res.status(201).json(newFlight);
    } else {
      res.status(400).send({
        message: "Pilot's slot is not available",
      });
    }
  });
});

module.exports = flightsRoutes;
