🎮 Fortress Frontlines

Welcome to Fortress Frontlines, a top-down 2D tank shooter game, inspired by the gunfight game mode from Call of Duty during Conuhack IX. Players battle it out in maze-like arenas filled with obstacles and strategic cover points.

    Modes: Practice Mode and 2-Player Mode
    Objective: Defeat your opponent by outmaneuvering, and outsmarting them.

🚀 Features

    🎯 Practice Mode: Hone your skills and familiarize your self with the controls against a computer-controlled tank.
    👫 2 Player Mode: Go head-to-head with a friend in local multiplayer.
    💥 Power-ups & Loot Boxes: Random boosts to give you an edge in battle.
    🗺️ Random Maps: Dynamic obstacle layouts for fresh gameplay every round.

⚙️ How to Run

    Download the Repository:

    Navigate to the Project Folder:

        cd fortress-frontlines

    Run the Game:
        Open index.html in any modern browser (preferably Chrome or Firefox).

🎮 Controls
🚗 Player 1 (Green Tank)

    Move: Arrow Keys (↑ ↓ ← →)
    Shoot: M or Spacebar

🔴 Player 2 (Red Tank)

    Move: W A S D
    Shoot: Q or G

⏸️ Pause Menu (In-Game Only)

    Pause/Resume: ESC
    Resume: Click the "Resume" button
    Exit to Menu: Click "Exit to Menu"

🗂️ Project Structure

fortress-frontlines/
├── index.html              # Main HTML file
├── tank_battles.js         # Core game logic
├── tank.js                 # Tank mechanics
├── bullet.js               # Bullet mechanics
├── wall.js                 # Wall/obstacle mechanics
├── grid.js                 # Grid and obstacle generation
└── lib/                    # p5.js libraries
    ├── p5.min.js
    ├── p5.dom.min.js
    ├── p5.sound.min.js
    └── p5.collide2d.min.js

❗ Known Issues

    Pause Menu Bug: Occasionally overlaps with the main menu (fixed in the latest version).
    Tank Stuck: Tanks may sometimes get stuck on obstacles (collision detection improvements needed).

✅ Future Improvements

    Add new power-ups and abilities for tanks.
    Introduce more maps with unique layouts.
    Implement online multiplayer support.

👤 Credits

    Game Developer: Jacob Lin
    Libraries Used: p5.js
    Inspiration: Classic tank games like Tank Trouble.