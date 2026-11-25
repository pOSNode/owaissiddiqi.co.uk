const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];

// Each extra round keeps its questions in its own file and is picked with ?round=<key>; no key plays the medical round
const ROUNDS = {
    compbio: { file: 'questions-compbio.json', title: 'Computational Biology Quiz' },
};
const roundKey = new URLSearchParams(location.search).get('round');
const round = Object.hasOwn(ROUNDS, roundKey) ? ROUNDS[roundKey] : undefined;
if (round) {
    document.getElementById('quiz-h').textContent = round.title;
    document.title = `${round.title} – Owais Siddiqi`;
}

fetch(round ? round.file : 'questions.json')
    .then((res) => {
        return res.json();
    })
    .then((loadedQuestions) => {
        questions = loadedQuestions;
        startGame();
    })
    .catch((err) => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_BONUS = 10;
// Set once per game to the number of domains represented, so every round covers each domain exactly once
let MAX_QUESTIONS = 10;

// Picks one random question from each domain so every round gets a guaranteed spread of topics
function buildRound(allQuestions) {
    const byDomain = {};
    allQuestions.forEach((q) => {
        const key = q.domain || 'General';
        (byDomain[key] = byDomain[key] || []).push(q);
    });

    const round = Object.keys(byDomain).map((domain) => {
        const pool = byDomain[domain];
        return pool[Math.floor(Math.random() * pool.length)];
    });

    // Shuffle so the domains don't always appear in the same order
    for (let i = round.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [round[i], round[j]] = [round[j], round[i]];
    }

    return round;
}

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = buildRound(questions);
    MAX_QUESTIONS = availableQuesions.length;
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        //go to the end page
        return window.location.assign('./end.html' + location.search);
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score;
};