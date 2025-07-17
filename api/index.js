import express from "express";
import cors from "cors";
import { Client } from "pg";
import bodyParser from "body-parser";
import morgan from "morgan";

const connection = new Client({
  user: "YOUR_DB_USERNAME",
  host: "YOUR_DB_HOST",
  database: "YOUR_DB_NAME",
  password: "YOUR_DB_PASSWORD",
  port: "YOUR_DB_PORT",
})

connection.connect();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("tiny"))
app.use(express.json())

app.post("/submitSignUp", (req, res) => {
  console.log(req.body)
  const username = req.body.username
  const password = req.body.password
  const email = req.body.email
  connection.query(`INSERT INTO users(username, password, email) VALUES ('${username}', '${password}', '${email}')`, (err, res) => {
    if (err) {
      console.error(err.stack);
      res.status(500).send("Server error");
    } else {
      console.log("Data inserted");
    }
  })
  res.status(201)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

