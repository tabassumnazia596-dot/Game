export type GameCategory = 'Arcade' | 'Action' | 'Puzzle' | 'Brain' | 'Casual';

export interface GameInfo {
  id: string;
  title: string;
  category: GameCategory;
  shortDesc: string;
  description: string;
  instructions: string[];
  controls: {
    desktop: string;
    mobile: string;
  };
  rating: number;
  playCount: number;
  featured?: boolean;
  popular?: boolean;
  new?: boolean;
  image?: string;
  badge?: string;
  accent: 'purple' | 'cyan' | 'green' | 'amber' | 'rose' | 'indigo';
}

export const GAMES_DATA: GameInfo[] = [
  {
    id: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    shortDesc: 'Navigate the cyber serpent, eat power orbs, and grow without crashing.',
    description: 'A slick modern twist on the legendary arcade classic. Guide your glowing cyber snake through a digital grid, collecting neon energy pellets to grow longer. Avoid colliding with walls and your own tail!',
    instructions: [
      'Use Arrow keys, WASD, or on-screen directional buttons to steer.',
      'Eat glowing green energy orbs to score points and increase tail length.',
      'Avoid running into the boundaries or colliding with your own body.',
      'Try to beat your personal local high score!'
    ],
    controls: {
      desktop: 'Arrow Keys or W, A, S, D',
      mobile: 'On-screen D-pad or swipe gestures'
    },
    rating: 4.9,
    playCount: 142500,
    popular: true,
    featured: true,
    accent: 'green'
  },
  {
    id: 'spaceshooter',
    title: 'Galaxy Raider',
    category: 'Action',
    shortDesc: 'Pilot your starfighter and destroy incoming waves of alien invaders.',
    description: 'An adrenaline-pumping retro space combat shooter. Defend the cosmos from incoming waves of enemy cruisers, dodge plasma fire, and rack up high scores with explosive combos.',
    instructions: [
      'Move your starship horizontally to evade enemy missiles.',
      'Fire laser cannons continuously to eliminate alien formations.',
      'Beware of descending enemy ships and unpredictable boss attacks.',
      'Survive multiple waves to unlock maximum score multipliers.'
    ],
    controls: {
      desktop: 'Arrow Left/Right (or A/D) to move, Spacebar to fire',
      mobile: 'Touch and drag ship, auto-fire button'
    },
    rating: 4.9,
    playCount: 189200,
    featured: true,
    popular: true,
    image: '/src/assets/images/featured_space_odyssey_1792853693339.jpg',
    accent: 'cyan'
  },
  {
    id: 'runner',
    title: 'Cyber Sprint',
    category: 'Action',
    shortDesc: 'Dash through high-speed neon rooftops, leap barriers, and collect energy cores.',
    description: 'A fast-paced infinite runner set across illuminated futuristic skyscrapers. Dash, jump over laser barricades, duck under low barriers, and grab energy cores before speed reaches overdrive.',
    instructions: [
      'Time your jumps carefully to clear rooftop gaps and energy barriers.',
      'Slide or duck underneath floating security lasers.',
      'Collect golden energy shards to maximize your score.',
      'The longer you survive, the faster the speed increases!'
    ],
    controls: {
      desktop: 'Up Arrow / Space to Jump, Down Arrow to Slide',
      mobile: 'Tap Jump / Slide buttons on screen'
    },
    rating: 4.8,
    playCount: 167400,
    featured: true,
    popular: true,
    image: '/src/assets/images/featured_cyber_runner_1792853694387.jpg',
    accent: 'purple'
  },
  {
    id: '2048',
    title: '2048 Neon Pulse',
    category: 'Puzzle',
    shortDesc: 'Slide and merge matching cyber tiles to forge the legendary 2048 block.',
    description: 'The addictive number puzzle game rendered with ultra-clean neon aesthetic and responsive haptics. Combine matching tiles to reach 2048 and beyond!',
    instructions: [
      'Swipe or use arrow keys to shift all tiles across the 4x4 matrix.',
      'When two tiles with the same number collide, they merge into one with double the value.',
      'Every move spawns a new 2 or 4 tile in an empty cell.',
      'Keep merging before the grid fills completely!'
    ],
    controls: {
      desktop: 'Arrow Keys or WASD',
      mobile: 'Swipe in any direction or use touch arrow buttons'
    },
    rating: 4.9,
    playCount: 215000,
    featured: true,
    popular: true,
    image: '/src/assets/images/featured_puzzle_dimension_1792853694003.jpg',
    accent: 'amber'
  },
  {
    id: 'breakout',
    title: 'Neon Breakout',
    category: 'Arcade',
    shortDesc: 'Smash through multi-colored cyber bricks with high-velocity laser balls.',
    description: 'The definitive brick-breaker reimagined. Control your energy paddle, ricochet glowing balls into rows of destructible cyber bricks, and catch special power-ups.',
    instructions: [
      'Slide the paddle left and right to bounce the ball back toward the bricks.',
      'Clear all bricks in each wave to advance to tougher stages.',
      'Angle your hits off the paddle edges to steer the trajectory.',
      'Do not allow the ball to drop below the paddle!'
    ],
    controls: {
      desktop: 'Mouse movement or Left/Right Arrow keys',
      mobile: 'Drag paddle with finger or use touch arrow buttons'
    },
    rating: 4.7,
    playCount: 128300,
    popular: true,
    accent: 'cyan'
  },
  {
    id: 'flappy',
    title: 'Cyber Bird',
    category: 'Arcade',
    shortDesc: 'Flap through perilous neon electric pylons in this intense arcade flight test.',
    description: 'Guide your cybernetic avian drone through hazardous high-voltage columns. Test your rhythm, reflexes, and composure in this famously challenging tap-to-fly game.',
    instructions: [
      'Tap or press Space to flap upward against relentless gravity.',
      'Navigate cleanly through the vertical gaps in each neon pillar.',
      'Each obstacle gate successfully cleared awards 1 point.',
      'Avoid colliding with pillars, the ceiling, or ground.'
    ],
    controls: {
      desktop: 'Spacebar or Left Click',
      mobile: 'Tap anywhere on the game screen'
    },
    rating: 4.7,
    playCount: 178000,
    popular: true,
    accent: 'green'
  },
  {
    id: 'tictactoe',
    title: 'Neon Tic Tac Toe',
    category: 'Brain',
    shortDesc: 'Classic X vs O with smart AI bot difficulties or local 2-player mode.',
    description: 'The timeless strategy duel enhanced with glowing neon lines, smart AI (Easy, Medium, and Unbeatable Minimax), and local Pass & Play mode.',
    instructions: [
      'Take turns placing your neon marker (X or O) on the 3x3 grid.',
      'Align three of your markers in a row, column, or diagonal to win.',
      'Challenge the AI bot or compete against a friend locally.',
      'Track win/loss streaks across rounds.'
    ],
    controls: {
      desktop: 'Click on any available cell',
      mobile: 'Tap on any available cell'
    },
    rating: 4.6,
    playCount: 94000,
    accent: 'purple'
  },
  {
    id: 'rps',
    title: 'Rock Paper Scissors',
    category: 'Casual',
    shortDesc: 'Battle the CPU in rapid neon Rock Paper Scissors with streak multipliers.',
    description: 'The universally loved hand game with neon visuals, realistic bot algorithms, streak tracking, and exciting round animations.',
    instructions: [
      'Rock beats Scissors, Scissors beats Paper, Paper beats Rock.',
      'Select your weapon before the countdown strikes.',
      'Build win streaks to trigger score bonuses.',
      'Analyze the bot’s play patterns to dominate the leaderboard.'
    ],
    controls: {
      desktop: 'Click Rock, Paper, or Scissors (Keys 1, 2, 3)',
      mobile: 'Tap your choice'
    },
    rating: 4.5,
    playCount: 82000,
    accent: 'rose'
  },
  {
    id: 'memory',
    title: 'Cyber Memory Match',
    category: 'Brain',
    shortDesc: 'Flip holographic cards and uncover matching pairs with minimal moves.',
    description: 'Sharpen your memory retention with this brain workout. Uncover pairs of futuristic icons, track your accuracy, and race against the clock.',
    instructions: [
      'Click or tap cards to flip and reveal their hidden symbols.',
      'Uncover matching pairs to lock them on the board.',
      'If two flipped cards do not match, they will turn back face-down.',
      'Clear the entire board in the fewest moves possible.'
    ],
    controls: {
      desktop: 'Click cards to flip',
      mobile: 'Tap cards to flip'
    },
    rating: 4.8,
    playCount: 112000,
    new: true,
    accent: 'indigo'
  },
  {
    id: 'minesweeper',
    title: 'Quantum Minesweeper',
    category: 'Puzzle',
    shortDesc: 'Deduce hidden quantum mines using numerical proximity indicators.',
    description: 'The masterclass of logical deduction. Safely uncover all secure grid cells without triggering hidden quantum anomalies. Guaranteed safe first click!',
    instructions: [
      'Left-click / tap to reveal a hidden cell.',
      'Numbers indicate exactly how many mines touch that cell.',
      'Right-click or hold / toggle Flag mode to mark suspected mines.',
      'Clear all safe tiles to achieve quantum stabilization!'
    ],
    controls: {
      desktop: 'Left Click to reveal, Right Click to flag',
      mobile: 'Tap to reveal, toggle Flag button to place markers'
    },
    rating: 4.8,
    playCount: 135000,
    accent: 'cyan'
  },
  {
    id: 'sudoku',
    title: 'Master Sudoku',
    category: 'Brain',
    shortDesc: 'Solve 9x9 logic number grids with real-time conflict checking and hints.',
    description: 'The quintessential Japanese number placement puzzle. Fill the 9x9 grid with numbers 1 through 9 such that each row, column, and 3x3 box contains every digit without repetition.',
    instructions: [
      'Select a cell on the board, then choose a number from 1 to 9.',
      'Ensure no row, column, or 3x3 region contains duplicate digits.',
      'Use the Erase or Hint buttons when needed.',
      'Choose between Easy, Medium, and Hard difficulties.'
    ],
    controls: {
      desktop: 'Click cell and press keys 1-9 or click number pad',
      mobile: 'Tap cell, then tap number button below'
    },
    rating: 4.9,
    playCount: 154000,
    accent: 'purple'
  },
  {
    id: 'wordguess',
    title: 'Cyber Word Guess',
    category: 'Brain',
    shortDesc: 'Deduce secret 5-letter words in 6 attempts with real-time letter feedback.',
    description: 'An exciting cyber-themed word guessing challenge. Enter 5-letter words and use the color-coded tiles (green for correct position, yellow for misplaced, gray for absent) to deduce the mystery word.',
    instructions: [
      'Type any valid 5-letter word and press Enter to submit.',
      'Green tiles mean the letter is correct and in the right slot.',
      'Yellow tiles mean the letter is in the word but wrong spot.',
      'Gray tiles mean the letter is not in the secret word at all.'
    ],
    controls: {
      desktop: 'Physical keyboard A-Z, Backspace, Enter',
      mobile: 'Interactive on-screen keyboard'
    },
    rating: 4.9,
    playCount: 198000,
    popular: true,
    accent: 'green'
  },
  {
    id: 'hangman',
    title: 'Neon Hangman',
    category: 'Casual',
    shortDesc: 'Guess the hidden gaming, tech, and animal terms before drawing complete.',
    description: 'A stylish neon reimagining of Hangman. Choose your favorite trivia category, guess missing letters, and save the cyber avatar before you run out of energy!',
    instructions: [
      'Select letters one by one from the alphabet keypad.',
      'Correct letters fill in the corresponding word dashes.',
      'Incorrect letters add a component to the neon gallows.',
      'Guess the complete word before 6 incorrect attempts!'
    ],
    controls: {
      desktop: 'Click letter buttons or press A-Z keys',
      mobile: 'Tap letter buttons on keypad'
    },
    rating: 4.6,
    playCount: 76000,
    accent: 'amber'
  },
  {
    id: 'whackamole',
    title: 'Cyber Mole Whack',
    category: 'Casual',
    shortDesc: 'Whack rogue cyber droids popping from server pods before time expires.',
    description: 'Test your hand-eye coordination! Whack mischievous neon droids popping out of server ports. Catch bonus golden droids for 3x points and avoid hazardous bombs.',
    instructions: [
      'Click or tap droids as soon as they emerge from server holes.',
      'Standard droids give 10 points. Golden droids award 30 points.',
      'Avoid red bomb units — striking them subtracts 20 points!',
      'Score as many points as possible before the 30-second timer runs out.'
    ],
    controls: {
      desktop: 'Click with mouse',
      mobile: 'Tap targets with finger'
    },
    rating: 4.7,
    playCount: 104000,
    accent: 'rose'
  },
  {
    id: 'simon',
    title: 'Simon Memory Matrix',
    category: 'Brain',
    shortDesc: 'Memorize and replicate expanding sequences of luminous neon audio pads.',
    description: 'The classic 1980s memory game upgraded with modern synthesizer frequencies and luminous glowing quadrants. How long a sequence can your brain remember?',
    instructions: [
      'Watch and listen as the four colored pads illuminate in sequence.',
      'Repeat the exact same sequence by tapping the pads in order.',
      'Each successful round adds one more step to the pattern.',
      'One wrong tap ends the streak!'
    ],
    controls: {
      desktop: 'Click pads with mouse (or keys 1, 2, 3, 4)',
      mobile: 'Tap colored quadrants'
    },
    rating: 4.7,
    playCount: 119000,
    accent: 'purple'
  },
  {
    id: 'puzzle15',
    title: 'Number Slide 15',
    category: 'Puzzle',
    shortDesc: 'Slide numbered tiles into numerical order in this classic mathematical puzzle.',
    description: 'The legendary 15-puzzle sliding challenge. Move tiles adjacent to the empty slot to arrange numbers 1 through 15 sequentially from left to right, top to bottom.',
    instructions: [
      'Click or tap any numbered tile adjacent to the empty square to slide it.',
      'Arrange tiles sequentially: 1 to 15 in order, leaving the bottom-right empty.',
      'Includes an automatic solvable board validator.',
      'Track total moves and time to completion.'
    ],
    controls: {
      desktop: 'Click tile adjacent to space (or arrow keys)',
      mobile: 'Tap tile adjacent to space'
    },
    rating: 4.6,
    playCount: 68000,
    accent: 'indigo'
  },
  {
    id: 'bubbleshooter',
    title: 'Bubble Galaxy Blast',
    category: 'Arcade',
    shortDesc: 'Aim, launch, and match 3 or more colored plasma bubbles to clear the cluster.',
    description: 'Aim your plasma cannon, calculate bounce angles off sidewalls, and connect clusters of three or more matching bubbles to trigger explosive cascading pops.',
    instructions: [
      'Aim your cannon line toward the target bubble clusters.',
      'Launch plasma orbs to form clusters of 3 or more identical colors.',
      'Disconnected ceiling bubbles will drop for massive bonus points.',
      'Prevent the descending bubble ceiling from reaching the baseline!'
    ],
    controls: {
      desktop: 'Move mouse to aim, click to fire',
      mobile: 'Touch and drag to aim line, release to launch'
    },
    rating: 4.8,
    playCount: 141000,
    popular: true,
    accent: 'cyan'
  },
  {
    id: 'colormatch',
    title: 'Color Reflex Match',
    category: 'Brain',
    shortDesc: 'Conquer the psychological Stroop effect in high-tempo color cognition.',
    description: 'A brain workout based on the famous Stroop effect. Does the text meaning match the ink color? Decide rapidly under an accelerating countdown timer!',
    instructions: [
      'Observe the color word displayed on screen (e.g. "BLUE").',
      'Check if the font color matches the word meaning.',
      'Click "MATCH" or "NO MATCH" before the time bar runs out.',
      'Maintain streaks to trigger score combos.'
    ],
    controls: {
      desktop: 'Click Match / No Match or Left/Right Arrow Keys',
      mobile: 'Tap Match / No Match buttons'
    },
    rating: 4.7,
    playCount: 89000,
    new: true,
    accent: 'green'
  },
  {
    id: 'reaction',
    title: 'Reaction Time Reflex',
    category: 'Casual',
    shortDesc: 'Benchmark your neurological reaction latency down to the exact millisecond.',
    description: 'Test your reflexes! Wait for the red screen to turn neon green, then click or tap as fast as humanly possible. Average your score over 5 rounds to discover your gaming tier.',
    instructions: [
      'Click the box to start the test.',
      'Wait patiently while the screen is RED — do not click too early!',
      'The instant the box turns GREEN, click or tap as quickly as you can.',
      'Complete 5 trials to calculate your official reaction average.'
    ],
    controls: {
      desktop: 'Click anywhere inside test zone (or Spacebar)',
      mobile: 'Tap test area with finger'
    },
    rating: 4.9,
    playCount: 162000,
    popular: true,
    accent: 'rose'
  },
  {
    id: 'typingspeed',
    title: 'Cyber Typing Speed',
    category: 'Brain',
    shortDesc: 'Test your words-per-minute (WPM) and accuracy against engaging tech passages.',
    description: 'Measure your typing speed and keystroke precision with real-time feedback. Track words-per-minute (WPM), accuracy percentage, and net characters typed.',
    instructions: [
      'Select a 30s or 60s timed session or practice passage.',
      'Type the highlighted passage as accurately and quickly as possible.',
      'Real-time green/red highlights track character accuracy.',
      'Receive your final WPM, accuracy %, and skill rating.'
    ],
    controls: {
      desktop: 'Type on physical keyboard',
      mobile: 'Type on mobile virtual keyboard'
    },
    rating: 4.8,
    playCount: 110000,
    new: true,
    accent: 'amber'
  }
];

export const CATEGORIES: GameCategory[] = ['Arcade', 'Action', 'Puzzle', 'Brain', 'Casual'];
