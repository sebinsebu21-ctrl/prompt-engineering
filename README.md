# 🏍️ Bike Racing Game

A fun and interactive bike racing game built with vanilla HTML, CSS, and JavaScript. Navigate your bike through traffic, collect coins, and score as many points as possible!

## 🎮 Features

- **Dynamic Gameplay**: Increasing difficulty as you progress
- **Obstacle Avoidance**: Navigate around traffic to survive
- **Coin Collection**: Collect coins to earn points
- **Real-time Statistics**: Track your score, speed, and distance
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Fluid gameplay with canvas rendering
- **Game States**: Start, Pause, Resume, and Reset functionality

## 🕹️ How to Play

1. **Start the Game**: Click the "Start Game" button
2. **Move Your Bike**: Use the **Left (←)** and **Right (→)** arrow keys to steer
3. **Avoid Obstacles**: Don't hit the red obstacles
4. **Collect Coins**: Drive over yellow coins to score points
5. **Survive**: The longer you survive, the faster the game gets!

### Scoring
- **Coins**: +10 points per coin collected
- **Distance**: Measured in game units as you progress

## 📊 Game Statistics

- **Score**: Current points earned from collected coins
- **Speed**: Current game speed (increases over time)
- **Distance**: Total distance traveled in the game

## 🛠️ Technologies Used

- **HTML5**: Game structure and semantic markup
- **CSS3**: Styling, animations, and responsive design
- **JavaScript**: Game logic, physics, and interactivity
- **Canvas API**: 2D graphics rendering

## 📁 File Structure

```
prompt-engineering/
├── index.html      # Main HTML file with game layout
├── styles.css      # Game styling and animations
├── game.js         # Core game logic and mechanics
└── README.md       # Documentation (this file)
```

## 🎯 Game Objects

### Player (Bike)
- Blue bike controlled by the player
- Can move left and right across the road
- Crashes on collision with obstacles

### Obstacles
- Red vehicles that spawn randomly
- Move down the screen at increasing speed
- Cause game over on collision

### Coins
- Yellow rotating coins
- Award 10 points when collected
- Spawn randomly on the road

## 🔧 Game Controls

| Key | Action |
|-----|--------|
| ← | Move bike left |
| → | Move bike right |
| Click "Start Game" | Begin the game |
| Click "Pause" | Pause/Resume gameplay |
| Click "Reset" | Return to main menu |

## 📈 Game Progression

- Game speed starts at 3 units/frame
- Speed increases gradually up to 8 units/frame
- More obstacles and coins spawn as you play
- Difficulty escalates naturally over time

## 🎨 UI Components

- **Game Header**: Displays title and statistics
- **Game Canvas**: Main playing area (400x600px)
- **Control Buttons**: Start, Pause, and Reset options
- **Game Over Modal**: Shows final score and distance
- **Info Section**: Displays controls and objectives

## 📱 Responsive Features

- Adapts to different screen sizes
- Touch-friendly button sizes
- Readable text on mobile devices
- Center-aligned layout for various viewports

## 🚀 How to Run

1. Clone this repository
2. Open `index.html` in a web browser
3. Click "Start Game" and enjoy!

No installation or dependencies required—pure vanilla JavaScript!

## 🐛 Future Improvements

- Power-ups and special abilities
- Multiple difficulty levels
- Leaderboard system
- Sound effects and music
- Different bike skins
- Mobile touch controls
- Multiplayer mode

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve the game!

---

**Enjoy the race! 🏁**
