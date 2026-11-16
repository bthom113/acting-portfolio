
/*
    Breana Grace Acting Portfolio
    Milestone 2 - Interactive Quiz

    Features:
    - 10-minute countdown timer
    - Automatic grading
    - Individual question feedback
    - Pass/fail results
    - Time tracking
    - Retake quiz functionality
*/

// Get the HTML elements needed for the quiz
const quizForm = document.getElementById("quizForm");
const timerDisplay = document.getElementById("timer");
const resultsDisplay = document.getElementById("results");
const submitButton = document.getElementById("submitBtn");
const resetButton = document.getElementById("resetBtn");

// Quiz settings
const QUIZ_TIME = 600; // 10 minutes in seconds
const PASSING_SCORE = 70;

// Correct answers for all 10 questions
const answerKey = {
    q1: { answer: "b", text: "Understanding characters, conflicts, and story" },
    q2: { answer: "c", text: "Continuity" },
    q3: { answer: "a", text: "Planned movements and positions of actors" },
    q4: { answer: "subtext", text: "Subtext" },
    q5: { answer: "objective", text: "Objective" },
    q6: { answer: ["a", "b", "c"], text: "Voice projection, stage presence, and blocking" },
    q7: { answer: "b", text: "Stage acting is performed for a live audience" },
    q8: { answer: "improvisation", text: "Improvisation" },
    q9: { answer: "a", text: "Cameras capture subtle facial expressions" },
    q10: { answer: "c", text: "Why a character behaves in a particular way" }
};

let timeLeft = QUIZ_TIME;
let startTime = Date.now();
let timerInterval;
let quizSubmitted = false;

// Format seconds as minutes:seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Update the timer every second
function updateTimer() {
    if (quizSubmitted) {
        return;
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeLeft = Math.max(0, QUIZ_TIME - elapsed);

    timerDisplay.textContent =
        `Time Remaining: ${formatTime(timeLeft)}`;

    // Automatically submit when time expires
    if (timeLeft === 0) {
        gradeQuiz(true);
    }
}

// Get the user's answer for a question
function getUserAnswer(questionNumber) {
    const questionName = `q${questionNumber}`;

    // Question 6 allows multiple selections
    if (questionNumber === 6) {
        return Array.from(
            quizForm.querySelectorAll(
                `input[name="${questionName}"]:checked`
            )
        ).map(input => input.value).sort();
    }

    // Fill-in-the-blank questions
    if ([4, 5, 8].includes(questionNumber)) {
        const input = quizForm.elements[questionName];

        return input.value.trim().toLowerCase()
            .replace(/\s+/g, " ");
    }

    // Multiple-choice questions
    const selected = quizForm.querySelector(
        `input[name="${questionName}"]:checked`
    );

    return selected ? selected.value : "";
}

// Check whether the user's answer is correct
function checkAnswer(questionNumber, userAnswer) {
    const correctAnswer = answerKey[`q${questionNumber}`].answer;

    // Compare all selections for question 6
    if (questionNumber === 6) {
        return JSON.stringify(userAnswer) ===
               JSON.stringify(correctAnswer);
    }

    return userAnswer === correctAnswer;
}

// Convert selected answers into readable text
function getAnswerText(questionNumber, userAnswer) {
    if (Array.isArray(userAnswer)) {
        if (userAnswer.length === 0) {
            return "No answer";
        }

        const labels = Array.from(
            quizForm.querySelectorAll(
                `input[name="q${questionNumber}"]`
            )
        );

        return labels
            .filter(input => userAnswer.includes(input.value))
            .map(input => input.parentElement.textContent.trim())
            .join(", ");
    }

    if (!userAnswer) {
        return "No answer";
    }

    if ([4, 5, 8].includes(questionNumber)) {
        return userAnswer;
    }

    const selected = quizForm.querySelector(
        `input[name="q${questionNumber}"]:checked`
    );

    return selected
        ? selected.parentElement.textContent.trim()
        : "No answer";
}

// Grade the quiz and display results
function gradeQuiz(timeExpired = false) {
    if (quizSubmitted) {
        return;
    }

    // Stop the timer and prevent duplicate submissions
    quizSubmitted = true;
    clearInterval(timerInterval);

    const elapsedSeconds = Math.min(
        QUIZ_TIME,
        Math.floor((Date.now() - startTime) / 1000)
    );

    const timeSpent = formatTime(elapsedSeconds);

    let correctCount = 0;
    let feedbackHTML = "";

    // Grade each of the 10 questions
    for (let i = 1; i <= 10; i++) {
        const userAnswer = getUserAnswer(i);
        const isCorrect = checkAnswer(i, userAnswer);

        if (isCorrect) {
            correctCount++;
        }

        const questionScore = isCorrect ? 10 : 0;
        const resultClass = isCorrect ? "correct" : "incorrect";
        const resultText = isCorrect ? "Correct" : "Incorrect";

        feedbackHTML += `
            <div class="question">
                <h3>Question ${i}</h3>
                <p class="${resultClass}">
                    ${resultText} - ${questionScore}/10 points
                </p>
                <p><strong>Your answer:</strong>
                    ${escapeHTML(getAnswerText(i, userAnswer))}
                </p>
                <p><strong>Correct answer:</strong>
                    ${answerKey[`q${i}`].text}
                </p>
            </div>
        `;
    }

    // Calculate final score
    const totalScore = correctCount * 10;
    const passed = totalScore >= PASSING_SCORE;

    const passFailText = passed ? "PASS" : "FAIL";
    const passFailClass = passed ? "correct" : "incorrect";

    // Display results on the same page
    resultsDisplay.innerHTML = `
        <h2>Quiz Results</h2>

        ${timeExpired
            ? "<p class='incorrect'>Time expired! Your quiz was submitted automatically.</p>"
            : ""}

        <h3 class="${passFailClass}">
            Overall Result: ${passFailText}
        </h3>

        <p><strong>Total Score:</strong>
            ${totalScore}/100 (${totalScore}%)
        </p>

        <p><strong>Correct Answers:</strong>
            ${correctCount} out of 10
        </p>

        <p><strong>Time Spent:</strong>
            ${timeSpent}
        </p>

        <h2>Question-by-Question Feedback</h2>
        ${feedbackHTML}
    `;

    resultsDisplay.hidden = false;

    // Prevent further changes after submission
    quizForm.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    });

    submitButton.disabled = true;
    timerDisplay.textContent =
        `Quiz Completed - Time Spent: ${timeSpent}`;

    // Scroll to results
    resultsDisplay.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Escape text before inserting it into HTML
function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

// Handle the Submit Quiz button
quizForm.addEventListener("submit", function(event) {
    event.preventDefault();
    updateTimer();

    if (!quizSubmitted) {
        gradeQuiz();
    }
});

// Reset the entire quiz for another attempt
resetButton.addEventListener("click", function() {
    clearInterval(timerInterval);

    quizForm.reset();

    // Enable all inputs again
    quizForm.querySelectorAll("input").forEach(input => {
        input.disabled = false;
    });

    submitButton.disabled = false;
    quizSubmitted = false;

    // Clear previous results
    resultsDisplay.innerHTML = "";
    resultsDisplay.hidden = true;

    // Restart the timer
    timeLeft = QUIZ_TIME;
    startTime = Date.now();

    timerDisplay.textContent = "Time Remaining: 10:00";

    timerInterval = setInterval(updateTimer, 1000);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Start the timer when the page loads
updateTimer();
timerInterval = setInterval(updateTimer, 1000);
