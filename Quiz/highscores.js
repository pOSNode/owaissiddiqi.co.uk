const highScoresList = document.getElementById('highScoresList');
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

if (highScores.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No scores yet — play a round to set the first high score!';
    highScoresList.appendChild(empty);
} else {
    highScores.forEach((score, i) => {
        const row = document.createElement('div');
        row.className = 'high-score';

        const rank = document.createElement('span');
        rank.className = 'rank';
        rank.textContent = i + 1;

        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = score.round === 'compbio' ? `${score.name} · Comp bio` : score.name;

        const points = document.createElement('span');
        points.className = 'score';
        points.textContent = score.score;

        row.append(rank, name, points);
        highScoresList.appendChild(row);
    });
}
