// login.js

// List of allowed users (can be expanded)
const validUsers = [
    { username: "admin", password: "1234" },
    { username: "user", password: "pass" },
    { username: "student", password: "quiz123" }
  ];
  
  // Get the login form and error display
  const loginForm = document.getElementById("login-form");
  const errorDisplay = document.getElementById("login-error");
  
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    // Check if credentials match a user
    const matchedUser = validUsers.find(
      user => user.username === username && user.password === password
    );
  
    if (matchedUser) {
      // Successful login
      sessionStorage.setItem("loggedIn", "true");
      window.location.href = "quizz.html";
    } else {
      // Show error
      errorDisplay.textContent = "Invalid username or password.";
    }
  });
  


  