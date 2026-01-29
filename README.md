# Chess Game - Single & Multiplayer

A fully functional chess game with single-player AI and multiplayer support. Built with vanilla HTML, CSS, and JavaScript.

## Features

- ✅ Single-player mode with AI opponent (Easy, Medium, Hard)
- ✅ Multiplayer mode with Game ID support
- ✅ Chess timer (5 minutes per side)
- ✅ Piece scoring system
- ✅ Responsive board layout
- ✅ Move validation for pawns

## Installation

```bash
# Clone or download the project
npm install

# Start development server
npm run dev

# Or start with default server
npm start
```

## Deployment

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source

## Usage

1. Select **Single Player** or **Multiplayer** mode
2. Choose AI difficulty (if single player)
3. Enter Game ID (if multiplayer)
4. Click **Start Game**
5. Click a piece to select, then click target square to move

## Project Structure

```
chess-game/
├── index.html          # Main game board
├── css/
│   └── style.css       # Game styling
├── js/
│   └── game.js         # Game logic
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── README.md          # This file
```

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

MIT
