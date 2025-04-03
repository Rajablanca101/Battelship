const GRID_SIZE = 6;
const MAX_GUESSES = 20;

let guesses = 0;
let hits = new Set();
let misses = new Set();
let sunkShips = new Set();

// Load ships from JSON file
async function loadShips() {
    try {
        let response = await fetch("battleship.json");
        let data = await response.json();
        return data.ships;
    } catch (error) {
        console.error("Error loading ships:", error);
        return [];
    }
}

// Create board and place ships
function initializeBoard(ships) {
    let board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    let shipCells = new Map();
    let shipData = {};

    ships.forEach(ship => {
        let { name, orientation, size, coords } = ship;
        let [col, row] = coords;
        let positions = [];

        for (let i = 0; i < size; i++) {
            let x = orientation === "horizontal" ? col - 1 + i : col - 1;
            let y = orientation === "vertical" ? row - 1 + i : row - 1;

            if (x >= GRID_SIZE || y >= GRID_SIZE) continue;

            board[y][x] = name;
            positions.push(`${x},${y}`);
        }

        positions.forEach(pos => shipCells.set(pos, name));
        shipData[name] = { size, hits: 0, positions };
    });

    return { board, shipCells, shipData };
}

// Handle cell clicks
function handleClick(x, y, gameState) {
    let pos = `${x},${y}`;
    if (hits.has(pos) || misses.has(pos)) return;

    guesses++;
    let hitShip = gameState.shipCells.get(pos);
    let cell = document.querySelector(`[data-x='${x}'][data-y='${y}']`);

    if (hitShip) {
        hits.add(pos);
        gameState.shipData[hitShip].hits++;
        cell.classList.add("hit");

        if (gameState.shipData[hitShip].hits === gameState.shipData[hitShip].size) {
            sunkShips.add(hitShip);
            alert(`You sank ${hitShip}!`);
        } else {
            alert("Hit!");
        }
    } else {
        misses.add(pos);
        cell.classList.add("miss");
        alert("Miss!");
    }

    if (sunkShips.size === Object.keys(gameState.shipData).length || guesses >= MAX_GUESSES) {
        alert("Game Over!");
    }
}

// Start game and create board
async function startGame() {
    let ships = await loadShips();
    if (ships.length === 0) return;

    let gameState = initializeBoard(ships);
    let boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener("click", () => handleClick(x, y, gameState));
            boardElement.appendChild(cell);
        }
    }
}

document.addEventListener("DOMContentLoaded", startGame);