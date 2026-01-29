# Chess Game Testing Guide

## Current Status
The chess game has been enhanced with comprehensive debugging logging. All moves are now logged to the browser console.

## How to Test the Game

### 1. Start the Server
```bash
npm run dev
```
The server runs on `http://127.0.0.1:3000`

### 2. Open the Browser
Navigate to `http://127.0.0.1:3000` in your web browser.

### 3. Open Developer Console
- Press `F12` or `Ctrl+Shift+I` to open the browser's Developer Tools
- Click on the "Console" tab to see debug output

### 4. Test the Game

#### Step 1: Start a Game
1. Select **"Single Player"** from the Mode dropdown
2. Select **"Medium"** difficulty (or any difficulty)
3. Click the **"START"** button
4. You should see the board and pieces rendered

#### Step 2: Make a White Move
1. Click on a white pawn (at the bottom of the board)
2. Click on an empty square one row up to move the pawn forward
3. The board should update and show "Turn: BLACK"

#### Step 3: Watch the AI Move
- The console will show detailed logging:
  ```
  === AI TURN STARTED ===
  getAllPossibleMoves(black): Found X pieces, tested Y moves, returned Z valid moves
  Black available moves: Z
  [Detailed move information]
  Final chosen move: {fromRow: ..., fromCol: ..., toRow: ..., toCol: ...}
  movePiece SUCCESS: Moving p from (1,0) to (2,0)...
  === AI TURN ENDED ===
  ```
- The board should update to show the AI's move
- "Turn: WHITE" should be displayed

### 5. Expected Console Output

#### On Game Start
```
getCurrentPlayer() result: white
getAllPossibleMoves(white): Found 16 pieces, tested 1024 moves, returned 20 valid moves
Board updated after player move
```

#### After White Pawn Move
```
movePiece SUCCESS: Moving P from (6,1) to (5,1), capturing nothing
=== AI TURN STARTED ===
getAllPossibleMoves(black): Found 16 pieces, tested 1024 moves, returned 20 valid moves
Medium mode - Random move chosen: {fromRow: 1, fromCol: 1, toRow: 2, toCol: 1, piece: 'p'}
movePiece SUCCESS: Moving p from (1,1) to (2,1), capturing nothing
Board updated after AI move
=== AI TURN ENDED ===
```

## What Each Log Means

### `getAllPossibleMoves()` Output
- **Found X pieces**: Number of pieces belonging to the player
- **Tested Y moves**: Total board squares checked for legal moves
- **Returned Z valid moves**: Number of valid moves found

### `movePiece()` Output
- **SUCCESS**: The move was executed correctly
- **FAILED**: The move was rejected due to:
  - No piece at source
  - Target has same color piece
  - Invalid move for that piece type

## Difficulty Levels

- **Easy**: Chooses a completely random legal move
- **Medium**: Prefers capturing moves (70% of the time), otherwise random
- **Hard**: Always chooses the move that captures the most valuable piece

## Troubleshooting

### If AI doesn't move:
1. Check the console for error messages
2. Look for the "=== AI TURN STARTED ===" log
3. Count the returned moves - should be >0

### If moves look invalid:
1. Check `movePiece SUCCESS` logs
2. Verify the fromRow/fromCol match selected piece
3. Ensure toRow/toCol are valid destination

### If board doesn't render:
1. Ensure index.html, styles.css, and game.js are in the root folder
2. Check that `game.js` script tag is at the bottom of index.html

## File Locations
- **HTML**: `index.html`
- **CSS**: `styles.css`
- **JavaScript**: `game.js`

All files are in the root directory and should be served at `http://127.0.0.1:3000/`
