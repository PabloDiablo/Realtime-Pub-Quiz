const mongoose = require("mongoose");
require("./database/model/games");
require("./database/model/questions");
const db = mongoose.connection;
const Games = mongoose.model("Games");
const Questions = mongoose.model("Questions");
const dbConfig = require("./config");

const data = require("./data.json");

mongoose
  .connect(
    `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log("connection succesvol");
    return seedQuestions();
  })
  .then(() => {
    return seedGames();
  })
  .catch(err => {
    console.log(err);
  })
  .then(() => {
    db.close();
  });

async function seedGames() {
  await Games.deleteMany();
}

async function seedQuestions() {
  await Questions.deleteMany();

  await Questions.insertMany(data);
}
