const username = document.getElementById('username');
const nameError = document.getElementById('nameError');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');

const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const MAX_HIGH_SCORES = 5;

finalScore.innerText = mostRecentScore;

username.addEventListener('input', () => {
    nameError.classList.remove('show');
});

username.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveHighScore();
    }
});

saveScoreBtn.addEventListener('click', saveHighScore);

function saveHighScore() {
    const name = username.value.trim();
    if (!name) {
        nameError.classList.add('show');
        username.focus();
        return;
    }

    const score = {
        score: mostRecentScore,
        name: name,
    };
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);

    localStorage.setItem('highScores', JSON.stringify(highScores));
    window.location.assign('./');
}
