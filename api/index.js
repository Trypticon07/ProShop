import express from "express";
import cors from "cors";
import { Client } from "pg";
import bodyParser from "body-parser";
import morgan from "morgan";
import bcrypt from "bcrypt";
import axios from "axios";
import checkEmailAndPassword from "./validation.js";

const connection = new Client({
  user: "YOUR_DB_USERNAME",
  host: "YOUR_DB_HOST",
  database: "YOUR_DB_NAME",
  password: "YOUR_DB_PASSWORD",
  port: "YOUR_DB_PORT",
});

connection.connect();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(express.json());

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  try {
    const DBresult = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (DBresult.rows.length > 0) {
      return res.status(400).send("Email is already used");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await connection.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [username, hashedPassword, email]
    );

    res.status(201).send("User created");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.post("/logIn", async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  const userCaptchaToken = req.body.captcha;
  const secretKey = "YOUR_RECAPTCHA_SECRET_KEY";

  try {
    // const response = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptchaToken}`
    // );
    // if (!response.data.success) {
    //   return res.status(400).send("reCAPTCHA verification failed");
    // }

    const checkResult = checkEmailAndPassword(email, password);
    if (checkResult.isInvalid) {
      return res.status(400).json(checkResult);
    }

    const result = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("invalid email or password");
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("invalid email or password");
    }

    res.status(200).send("You have successfully logged in!");
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
