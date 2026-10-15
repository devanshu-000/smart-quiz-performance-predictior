// --- STATE MANAGEMENT ---
let currentUser = JSON.parse(localStorage.getItem('quiz_current_user')) || null;
let users = JSON.parse(localStorage.getItem('quiz_users')) || [];
let attempts = JSON.parse(localStorage.getItem('quiz_attempts')) || [];

// Active Quiz State
let activeQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeLeftSeconds = 0;

// Chart instances
let trendChartInstance = null;
let subjectChartInstance = null;
let analysisDetailedChartInstance = null;
let radarChartInstance = null;

// --- DOM ELEMENTS ---
const authContainer = document.getElementById('auth-container');
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const appContainer = document.getElementById('app-container');
const logoutBtn = document.getElementById('logout-btn');
const userDisplayName = document.getElementById('user-display-name');
const userRollDisplay = document.getElementById('user-roll-display');
const themeToggle = document.getElementById('theme-toggle');
const pageTitle = document.getElementById('page-title');

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuthState();
    setupEventListeners();
});

function initTheme() {
    const savedTheme = localStorage.getItem('quiz_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

function checkAuthState() {
    if (currentUser) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userDisplayName.textContent = currentUser.name;
        userRollDisplay.textContent = `Roll: ${currentUser.roll || 'N/A'} | ID: ${currentUser.studentId || 'N/A'}`;
        loadDashboardData();
        renderQuizHub();
    } else {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        loginBox.classList.remove('hidden');
        signupBox.classList.add('hidden');
    }
}

// --- EVENT LISTENERS & NAVIGATION ---
function setupEventListeners() {
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.classList.add('hidden');
        signupBox.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('quiz_current_user', JSON.stringify(currentUser));
            checkAuthState();
        } else {
            alert('Invalid email or password.');
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const roll = document.getElementById('signup-roll').value.trim();
        const studentId = document.getElementById('signup-id').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (users.some(u => u.email === email)) {
            alert('An account with this email already exists.');
            return;
        }

        const newUser = { id: 'user_' + Date.now(), name, roll, studentId, email, password };
        users.push(newUser);
        localStorage.setItem('quiz_users', JSON.stringify(users));

        currentUser = newUser;
        localStorage.setItem('quiz_current_user', JSON.stringify(currentUser));
        checkAuthState();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('quiz_current_user');
        checkAuthState();
    });

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quiz_theme', newTheme);
        updateThemeIcon(newTheme);
        updateChartsTheme();
    });

    // Sidebar navigation
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));
            li.classList.add('active');

            const targetViewId = li.getAttribute('data-target');
            switchView(targetViewId);
        });
    });

    document.getElementById('next-question-btn').addEventListener('click', handleNextQuestion);
    document.getElementById('back-to-hub-btn').addEventListener('click', () => {
        switchView('dashboard-view');
        document.querySelector('.nav-links li[data-target="dashboard-view"]').classList.add('active');
        document.querySelector('.nav-links li[data-target="quiz-hub-view"]').classList.remove('active');
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    const titles = {
        'dashboard-view': 'Dashboard Overview',
        'quiz-hub-view': 'Quiz Hub',
        'analysis-view': 'Performance Analysis',
        'leaderboard-view': 'Student Leaderboard',
        'history-view': 'Quiz History & Student Records'
    };
    pageTitle.textContent = titles[viewId] || 'QuizMaster AI';

    if (viewId === 'dashboard-view') loadDashboardData();
    if (viewId === 'analysis-view') renderAnalysisCharts();
    if (viewId === 'leaderboard-view') renderLeaderboardTable();
    if (viewId === 'history-view') renderHistoryTable();
}

// --- PERFORMANCE CLASSIFICATION HELPER ---
function getPerformanceRating(scorePercent) {
    if (scorePercent >= 90) return { label: '🌟 Star Performer', class: 'success' };
    if (scorePercent >= 75) return { label: '🔥 Nice Work', class: 'success' };
    if (scorePercent >= 50) return { label: '👍 Good', class: 'warning' };
    return { label: '⚠️ Need Improvement', class: 'danger' };
}

// --- DASHBOARD & ANALYTICS ---
function getUserAttempts() {
    if (!currentUser) return [];
    return attempts.filter(a => a.userId === currentUser.id);
}

function loadDashboardData() {
    const userAttempts = getUserAttempts();
    const total = userAttempts.length;

    document.getElementById('stat-total').textContent = total;

    if (total > 0) {
        const scores = userAttempts.map(a => a.scorePercent);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / total);
        const high = Math.max(...scores);

        document.getElementById('stat-avg').textContent = avg + '%';
        document.getElementById('stat-high').textContent = high + '%';

        renderTrendChart(userAttempts);
        renderSubjectChart(userAttempts);
        calculatePrediction(userAttempts);
        generateRecommendations(userAttempts);
    } else {
        document.getElementById('stat-avg').textContent = '0%';
        document.getElementById('stat-high').textContent = '0%';
        document.getElementById('prediction-score-val').textContent = '--';
        document.getElementById('prediction-text').textContent = 'Complete at least 2 quizzes to unlock intelligent score forecasts and personalized trend projections.';
        document.getElementById('recommendations-list').innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Complete quizzes to get tailored topic recommendations based on your weak points.</p>';
    }
}

// --- CHARTS & PREDICTION LOGIC ---
function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#94a3b8' : '#64748b',
        grid: isDark ? '#334155' : '#e2e8f0',
        primary: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    };
}

function updateChartsTheme() {
    if (document.getElementById('dashboard-view').classList.contains('active')) {
        const userAttempts = getUserAttempts();
        if (userAttempts.length > 0) {
            renderTrendChart(userAttempts);
            renderSubjectChart(userAttempts);
        }
    } else if (document.getElementById('analysis-view').classList.contains('active')) {
        renderAnalysisCharts();
    }
}

function renderTrendChart(userAttempts) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const colors = getChartColors();

    const labels = userAttempts.map((a, i) => `Attempt ${i + 1}`);
    const data = userAttempts.map(a => a.scorePercent);

    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score %',
                data: data,
                borderColor: colors.primary,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
                y: { min: 0, max: 100, ticks: { color: colors.text }, grid: { color: colors.grid } }
            }
        }
    });
}

function renderSubjectChart(userAttempts) {
    const ctx = document.getElementById('subjectChart').getContext('2d');
    const colors = getChartColors();

    const subjectScores = {};
    userAttempts.forEach(a => {
        if (!subjectScores[a.subject]) subjectScores[a.subject] = { total: 0, count: 0 };
        subjectScores[a.subject].total += a.scorePercent;
        subjectScores[a.subject].count += 1;
    });

    const subjects = Object.keys(subjectScores);
    const averages = subjects.map(s => Math.round(subjectScores[s].total / subjectScores[s].count));

    if (subjectChartInstance) subjectChartInstance.destroy();

    subjectChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [{
                label: 'Average Score %',
                data: averages,
                backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: colors.text }, grid: { display: false } },
                y: { min: 0, max: 100, ticks: { color: colors.text }, grid: { color: colors.grid } }
            }
        }
    });
}

function calculatePrediction(userAttempts) {
    const predValEl = document.getElementById('prediction-score-val');
    const predTextEl = document.getElementById('prediction-text');

    if (userAttempts.length < 2) {
        predValEl.textContent = '--';
        predTextEl.textContent = 'Complete at least 2 quizzes to unlock intelligent score forecasts and personalized trend projections.';
        return;
    }

    const scores = userAttempts.map(a => a.scorePercent);
    const n = scores.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += scores[i];
        sumXY += i * scores[i];
        sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextScore = Math.round(slope * n + intercept);
    const clampedScore = Math.max(0, Math.min(100, nextScore));

    predValEl.textContent = clampedScore + '%';

    if (slope > 0) {
        predTextEl.textContent = `Based on your recent upward trend (+${Math.round(slope)}% per attempt), your predicted score for your next quiz is ${clampedScore}%. Keep up the momentum!`;
    } else if (slope < 0) {
        predTextEl.textContent = `Your scores show a slight downward trend. Focus on reviewing missed topics before your next attempt to elevate your performance to around ${clampedScore}%.`;
    } else {
        predTextEl.textContent = `Your performance is currently stable. Expecting around ${clampedScore}% on your next assessment attempt.`;
    }
}

function generateRecommendations(userAttempts) {
    const container = document.getElementById('recommendations-list');
    container.innerHTML = '';

    const wrongTopics = [];
    userAttempts.forEach(a => {
        if (a.scorePercent < 80) {
            wrongTopics.push(a.subject);
        }
    });

    if (wrongTopics.length === 0) {
        container.innerHTML = '<p style="color: var(--success); font-size: 0.9rem; font-weight: 500;"><i class="fa-solid fa-circle-check"></i> Excellent work! You are performing strongly across all attempted subjects.</p>';
        return;
    }

    const uniqueWeak = [...new Set(wrongTopics)];
    uniqueWeak.forEach(subject => {
        const item = document.createElement('div');
        item.className = 'rec-item';
        item.innerHTML = `
            <div class="rec-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div>
                <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.15rem;">Review ${subject} Fundamentals</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Scores in this area indicate potential gaps. Revisit core concepts and definitions.</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// --- QUIZ HUB & ENGINE ---
function getDifficultyBadgeClass(diff) {
    switch(diff) {
        case 'Low': return 'success';
        case 'Mid': return 'info';
        case 'High': return 'warning';
        case 'Extream': return 'danger';
        default: return 'info';
    }
}

function renderQuizHub() {
    const grid = document.getElementById('quiz-categories-grid');
    grid.innerHTML = '';

    quizDatabase.forEach(quiz => {
        const badgeClass = getDifficultyBadgeClass(quiz.difficulty);
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <div>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <span class="badge ${badgeClass}">${quiz.difficulty} Level</span>
                    <span class="badge warning">${quiz.subject}</span>
                </div>
                <h3>${quiz.title}</h3>
                <p>${quiz.description}</p>
            </div>
            <div>
                <div class="quiz-meta">
                    <span><i class="fa-regular fa-question-circle"></i> ${quiz.questions.length} Questions</span>
                    <span><i class="fa-regular fa-clock"></i> ${quiz.questions.length * 1} mins</span>
                </div>
                <button class="btn" onclick="launchQuiz('${quiz.id}')">Start Quiz</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function launchQuiz(quizId) {
    activeQuiz = quizDatabase.find(q => q.id === quizId);
    if (!activeQuiz) return;

    currentQuestionIndex = 0;
    userAnswers = new Array(activeQuiz.questions.length).fill(null);
    timeLeftSeconds = activeQuiz.questions.length * 60;

    document.getElementById('active-quiz-title').textContent = `${activeQuiz.title} (${activeQuiz.difficulty})`;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('active-quiz-view').classList.add('active');

    renderQuestion();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeftSeconds--;
        updateTimerDisplay();

        if (timeLeftSeconds <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeftSeconds / 60);
    const secs = timeLeftSeconds % 60;
    document.getElementById('time-left').textContent =
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderQuestion() {
    const q = activeQuiz.questions[currentQuestionIndex];
    document.getElementById('question-progress').textContent = `Question ${currentQuestionIndex + 1} of ${activeQuiz.questions.length}`;
    document.getElementById('question-text').textContent = q.q;

    const optionsList = document.getElementById('options-container');
    optionsList.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const item = document.createElement('div');
        item.className = 'option-item';
        if (userAnswers[currentQuestionIndex] === idx) {
            item.classList.add('selected');
        }
        item.innerHTML = `
            <input type="radio" name="quiz-option" ${userAnswers[currentQuestionIndex] === idx ? 'checked' : ''}>
            <span>${opt}</span>
        `;
        item.addEventListener('click', () => {
            userAnswers[currentQuestionIndex] = idx;
            document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            item.querySelector('input').checked = true;
        });
        optionsList.appendChild(item);
    });

    const nextBtn = document.getElementById('next-question-btn');
    if (currentQuestionIndex === activeQuiz.questions.length - 1) {
        nextBtn.textContent = 'Submit Quiz';
    } else {
        nextBtn.textContent = 'Next Question';
    }
}

function handleNextQuestion() {
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please select an option before proceeding.');
        return;
    }

    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        clearInterval(timerInterval);
        finishQuiz();
    }
}

function finishQuiz() {
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) {
            correctCount++;
        }
    });

    const totalQ = activeQuiz.questions.length;
    const scorePercent = Math.round((correctCount / totalQ) * 100);
    const rating = getPerformanceRating(scorePercent);

    const newAttempt = {
        id: 'att_' + Date.now(),
        userId: currentUser.id,
        studentName: currentUser.name,
        rollNumber: currentUser.roll || 'N/A',
        studentId: currentUser.studentId || 'N/A',
        quizTitle: activeQuiz.title,
        subject: activeQuiz.subject,
        difficulty: activeQuiz.difficulty,
        score: correctCount,
        total: totalQ,
        scorePercent: scorePercent,
        rating: rating.label,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    attempts.push(newAttempt);
    localStorage.setItem('quiz_attempts', JSON.stringify(attempts));

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('quiz-result-view').classList.add('active');

    document.getElementById('result-score-circle').textContent = scorePercent + '%';
    document.getElementById('result-title').textContent = scorePercent >= 75 ? 'Outstanding Performance!' : 'Quiz Completed!';

    document.getElementById('performance-tag-container').innerHTML = `
        <span class="badge ${rating.class}" style="font-size: 0.9rem; padding: 0.4rem 1rem;">Performance: ${rating.label}</span>
    `;

    document.getElementById('result-subtitle').textContent = `You scored ${correctCount} out of ${totalQ} correct answers (${scorePercent}%). Verified answers correctly graded!`;
}

// --- ANALYSIS, LEADERBOARD & HISTORY VIEWS ---
function renderAnalysisCharts() {
    const userAttempts = getUserAttempts();
    const colors = getChartColors();

    const ctx1 = document.getElementById('analysisDetailedChart').getContext('2d');
    if (analysisDetailedChartInstance) analysisDetailedChartInstance.destroy();

    analysisDetailedChartInstance = new Chart(ctx1, {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Speed', 'Consistency', 'Subject Mastery', 'Retention'],
            datasets: [{
                label: 'Performance Metrics',
                data: userAttempts.length > 0 ? [
                    Math.round(userAttempts.reduce((a,b)=>a+b.scorePercent,0)/userAttempts.length),
                    85, 78, 80, 82
                ] : [50, 50, 50, 50, 50],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: colors.primary,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: { color: colors.grid },
                    grid: { color: colors.grid },
                    ticks: { display: false, max: 100 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    const ctx2 = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();

    const subjectScores = {};
    userAttempts.forEach(a => {
        if (!subjectScores[a.subject]) subjectScores[a.subject] = { total: 0, count: 0 };
        subjectScores[a.subject].total += a.scorePercent;
        subjectScores[a.subject].count += 1;
    });

    const subjects = Object.keys(subjectScores).length > 0 ? Object.keys(subjectScores) : ['Programming', 'Algorithms', 'Web Dev'];
    const dataVals = Object.keys(subjectScores).length > 0 ? subjects.map(s => Math.round(subjectScores[s].total / subjectScores[s].count)) : [60, 70, 65];

    radarChartInstance = new Chart(ctx2, {
        type: 'polarArea',
        data: {
            labels: subjects,
            datasets: [{
                data: dataVals,
                backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: colors.text } } }
        }
    });
}

function renderLeaderboardTable() {
    const tbody = document.getElementById('leaderboard-table-body');
    tbody.innerHTML = '';

    const studentMap = {};

    attempts.forEach(att => {
        const studentKey = (att.rollNumber && att.rollNumber !== 'PENDING') ? att.rollNumber : att.studentName;
        if (!studentMap[studentKey]) {
            studentMap[studentKey] = {
                name: att.studentName,
                roll: att.rollNumber,
                studentId: att.studentId,
                totalQuizzes: 0,
                totalScorePercent: 0,
                highestScore: 0
            };
        }
        studentMap[studentKey].totalQuizzes += 1;
        studentMap[studentKey].totalScorePercent += att.scorePercent;
        if (att.scorePercent > studentMap[studentKey].highestScore) {
            studentMap[studentKey].highestScore = att.scorePercent;
        }
    });

    const leaderboardData = Object.values(studentMap)
        .map(s => ({
            ...s,
            avgScore: Math.round(s.totalScorePercent / s.totalQuizzes)
        }))
        .sort((a, b) => b.avgScore - a.avgScore || b.totalQuizzes - a.totalQuizzes);

    if (leaderboardData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No leaderboard records available yet. Take a quiz to appear here!</td></tr>';
        return;
    }

    leaderboardData.forEach((student, index) => {
        const rank = index + 1;
        let rankDisplay = `${rank}`;
        if (rank === 1) rankDisplay = '🥇 1st';
        else if (rank === 2) rankDisplay = '🥈 2nd';
        else if (rank === 3) rankDisplay = '🥉 3rd';

        const rating = getPerformanceRating(student.avgScore);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${rankDisplay}</strong></td>
            <td>${student.name}</td>
            <td><code>${student.roll}</code></td>
            <td><code>${student.studentId}</code></td>
            <td>${student.totalQuizzes}</td>
            <td><strong>${student.avgScore}%</strong></td>
            <td><span class="badge ${rating.class}">${rating.label}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';

    if (attempts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No quiz attempts recorded yet.</td></tr>';
        return;
    }

    attempts.slice().reverse().forEach(att => {
        const badgeClass = att.scorePercent >= 80 ? 'success' : (att.scorePercent >= 50 ? 'warning' : 'danger');
        const diffBadge = getDifficultyBadgeClass(att.difficulty || 'Mid');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${att.studentName}</strong><br><small style="color: var(--text-muted);">Roll: ${att.rollNumber} | ID: ${att.studentId}</small></td>
            <td><strong>${att.quizTitle}</strong><br><small style="color: var(--text-muted);">${att.subject}</small></td>
            <td><span class="badge ${diffBadge}">${att.difficulty || 'Mid'}</span></td>
            <td>${att.score} / ${att.total}</td>
            <td><span class="badge ${badgeClass}">${att.scorePercent}%</span></td>
            <td><span class="badge ${badgeClass}">${att.rating || 'Good'}</span></td>
            <td>${att.date}</td>
        `;
        tbody.appendChild(row);
    });
}
