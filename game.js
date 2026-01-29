// Chess Game Variables
const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let gameState = {
    selectedSquare: null,
    currentPlayer: 'white',
    moveCount: 0,
    gameStarted: false,
    whiteTime: 300,
    blackTime: 300,
    gameMode: 'single',
    aiDifficulty: 'medium',
    timerRunning: false
};

// Initialize board display on page load
document.addEventListener('DOMContentLoaded', function() {
    renderBoard();
    updateUI();
});

// Render the chess board
function renderBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            
            square.className = 'square ' + (isLight ? 'light' : 'dark');
            square.id = `square-${row}-${col}`;
            
            if (gameState.selectedSquare && gameState.selectedSquare.row === row && gameState.selectedSquare.col === col) {
                square.classList.add('selected');
            }

            const piece = board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece ' + (piece === piece.toUpperCase() ? 'white' : 'black');
                pieceEl.textContent = PIECES[piece];
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            chessboard.appendChild(square);
        }
    }
}

// Handle square click
function handleSquareClick(row, col) {
    if (!gameState.gameStarted) {
        alert('Please click "START" first!');
        return;
    }

    const piece = board[row][col];

    // If clicking the same square, deselect
    if (gameState.selectedSquare && gameState.selectedSquare.row === row && gameState.selectedSquare.col === col) {
        gameState.selectedSquare = null;
        renderBoard();
        return;
    }

    // If no piece selected, try to select one
    if (!gameState.selectedSquare) {
        if (!piece) return;
        
        const isWhitePiece = piece === piece.toUpperCase();
        if ((gameState.currentPlayer === 'white' && !isWhitePiece) ||
            (gameState.currentPlayer === 'black' && isWhitePiece)) {
            return;
        }

        gameState.selectedSquare = { row, col };
        renderBoard();
        return;
    }

    // Try to move the piece
    const fromRow = gameState.selectedSquare.row;
    const fromCol = gameState.selectedSquare.col;
    
    if (movePiece(fromRow, fromCol, row, col)) {
        gameState.selectedSquare = null;
        gameState.moveCount++;
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        updateUI();
        renderBoard();

        // Check for checkmate after white moves
        if (gameState.gameMode === 'single') {
            const blackMoves = getAllPossibleMoves('black');
            if (blackMoves.length === 0) {
                showNotification('CHECKMATE!', 'White Wins! Black has no legal moves.');
                gameState.timerRunning = false;
                return;
            }
        }

        // AI move if single player
        if (gameState.gameMode === 'single' && gameState.currentPlayer === 'black') {
            setTimeout(() => {
                makeAIMove();
            }, 800);
        }
    } else {
        gameState.selectedSquare = null;
        renderBoard();
    }
}

// Move piece with validation
function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];

    if (!piece) {
        console.log('movePiece FAILED: No piece at source');
        return false;
    }

    // Can't move to own piece
    if (targetPiece) {
        const sameColor = (piece === piece.toUpperCase()) === (targetPiece === targetPiece.toUpperCase());
        if (sameColor) {
            console.log('movePiece FAILED: Target square has same color piece');
            return false;
        }
    }

    // Validate move based on piece type
    if (!isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
        console.log(`movePiece FAILED: Invalid move for piece ${piece} from (${fromRow},${fromCol}) to (${toRow},${toCol})`);
        return false;
    }

    // Execute move
    console.log(`movePiece SUCCESS: Moving ${piece} from (${fromRow},${fromCol}) to (${toRow},${toCol}), capturing ${targetPiece || 'nothing'}`);
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    // Pawn promotion
    if ((piece === 'P' && toRow === 0) || (piece === 'p' && toRow === 7)) {
        board[toRow][toCol] = piece === 'P' ? 'Q' : 'q';
        console.log(`Pawn promoted to ${piece === 'P' ? 'Q' : 'q'}`);
    }

    updateScore();
    return true;
}

// Validate move based on piece type
function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const type = piece.toLowerCase();

    switch (type) {
        case 'p': return isValidPawnMove(piece, fromRow, fromCol, toRow, toCol);
        case 'n': return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b': return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'r': return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'q': return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k': return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default: return false;
    }
}

function isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
    const direction = piece === 'P' ? -1 : 1;
    const startRow = piece === 'P' ? 6 : 1;

    // Moving forward
    if (fromCol === toCol) {
        if (board[toRow][toCol] !== null) return false;
        if (toRow === fromRow + direction) return true;
        if (fromRow === startRow && toRow === fromRow + 2 * direction && board[fromRow + direction][fromCol] === null) {
            return true;
        }
    }

    // Capturing diagonally
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && board[toRow][toCol] !== null) {
        return true;
    }

    return false;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const dr = Math.abs(toRow - fromRow);
    const dc = Math.abs(toCol - fromCol);
    return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    const dr = Math.abs(toRow - fromRow);
    const dc = Math.abs(toCol - fromCol);
    return dr === dc && dr > 0 && isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    return (fromRow === toRow || fromCol === toCol) && 
           (fromRow !== toRow || fromCol !== toCol) &&
           isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    const dr = Math.abs(toRow - fromRow);
    const dc = Math.abs(toCol - fromCol);
    return (fromRow === toRow || fromCol === toCol || dr === dc) && 
           (fromRow !== toRow || fromCol !== toCol) &&
           isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const dr = Math.abs(toRow - fromRow);
    const dc = Math.abs(toCol - fromCol);
    return dr <= 1 && dc <= 1 && (dr > 0 || dc > 0);
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const dr = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const dc = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let r = fromRow + dr;
    let c = fromCol + dc;

    while (r !== toRow || c !== toCol) {
        if (board[r][c] !== null) return false;
        r += dr;
        c += dc;
    }

    return true;
}

// AI Move
function makeAIMove() {
    console.log('=== AI TURN STARTED ===');
    console.log('Board state:', JSON.stringify(board));
    
    const moves = getAllPossibleMoves('black');
    console.log('Black available moves:', moves.length);
    console.log('Moves:', moves);
    
    if (moves.length === 0) {
        console.log('No moves available - Checkmate!');
        showNotification('CHECKMATE!', 'White Wins! Black has no legal moves.');
        gameState.timerRunning = false;
        return;
    }

    let chosenMove = null;

    if (gameState.aiDifficulty === 'easy') {
        // Easy: random move
        const randomIndex = Math.floor(Math.random() * moves.length);
        chosenMove = moves[randomIndex];
        console.log('Easy mode - Random move chosen:', chosenMove);
    } else if (gameState.aiDifficulty === 'medium') {
        // Medium: prefer capturing moves
        const capturingMoves = moves.filter(m => board[m.toRow][m.toCol] !== null);
        console.log('Capturing moves available:', capturingMoves.length);
        if (capturingMoves.length > 0 && Math.random() > 0.3) {
            const randomIndex = Math.floor(Math.random() * capturingMoves.length);
            chosenMove = capturingMoves[randomIndex];
            console.log('Medium mode - Capturing move chosen:', chosenMove);
        } else {
            const randomIndex = Math.floor(Math.random() * moves.length);
            chosenMove = moves[randomIndex];
            console.log('Medium mode - Regular move chosen:', chosenMove);
        }
    } else {
        // Hard: choose best move (most valuable capture)
        let bestScore = -Infinity;
        moves.forEach(m => {
            const capturedPiece = board[m.toRow][m.toCol];
            const captureValue = capturedPiece ? getPieceValue(capturedPiece) : 0;
            if (captureValue > bestScore) {
                bestScore = captureValue;
                chosenMove = m;
            }
        });
        console.log('Hard mode - Best move chosen:', chosenMove, 'Value:', bestScore);
        if (!chosenMove) {
            chosenMove = moves[0];
        }
    }

    if (!chosenMove) {
        console.error('ERROR: No move chosen! Using first available move.');
        chosenMove = moves[0];
    }

    console.log('Final chosen move:', chosenMove);
    console.log('Attempting to move:', `(${chosenMove.fromRow},${chosenMove.fromCol}) -> (${chosenMove.toRow},${chosenMove.toCol})`);
    
    // Execute the move
    const success = movePiece(chosenMove.fromRow, chosenMove.fromCol, chosenMove.toRow, chosenMove.toCol);
    console.log('Move execution success:', success);
    
    if (success) {
        gameState.moveCount++;
        gameState.currentPlayer = 'white';
        updateUI();
        renderBoard();
        console.log('Board updated after AI move');

        // Check if white is in checkmate
        const whiteMoves = getAllPossibleMoves('white');
        console.log('White available moves:', whiteMoves.length);
        if (whiteMoves.length === 0) {
            showNotification('CHECKMATE!', 'Black Wins! White has no legal moves.');
            gameState.timerRunning = false;
        }
    } else {
        console.error('ERROR: Move failed!');
    }
    console.log('=== AI TURN ENDED ===');
}

function getPieceValue(piece) {
    const values = {
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100,
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100
    };
    return values[piece] || 0;
}

function getAllPossibleMoves(color) {
    const moves = [];
    const isBlack = color === 'black';
    let piecesFound = 0;
    let validMovesTested = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            // Check if piece belongs to correct player
            const isWhitePiece = piece === piece.toUpperCase();
            if (isBlack && isWhitePiece) continue;  // Black pieces are lowercase
            if (!isBlack && !isWhitePiece) continue; // White pieces are uppercase

            piecesFound++;

            // Try all possible destination squares
            for (let r2 = 0; r2 < 8; r2++) {
                for (let c2 = 0; c2 < 8; c2++) {
                    // Skip same square
                    if (r === r2 && c === c2) continue;

                    const targetPiece = board[r2][c2];
                    
                    // Can't capture own piece
                    if (targetPiece) {
                        const targetIsWhite = targetPiece === targetPiece.toUpperCase();
                        if (isWhitePiece === targetIsWhite) continue; // Same color, skip
                    }

                    // Check if move is valid
                    validMovesTested++;
                    if (isValidMove(piece, r, c, r2, c2)) {
                        moves.push({
                            fromRow: r,
                            fromCol: c,
                            toRow: r2,
                            toCol: c2,
                            piece: piece
                        });
                    }
                }
            }
        }
    }

    console.log(`getAllPossibleMoves(${color}): Found ${piecesFound} pieces, tested ${validMovesTested} moves, returned ${moves.length} valid moves`);
    return moves;
}

// Update score
function updateScore() {
    const values = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100 };
    let whiteScore = 0, blackScore = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const value = values[piece.toUpperCase()] || 0;
                if (piece === piece.toUpperCase()) {
                    whiteScore += value;
                } else {
                    blackScore += value;
                }
            }
        }
    }

    document.getElementById('whiteScore').textContent = whiteScore;
    document.getElementById('blackScore').textContent = blackScore;
}

// Update UI
function updateUI() {
    document.getElementById('currentTurn').textContent = gameState.currentPlayer.toUpperCase();
    document.getElementById('moveCount').textContent = gameState.moveCount;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    document.getElementById('whiteTime').textContent = formatTime(gameState.whiteTime);
    document.getElementById('blackTime').textContent = formatTime(gameState.blackTime);
}

// Game controls
function startNewGame() {
    gameState.gameMode = document.getElementById('mode').value;
    gameState.aiDifficulty = document.getElementById('difficulty').value;
    
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    gameState.selectedSquare = null;
    gameState.currentPlayer = 'white';
    gameState.moveCount = 0;
    gameState.gameStarted = true;
    gameState.whiteTime = 300;
    gameState.blackTime = 300;
    gameState.timerRunning = true;

    updateScore();
    updateUI();
    renderBoard();

    // Start timer
    startTimer();
}

function resetGame() {
    gameState.selectedSquare = null;
    gameState.currentPlayer = 'white';
    gameState.moveCount = 0;
    gameState.gameStarted = false;
    gameState.timerRunning = false;
    gameState.whiteTime = 300;
    gameState.blackTime = 300;

    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    updateScore();
    updateUI();
    renderBoard();
}

let timerInterval;
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameState.timerRunning) {
            clearInterval(timerInterval);
            return;
        }

        if (gameState.currentPlayer === 'white' && gameState.whiteTime > 0) {
            gameState.whiteTime--;
        } else if (gameState.currentPlayer === 'black' && gameState.blackTime > 0) {
            gameState.blackTime--;
        }

        updateTimerDisplay();

        if (gameState.whiteTime === 0 || gameState.blackTime === 0) {
            gameState.timerRunning = false;
            const winner = gameState.whiteTime === 0 ? 'BLACK' : 'WHITE';
            showNotification('TIME UP!', `${winner} WINS! Time's up!`);
            resetGame();
        }
    }, 1000);
}

// Show notification
function showNotification(title, message) {
    const notif = document.getElementById('notification');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    notif.classList.add('show');
}

// Close notification
function closeNotification() {
    const notif = document.getElementById('notification');
    notif.classList.remove('show');
}
