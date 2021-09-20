const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const url = "mongodb+srv://etruth18-user:c1h2u3c4k5@cluster0.7sarz.mongodb.net/budgetdb?retryWrites=true&w=majority";


const PORT = 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(url, function(err, db) {
  if (err) throw err;
    console.log ("Database created!");
    db.close();
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});