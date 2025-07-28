import express from "express";
import cors from "cors";
import { Client } from "pg";
import bodyParser from "body-parser";
import morgan from "morgan";
import bcrypt from "bcrypt";
import axios from "axios";
import { checkEmailAndPassword, checkUsername } from "./validation.js";
import { sendMessage } from "./model.js";
import session from "express-session";
import rateLimit from "express-rate-limit";

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

app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  session({
    secret:
      "YOUR_SESSION_SECRET_KEY",
    // node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}
const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 2,
  message: {
    isInvalid: true,
    field: "rateLimit",
    error: "Too many registration attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5,
  message: {
    isInvalid: true,
    field: "rateLimit",
    error: "Too many log in attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/register", registerLimiter, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const userCaptchaToken = req.body.captcha;
  const secretKey = "YOUR_RECAPTCHA_SECRET_KEY";

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptchaToken}`
    );
    if (!response.data.success) {
      return res.status(400).json({
        isInvalid: true,
        field: "captcha",
        error: "Please confirm that you are not a robot.",
      });
    }
    const checkResult = checkEmailAndPassword(email, password);
    const usernameCheck = checkUsername(username);
    if (checkResult.isInvalid) {
      return res.status(400).json(checkResult);
    }
    if (usernameCheck.isInvalid) {
      return res.status(400).json(usernameCheck);
    }

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
app.post("/logIn", loginLimiter, async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  const userCaptchaToken = req.body.captcha;
  const secretKey = "YOUR_RECAPTCHA_SECRET_KEY";

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptchaToken}`
    );
    if (!response.data.success) {
      return res.status(400).json({
        isInvalid: true,
        field: "captcha",
        error: "Please confirm that you are not a robot.",
      });
    }

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
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    res.status(200).send("You have successfully logged in!");
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    res.send("Logged out");
  });
});

app.get("/profile", requireAuth, async (req, res) => {
  res.send(`Welcome, ${req.session.user.username}!`);
});
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});
function extractCommandJson(text) {
  // Searching for similar JSON with keys command and param
  const match = text.match(/\{[^{}]*"command"[^{}]*"param"[^{}]*\}/);

  if (match) {
    try {
      const json = JSON.parse(match[0]);
      return json;
    } catch (err) {
      console.error("Unable to parse JSON:", err);
    }
  }

  return null;
}
async function getOrCreateTicket(req) {
  if (req.session.ticketId) {
    console.log(req.session.ticketId);
    return req.session.ticketId;
  }
  const userId = req.session.user.id;
  const result = await connection.query(
    "INSERT INTO tickets (user_id) VALUES ($1) RETURNING id",
    [userId]
  );
  const ticketId = result.rows[0].id;
  req.session.ticketId = ticketId;
  return ticketId;
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log(message);
  const user = req.session.user;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message is empty" });
  }

  const sender = "user";
  const userId = user?.id || null;

  //const botReply = "Thank you! Our support will reply soon.";
  const botReply = await sendMessage(message);
  res.json({ reply: botReply });
  if (!req.session.user) {
    console.log("401");
    return; //res.status(401).json({ reply: "Please log in." });
  }
  console.log("200");
  const ticketId = await getOrCreateTicket(req);

  connection.query(
    "INSERT INTO chat_messages (ticket_id, sender, message) VALUES ($1, 'user', $2)",
    [ticketId, message],
    (err) => {
      if (err) {
        console.error("Error while saving chat: ", err);
        return res.status(500).send("Error saving message");
      }
      console.log("Insert1");
      connection.query(
        "INSERT INTO chat_messages (ticket_id, sender, message) VALUES ($1, 'bot', $2)",
        [ticketId, botReply],
        (err2) => {
          if (err2) {
            console.error("Error while saving bot answer: ", err2);
          }
          console.log("Insert2");
        }
      );
    }
  );
  // if (userMessage.toLowerCase().includes("bye")) {
  //   botReply = "Goodbye! Your ticket is now closed.";
  //   await connection.query(
  //     `UPDATE tickets SET status='closed', closed_at=NOW()
  //        WHERE id = $1`,
  //     [ticketId]
  //   );
  //   delete req.session.ticketId;
  // }
});
app.get("/chat/history", (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).send("Not authorized");

  connection.query(
    "SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC",
    [userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error while loading chat");
      }
      res.json(result.rows);
    }
  );
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
