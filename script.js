// script.js
const subjectsPerClass = {
    1: ["Math", "English", "EVS", "Hindi", "Computer", "Art"],
    2: ["Math", "English", "EVS", "Hindi", "Computer", "Art"],
    3: ["Math", "English", "Science", "Hindi", "Computer", "EVS"],
    4: ["Math", "English", "Science", "Hindi", "Computer", "EVS"],
    5: ["Math", "English", "Science", "Hindi", "Computer", "EVS"],
    6: ["Math", "English", "Physics", "Biology", "Chemistry", "EVS"],
    7: ["Math", "English", "Physics", "Biology", "Chemistry", "Geography"],
    8: ["Math", "English", "Physics", "Biology", "Chemistry", "Civics"],
    9: ["Math", "English", "Physics", "Biology", "Chemistry", "History"],
    10: ["Math", "English", "Physics", "Biology", "Chemistry", "Geography"]
  };
  
  const chaptersPerSubject = {
    1: { EVS: 3, Math: 2, English: 2, Hindi: 2, Computer: 1, Art: 1 },
    2: { EVS: 4, Math: 2, English: 2, Hindi: 2, Computer: 1, Art: 1 },
    3: { Science: 4, EVS: 3, Math: 3, English: 2, Hindi: 2, Computer: 2 },
    4: { Science: 4, EVS: 4, Math: 3, English: 3, Hindi: 3, Computer: 2 },
    5: { Science: 5, EVS: 4, Math: 3, English: 3, Hindi: 3, Computer: 2 },
    6: { Physics: 5, Biology: 4, Chemistry: 3, Math: 3, English: 2, EVS: 3 },
    7: { Physics: 5, Biology: 4, Chemistry: 4, Math: 3, English: 2, Geography: 2 },
    8: { Physics: 5, Biology: 4, Chemistry: 4, Math: 3, English: 2, Civics: 2 },
    9: { Physics: 6, Biology: 4, Chemistry: 4, Math: 3, English: 2, History: 3 },
    10: { Physics: 6, Biology: 5, Chemistry: 4, Math: 3, English: 2, Geography: 3 }
  };
  
  let selectedClass = null;
  let selectedSubject = null;
  let selectedChapter = null;
  let questions = [];
  let selectedQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let selectedOption = null;
  let isProcessing = false;
  let usedQuestionIndices = new Set();
  
  let timerInterval;
  let elapsedSeconds = 0;
  
  const elements = {
    home: document.getElementById("home"),
    subjectSelect: document.getElementById("subject-select"),
    chapterSelect: document.getElementById("chapter-select"),
    rulesPopup: document.getElementById("rules-popup"),
    quizContainer: document.getElementById("quiz-container"),
    resultContainer: document.getElementById("result-container"),
    classOptions: document.getElementById("class-options"),
    subjectOptions: document.getElementById("subject-options"),
    chapterOptions: document.getElementById("chapter-options"),
    classNext: document.getElementById("class-next"),
    subjectNext: document.getElementById("subject-next"),
    subjectBack: document.getElementById("subject-back"),
    chapterNext: document.getElementById("chapter-next"),
    chapterBack: document.getElementById("chapter-back"),
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
    selectedClassDisplay: document.getElementById("selected-class-display"),
    selectedSubjectDisplay: document.getElementById("selected-subject-display"),
    chapterClassDisplay: document.getElementById("chapter-class-display"),
    timerContainer: document.getElementById("timer-container"),
    timerSeconds: document.getElementById("timer-seconds"),
    clockIcon: document.querySelector(".clock-icon")
  };
  
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
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
    return fetch(path).then(response => {
      if (!response.ok) throw new Error("File not found");
      return response.json();
    });
  }
  
  function getRandomQuestionIndex(total) {
    if (usedQuestionIndices.size >= total) usedQuestionIndices.clear();
    let i;
    do {
      i = Math.floor(Math.random() * total);
    } while (usedQuestionIndices.has(i));
    usedQuestionIndices.add(i);
    return i;
  }
  
  function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      updateTimerDisplay();
    }, 1000);
  }
  
  function updateTimerDisplay() {
    const time = `${elapsedSeconds}s`;
    elements.timerSeconds.textContent = time;
  
    if (elapsedSeconds <= 29) {
      elements.timerSeconds.style.color = "var(--success)";
      elements.clockIcon.style.color = "var(--success)";
    } else if (elapsedSeconds <= 49) {
      elements.timerSeconds.style.color = "var(--warning)";
      elements.clockIcon.style.color = "var(--warning)";
    } else {
      elements.timerSeconds.style.color = "var(--danger)";
      elements.clockIcon.style.color = "var(--danger)";
    }
  }
  
  function stopTimer() {
    clearInterval(timerInterval);
  }
  
  function startQuiz() {
    const path = `questions/class${selectedClass}${selectedSubject.toLowerCase()}${selectedChapter}.json`;
    elements.questionElement.textContent = "Loading questions...";
    elements.optionsContainer.innerHTML = "";
    elements.nextBtn.disabled = true;
    usedQuestionIndices.clear();
  
    loadJSON(path)
      .then(data => {
        questions = data;
        selectedQuestions = [];
  
        while (selectedQuestions.length < Math.min(10, questions.length)) {
          const idx = getRandomQuestionIndex(questions.length);
          const q = questions[idx];
          if (!selectedQuestions.includes(q)) selectedQuestions.push(q);
        }
  
        currentIndex = 0;
        score = 0;
        isProcessing = false;
        elements.quizSubjectName.textContent = `${selectedSubject} - Ch ${selectedChapter}`;
        elements.currentQuestion.textContent = "1";
        elements.totalQuestions.textContent = selectedQuestions.length;
        document.querySelector(".progress-fill").style.width = "0%";
        showScreen("quiz-container");
        showQuestion();
      })
      .catch(() => {
        alert("Could not load questions.");
        showScreen("home");
      });
  }
  
  function showQuestion() {
    const q = selectedQuestions[currentIndex];
    elements.questionElement.textContent = q.question;
    elements.optionsContainer.innerHTML = "";
    selectedOption = null;
    elements.nextBtn.disabled = true;
    isProcessing = false;
    elements.currentQuestion.textContent = currentIndex + 1;
    const progress = (currentIndex / selectedQuestions.length) * 100;
    document.querySelector(".progress-fill").style.width = `${progress}%`;
  
    q.options.forEach((opt, idx) => {
      const card = document.createElement("div");
      card.className = "option-card";
      card.innerHTML = `<span>${opt}</span>`;
      card.addEventListener("click", () => {
        if (isProcessing) return;
        document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedOption = idx;
        elements.nextBtn.disabled = false;
      });
      elements.optionsContainer.appendChild(card);
    });
  
    startTimer();
  }
  
  function nextQuestion() {
    if (isProcessing || selectedOption === null) {
      if (selectedOption === null) alert("Please select an answer.");
      return;
    }
  
    isProcessing = true;
    elements.nextBtn.disabled = true;
    stopTimer();
  
    const correct = selectedQuestions[currentIndex].correctIndex;
    const selectedCard = elements.optionsContainer.children[selectedOption];
  
    if (selectedOption === correct) {
      selectedCard.classList.add("correct");
      score = Math.min(score + 10, selectedQuestions.length * 10);
    } else {
      selectedCard.classList.add("incorrect");
      elements.optionsContainer.children[correct].classList.add("correct");
    }
  
    document.querySelectorAll(".option-card").forEach(c => c.style.pointerEvents = "none");
  
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
    elements.resultSubject.textContent = selectedSubject;
    elements.scoreValue.textContent = score;
    elements.scoreMax.textContent = total;
    elements.scorePercent.textContent = percent;
  
    const circle = document.querySelector(".progress-ring__circle--fill");
    const r = circle.r.baseVal.value;
    const c = 2 * Math.PI * r;
    const offset = c - (percent / 100) * c;
  
    circle.style.strokeDasharray = `${c} ${c}`;
    circle.style.strokeDashoffset = c;
  
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 100);
  
    showScreen("result-container");
  }
  
  document.addEventListener("DOMContentLoaded", () => {
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
  
    elements.subjectBack.addEventListener("click", () => showScreen("home"));
  
    elements.subjectNext.addEventListener("click", () => {
      const chapterCount = (chaptersPerSubject[selectedClass] || {})[selectedSubject] || 1;
      const chapters = Array.from({ length: chapterCount }, (_, i) => `Chapter ${i + 1}`);
      renderOptions("chapter-options", chapters, chapter => {
        selectedChapter = chapter.split(" ")[1]; // "Chapter 1" → "1"
        elements.chapterNext.disabled = false;
      });
      elements.selectedSubjectDisplay.textContent = selectedSubject;
      elements.chapterClassDisplay.textContent = selectedClass;
      showScreen("chapter-select");
    });
  
    elements.chapterBack.addEventListener("click", () => showScreen("subject-select"));
    elements.chapterNext.addEventListener("click", () => showScreen("rules-popup"));
    elements.rulesBack.addEventListener("click", () => showScreen("chapter-select"));
    elements.startQuiz.addEventListener("click", startQuiz);
    elements.nextBtn.addEventListener("click", nextQuestion);
  });
  
  // Mark correct/incorrect style
  const style = document.createElement("style");
  style.textContent = `
  .option-card.correct {
    background: rgba(76, 175, 80, 0.2) !important;
    border-color: var(--success) !important;
  }
  .option-card.correct::after {
    content: '\\f00c';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    color: var(--success);
  }
  .option-card.incorrect {
    background: rgba(244, 67, 54, 0.2) !important;
    border-color: var(--danger) !important;
  }
  .option-card.incorrect::after {
    content: '\\f00d';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    color: var(--danger);
  }`;
  document.head.appendChild(style);
  