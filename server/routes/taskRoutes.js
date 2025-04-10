import express from "express";
import { connectToDB } from "../lib/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to ensure that only the person logged that is logged in is able to see their tasks
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: "No Token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

// get tasks
router.get("/tasks", verifyToken, async (req, res) => {
  try {
    const db = await connectToDB();
    const [rows] = await db.query("SELECT * FROM tasks WHERE user_id = ?", [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// add tasks
router.post("/tasks", verifyToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const db = await connectToDB();
    await db.query(
      "INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)",
      [req.userId, title, description]
    );
    res.status(201).json({ message: "Task Created" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add task" });
  }
});

// delete a specific task
router.delete("/tasks/:id", verifyToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const db = await connectToDB();
    const [rows] = await db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
      taskId,
      req.userId,
    ]);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;
