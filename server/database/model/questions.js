const mongoose = require("mongoose");

//Create schema
const questionsSchema = new mongoose.Schema({
  question: {
    type: String
    // required: true,
  },
  image: {
    type: String
  },
  answer: {
    type: String
    // required: true,
  },
  category: {
    type: String
    // required: true,
  }
});

//Create model
mongoose.model("Questions", questionsSchema);

module.exports = questionsSchema;
