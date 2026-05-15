const grid = document.getElementById("grid");
const ballSound = new Audio("Click.mp3");
ballSound.volume = 0.99;
const wrongClickSound = new Audio("wrong-click.mp3");
wrongClickSound.volume = 0.99;
wrongClickSound.preload = "auto";
const height = Number(localStorage.getItem("height"));
const width = Number(localStorage.getItem("width"));

if (!height || !width || height<=1 || width<=1) {
    alert("Invalid game data");
}

const mode = localStorage.getItem("mode");
let players = Number(localStorage.getItem("players"));
if (mode === "computer") {
    players = 2;
}
const allColors = [ "#ff4d6d", "#4d7cff","#38d39f", "#ffc857"];
const colors = allColors.slice(0, players);
let currentPlayer = 0;
let gameOver = false;
const winnerSound = new Audio("Game Over.mp3");
const scoreboard = document.getElementById("scoreboard");
const scores = {};
for (const color of colors) {
    scores[color] = 0;
}
grid.innerHTML = "";

const maxGridWidth = 500;
const maxGridHeight = 500;
const cellWidth = Math.floor(maxGridWidth / width);
const cellHeight = Math.floor(maxGridHeight / height);
const cellSize = Math.min(cellWidth, cellHeight);
const ballSize = Math.max(3, Math.floor(cellSize * 0.28));
const ballMargin = Math.max(1, Math.floor(cellSize * 0.04));
grid.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;

const board = [];
const cellElements = [];
for (let i = 0; i < height; i++) {
    board[i] = [];
    cellElements[i] = [];
    for (let j = 0; j < width; j++) {
            board[i][j] = {
            owner: "",
            count: 0
        };
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener("click", (event) => {
            if (gameOver) {
                return;
            }
            if (
                i < 0 || i >= height ||
                j < 0 || j >= width
            ) {
                wrongClickSound.currentTime = 0;
                wrongClickSound.play();
                return;
            }
            const currentColor = colors[currentPlayer];
            if (
                board[i][j].owner === "" ||
                board[i][j].owner === currentColor
            ) {
                addBall(i, j, currentColor);
                checkWinner();
                let nextIndex = currentPlayer;
                if (!gameOver) {
                    const alivePlayers = getAlivePlayers();
                    do {
                        nextIndex = (nextIndex + 1) % colors.length;
                    } while (!alivePlayers.includes(colors[nextIndex]))
                    currentPlayer = nextIndex;         
                }
                if (mode === "computer" && !gameOver && currentPlayer === 1) {
                    setTimeout(() => {
                        computerMove();
                    }, 400);
                }
            }
            else {
                wrongClickSound.currentTime = 0;
                wrongClickSound.play();
            }
        });
        grid.appendChild(cell);
        cellElements[i][j] = cell;
    }
}
function getAlivePlayers() {
    const alive = [];
    for (const color of colors) {
        let hasBall = false;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (board[i][j].owner === color) {
                    hasBall = true;
                    break;
                }
            }
            if (hasBall) break;
        }
        const totalBalls = board.flat().reduce(
            (sum, cell) => sum + cell.count,
            0
        );
        if (hasBall || totalBalls < players) {
            alive.push(color);
        }
    }
    return alive;
}
function addBall(row, col, color) {
    ballSound.currentTime = 0;
    ballSound.play().catch(() => {});
    const cell = board[row][col];

    if (cell.owner !== "" && cell.owner !== color) {
        scores[cell.owner] -= cell.count * 10;  
        scores[color] += cell.count * 10;        
    }
    cell.owner = color;
    cell.count++;
    scores[color] += 10;
    updateCell(row, col);
    updateScoreboard()
    if (cell.count >= getCriticalMass(row, col)) {
        explode(row, col, color);
    }

}

function getCriticalMass(row, col) {
    let neighbors = 0;
    if (row > 0) neighbors++;
    if (row < height - 1) neighbors++;
    if (col > 0) neighbors++;
    if (col < width - 1) neighbors++;
    return neighbors;
}
function explode(row, col, color) {
    const cell = board[row][col];
    if (cell.owner !== "") {
        scores[cell.owner] -= cell.count * 10;
    }
    cell.owner = "";
    cell.count = 0;
    updateCell(row, col);
    const directions = [
        [-1, 0], 
        [1, 0],  
        [0, -1], 
        [0, 1]   
    ];
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (
            nr >= 0 &&
            nr < height &&
            nc >= 0 &&
            nc < width
        ) {
            addBall(nr, nc, color);
        }
    }
    updateScoreboard();
}
function updateCell(row, col) {
    const cellElement = cellElements[row][col];
    const cell = board[row][col];

    cellElement.innerHTML = "";
    const visibleCount = Math.min(cell.count, 4);
    for (let k = 0; k < visibleCount; k++) {
        const ball = document.createElement("div");
        ball.classList.add("ball");
        ball.style.width = `${ballSize}px`;
        ball.style.height = `${ballSize}px`;
        ball.style.margin = `${ballMargin}px`;
        ball.style.backgroundColor = cell.owner;
        ball.style.boxShadow = `0 0 ${Math.max(2, Math.floor(cellSize * 0.2))}px ${cell.owner}`;
        cellElement.appendChild(ball);
    }
}
function getActivePlayers() {
    const activePlayers = [];
    for (const color of colors) {
        let found = false;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (board[i][j].owner === color) {
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (found) {
            activePlayers.push(color);
        }
    }
    return activePlayers;
}
function updateScoreboard() {
    scoreboard.innerHTML = "";
    const colorNames = {};
    colorNames["#ff4d6d"] = "Red Player";
    if (mode === "computer") {
        colorNames["#4d7cff"] = "Computer";
    } else {
        colorNames["#4d7cff"] = "Blue Player";
    }
    colorNames["#38d39f"] = "Green Player";
    colorNames["#ffc857"] = "Yellow Player";
    const activePlayers = getActivePlayers();
    for (const color of colors) {
        const item = document.createElement("div");
        item.className = "score-item";
        item.style.borderLeft = `6px solid ${color}`;
        if (!activePlayers.includes(color) &&
            board.flat().reduce((sum, cell) => sum + cell.count, 0) >= players) {
            item.classList.add("eliminated");
            item.innerHTML =
                `${colorNames[color]}<br>Eliminated`;
        } else {
            item.innerHTML =
                `${colorNames[color]}<br>${scores[color]} Points`;
        }
        scoreboard.appendChild(item);
    }
}
function checkWinner() {
    const owners = new Set();
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const owner = board[i][j].owner;
            if (owner !== "") {
                owners.add(owner);
            }
        }
    }
    const totalBalls = board.flat()
        .reduce((sum, cell) => sum + cell.count, 0);
    if (totalBalls < players) {
        return;
    }
    if (owners.size === 1) {
        if (gameOver) {
            return;
        }
        gameOver = true;
        const activePlayers = getActivePlayers();
        const winnerColor = activePlayers[0];
        let winnerName = "";
        if (winnerColor === "#ff4d6d") {
            winnerName = "Red Player";
        }
        else if (winnerColor === "#4d7cff") {
            winnerName = "Blue Player";
        }
        else if (winnerColor === "#38d39f") {
            winnerName = "Green Player";
        }
        else if (winnerColor === "#ffc857") {
            winnerName = "Yellow Player";
        }
        winnerSound.play();
        setTimeout(() => {
            alert(`Game Over! ${winnerName} wins!`);
            window.location.href = "index.html";
        }, 90);
    }
}
function computerMove() {
    if (gameOver) {
        return;
    }

    const computerColor = colors[currentPlayer];
    let bestMove = null;
    let bestScore = -Infinity;

    function cloneBoard() {
        return board.map(row =>
            row.map(cell => ({
                owner: cell.owner,
                count: cell.count
            }))
        );
    }

    function simulateMove(testBoard, row, col, color) {
        function add(r, c) {
            const cell = testBoard[r][c];
            cell.owner = color;
            cell.count++;

            if (cell.count >= getCriticalMass(r, c)) {
                cell.owner = "";
                cell.count = 0;

                const directions = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ];

                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;

                    if (
                        nr >= 0 && nr < height &&
                        nc >= 0 && nc < width
                    ) {
                        add(nr, nc);
                    }
                }
            }
        }

        add(row, col);
    }
    function evaluateTestBoard(testBoard) {
        let score = 0;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const cell = testBoard[i][j];

                if (cell.owner === computerColor) {
                    score += cell.count * 20 + 10;

                    if (
                        cell.count === getCriticalMass(i, j) - 1
                    ) {
                        score += 100;
                    }
                } else if (cell.owner !== "") {
                    score -= cell.count * 20 + 10;

                    if (
                        cell.count === getCriticalMass(i, j) - 1
                    ) {
                        score -= 100;
                    }
                }
            }
        }

        return score;
    }
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const cell = board[i][j];
            if (
                cell.owner !== "" &&
                cell.owner !== computerColor
            ) {
                continue;
            }

            const testBoard = cloneBoard();
            simulateMove(testBoard, i, j, computerColor);

            let score = evaluateTestBoard(testBoard);

            if (cell.owner === computerColor) {
                score += 30;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = {
                    row: i,
                    col: j
                };
            }
        }
    }
    if (!bestMove) {
        return;
    }
    addBall(bestMove.row, bestMove.col, computerColor);
    checkWinner();
    if (!gameOver) {
        const alivePlayers = getAlivePlayers();
        let nextIndex = currentPlayer;

        do {
            nextIndex = (nextIndex + 1) % colors.length;
        } while (
            !alivePlayers.includes(colors[nextIndex])
        );

        currentPlayer = nextIndex;
    }
}
