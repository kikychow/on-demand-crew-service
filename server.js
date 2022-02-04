require("dotenv").config();
const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json())

const pilots = require("./routes/pilots");
app.use("/pilots", pilots);

const flights = require("./routes/flights");
app.use("/flights", flights);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to ${port}`));
