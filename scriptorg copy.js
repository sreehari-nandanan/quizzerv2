// script.js
const subjectsPerClass = {
  1: ["Math", "English", "EVS", "Hindi", "Computer", "Art"],
  2: ["Math", "English", "EVS", "Hindi", "Computer", "Art"],
  3: ["Math", "English", "Science", "Hindi", "Computer", "SST"],
  4: ["Math", "English", "Science", "Hindi", "Computer", "EVS"],
  5: ["Math", "English", "Science", "Hindi", "Computer", "EVS"],
  6: ["Math", "English", "Physics", "Biology", "Chemistry", "History"],
  7: ["Math", "English", "Physics", "Biology", "Chemistry", "Geography"],
  8: ["Math", "English", "Physics", "Biology", "Chemistry", "Civics"],
  9: ["Math", "English", "Physics", "Biology", "Chemistry", "History"],
  10: ["Math", "English", "Physics", "Biology", "Chemistry", "Geography"]
};

let selectedClass = null;
let selectedSubject = null;
let questions = [];
let selectedQuestions = [];
let currentIndex = 0;
let score = 0;
let selectedOption = null;

// DOM Elements
const elements = {
  home: document.getElementById("home"),
  subjectSelect: document.getElementById("subject-select"),
  rulesPopup: document.getElementById("rules-popup"),
  quizContainer: document.getElementById("quiz-container"),
  resultContainer: document.getElementById("result-container"),
  classOptions: document.getElementById("class-options"),
  subjectOptions: document.getElementById("subject-options"),
  classNext: document.getElementById("class-next"),
  subjectNext: document.getElementById("subject-next"),
  subjectBack: document.getElementById("subject-back"),
  rulesBack: document.getElementById("rules-back"),
  startQuiz: document.getElementById("start-quiz"),
  nextBtn: document.getElementById("next-btn"),
  questionElement: document.getElementById("question"),
  optionsContainer: document.getElementById("options"),
  quizSubjectName: document.getElementById("quiz-subject-name"),
  currentQuestion: document.getElementById("current-question"),
  totalQuestions: document.getElementById("total-questions"),
  resultSubject: document.getElementById("result-subject"),
  scorePercent: document.getElementById("score-percent"),
  scoreValue: document.getElementById("score-value"),
  scoreMax: document.getElementById("score-max"),
  selectedClassDisplay: document.getElementById("selected-class-display")
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function renderOptions(containerId, options, onSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  options.forEach(opt => {
    const card = document.createElement("div");
    card.className = "option-card";
    card.textContent = opt;
    card.addEventListener("click", () => {
      container.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      onSelect(opt);
    });
    container.appendChild(card);
  });
}

function loadJSON(path) {
  return fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch(error => {
      console.error("Error loading JSON:", error);
      throw error;
    });
}

function startQuiz() {
  const path = `questions/class${selectedClass}${selectedSubject.toLowerCase()}.json`;
  
  // Show loading state
  elements.questionElement.textContent = "Loading questions...";
  elements.optionsContainer.innerHTML = "";
  elements.nextBtn.disabled = true;
  
  loadJSON(path)
    .then(data => {
      questions = data;
      selectedQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
      currentIndex = 0;
      score = 0;
      
      // Update quiz info
      elements.quizSubjectName.textContent = selectedSubject;
      elements.currentQuestion.textContent = "1";
      elements.totalQuestions.textContent = selectedQuestions.length;
      document.querySelector(".progress-fill").style.width = "0%";
      
      showScreen("quiz-container");
      showQuestion();
    })
    .catch(error => {
      console.error("Error loading questions:", error);
      alert("Error loading questions. Please try again later.");
      showScreen("home");
    });
}

function showQuestion() {
  const q = selectedQuestions[currentIndex];
  elements.questionElement.textContent = q.question;
  elements.optionsContainer.innerHTML = "";
  selectedOption = null;
  elements.nextBtn.disabled = true;

  // Update progress
  elements.currentQuestion.textContent = currentIndex + 1;
  const progressPercent = (currentIndex / selectedQuestions.length) * 100;
  document.querySelector(".progress-fill").style.width = `${progressPercent}%`;

  q.options.forEach((opt, idx) => {
    const card = document.createElement("div");
    card.className = "option-card";
    card.innerHTML = `<span>${opt}</span>`;
    card.addEventListener("click", () => {
      document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedOption = idx;
      elements.nextBtn.disabled = false;
    });
    elements.optionsContainer.appendChild(card);
  });
}

function nextQuestion() {
  if (selectedOption === null) {
    alert("Please select an answer.");
    return;
  }

  // Check answer and provide visual feedback
  const correctIndex = selectedQuestions[currentIndex].correctIndex;
  const selectedCard = elements.optionsContainer.children[selectedOption];
  
  if (selectedOption === correctIndex) {
    selectedCard.classList.add("correct");
    score += 10;
  } else {
    selectedCard.classList.add("incorrect");
    elements.optionsContainer.children[correctIndex].classList.add("correct");
  }

  // Disable all options after selection
  document.querySelectorAll(".option-card").forEach(card => {
    card.style.pointerEvents = "none";
  });

  // Delay before moving to next question
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < selectedQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1500);
}

function showResults() {
  const total = selectedQuestions.length * 10;
  const percent = Math.round((score / total) * 100);
  
  // Update result elements
  elements.resultSubject.textContent = selectedSubject;
  elements.scoreValue.textContent = score;
  elements.scoreMax.textContent = total;
  elements.scorePercent.textContent = percent;
  
  // Animate the circular progress
  const circle = document.querySelector(".progress-ring__circle--fill");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;
  
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 100);
  
  showScreen("result-container");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Class selection
  renderOptions("class-options", Object.keys(subjectsPerClass), cls => {
    selectedClass = cls;
    elements.classNext.disabled = false;
  });

  elements.classNext.addEventListener("click", () => {
    const subjects = subjectsPerClass[selectedClass];
    elements.selectedClassDisplay.textContent = selectedClass;
    renderOptions("subject-options", subjects, subject => {
      selectedSubject = subject;
      elements.subjectNext.disabled = false;
    });
    showScreen("subject-select");
  });

  elements.subjectBack.addEventListener("click", () => {
    showScreen("home");
  });

  elements.subjectNext.addEventListener("click", () => {
    showScreen("rules-popup");
  });

  elements.rulesBack.addEventListener("click", () => {
    showScreen("subject-select");
  });

  elements.startQuiz.addEventListener("click", startQuiz);
  elements.nextBtn.addEventListener("click", nextQuestion);
});

// Add correct/incorrect styles to CSS
const style = document.createElement("style");
style.textContent = `
  .option-card.correct {
    background: rgba(76, 175, 80, 0.2) !important;
    border-color: var(--success) !important;
  }
  
  .option-card.correct::after {
    content: '\\f00c' !important;
    font-family: 'Font Awesome 6 Free' !important;
    font-weight: 900 !important;
    color: var(--success) !important;
  }
  
  .option-card.incorrect {
    background: rgba(244, 67, 54, 0.2) !important;
    border-color: var(--danger) !important;
  }
  
  .option-card.incorrect::after {
    content: '\\f00d' !important;
    font-family: 'Font Awesome 6 Free' !important;
    font-weight: 900 !important;
    color: var(--danger) !important;
  }
`;
document.head.appendChild(style);