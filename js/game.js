const boardEl = document.getElementById("game");
let selected = null;
let turn = "white";
let mode = "single";
let gameDifficulty = "medium";
let moveCount = 0;

let whiteTime = 300;
let blackTime = 300;
let timerRunning = false;

const pieces = {
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    p: "♟",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    P: "♙"
};

let board = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

function drawBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement("div");
            const isWhiteSquare = (r + c) % 2 === 0;
            sq.className = "square " + (isWhiteSquare ? "white" : "black");
            if (selected && selected.r === r && selected.c === c) {
                sq.classList.add("selected");
            }
            sq.dataset.r = r;
            sq.dataset.c = c;
            
            const piece = board[r][c];
            if (piece) {
                const pieceSpan = document.createElement("span");
                pieceSpan.className = "piece " + (piece === piece.toUpperCase() ? "white-piece" : "black-piece");
                pieceSpan.innerHTML = pieces[piece];
                sq.appendChild(pieceSpan);
            }
            
            sq.onclick = () => clickSquare(r, c);
            boardEl.appendChild(sq);
        }
    }
    updateScore();
    updateStatus();
}

function clickSquare(r, c) {
    const piece = board[r][c];
    
    // If clicking same square, deselect
    if (selected && selected.r === r && selected.c === c) {
        selected = null;
        drawBoard();
        return;
    }

    // If no piece selected, select if it's the player's piece
    if (!selected) {
        if (!piece) return;
        const isPieceWhite = piece === piece.toUpperCase();
        if ((turn === "white" && isPieceWhite) || (turn === "black" && !isPieceWhite)) {
            selected = { r, c };
            drawBoard();
        }
        return;
    }

    // Try to move
    move(selected.r, selected.c, r, c);
    selected = null;
}

function isValidMove(r1, c1, r2, c2, piece) {
    // Can't move to same square
    if (r1 === r2 && c1 === c2) return false;

    // Pawn rules
    if (piece.toLowerCase() === "p") {
        const dir = piece === "P" ? -1 : 1;
        const startRow = piece === "P" ? 6 : 1;

        // Moving forward
        if (c1 === c2) {
            if (board[r2][c2] !== "") return false;
            if (r2 === r1 + dir) return true;
            if (r1 === startRow && r2 === r1 + 2 * dir && board[r1 + dir][c1] === "") return true;
        }

        // Capturing diagonally
        if (Math.abs(c2 - c1) === 1 && r2 === r1 + dir && board[r2][c2] !== "") {
            return true;
        }
        return false;
    }

    // Basic movement for other pieces (simplified)
    const dr = r2 - r1;
    const dc = c2 - c1;

    switch (piece.toLowerCase()) {
        case "n": // Knight - L shaped moves
            return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
        case "b": // Bishop - diagonal
            return Math.abs(dr) === Math.abs(dc) && dr !== 0 && isPathClear(r1, c1, r2, c2);
        case "r": // Rook - horizontal or vertical
            return (dr === 0 || dc === 0) && (dr !== 0 || dc !== 0) && isPathClear(r1, c1, r2, c2);
        case "q": // Queen - diagonal or straight
            return ((dr === 0 || dc === 0) || Math.abs(dr) === Math.abs(dc)) && (dr !== 0 || dc !== 0) && isPathClear(r1, c1, r2, c2);
        case "k": // King - one square any direction
            return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
    }
    return false;
}

function isPathClear(r1, c1, r2, c2) {
    const dr = r2 > r1 ? 1 : r2 < r1 ? -1 : 0;
    const dc = c2 > c1 ? 1 : c2 < c1 ? -1 : 0;

    let r = r1 + dr;
    let c = c1 + dc;

    while (r !== r2 || c !== c2) {
        if (board[r][c] !== "") return false;
        r += dr;
        c += dc;
    }

    return true;
}

function move(r1, c1, r2, c2) {
    const piece = board[r1][c1];
    if (!piece) return;

    // Can't capture own piece
    const targetPiece = board[r2][c2];
    if (targetPiece) {
        const isSameColor = (piece === piece.toUpperCase()) === (targetPiece === targetPiece.toUpperCase());
        if (isSameColor) return;
    }

    // Validate move
    if (!isValidMove(r1, c1, r2, c2, piece)) return;

    // Make the move
    board[r2][c2] = piece;
    board[r1][c1] = "";
    moveCount++;

    // Check for pawn promotion
    if (piece.toLowerCase() === "p") {
        if ((piece === "P" && r2 === 0) || (piece === "p" && r2 === 7)) {
            board[r2][c2] = piece === "P" ? "Q" : "q";
        }
    }

    turn = turn === "white" ? "black" : "white";
    drawBoard();

    // AI move for single player
    if (mode === "single" && turn === "black") {
        setTimeout(() => aiMove(), 800);
    }
}

function aiMove() {
    const possibleMoves = getAllPossibleMoves("black");

    if (possibleMoves.length === 0) {
        alert("Checkmate! White wins!");
        resetGame();
        return;
    }

    let selectedMove = null;

    if (gameDifficulty === "easy") {
        // Random move
        selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (gameDifficulty === "medium") {
        // Prefer capturing moves, but also make other moves
        const capturingMoves = possibleMoves.filter(m => board[m.to.r][m.to.c] !== "");
        if (capturingMoves.length > 0 && Math.random() > 0.3) {
            selectedMove = capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
        } else {
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
    } else if (gameDifficulty === "hard") {
        // Choose best move based on piece value
        let bestScore = -Infinity;
        possibleMoves.forEach(m => {
            const captureValue = board[m.to.r][m.to.c] ? getPieceValue(board[m.to.r][m.to.c]) : 0;
            const moveScore = captureValue + Math.random() * 0.5; // Small randomness for variety
            if (moveScore > bestScore) {
                bestScore = moveScore;
                selectedMove = m;
            }
        });
    }

    if (selectedMove) {
        const fromR = selectedMove.from.r;
        const fromC = selectedMove.from.c;
        const toR = selectedMove.to.r;
        const toC = selectedMove.to.c;

        board[toR][toC] = board[fromR][fromC];
        board[fromR][fromC] = "";
        moveCount++;

        // Check for pawn promotion
        const piece = board[toR][toC];
        if (piece.toLowerCase() === "p") {
            if ((piece === "P" && toR === 0) || (piece === "p" && toR === 7)) {
                board[toR][toC] = piece === "P" ? "Q" : "q";
            }
        }

        turn = "white";
        drawBoard();
    }
}

function getAllPossibleMoves(color) {
    const moves = [];
    const isBlack = color === "black";

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const isWhitePiece = piece === piece.toUpperCase();
            if ((isBlack && isWhitePiece) || (!isBlack && !isWhitePiece)) {
                continue;
            }

            // Try all possible target squares
            for (let r2 = 0; r2 < 8; r2++) {
                for (let c2 = 0; c2 < 8; c2++) {
                    if (isValidMove(r, c, r2, c2, piece)) {
                        // Make sure target is empty or enemy piece
                        const target = board[r2][c2];
                        if (!target || (target === target.toUpperCase()) !== isWhitePiece) {
                            moves.push({
                                from: { r, c },
                                to: { r: r2, c: c2 }
                            });
                        }
                    }
                }
            }
        }
    }

    return moves;

function getPieceValue(piece) {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
    return values[piece.toLowerCase()] || 0;
}

function updateScore() {
    let whiteScore = 0;
    let blackScore = 0;

    board.flat().forEach((piece) => {
        if (!piece) return;
        const value = getPieceValue(piece);
        if (piece === piece.toUpperCase()) {
            whiteScore += value;
        } else {
            blackScore += value;
        }
    });

    document.getElementById("wscore").innerText = whiteScore;
    document.getElementById("bscore").innerText = blackScore;
}

function updateStatus() {
    const status = document.getElementById("status");
    if (status) {
        const currentPlayer = turn.charAt(0).toUpperCase() + turn.slice(1);
        status.innerText = `${currentPlayer}'s Turn (Move #${moveCount})`;
    }
}

function resetGame() {
    board = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ];
    turn = "white";
    selected = null;
    moveCount = 0;
    whiteTime = 300;
    blackTime = 300;
    timerRunning = false;
    drawBoard();
}

function startGame() {
    mode = document.getElementById("mode").value;
    gameDifficulty = document.getElementById("level").value;
    resetGame();
    timerRunning = true;
}

// Timer
setInterval(() => {
    if (!timerRunning) return;

    if (turn === "white" && whiteTime > 0) {
        whiteTime--;
    } else if (turn === "black" && blackTime > 0) {
        blackTime--;
    }

    document.getElementById("wtime").innerText = formatTime(whiteTime);
    document.getElementById("btime").innerText = formatTime(blackTime);

    // Game over if time runs out
    if (whiteTime === 0 || blackTime === 0) {
        timerRunning = false;
        const winner = whiteTime === 0 ? "Black" : "White";
        alert(`${winner} wins! Time's up.`);
        resetGame();
    }
}, 1000);

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        drawBoard();
    });
} else {
    drawBoard();
}
