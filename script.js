document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const playBtn = document.getElementById("play-btn");
    const gameContainer = document.getElementById("game-container");
    const gameBoard = document.getElementById("game-board");
    const stageNumberEl = document.getElementById("stage-number");
    const timerEl = document.getElementById("timer");
    const livesEl = document.getElementById("lives");
    const hintBtn = document.getElementById("hint-btn");

    const leaderboardBtn = document.getElementById("leaderboard-btn");
    const leaderboardModal = document.getElementById("leaderboard-modal");
    const leaderboardList = document.getElementById("leaderboard-list");
    const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");

    let username = "";
    let stage = 1;
    let lives = 1;
    let playerPos = { x: 0, y: 0 };
    let finishPos = { x: 9, y: 9 };
    let walls = [];
    let timerInterval;
    let canMove = false;
    let hintUsed = false;
    let isScoreSaved = false;
    let isGameOver = false;

    usernameInput.addEventListener("input", () => {
        playBtn.disabled = usernameInput.value.trim() === "";
    });

    playBtn.addEventListener("click", () => {
        username = usernameInput.value.trim();
        document.getElementById("welcome-screen").classList.add("hidden");
        gameContainer.classList.remove("hidden");
        startGame();
    });

    // Start Game
    function startGame() {
        stageNumberEl.textContent = stage;
        livesEl.textContent = lives;
        hintUsed = false;
        hintBtn.disabled = false;
        generateMaze();
        startTimer();
    }

    // Generate Maze
    function generateMaze() {
        gameBoard.innerHTML = "";
        walls = [];
        playerPos = { x: 0, y: Math.floor(Math.random() * 10) };
        finishPos = { x: 9, y: Math.floor(Math.random() * 10) };

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.x = x;
                cell.dataset.y = y;

                if (Math.random() < 0.2 && !(x === 0 || x === 9)) {
                    cell.classList.add("wall");
                    walls.push({ x, y });
                }

                if (x === playerPos.x && y === playerPos.y) {
                    cell.classList.add("player");
                }

                if (x === finishPos.x && y === finishPos.y) {
                    cell.classList.add("finish");
                }

                gameBoard.appendChild(cell);
            }
        }
    }

    // Timer
    function startTimer() {
        let memorizingTime = 10;
        let moveTime = 20;
    
        // Default display
        timerEl.textContent = memorizingTime;
        canMove = false;
    
        document.querySelectorAll(".wall").forEach(wall => wall.style.backgroundColor = "gray");
    
        clearInterval(timerInterval);
    
        // Memorizing time (10s)
        timerInterval = setInterval(() => {
            memorizingTime--;
            timerEl.textContent = memorizingTime;
    
            if (memorizingTime === 0) {
                // Move time (20s) after Memorizing time
                canMove = true;
                document.querySelectorAll(".wall").forEach(wall => wall.style.backgroundColor = "#ddd");
                timerEl.textContent = moveTime;
    
                clearInterval(timerInterval); // Stop timer memorizing
                startMoveTime(moveTime);
            }
        }, 1000);
    }
    
    function startMoveTime(moveTime) {
        timerInterval = setInterval(() => {
            moveTime--;
            timerEl.textContent = moveTime;
    
            if (moveTime === 0) {
                loseLife("Time is up!");
            }
        }, 1000);
    }

    // Controller
    document.addEventListener("keydown", (e) => {
        if (!canMove) return;

        let newX = playerPos.x;
        let newY = playerPos.y;

        if (e.key === "ArrowUp") newY--;
        if (e.key === "ArrowDown") newY++;
        if (e.key === "ArrowLeft") newX--;
        if (e.key === "ArrowRight") newX++;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            if (!walls.some(w => w.x === newX && w.y === newY)) {
                movePlayer(newX, newY);
            } else {
                loseLife("Oops! You ran into a wall!");
            }
        }
    });

    function movePlayer(x, y) {
        document.querySelector(".player").classList.remove("player");
        playerPos = { x, y };
        document.querySelector(`[data-x='${x}'][data-y='${y}']`).classList.add("player");

        if (x === finishPos.x && y === finishPos.y) {
            clearInterval(timerInterval);
            alert("Well done! Time for the next stage.");
            stage++;
            startGame();
        }
    }

    hintBtn.addEventListener("click", () => {
        if (!canMove || hintUsed) return;

        hintUsed = true;
        hintBtn.disabled = true;

        document.querySelectorAll(".wall").forEach(wall => wall.style.backgroundColor = "gray");
        setTimeout(() => {
            document.querySelectorAll(".wall").forEach(wall => wall.style.backgroundColor = "#ddd");
        }, 1000);
    });

    // Game Over - (Pop up)
    function showGameOverPopup() {
        document.getElementById("game-over-username").textContent = username;
        document.getElementById("game-over-stage").textContent = stage;
        document.getElementById("game-over-modal").style.display = "block";

        // Disable some action
        hintBtn.disabled = true;
        document.querySelectorAll(".cell").forEach(cell => cell.style.pointerEvents = "none");
    }
    
    // Lose
    function loseLife(message) {
        if (isGameOver) return; // Do nothing (game over)
    
        alert(message);
        lives--;
        livesEl.textContent = lives;
    
        if (lives === 0 || timer === 0) {
            isGameOver = true; // Set game over (to set do nothing)
            clearInterval(timerInterval);
            showGameOverPopup();
        } else {
            startGame();
        }
    }

    // Save Score
    document.getElementById("save-score-btn").addEventListener("click", () => {
        if (isScoreSaved) return;

        const scoreData = { username, stage };
        let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
        scores.push(scoreData);
        scores.sort((a, b) => b.stage - a.stage);
        localStorage.setItem("leaderboard", JSON.stringify(scores));

        isScoreSaved = true;

        alert("Your score has been saved successfully!");

        // Reset game and back to home screen
        document.getElementById("game-over-modal").style.display = "none";
        document.getElementById("welcome-screen").classList.remove("hidden");
        gameContainer.classList.add("hidden");

        // Reset data game
        stage = 1;
        lives = 5;
        memorizingTime = 10;
        moveTime = 20;
        playerPos = { x: 0, y: 0 };
        finishPos = { x: 9, y: 9 };
        walls = [];
        hintUsed = false;
        isScoreSaved = false;
        isGameOver = false;
        stageNumberEl.textContent = stage;
        livesEl.textContent = lives;
        timerEl.textContent = timer;
    });

    // Leaderboard
    leaderboardBtn.addEventListener("click", () => {
        leaderboardList.innerHTML = ""; 
    
        let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    
        if (scores.length === 0) {
            leaderboardList.innerHTML = "<p>No scores have been saved yet.</p>";
        } else {
            scores.sort((a, b) => b.stage - a.stage); // descending sort
            scores.forEach((score, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${score.username} - Stage ${score.stage}`;
                leaderboardList.appendChild(li);
            });
        }
    
        leaderboardModal.style.display = "block";
    });    
    closeLeaderboardBtn.addEventListener("click", () => {
        leaderboardModal.style.display = "none";
    });
    document.getElementById("clear-leaderboard-btn").addEventListener("click", () => {
        localStorage.removeItem("leaderboard");
        leaderboardList.innerHTML = "<p>No scores have been saved yet.</p>";
        alert("The leaderboard has been cleared!");
    });

    // Instructions
    document.getElementById('instructions-btn').addEventListener('click', function() {
        document.getElementById('instructions-modal').classList.remove('hidden');
        document.getElementById('instructions-modal').classList.add('visible');
    });
    document.getElementById('close-instructions-btn').addEventListener('click', function() {
        document.getElementById('instructions-modal').classList.remove('visible');
        document.getElementById('instructions-modal').classList.add('hidden');
    });
});