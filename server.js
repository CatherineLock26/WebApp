const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "questions.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readQuestions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading questions:", error);
    return [];
  }
}

function writeQuestions(questions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2), "utf8");
}

app.get("/api/questions", (req, res) => {
  res.json(readQuestions());
});

app.post("/api/questions", (req, res) => {
  const { question, options, answer } = req.body;

  if (
    typeof question !== "string" ||
    !Array.isArray(options) ||
    options.length !== 3 ||
    options.some(option => typeof option !== "string" || !option.trim()) ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer > 2
  ) {
    return res.status(400).json({ message: "Invalid question data." });
  }

  const questions = readQuestions();
  const newQuestion = {
    id: Date.now(),
    question: question.trim(),
    options: options.map(option => option.trim()),
    answer
  };

  questions.push(newQuestion);
  writeQuestions(questions);
  res.status(201).json(newQuestion);
});

app.put("/api/questions/:id", (req, res) => {
  const questionId = Number(req.params.id);
  const { question, options, answer } = req.body;

  if (
    typeof question !== "string" ||
    !Array.isArray(options) ||
    options.length !== 3 ||
    options.some(option => typeof option !== "string" || !option.trim()) ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer > 2
  ) {
    return res.status(400).json({ message: "Invalid question data." });
  }

  const questions = readQuestions();
  const index = questions.findIndex(item => item.id === questionId);

  if (index === -1) {
    return res.status(404).json({ message: "Question not found." });
  }

  questions[index] = {
    ...questions[index],
    question: question.trim(),
    options: options.map(option => option.trim()),
    answer
  };

  writeQuestions(questions);
  res.json(questions[index]);
});

app.delete("/api/questions/:id", (req, res) => {
  const questionId = Number(req.params.id);
  const questions = readQuestions();
  const filtered = questions.filter(item => item.id !== questionId);

  if (filtered.length === questions.length) {
    return res.status(404).json({ message: "Question not found." });
  }

  writeQuestions(filtered);
  res.json({ message: "Question deleted." });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Quiz app running on http://localhost:${PORT}`);
});
