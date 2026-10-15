# Smart Quiz Performance Predictor

A professional, fully functional, and modular Smart Quiz web platform built with HTML, CSS, JavaScript, and Java. Designed for college project demonstrations with student credential verification (Roll No, Name, Student ID), persistent storage, secure authentication, difficulty levels (Low, Mid, High, Extream), interactive charts, timer-based quizzes, performance ratings (🌟 Star Performer, 🔥 Nice Work, 👍 Good, ⚠️ Need Improvement), AI score predictions, and a student leaderboard.

## File Structure

```text
SmartQuizProject/
│
├── index.html              # Main HTML entry point & Student Info modal
├── README.md               # Project documentation & instructions
│
├── css/
│   └── style.css           # Modular stylesheet with light/dark theme support
│
├── js/
│   ├── quiz-data.js        # Quiz questions categorized by difficulty (Low, Mid, High, Extream)
│   └── app.js              # Application logic, student credentials, timer, performance rating, leaderboard, and Chart.js integration
│
└── java/
    └── QuizPredictor.java  # Java backend helper implementing linear regression score prediction
```

## Features

1. **Student Verification Prompt:** Prior to starting any quiz, users provide their **Student Name**, **Roll Number**, and **Student ID**, which are persistently saved with every quiz attempt.
2. **Performance Ratings:** Instant categorization upon finishing quizzes:
   - 🌟 **Star Performer** (90%+)
   - 🔥 **Nice Work** (75% - 89%)
   - 👍 **Good** (50% - 74%)
   - ⚠️ **Need Improvement** (<50%)
3. **Student Leaderboard:** Displays top-performing students ranked by average scores, total quizzes taken, and performance tags.
4. **Modular Architecture:** Clean separation of concerns with dedicated files for HTML, CSS, JavaScript modules, and Java backend logic.
5. **Difficulty Tiers:** Quizzes categorized into **Low**, **Mid**, **High**, and **Extream** levels.
6. **Beautiful UI & Dark Mode:** Modern card-based design with smooth animations, Google Fonts, FontAwesome icons, and persistent Light/Dark mode toggle.
7. **User Authentication & History:** Functional registration, login, logout, session persistence, and comprehensive attempt logs.
8. **AI & Java Score Prediction:** Linear trend-based predictive modeling forecasting your next quiz score.

## Installation & Running Instructions

1. Ensure you have a modern web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
2. Clone or download this repository to your local machine.
3. Open the project folder and double-click `index.html` (or run via Live Server in VS Code).
4. To run the Java backend predictor helper:
   ```bash
   javac java/QuizPredictor.java
   java java.QuizPredictor
   ```

---
*Developed for professional college demonstration.*
