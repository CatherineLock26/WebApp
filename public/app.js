let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let editingQuestionId = null;

const loginBtn = document.getElementById("loginBtn");
const adminBtn = document.getElementById("adminBtn");
const homepageBtn = document.getElementById("HomepageBtn");
const goHomeBtn = document.getElementById("goHomeBtn");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const welcomeMessage = document.getElementById("welcomeMessage");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const progressFill = document.getElementById("progressFill");
const feedbackMessage = document.getElementById("feedbackMessage");

const questionList = document.getElementById("questionList");
const adminStatusMessage = document.getElementById("adminStatusMessage");
const formTitle = document.getElementById("formTitle");

if (loginBtn) {
  loginBtn.addEventListener("click", login);
}

if (adminBtn) {
  adminBtn.addEventListener("click", adminLogin);
}

if (homepageBtn) {
  homepageBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

if (goHomeBtn) {
  goHomeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

if (addQuestionBtn) {
  addQuestionBtn.addEventListener("click", saveQuestionFromForm);
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", exitEditMode);
}

if (welcomeMessage) {
  startQuizPage();
}

if (questionList) {
  loadAdminQuestions();
}

function login() {
  const usernameInput = document.getElementById("username");
  const loginMessage = document.getElementById("loginMessage");
  const username = usernameInput.value.trim();

  if (!username) {
    loginMessage.textContent = "Please enter your name.";
    return;
  }

  localStorage.setItem("quizUser", username);
  window.location.href = "quiz.html";
}

function adminLogin() {
  const user = document.getElementById("user").value.trim();
  const password = document.getElementById("password").value.trim();
  const adminMessage = document.getElementById("adminMessage");

  if (!user || !password) {
    adminMessage.textContent = "Please enter both username and password.";
    return;
  }

  if (user === "Admin" && password === "Admin123") {
    window.location.href = "admin.html";
    return;
  }

  adminMessage.textContent = "Incorrect username or password.";
}

async function fetchQuestions() {
  const response = await fetch("/api/questions");

  if (!response.ok) {
    throw new Error("Could not load questions.");
  }

  return response.json();
}

async function startQuizPage() {
  const username = localStorage.getItem("quizUser");

  if (!username) {
    window.location.href = "index.html";
    return;
  }

  welcomeMessage.textContent = `Welcome, ${username}`;

  try {
    questions = await fetchQuestions();

    if (!questions.length) {
      showEmptyQuizState();
      return;
    }

    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
  } catch (error) {
    questionText.textContent = "Could not load the quiz right now.";
    feedbackMessage.textContent = "Please try again later.";
  }
}

function showEmptyQuizState() {
  progressText.textContent = "No questions available";
  scoreText.textContent = "Score: 0";
  progressFill.style.width = "0%";
  questionText.textContent = "There are no questions in the quiz yet.";
  optionsContainer.innerHTML = "";
  feedbackMessage.textContent = "Ask the admin to add some questions first.";
}

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  const total = questions.length;
  const currentNumber = currentQuestionIndex + 1;
  const progressPercent = (currentNumber / total) * 100;

  progressText.textContent = `Question ${currentNumber} of ${total}`;
  scoreText.textContent = `Score: ${score}`;
  progressFill.style.width = `${progressPercent}%`;

  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";
  feedbackMessage.textContent = "";

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(index));
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  const correctAnswer = questions[currentQuestionIndex].answer;
  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach(button => button.disabled = true);

  if (selectedIndex === correctAnswer) {
    score += 1;
    feedbackMessage.textContent = "Correct!";
  } else {
    feedbackMessage.textContent = `Incorrect. Correct answer: ${questions[currentQuestionIndex].options[correctAnswer]}`;
  }

  scoreText.textContent = `Score: ${score}`;
  currentQuestionIndex += 1;

  setTimeout(() => {
    if (currentQuestionIndex < questions.length) {
      renderQuestion();
    } else {
      showResults();
    }
  }, 900);
}

function showResults() {
  let resultMessage = "Keep practising.";

  if (score === questions.length) {
    resultMessage = "Excellent work!";
  } else if (score >= Math.ceil(questions.length / 2)) {
    resultMessage = "Good effort!";
  }

  const card = document.querySelector(".quiz-card");
  card.innerHTML = `
    <div class="top-row">
      <div>
        <p class="eyebrow">Quiz Complete</p>
        <h1>Nice work</h1>
      </div>
      <button class="secondary-btn" id="homeAfterQuizBtn" type="button">Home</button>
    </div>
    <div class="result-box">
      <p class="score-big">${score} / ${questions.length}</p>
      <p>${resultMessage}</p>
      <button id="playAgainBtn" type="button">Play Again</button>
    </div>
  `;

  document.getElementById("playAgainBtn").addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    renderQuizShellAgain();
  });

  document.getElementById("homeAfterQuizBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

function renderQuizShellAgain() {
  const card = document.querySelector(".quiz-card");
  card.innerHTML = `
    <div class="top-row">
      <div>
        <p class="eyebrow">Quiz Session</p>
        <h1 id="welcomeMessage">Welcome</h1>
      </div>
      <button class="secondary-btn" id="goHomeBtn" type="button">Home</button>
    </div>

    <div class="progress-wrap">
      <div class="progress-meta">
        <span id="progressText">Question 1 of 1</span>
        <span id="scoreText">Score: 0</span>
      </div>
      <div class="progress-bar">
        <div id="progressFill"></div>
      </div>
    </div>

    <h2 id="questionText">Loading question...</h2>
    <div id="optionsContainer" class="options-grid"></div>
    <p id="feedbackMessage" class="message"></p>
  `;

  window.location.reload();
}

async function loadAdminQuestions() {
  try {
    questions = await fetchQuestions();
    renderQuestions();
  } catch (error) {
    adminStatusMessage.textContent = "Could not load questions from the server.";
  }
}

function renderQuestions() {
  questionList.innerHTML = "";

  if (!questions.length) {
    questionList.innerHTML = `<p class="muted">No questions have been added yet.</p>`;
    return;
  }

  questions.forEach((item, index) => {
    const questionCard = document.createElement("div");
    questionCard.className = "question-item";
    questionCard.innerHTML = `
      <div class="question-item-head">
        <span class="chip">#${index + 1}</span>
      </div>
      <h3>${escapeHtml(item.question)}</h3>
      <p>1. ${escapeHtml(item.options[0])}</p>
      <p>2. ${escapeHtml(item.options[1])}</p>
      <p>3. ${escapeHtml(item.options[2])}</p>
      <p><strong>Correct answer index:</strong> ${item.answer}</p>
      <div class="button-row">
        <button type="button" data-edit-id="${item.id}">Edit</button>
        <button type="button" class="danger-btn" data-delete-id="${item.id}">Delete</button>
      </div>
    `;

    questionList.appendChild(questionCard);
  });

  questionList.querySelectorAll("[data-edit-id]").forEach(button => {
    button.addEventListener("click", () => editQuestion(Number(button.dataset.editId)));
  });

  questionList.querySelectorAll("[data-delete-id]").forEach(button => {
    button.addEventListener("click", () => deleteQuestion(Number(button.dataset.deleteId)));
  });
}

async function saveQuestionFromForm() {
  const newQuestion = document.getElementById("newQuestion").value.trim();
  const option1 = document.getElementById("option1").value.trim();
  const option2 = document.getElementById("option2").value.trim();
  const option3 = document.getElementById("option3").value.trim();
  const answer = Number(document.getElementById("answer").value);

  if (
    !newQuestion ||
    !option1 ||
    !option2 ||
    !option3 ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer > 2
  ) {
    adminStatusMessage.textContent = "Please complete all fields correctly.";
    return;
  }

  const payload = {
    question: newQuestion,
    options: [option1, option2, option3],
    answer
  };

  try {
    const isEditing = editingQuestionId !== null;
    const url = isEditing ? `/api/questions/${editingQuestionId}` : "/api/questions";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Could not save question.");
    }

    adminStatusMessage.textContent = isEditing
      ? "Question updated successfully."
      : "Question added successfully.";

    clearAdminForm();
    exitEditMode(false);
    questions = await fetchQuestions();
    renderQuestions();
  } catch (error) {
    adminStatusMessage.textContent = "Could not save question.";
  }
}

function editQuestion(id) {
  const selectedQuestion = questions.find(item => item.id === id);

  if (!selectedQuestion) {
    adminStatusMessage.textContent = "Question not found.";
    return;
  }

  editingQuestionId = id;
  document.getElementById("newQuestion").value = selectedQuestion.question;
  document.getElementById("option1").value = selectedQuestion.options[0];
  document.getElementById("option2").value = selectedQuestion.options[1];
  document.getElementById("option3").value = selectedQuestion.options[2];
  document.getElementById("answer").value = selectedQuestion.answer;

  formTitle.textContent = "Edit Question";
  addQuestionBtn.textContent = "Update Question";
  cancelEditBtn.hidden = false;
  adminStatusMessage.textContent = "Editing selected question.";
}

async function deleteQuestion(id) {
  try {
    const response = await fetch(`/api/questions/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Could not delete question.");
    }

    if (editingQuestionId === id) {
      exitEditMode();
    }

    adminStatusMessage.textContent = "Question deleted successfully.";
    questions = await fetchQuestions();
    renderQuestions();
  } catch (error) {
    adminStatusMessage.textContent = "Could not delete question.";
  }
}

function exitEditMode(clearForm = true) {
  editingQuestionId = null;
  formTitle.textContent = "Add Question";
  addQuestionBtn.textContent = "Save Question";
  cancelEditBtn.hidden = true;

  if (clearForm) {
    clearAdminForm();
  }
}

function clearAdminForm() {
  document.getElementById("newQuestion").value = "";
  document.getElementById("option1").value = "";
  document.getElementById("option2").value = "";
  document.getElementById("option3").value = "";
  document.getElementById("answer").value = "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
