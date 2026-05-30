import express from "express";
import cors from "cors";
import { Pool } from "pg";
import bodyParser from "body-parser";
import morgan from "morgan";
import bcrypt from "bcrypt";
import axios from "axios";
import { checkEmail, checkUsername, checkPassword } from "./validation.js";
import { sendMessage } from "./model.js";
import session from "express-session";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

pool.on("error", (err, client) => {
  console.error("Unexpected error in pool connection:", err);
});

const app = express();
const port = process.env.APP_PORT;

const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

app.set("trust proxy", 1);

app.use(
  cors({
    // Add more origins if needed
    origin: [
      "http://localhost:5500",
      "http://localhost:4173",
      "https://trypticon07.github.io",
    ],
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    // node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 3,
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

const subscriptionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 3,
  message: {
    isInvalid: true,
    field: "rateLimit",
    error: "Too many subscription attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const supportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 3,
  message: {
    isInvalid: true,
    field: "rateLimit",
    error:
      "Too many to ask a support attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const profileLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 3,
  message: {
    isInvalid: true,
    field: "rateLimit",
    error: "Too many changing attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/register", registerLimiter, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const userCaptchaToken = req.body.captcha;
  const secretKey = recaptchaSecretKey;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptchaToken}`,
    );
    if (!response.data.success) {
      return res.status(400).json({
        isInvalid: true,
        field: "captcha",
        error: "Please confirm that you are not a robot.",
      });
    }
    const emailCheck = checkEmail(email);
    const passwordCheck = checkPassword(password);
    const usernameCheck = checkUsername(username);
    if (emailCheck.isInvalid) {
      return res.status(400).json(emailCheck);
    }
    if (usernameCheck.isInvalid) {
      return res.status(400).json(usernameCheck);
    }
    if (passwordCheck.isInvalid) {
      return res.status(400).json(passwordCheck);
    }

    const DBresult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (DBresult.rows.length > 0) {
      return res.status(400).json({
        isInvalid: true,
        field: "email",
        error: "Email is already used.",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertedUser = await pool.query(
      "INSERT INTO users (username, password, email, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email",
      [username, hashedPassword, email],
    );

    const newUser = insertedUser.rows[0];
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };

    // Session cookie — expires on browser close
    req.session.cookie.expires = false;

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
  const secretKey = recaptchaSecretKey;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptchaToken}`,
    );
    if (!response.data.success) {
      return res.status(400).json({
        isInvalid: true,
        field: "captcha",
        error: "Please confirm that you are not a robot.",
      });
    }

    const emailCheck = checkEmail(email);
    const passwordCheck = checkPassword(password);
    if (emailCheck.isInvalid) {
      return res.status(400).json(emailCheck);
    }
    if (passwordCheck.isInvalid) {
      return res.status(400).json(passwordCheck);
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

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
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    } else {
      req.session.cookie.expires = false;
    }

    res.status(200).send("You have successfully logged in!");
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/subscribe", subscriptionLimiter, async (req, res) => {
  const email = req.body.email;
  try {
    const emailCheck = checkEmail(email);
    if (emailCheck.isInvalid) {
      return res.status(400).json(emailCheck);
    }

    await pool.query("INSERT INTO mailing_list (email) VALUES ($1)", [email]);

    res.status(200).send("You have successfully subscribed!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/support", supportLimiter, async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const description = req.body.description;
  try {
    if (email.length < 6 || email.length > 100) {
      return {
        isInvalid: true,
        field: "email",
        error: "Email must be between 6 and 100 characters.",
      };
    } else if (
      !email.includes("@") ||
      !email.includes(".") ||
      email.indexOf("@") === 0 ||
      email.lastIndexOf(".") < email.indexOf("@")
    ) {
      return res.status(400).json({
        isInvalid: true,
        field: "email",
        error: "Email is invalid.",
      });
    }
    if (firstName.length < 1 || firstName.length > 30) {
      return {
        isInvalid: true,
        field: "firstName",
        error: "First name must be between 1 and 30 characters.",
      };
    }
    if (lastName.length < 1 || lastName.length > 30) {
      return {
        isInvalid: true,
        field: "lastName",
        error: "Last name must be between 1 and 30 characters.",
      };
    }

    await pool.query(
      "INSERT INTO support_messages (first_name, last_name, email, description) VALUES ($1, $2, $3, $4)",
      [firstName, lastName, email, description],
    );

    res.status(200).send("You have successfully asked a question!");
  } catch (err) {
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

app.get("/profile", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");
    const query = `
      SELECT * FROM users 
      WHERE id = $1`;

    const values = [userId];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/profile/editUsername", profileLimiter, async (req, res) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) return res.status(401).send("Not authorized");
    const username = req.body.username;

    const usernameCheck = checkUsername(username);
    if (usernameCheck.isInvalid) {
      return res.status(400).json(usernameCheck);
    }
    const query = `
          UPDATE users
          SET username = $2
          WHERE id = $1
          RETURNING *;
        `;

    const values = [userId, username];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/profile/editEmail", profileLimiter, async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");
    const email = req.body.email;
    const emailCheck = checkEmail(email);
    if (emailCheck.isInvalid) {
      return res.status(400).json(emailCheck);
    }
    const checkQuery = `
          SELECT id FROM users 
          WHERE email = $1
        `;
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        isInvalid: true,
        field: "email",
        error: "Email is already used.",
      });
    }
    const query = `
          UPDATE users
          SET email = $2
          WHERE id = $1
          RETURNING *;
        `;

    const values = [userId, email];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/profile/changePassword", profileLimiter, async (req, res) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) return res.status(401).send("Not authorized");
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const oldPasswordCheck = checkPassword(oldPassword);
    if (oldPasswordCheck.isInvalid) {
      return res.status(400).json({
        ...oldPasswordCheck,
        field: "oldPassword",
      });
    }

    const newPasswordCheck = checkPassword(newPassword);
    if (newPasswordCheck.isInvalid) {
      return res.status(400).json({
        ...oldPasswordCheck,
        field: "newPassword",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        isInvalid: true,
        field: "oldPassword",
        error: "incorrect password",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const query = `
        UPDATE users
        SET password = $2
        WHERE id = $1
        RETURNING *;
        `;

    const values = [userId, hashedPassword];

    await pool.query(query, values);

    res.status(201).json({ message: "Password has been changed." });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: error.message });
  }
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
      const cleanedText = text.replace(match[0], "").trim();
      return { cleanedText, json };
    } catch (err) {
      console.error("Unable to parse JSON:", err);
    }
  }

  return text;
}

async function getOrCreateTicket(req) {
  if (req.session.ticketId) {
    return req.session.ticketId;
  }

  const userId = req.session.user.id;

  const result = await pool.query(
    "SELECT id FROM tickets WHERE user_id = $1 AND status != 'closed' ORDER BY created_at DESC LIMIT 1",
    [userId],
  );

  let ticketId;

  if (result.rows.length > 0) {
    ticketId = result.rows[0].id;
  } else {
    const insertResult = await pool.query(
      "INSERT INTO tickets (user_id) VALUES ($1) RETURNING id",
      [userId],
    );
    ticketId = insertResult.rows[0].id;
  }

  req.session.ticketId = ticketId;
  return ticketId;
}

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products LIMIT 40");
    res.json(result.rows);
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).send("Error loading products");
  }
});

app.get("/product", async (req, res) => {
  const id = req.query.id;
  try {
    const result = await pool.query(`SELECT * FROM products WHERE id=${id}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error loading product:", err);
    res.status(500).send("Error loading product");
  }
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message is empty" });
  }

  const botReply = await sendMessage(message);
  const answer = extractCommandJson(botReply);
  if (answer.json) {
    if (answer.cleanedText === "") {
      answer.cleanedText =
        "Goodbye! If you have any questions feel free to ask!";
    }
    res.json({ reply: answer.cleanedText });
  } else {
    res.json({ reply: answer });
  }

  if (!user) {
    return;
  }
  const ticketId = await getOrCreateTicket(req);
  if (answer.json && answer.json.command === "finish") {
    await pool.query(
      `UPDATE tickets SET status='closed', closed_at=NOW()
         WHERE id = $1`,
      [ticketId],
    );
    delete req.session.ticketId;
  }

  pool.query(
    "INSERT INTO chat_messages (ticket_id, sender, message) VALUES ($1, 'user', $2)",
    [ticketId, message],
    (err) => {
      if (err) {
        console.error("Error while saving chat: ", err);
        return res.status(500).send("Error saving message");
      }
      pool.query(
        "INSERT INTO chat_messages (ticket_id, sender, message) VALUES ($1, 'bot', $2)",
        [ticketId, botReply],
        (err2) => {
          if (err2) {
            console.error("Error while saving bot answer: ", err2);
          }
        },
      );
    },
  );
});

app.get("/chat/history", async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).send("Not authorized");

  try {
    const ticketResult = await pool.query(
      `SELECT id FROM tickets WHERE user_id = $1 AND status != 'closed'
       ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );

    if (ticketResult.rows.length === 0) {
      return res.json([]);
    }

    const ticketId = ticketResult.rows[0].id;

    const chatResult = await pool.query(
      `SELECT sender, message, created_at
       FROM chat_messages
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticketId],
    );

    res.json(chatResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while loading chat");
  }
});

app.get("/products/search", async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res
      .status(400)
      .json({ error: 'Search query parameter "q" is required' });
  }

  try {
    const query = `
      SELECT * FROM products 
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY id
      LIMIT 20
    `;

    const values = [`%${searchTerm}%`];

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/cart/add", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");

    const productId = req.body.product_id;
    const quantity = Number(req.body.quantity);

    if (!productId || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO cart_items (user_id, product_id, quantity, added_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, added_at = NOW()
      RETURNING id;
    `;
    const values = [userId, productId, quantity];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Item added/updated in cart successfully",
      cart_item: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding/updating item in cart:", error);
    res.status(500).send("Error while adding products to cart");
  }
});

app.post("/cart/remove", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");

    const productId = req.body.product_id;

    if (!productId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      DELETE FROM cart_items
      WHERE user_id = $1 AND product_id = $2;
    `;
    const values = [userId, productId];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Item removed from cart successfully",
      cart_item: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding/updating item in cart:", error);
    res.status(500).send("Error while adding products to cart");
  }
});

app.post("/cart/clear", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");

    const query = `
      DELETE FROM cart_items
      WHERE user_id = $1
      RETURNING *;
    `;
    const values = [userId];

    const result = await pool.query(query, values);

    res.status(200).json({
      message: "Cart cleared successfully",
      cleared_items: result.rows.length,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).send("Error while clearing cart");
  }
});

app.get("/cart/history", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");
    const query = `
      SELECT ci.id, ci.product_id, ci.quantity, ci.added_at,
             p.name AS product_name, p.price AS product_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC;
    `;

    const values = [userId];
    const result = await pool.query(query, values);

    res.status(200).json({
      cart_items: result.rows,
    });
  } catch (error) {
    console.error("Error fetching cart history:", error);
    res.status(500).send("Error while fetching cart history");
  }
});

app.post("/order/add", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const address = req.body.address;
    const address2 = req.body.address2;
    const country = req.body.country;
    const city = req.body.city;
    const zip = req.body.zip;
    const paymentMethod = req.body.paymentMethod;

    // card data
    const cardExpirationDate = req.body.expiration;
    const nameOnCard = req.body.nameOnCard;

    const status = "pending";

    if (
      !firstName ||
      !lastName ||
      !email ||
      !address ||
      !address2 ||
      !country ||
      !city ||
      !zip ||
      !paymentMethod ||
      !cardExpirationDate ||
      !nameOnCard ||
      !req.body.cardNumber ||
      !req.body.cvv
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query1 = `
      INSERT INTO orders (user_id, first_name, last_name, email, address, address2, country, city, zip, payment_method, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING ID;
    `;
    const values1 = [
      userId,
      firstName,
      lastName,
      email,
      address,
      address2,
      country,
      city,
      zip,
      paymentMethod,
      status,
    ];

    const result1 = await pool.query(query1, values1);
    const orderId = result1.rows[0].id;
    const query2 = `  INSERT INTO order_items (user_id, order_id, product_id, quantity, created_at)
      SELECT user_id, $1 AS order_id, product_id, quantity, NOW()
      FROM cart_items
      WHERE user_id = $2;
      `;
    const values2 = [orderId, userId];
    const result2 = await pool.query(query2, values2);

    if (
      processPayment(
        nameOnCard,
        cardExpirationDate,
        req.body.cardNumber,
        req.body.cvv,
      )
    ) {
      const updateQuery = `
      UPDATE orders SET status = 'paid' WHERE user_id = $1 AND id = $2`;
      const updateValues = [userId, orderId];
      await pool.query(updateQuery, updateValues);

      req.body.cardNumber = null;
      req.body.cvv = null;
    } else {
      const updateQuery = `
      UPDATE orders SET status = 'failed' WHERE user_id = $1 AND id = $2`;
      const updateValues = [userId, orderId];
      await pool.query(updateQuery, updateValues);
      return res.status(402).json({ error: "Payment failed." });
    }

    const clearCartQuery = `
      DELETE FROM cart_items
      WHERE user_id = $1
      RETURNING *;
    `;
    const clearCartValues = [userId];

    await pool.query(clearCartQuery, clearCartValues);

    res.status(201).json({
      message: "Order created successfully",
      order: result1.rows[0],
      order_items: result2.rows,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
});

app.get("/orders/history", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");

    const query = `
      SELECT o.id AS order_id,
             o.created_at,
             o.status,
             SUM(p.price * oi.quantity) AS total_amount
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id, o.created_at, o.status
      ORDER BY o.created_at DESC;
    `;

    const values = [userId];
    const result = await pool.query(query, values);

    res.status(200).json({
      orders: result.rows,
    });
  } catch (error) {
    console.error("Error fetching orders history:", error);
    res.status(500).send("Error while fetching orders history");
  }
});

app.post("/order/details", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");

    const orderId = req.body.orderId;

    const query = `
      SELECT o.id AS order_id,
         o.first_name,
         o.last_name,
         o.email,
         o.address,
         o.address2,
         o.country,
         o.city,
         o.zip,
         o.payment_method,
         o.status,
         o.created_at,
         json_agg(
           json_build_object(
             'product_id', oi.product_id,
             'quantity', oi.quantity,
             'name', p.name,
             'price', p.price
           )
         ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1 AND o.id = $2
      GROUP BY o.id, o.first_name, o.last_name, o.email,
           o.address, o.address2, o.country, o.city, o.zip,
           o.payment_method, o.status, o.created_at
      ORDER BY o.created_at DESC;
    `;

    const values = [userId, orderId];
    const result = await pool.query(query, values);

    res.status(200).json({
      order_items: result.rows,
    });
  } catch (error) {
    console.error("Error fetching order items history:", error);
    res.status(500).send("Error while fetching order items history");
  }
});

app.post("/order/cancel", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).send("Not authorized");

    const orderId = req.body.orderId;
    const status = "canceled";

    const checkQuery = `
      SELECT * FROM orders WHERE user_id = $1 AND id = $2
    `;
    const checkValues = [userId, orderId];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (
      checkResult.rows[0].status !== "paid" &&
      checkResult.rows[0].status !== "pending"
    ) {
      return res.status(400).send("Order is already canceled.");
    }

    const query = `
      UPDATE orders SET status = $3 WHERE user_id = $1 AND id = $2
    `;

    const values = [userId, orderId, status];
    const result = await pool.query(query, values);

    res.status(200).json({
      orders: result.rows,
    });
  } catch (error) {
    console.error("Error canceling order history:", error);
    res.status(500).send("Error while canceling order history");
  }
});

function processPayment(nameOnCard, cardExpirationDate, cardNumber, cvvCode) {
  // Here you can put payment processing code.
  if (nameOnCard && cardExpirationDate && cardNumber && cvvCode) {
    return true;
  } else {
    return false;
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
