import express from "express";
import { connectToDB } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

//for registration
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const db = await connectToDB();
    // Trying to save as an array and checking if the user already exists in the DB
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length > 0) {
      return res.status(409).json({ message: "User Already Exists" });
    }

    //if it is a new user then hashing password
    const hashPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username,email,password) VALUES (?,?,?)",
      [username, email, hashPassword]
    );
    return res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Some Error Occured",
    });
  }
});

//for login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await connectToDB();
    // Trying to save as an array and checking if the user already exists in the DB
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong Password" });
    }
    //after checking that the pwd is matched then we generate the token
    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, {
      expiresIn: "3h",
    });

    return res.status(201).json({ token: token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Some Error Occured",
    });
  }
});

//Inorder to verify the token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
      return res.status(403).json({
        message: "No Token Provided",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};



router.get("/home", verifyToken, async (req, res) => {
  try {
    const db = await connectToDB();
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // Now if the user exists then just returning the users information
    return res.status(201).json({ user: rows[0] });
  } catch (error) {
    console.log(Error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
