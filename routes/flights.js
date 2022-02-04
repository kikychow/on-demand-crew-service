const express = require("express");
const flightsRoutes = express.Router();
const fs = require("fs");

const dataPath = "./database/flights.json";

const saveFlightsData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};

const getFlightsData = () => {
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

flightsRoutes.post("/", (req, res) => {
  const newFlight = req.body
  let existFlights = getFlightsData();
  existFlights["Flight"].push(newFlight)

  saveFlightsData(existFlights);
  res.status(201).json(newFlight);
});

module.exports = flightsRoutes;
