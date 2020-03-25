const mongoose = require("mongoose");
require("./database/model/games");
require("./database/model/questions");
const db = mongoose.connection;
const Games = mongoose.model("Games");
const Questions = mongoose.model("Questions");
const dbConfig = require("./config");

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

  await Questions.insertMany([
    {
      question: "What's my name?",
      answer: "Bob",
      category: "General Knowledge"
    },
    {
      question: "What colour is this?",
      image:
        "https://us.123rf.com/450wm/alkestida/alkestida1510/alkestida151000004/47412317-stock-vector-vector-green-apple-with-green-leaf-isolated-on-a-white-background.jpg?ver=6",
      answer: "Green",
      category: "General Knowledge"
    },
    {
      question: "What channel is BBC One?",
      answer: "one",
      category: "General Knowledge"
    },
    {
      question: "Who's this?",
      answer: "Steve",
      category: "General Knowledge"
    },
    {
      question: "What's in my hand?",
      answer: "Jeff",
      category: "General Knowledge"
    },
    {
      question: "Who sang this song?",
      answer: "Fred",
      category: "Music"
    },
    {
      question: "What's this song?",
      answer: "Sandi",
      category: "Music"
    }
  ]);
}
