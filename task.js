const buttons = document.querySelectorAll(".mode-btn");
const playerOptions = document.getElementById("player-options");

const activeModeBtn = document.querySelector(".mode-btn.active");
let selectedMode = activeModeBtn ? activeModeBtn.dataset.mode : "computer";

playerOptions.style.display = "none";

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        selectedMode = btn.dataset.mode;

          if (selectedMode === "multiplayer") {
            playerOptions.style.display = "block";

            selectedPlayers = 2;
            const playerBtns = document.querySelectorAll(".player-btn");
            playerBtns.forEach(b => b.classList.remove("active"));
            document.querySelector('[data-players="2"]').classList.add("active");

        } else {
            playerOptions.style.display = "none";
            selectedPlayers = 2;
        }
    });
});
document.querySelectorAll(".player-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".player-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedPlayers = Number(btn.dataset.players);
    });
});

function startGame() {
    let height = Number(document.getElementById("height").value);
    let width = Number(document.getElementById("width").value);

    if (!height || !width || height <= 3 || width <= 3) {
        alert("Height and Width must be greater than 3!");
        return;
    }

    const allColors = ["red", "blue", "green", "yellow"];

    let chosenColors = [];

    if (selectedMode === "multiplayer") {
        chosenColors = allColors.slice(0, selectedPlayers);
    } else {
        chosenColors = allColors.sort(() => 0.5 - Math.random()).slice(0, 2);
    }

    localStorage.setItem("height", height);
    localStorage.setItem("width", width);
    localStorage.setItem("mode", selectedMode);
    localStorage.setItem("players", selectedPlayers);
    localStorage.setItem("colors", JSON.stringify(chosenColors));

    window.location.href = "grid.html";
}