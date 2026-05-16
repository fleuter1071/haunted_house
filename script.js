const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const roomNameEl = document.getElementById("roomName");
const objectiveEl = document.getElementById("objective");
const inventoryEl = document.getElementById("inventory");
const fearFillEl = document.getElementById("fearFill");
const messageEl = document.getElementById("message");
const restartButton = document.getElementById("restartButton");
const startBriefingEl = document.getElementById("startBriefing");
const startButton = document.getElementById("startButton");
const musicToggleButton = document.getElementById("musicToggleButton");
const briefingMusicToggleButton = document.getElementById("briefingMusicToggleButton");

const W = canvas.width;
const H = canvas.height;
const keys = new Set();
const justPressed = new Set();

const TILE = 48;
const PLAYER_RADIUS = 15;
const FLASHLIGHT_REACH = 260;
const FLASHLIGHT_SPREAD = Math.PI / 4.8;

const assetSources = {
  player: "assets/characters/player.svg",
  friendCaptive: "assets/characters/friend-captive.svg",
  madScientist: "assets/characters/mad-scientist.svg",
  ghost: "assets/enemies/ghost.svg",
  experiment: "assets/enemies/experiment.svg",
  bookshelf: "assets/props/bookshelf.svg",
  candle: "assets/props/candle.svg",
  chamber: "assets/props/containment-chamber.svg",
  door: "assets/props/door.svg",
  gravestone: "assets/props/gravestone.svg",
  key: "assets/props/key.svg",
  labMachine: "assets/props/lab-machine.svg",
  portrait: "assets/props/portrait.svg",
  stairs: "assets/props/stairs.svg"
};

const assetImages = {};

const rooms = {
  yard: {
    name: "Hawkins Street",
    objective: "Follow the signal into the Creel House",
    floor: "#18211c",
    wall: "#202326",
    spawn: { x: 132, y: 470 },
    walls: [
      rect(0, 0, W, 36),
      rect(0, H - 36, W, 36),
      rect(0, 0, 36, H),
      rect(W - 36, 0, 36, H),
      rect(318, 112, 324, 36),
      rect(318, 112, 36, 214),
      rect(606, 112, 36, 214),
      rect(354, 290, 100, 36),
      rect(506, 290, 100, 36)
    ],
    props: [
      { type: "path", x: 60, y: 410, w: 842, h: 68 },
      { type: "fence", x: 74, y: 86, w: 230, h: 34 },
      { type: "fence", x: 676, y: 92, w: 196, h: 34 },
      { type: "tree", x: 180, y: 128 },
      { type: "tree", x: 754, y: 156 },
      { type: "streetlamp", x: 112, y: 360 },
      { type: "bike", x: 214, y: 386 },
      { type: "mailbox", x: 646, y: 360 },
      { type: "flyerBoard", x: 778, y: 318 },
      { type: "porch", x: 408, y: 230, w: 144, h: 96 }
    ],
    exits: [
      { x: 454, y: 278, w: 52, h: 42, to: "foyer", spawn: { x: 480, y: 500 }, label: "Enter the Creel House" }
    ],
    items: [],
    enemies: []
  },
  foyer: {
    name: "Creel House Entry",
    objective: "Find the signal key",
    floor: "#211b24",
    wall: "#2a2630",
    spawn: { x: 480, y: 512 },
    walls: [
      rect(0, 0, W, 36),
      rect(0, H - 36, W, 36),
      rect(0, 0, 36, H),
      rect(W - 36, 0, 36, H),
      rect(260, 108, 176, 34),
      rect(524, 108, 176, 34),
      rect(286, 260, 388, 34),
      rect(180, 156, 46, 276),
      rect(734, 156, 46, 276)
    ],
    props: [
      { type: "rug", x: 354, y: 286, w: 252, h: 190 },
      { type: "stairs", x: 436, y: 42, w: 88, h: 112 },
      { type: "portrait", x: 88, y: 108, w: 58, h: 84 },
      { type: "portrait", x: 814, y: 108, w: 58, h: 84 },
      { type: "familyPortraitWall", x: 480, y: 210 },
      { type: "grandfatherClock", x: 840, y: 350 },
      { type: "candle", x: 250, y: 214 },
      { type: "candle", x: 710, y: 214 },
      { type: "candle", x: 320, y: 492 },
      { type: "candle", x: 640, y: 492 }
    ],
    exits: [
      { x: 438, y: 70, w: 84, h: 48, to: "lab", spawn: { x: 480, y: 500 }, item: "signal key", label: "Open the gate to Vecna's lair" },
      { x: 36, y: 246, w: 42, h: 80, to: "library", spawn: { x: 854, y: 300 }, label: "Enter the study" },
      { x: 452, y: H - 38, w: 56, h: 36, to: "yard", spawn: { x: 480, y: 340 }, label: "Back to Hawkins Street" }
    ],
    items: [],
    enemies: []
  },
  library: {
    name: "Creel House Study",
    objective: "Decode the radio signal",
    floor: "#151926",
    wall: "#252838",
    spawn: { x: 854, y: 300 },
    walls: [
      rect(0, 0, W, 36),
      rect(0, H - 36, W, 36),
      rect(0, 0, 36, H),
      rect(W - 36, 0, 36, H),
      rect(142, 110, 256, 38),
      rect(562, 110, 256, 38),
      rect(142, 254, 256, 38),
      rect(562, 254, 256, 38),
      rect(142, 398, 256, 38),
      rect(562, 398, 256, 38)
    ],
    props: [
      { type: "shelf", x: 142, y: 110, w: 256, h: 38 },
      { type: "shelf", x: 562, y: 110, w: 256, h: 38 },
      { type: "shelf", x: 142, y: 254, w: 256, h: 38 },
      { type: "shelf", x: 562, y: 254, w: 256, h: 38 },
      { type: "shelf", x: 142, y: 398, w: 256, h: 38 },
      { type: "shelf", x: 562, y: 398, w: 256, h: 38 },
      { type: "christmasLights", x: 360, y: 176, w: 240, h: 118 },
      { type: "radio", x: 466, y: 332, w: 80, h: 56 }
    ],
    exits: [
      { x: W - 78, y: 252, w: 42, h: 88, to: "foyer", spawn: { x: 92, y: 286 }, label: "Return to foyer" }
    ],
    items: [
      { id: "signal-key", name: "signal key", x: 480, y: 232, hidden: true, requiresPuzzle: true, collected: false }
    ],
    enemies: [
      { id: "library-ghost", x: 482, y: 330, startX: 482, startY: 330, radius: 18, speed: 78, color: "#b7fff0", path: [{ x: 482, y: 174 }, { x: 482, y: 500 }], target: 0, startTarget: 0 }
    ]
  },
  lab: {
    name: "Vecna's Mind Lair",
    objective: "Break three psychic anchors",
    floor: "#171e20",
    wall: "#263133",
    spawn: { x: 480, y: 500 },
    walls: [
      rect(0, 0, W, 36),
      rect(0, H - 36, W, 36),
      rect(0, 0, 36, H),
      rect(W - 36, 0, 36, H),
      rect(204, 118, 120, 36),
      rect(636, 118, 120, 36),
      rect(388, 246, 184, 88)
    ],
    props: [
      { type: "machine", x: 386, y: 116, w: 188, h: 126 },
      { type: "chamber", x: 424, y: 256, w: 112, h: 96 },
      { type: "scientist", x: 694, y: 266 }
    ],
    exits: [
      { x: 452, y: H - 38, w: 56, h: 36, to: "foyer", spawn: { x: 480, y: 144 }, label: "Back to the Creel House" }
    ],
    items: [],
    nodes: [
      { id: "node-a", x: 178, y: 180, active: true },
      { id: "node-b", x: 782, y: 180, active: true },
      { id: "node-c", x: 480, y: 438, active: true }
    ],
    enemies: [
      { id: "lab-experiment", x: 250, y: 374, startX: 250, startY: 374, radius: 20, speed: 96, color: "#74f2a3", path: [{ x: 250, y: 374 }, { x: 712, y: 374 }, { x: 712, y: 492 }, { x: 250, y: 492 }], target: 1, startTarget: 1 }
    ]
  }
};

let state;
let lastTime = performance.now();
let messageTimer = 0;
let gameStarted = false;
let introMusicEnabled = getStoredIntroMusicPreference();
let introMusicBlocked = false;
const introMusic = new Audio("assets/audio/upside-down-theme.mp3");
introMusic.loop = true;
introMusic.volume = 0.55;
introMusic.preload = "auto";
const demogorgonSound = new Audio("assets/audio/demogorgon_sound.mp3");
demogorgonSound.loop = true;
demogorgonSound.volume = 0.62;
demogorgonSound.preload = "auto";
let demogorgonSoundBlocked = false;

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function getStoredIntroMusicPreference() {
  try {
    return localStorage.getItem("introMusic") !== "off";
  } catch (error) {
    return true;
  }
}

function storeIntroMusicPreference() {
  try {
    localStorage.setItem("introMusic", introMusicEnabled ? "on" : "off");
  } catch (error) {
    // Private browsing or locked-down storage should not break the game.
  }
}

function updateIntroMusicButtons() {
  const label = introMusicEnabled ? "Intro Music On" : "Intro Music Off";
  for (const button of [musicToggleButton, briefingMusicToggleButton]) {
    if (!button) continue;
    button.textContent = label;
    button.setAttribute("aria-pressed", introMusicEnabled ? "true" : "false");
  }
}

function playIntroMusic() {
  if (!introMusicEnabled) return;
  const playAttempt = introMusic.play();
  if (!playAttempt) return;

  playAttempt
    .then(() => {
      introMusicBlocked = false;
    })
    .catch(() => {
      introMusicBlocked = true;
    });
}

function pauseIntroMusic() {
  introMusic.pause();
}

function toggleIntroMusic() {
  introMusicEnabled = !introMusicEnabled;
  storeIntroMusicPreference();
  updateIntroMusicButtons();

  if (introMusicEnabled) {
    playIntroMusic();
  } else {
    introMusicBlocked = false;
    pauseIntroMusic();
  }
}

function retryIntroMusicAfterInteraction() {
  if (introMusicEnabled && (introMusic.paused || introMusicBlocked)) {
    playIntroMusic();
  }
}

function playDemogorgonSound() {
  if (state.roomId !== "library" || state.won) return;
  const playAttempt = demogorgonSound.play();
  if (!playAttempt) return;

  playAttempt
    .then(() => {
      demogorgonSoundBlocked = false;
    })
    .catch(() => {
      demogorgonSoundBlocked = true;
    });
}

function pauseDemogorgonSound() {
  demogorgonSound.pause();
  demogorgonSound.currentTime = 0;
}

function updateDemogorgonSound() {
  if (!gameStarted || state.roomId !== "library" || state.won) {
    if (!demogorgonSound.paused) pauseDemogorgonSound();
    return;
  }

  if (demogorgonSound.paused || demogorgonSoundBlocked) {
    playDemogorgonSound();
  }
}

function retryAudioAfterInteraction() {
  retryIntroMusicAfterInteraction();
  updateDemogorgonSound();
}

function loadAssets() {
  const entries = Object.entries(assetSources);

  return Promise.all(entries.map(([name, src]) => (
    new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        assetImages[name] = image;
        resolve();
      };
      image.onerror = () => resolve();
      image.src = src;
    })
  )));
}

function drawAsset(name, x, y, w, h) {
  const image = assetImages[name];
  if (!image || !image.complete) return false;
  ctx.drawImage(image, x, y, w, h);
  return true;
}

function resetGame() {
  pauseDemogorgonSound();

  for (const room of Object.values(rooms)) {
    if (room.items) room.items.forEach((item) => { item.collected = false; });
    if (room.nodes) room.nodes.forEach((node) => { node.active = true; });
    if (room.enemies) {
      room.enemies.forEach((enemy) => {
        enemy.x = enemy.startX;
        enemy.y = enemy.startY;
        enemy.target = enemy.startTarget;
      });
    }
  }

  state = {
    roomId: "yard",
    player: { x: rooms.yard.spawn.x, y: rooms.yard.spawn.y, vx: 1, vy: 0 },
    inventory: [],
    fear: 0,
    flashlight: true,
    libraryPuzzle: {
      clueSeen: false,
      radioOpen: false,
      selectedDigit: 0,
      frequency: [0, 0, 0],
      answer: [4, 1, 5],
      solved: false,
      penaltyTimer: 0
    },
    endingPhase: "playing",
    endingTimer: 0,
    won: false,
    pulse: 0
  };

  showMessage("Find Eleven before Vecna pulls her under.");
  updateHud();
}

function currentRoom() {
  return rooms[state.roomId];
}

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.add("show");
  messageTimer = 2.6;
}

function updateHud() {
  const room = currentRoom();
  roomNameEl.textContent = room.name;

  if (state.won || state.endingPhase === "complete") {
    objectiveEl.textContent = "Eleven is safe";
  } else if (state.endingPhase === "chamberOpening") {
    objectiveEl.textContent = "Vecna's hold is breaking";
  } else if (state.endingPhase === "reunited") {
    objectiveEl.textContent = "Get Eleven out";
  } else if (state.roomId === "foyer" && state.inventory.includes("signal key")) {
    objectiveEl.textContent = "Open the gate to Vecna's lair";
  } else if (state.roomId === "library") {
    objectiveEl.textContent = getLibraryObjective();
  } else if (state.roomId === "lab") {
    const active = room.nodes.filter((node) => node.active).length;
    objectiveEl.textContent = active > 0 ? `Break ${active} psychic anchor${active === 1 ? "" : "s"}` : "Break Vecna's hold on Eleven";
  } else {
    objectiveEl.textContent = room.objective;
  }

  inventoryEl.textContent = state.inventory.length ? state.inventory.join(", ") : "None";
  fearFillEl.style.width = `${Math.round(state.fear)}%`;
}

function update(dt) {
  updateDemogorgonSound();

  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) messageEl.classList.remove("show");
  }

  if (state.won) {
    state.pulse += dt;
    return;
  }

  if (state.endingPhase !== "playing") {
    updateEnding(dt);
    updateHud();
    justPressed.clear();
    return;
  }

  if (state.libraryPuzzle.penaltyTimer > 0) {
    state.libraryPuzzle.penaltyTimer = Math.max(0, state.libraryPuzzle.penaltyTimer - dt);
  }

  if (state.libraryPuzzle.radioOpen) {
    handleInput(dt);
    updateHud();
    justPressed.clear();
    return;
  }

  handleInput(dt);
  updateEnemies(dt);
  updateFear(dt);
  handleInteract();
  updateStudyClueVisibility();
  updateHud();
  justPressed.clear();
}

function handleInput(dt) {
  if (state.libraryPuzzle.radioOpen) {
    handleRadioInput();
    return;
  }

  if (justPressed.has(" ")) {
    state.flashlight = !state.flashlight;
    showMessage(state.flashlight ? "Flashlight on." : "Flashlight off.");
  }

  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
    state.player.vx = dx;
    state.player.vy = dy;
  }

  const speed = 178;
  movePlayer(dx * speed * dt, dy * speed * dt);
}

function handleRadioInput() {
  const puzzle = state.libraryPuzzle;

  if (justPressed.has("escape")) {
    puzzle.radioOpen = false;
    showMessage("You step back from the radio.");
    return;
  }

  if (justPressed.has("arrowleft") || justPressed.has("a")) {
    puzzle.selectedDigit = Math.max(0, puzzle.selectedDigit - 1);
  }

  if (justPressed.has("arrowright") || justPressed.has("d")) {
    puzzle.selectedDigit = Math.min(2, puzzle.selectedDigit + 1);
  }

  if (justPressed.has("arrowup") || justPressed.has("w")) {
    puzzle.frequency[puzzle.selectedDigit] = (puzzle.frequency[puzzle.selectedDigit] + 1) % 10;
  }

  if (justPressed.has("arrowdown") || justPressed.has("s")) {
    puzzle.frequency[puzzle.selectedDigit] = (puzzle.frequency[puzzle.selectedDigit] + 9) % 10;
  }

  if (justPressed.has("e") || justPressed.has("enter")) {
    submitRadioFrequency();
  }
}

function updateStudyClueVisibility() {
  if (state.roomId !== "library" || state.libraryPuzzle.solved) return;

  const lightWall = rooms.library.props.find((prop) => prop.type === "christmasLights");
  if (!lightWall) return;

  const cluePoint = {
    x: lightWall.x + lightWall.w / 2,
    y: lightWall.y + lightWall.h / 2
  };

  if (state.flashlight && pointInFlashlight(cluePoint.x, cluePoint.y)) {
    state.libraryPuzzle.clueSeen = true;
  }
}

function submitRadioFrequency() {
  const puzzle = state.libraryPuzzle;
  const correct = puzzle.frequency.every((digit, index) => digit === puzzle.answer[index]);

  if (correct) {
    puzzle.solved = true;
    puzzle.radioOpen = false;
    state.fear = Math.max(0, state.fear - 10);
    showMessage("The static clears. Eleven's signal breaks through. The signal key appears.");
    return;
  }

  puzzle.penaltyTimer = 3;
  state.fear = clamp(state.fear + 16, 0, 100);
  showMessage("Static screams back. Mind Pressure rises.");
}

function movePlayer(dx, dy) {
  const room = currentRoom();
  const nextX = clamp(state.player.x + dx, PLAYER_RADIUS + 36, W - PLAYER_RADIUS - 36);
  const nextY = clamp(state.player.y + dy, PLAYER_RADIUS + 36, H - PLAYER_RADIUS - 36);

  if (!collides(nextX, state.player.y, room.walls)) state.player.x = nextX;
  if (!collides(state.player.x, nextY, room.walls)) state.player.y = nextY;
}

function collides(x, y, walls) {
  return walls.some((wall) => (
    x + PLAYER_RADIUS > wall.x &&
    x - PLAYER_RADIUS < wall.x + wall.w &&
    y + PLAYER_RADIUS > wall.y &&
    y - PLAYER_RADIUS < wall.y + wall.h
  ));
}

function updateEnemies(dt) {
  const room = currentRoom();
  if (!room.enemies) return;

  for (const enemy of room.enemies) {
    const target = enemy.path[enemy.target];
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    const slowed = state.flashlight && pointInFlashlight(enemy.x, enemy.y);
    const alerted = state.roomId === "library" && state.libraryPuzzle.penaltyTimer > 0;
    const speed = enemy.speed * (alerted ? 1.65 : 1) * (slowed ? 0.32 : 1);

    if (distance < 4) {
      enemy.target = (enemy.target + 1) % enemy.path.length;
    } else {
      enemy.x += (dx / distance) * speed * dt;
      enemy.y += (dy / distance) * speed * dt;
    }
  }
}

function updateFear(dt) {
  const room = currentRoom();
  let pressure = -10;

  if (room.enemies) {
    for (const enemy of room.enemies) {
      const distance = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
      if (distance < 52) pressure += 48;
      else if (distance < 110) pressure += 18;
    }
  }

  state.fear = clamp(state.fear + pressure * dt, 0, 100);
  if (state.fear >= 100) {
    const spawn = currentRoom().spawn;
    state.player.x = spawn.x;
    state.player.y = spawn.y;
    state.fear = 30;
    showMessage("Mind pressure spikes. You stumble back to the room entrance.");
  }
}

function handleInteract() {
  if (!justPressed.has("e")) return;

  const room = currentRoom();

  for (const exit of room.exits) {
    if (circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 7, exit)) {
      if (exit.item && !state.inventory.includes(exit.item)) {
        showMessage(`Vecna's gate needs the ${exit.item}.`);
        return;
      }

      state.roomId = exit.to;
      state.player.x = exit.spawn.x;
      state.player.y = exit.spawn.y;
      state.fear = Math.max(0, state.fear - 12);
      updateDemogorgonSound();
      showMessage(exit.label);
      return;
    }
  }

  if (state.roomId === "library" && !state.libraryPuzzle.solved) {
    const radio = room.props.find((prop) => prop.type === "radio");
    if (radio && circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 7, radio)) {
      state.libraryPuzzle.radioOpen = true;
      showMessage("Tune the radio to the frequency from the lights.");
      return;
    }
  }

  if (room.items) {
    for (const item of room.items) {
      if (!item.collected && isItemVisible(item) && distanceToPlayer(item) < 44) {
        item.collected = true;
        state.inventory.push(item.name);
        showMessage("You found the signal key.");
        return;
      }
    }
  }

  if (room.nodes) {
    for (const node of room.nodes) {
      if (node.active && distanceToPlayer(node) < 48) {
        node.active = false;
        state.fear = Math.max(0, state.fear - 10);
        const remaining = room.nodes.filter((powerNode) => powerNode.active).length;
        showMessage(remaining ? "Psychic anchor broken." : "Vecna's hold is breaking. Get to Eleven!");
        return;
      }
    }

    const chamber = { x: 424, y: 256, w: 112, h: 96 };
    const allDisabled = room.nodes.every((node) => !node.active);
    if (allDisabled && circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 9, chamber)) {
      startRescueSequence();
    } else if (!allDisabled && circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 9, chamber)) {
      showMessage("Vecna's psychic hold is still too strong.");
    }
  }
}

function startRescueSequence() {
  if (state.endingPhase !== "playing") return;
  state.endingPhase = "chamberOpening";
  state.endingTimer = 0;
  state.flashlight = true;
  state.fear = 0;
  showMessage("The red fog splits. Eleven reaches for you.");
  updateHud();
}

function updateEnding(dt) {
  state.endingTimer += dt;
  state.pulse += dt;

  if (state.endingPhase === "chamberOpening" && state.endingTimer >= 1.25) {
    state.endingPhase = "reunited";
    state.endingTimer = 0;
    showMessage("You pull Eleven back. Vecna recoils.");
    return;
  }

  if (state.endingPhase === "reunited" && state.endingTimer >= 2.4) {
    state.endingPhase = "complete";
    state.won = true;
    state.endingTimer = 0;
    showMessage("You escape the Upside Down together.");
  }
}

function render() {
  const room = currentRoom();
  drawRoom(room);
  drawExits(room);
  drawItems(room);
  drawNodes(room);
  drawEnemies(room);
  drawPlayer();
  drawLighting(room);
  drawEndingSequence();
  drawWinOverlay();
  drawRadioTuningOverlay();
}

function drawRoom(room) {
  ctx.fillStyle = room.floor;
  ctx.fillRect(0, 0, W, H);

  drawFloorPattern(room);
  drawRoomAtmosphere(room);
  drawProps(room);
  drawRoomPropConnections(room);

  for (const wall of room.walls) {
    drawStyledWall(wall, room);
  }

  drawForegroundProps(room);
}

function drawStyledWall(wall, room) {
  const style = getWallStyle(room);
  const horizontal = wall.w >= wall.h;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(wall.x + 4, wall.y + wall.h - 4, wall.w, 8);

  ctx.fillStyle = style.base;
  ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

  ctx.fillStyle = style.top;
  if (horizontal) {
    ctx.fillRect(wall.x, wall.y, wall.w, Math.min(8, wall.h * 0.34));
  } else {
    ctx.fillRect(wall.x, wall.y, Math.min(8, wall.w * 0.34), wall.h);
  }

  ctx.fillStyle = style.shadow;
  if (horizontal) {
    ctx.fillRect(wall.x, wall.y + wall.h - 7, wall.w, 7);
  } else {
    ctx.fillRect(wall.x + wall.w - 7, wall.y, 7, wall.h);
  }

  ctx.strokeStyle = style.edge;
  ctx.lineWidth = 2;
  ctx.strokeRect(wall.x + 1, wall.y + 1, wall.w - 2, wall.h - 2);

  drawWallMaterial(wall, style, horizontal);
  ctx.restore();
}

function getWallStyle(room) {
  if (room.name === "Hawkins Street") {
    return {
      material: "stone",
      base: "#20272a",
      top: "#31393b",
      shadow: "rgba(5, 6, 10, 0.34)",
      edge: "rgba(216, 196, 156, 0.18)",
      detail: "rgba(216, 196, 156, 0.14)"
    };
  }

  if (room.name === "Creel House Entry") {
    return {
      material: "creelHouse",
      base: "#2b2430",
      top: "#3d3038",
      shadow: "rgba(5, 6, 10, 0.32)",
      edge: "rgba(231, 196, 106, 0.2)",
      detail: "rgba(231, 196, 106, 0.16)"
    };
  }

  if (room.name === "Creel House Study") {
    return {
      material: "creelStudy",
      base: "#202234",
      top: "#303149",
      shadow: "rgba(5, 6, 10, 0.36)",
      edge: "rgba(231, 196, 106, 0.16)",
      detail: "rgba(79, 135, 168, 0.18)"
    };
  }

  if (room.name === "Vecna's Mind Lair") {
    return {
      material: "upsideDown",
      base: "#1b2424",
      top: "#2b3334",
      shadow: "rgba(5, 6, 10, 0.42)",
      edge: "rgba(255, 82, 92, 0.18)",
      detail: "rgba(255, 82, 92, 0.18)"
    };
  }

  return {
    material: "lab",
    base: "#263133",
    top: "#344245",
    shadow: "rgba(5, 6, 10, 0.34)",
    edge: "rgba(116, 242, 163, 0.18)",
    detail: "rgba(116, 242, 163, 0.22)"
  };
}

function drawWallMaterial(wall, style, horizontal) {
  if (style.material === "stone") {
    drawStoneWallDetail(wall, style, horizontal);
  } else if (style.material === "creelHouse") {
    drawCreelHouseWallDetail(wall, style, horizontal);
  } else if (style.material === "wood") {
    drawWoodWallDetail(wall, style, horizontal);
  } else if (style.material === "library") {
    drawLibraryWallDetail(wall, style, horizontal);
  } else if (style.material === "creelStudy") {
    drawCreelStudyWallDetail(wall, style, horizontal);
  } else if (style.material === "upsideDown") {
    drawUpsideDownWallDetail(wall, style, horizontal);
  } else {
    drawLabWallDetail(wall, style, horizontal);
  }
}

function drawStoneWallDetail(wall, style, horizontal) {
  ctx.strokeStyle = style.detail;
  ctx.lineWidth = 2;
  const step = horizontal ? 42 : 36;
  const inset = 7;

  if (horizontal) {
    for (let x = wall.x + 12; x < wall.x + wall.w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, wall.y + inset);
      ctx.lineTo(x + 10, wall.y + wall.h - inset);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(wall.x + 8, wall.y + wall.h / 2);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + wall.h / 2);
    ctx.stroke();
  } else {
    for (let y = wall.y + 12; y < wall.y + wall.h; y += step) {
      ctx.beginPath();
      ctx.moveTo(wall.x + inset, y);
      ctx.lineTo(wall.x + wall.w - inset, y + 10);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w / 2, wall.y + 8);
    ctx.lineTo(wall.x + wall.w / 2, wall.y + wall.h - 8);
    ctx.stroke();
  }
}

function drawWoodWallDetail(wall, style, horizontal) {
  ctx.strokeStyle = style.detail;
  ctx.lineWidth = 3;
  const step = 28;

  if (horizontal) {
    for (let x = wall.x + step; x < wall.x + wall.w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, wall.y + 5);
      ctx.lineTo(x, wall.y + wall.h - 7);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(91, 60, 36, 0.42)";
    ctx.beginPath();
    ctx.moveTo(wall.x + 6, wall.y + wall.h - 10);
    ctx.lineTo(wall.x + wall.w - 6, wall.y + wall.h - 10);
    ctx.stroke();
  } else {
    for (let y = wall.y + step; y < wall.y + wall.h; y += step) {
      ctx.beginPath();
      ctx.moveTo(wall.x + 5, y);
      ctx.lineTo(wall.x + wall.w - 7, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(91, 60, 36, 0.42)";
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w - 10, wall.y + 6);
    ctx.lineTo(wall.x + wall.w - 10, wall.y + wall.h - 6);
    ctx.stroke();
  }
}

function drawCreelHouseWallDetail(wall, style, horizontal) {
  ctx.save();
  ctx.lineCap = "round";

  ctx.fillStyle = "rgba(58, 42, 47, 0.38)";
  if (horizontal) {
    for (let x = wall.x + 14; x < wall.x + wall.w - 12; x += 52) {
      ctx.fillRect(x, wall.y + 8, 34, Math.max(8, wall.h - 18));
    }
  } else {
    for (let y = wall.y + 14; y < wall.y + wall.h - 12; y += 52) {
      ctx.fillRect(wall.x + 8, y, Math.max(8, wall.w - 18), 34);
    }
  }

  ctx.strokeStyle = "rgba(231, 196, 106, 0.22)";
  ctx.lineWidth = 3;
  if (horizontal) {
    ctx.beginPath();
    ctx.moveTo(wall.x + 8, wall.y + wall.h - 9);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + wall.h - 9);
    ctx.moveTo(wall.x + 8, wall.y + 9);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + 9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(wall.x + 9, wall.y + 8);
    ctx.lineTo(wall.x + 9, wall.y + wall.h - 8);
    ctx.moveTo(wall.x + wall.w - 9, wall.y + 8);
    ctx.lineTo(wall.x + wall.w - 9, wall.y + wall.h - 8);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(12, 10, 14, 0.38)";
  ctx.lineWidth = 2;
  const cracks = horizontal
    ? [[wall.x + wall.w * 0.28, wall.y + 12], [wall.x + wall.w * 0.63, wall.y + wall.h - 12]]
    : [[wall.x + 12, wall.y + wall.h * 0.32], [wall.x + wall.w - 12, wall.y + wall.h * 0.68]];
  for (const [x, y] of cracks) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (horizontal ? 16 : -8), y + 10);
    ctx.lineTo(x + (horizontal ? 7 : 7), y + 24);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(246, 240, 223, 0.08)";
  if (horizontal) {
    for (let x = wall.x + 28; x < wall.x + wall.w - 8; x += 84) {
      ctx.fillRect(x, wall.y + 13, 8, Math.max(6, wall.h - 26));
    }
  } else {
    for (let y = wall.y + 28; y < wall.y + wall.h - 8; y += 84) {
      ctx.fillRect(wall.x + 13, y, Math.max(6, wall.w - 26), 8);
    }
  }

  ctx.restore();
}

function drawLibraryWallDetail(wall, style, horizontal) {
  ctx.strokeStyle = style.detail;
  ctx.lineWidth = 2;

  if (horizontal) {
    for (let x = wall.x + 14; x < wall.x + wall.w - 8; x += 18) {
      const h = 10 + ((x / 18) % 3) * 4;
      ctx.fillStyle = x % 36 === 0 ? "rgba(208, 166, 75, 0.18)" : "rgba(79, 135, 168, 0.18)";
      ctx.fillRect(x, wall.y + wall.h - h - 8, 8, h);
    }
    ctx.beginPath();
    ctx.moveTo(wall.x + 8, wall.y + wall.h - 8);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + wall.h - 8);
    ctx.stroke();
  } else {
    for (let y = wall.y + 14; y < wall.y + wall.h - 8; y += 18) {
      const w = 10 + ((y / 18) % 3) * 4;
      ctx.fillStyle = y % 36 === 0 ? "rgba(208, 166, 75, 0.18)" : "rgba(79, 135, 168, 0.18)";
      ctx.fillRect(wall.x + wall.w - w - 8, y, w, 8);
    }
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w - 8, wall.y + 8);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + wall.h - 8);
    ctx.stroke();
  }
}

function drawCreelStudyWallDetail(wall, style, horizontal) {
  ctx.save();
  ctx.lineCap = "round";

  ctx.fillStyle = "rgba(18, 17, 28, 0.36)";
  if (horizontal) {
    for (let x = wall.x + 12; x < wall.x + wall.w - 10; x += 64) {
      ctx.fillRect(x, wall.y + 8, 44, Math.max(8, wall.h - 18));
    }
  } else {
    for (let y = wall.y + 12; y < wall.y + wall.h - 10; y += 64) {
      ctx.fillRect(wall.x + 8, y, Math.max(8, wall.w - 18), 44);
    }
  }

  ctx.strokeStyle = "rgba(231, 196, 106, 0.2)";
  ctx.lineWidth = 3;
  if (horizontal) {
    ctx.beginPath();
    ctx.moveTo(wall.x + 8, wall.y + 9);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + 9);
    ctx.moveTo(wall.x + 8, wall.y + wall.h - 9);
    ctx.lineTo(wall.x + wall.w - 8, wall.y + wall.h - 9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(wall.x + 9, wall.y + 8);
    ctx.lineTo(wall.x + 9, wall.y + wall.h - 8);
    ctx.moveTo(wall.x + wall.w - 9, wall.y + 8);
    ctx.lineTo(wall.x + wall.w - 9, wall.y + wall.h - 8);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(79, 135, 168, 0.18)";
  if (horizontal) {
    for (let x = wall.x + 18; x < wall.x + wall.w - 10; x += 24) {
      const bookH = 7 + ((x / 24) % 3) * 3;
      ctx.fillRect(x, wall.y + wall.h - bookH - 10, 8, bookH);
    }
  } else {
    for (let y = wall.y + 18; y < wall.y + wall.h - 10; y += 24) {
      const bookW = 7 + ((y / 24) % 3) * 3;
      ctx.fillRect(wall.x + wall.w - bookW - 10, y, bookW, 8);
    }
  }

  ctx.strokeStyle = "rgba(246, 240, 223, 0.1)";
  ctx.lineWidth = 2;
  if (horizontal) {
    for (let x = wall.x + 44; x < wall.x + wall.w - 18; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, wall.y + 12);
      ctx.lineTo(x + 14, wall.y + wall.h - 12);
      ctx.stroke();
    }
  } else {
    for (let y = wall.y + 44; y < wall.y + wall.h - 18; y += 96) {
      ctx.beginPath();
      ctx.moveTo(wall.x + 12, y);
      ctx.lineTo(wall.x + wall.w - 12, y + 14);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawLabWallDetail(wall, style, horizontal) {
  ctx.strokeStyle = style.detail;
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 10]);

  if (horizontal) {
    ctx.beginPath();
    ctx.moveTo(wall.x + 10, wall.y + wall.h / 2);
    ctx.lineTo(wall.x + wall.w - 10, wall.y + wall.h / 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w / 2, wall.y + 10);
    ctx.lineTo(wall.x + wall.w / 2, wall.y + wall.h - 10);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(116, 242, 163, 0.18)";
  const step = 48;
  if (horizontal) {
    for (let x = wall.x + 18; x < wall.x + wall.w; x += step) {
      ctx.fillRect(x, wall.y + 8, 5, 5);
    }
  } else {
    for (let y = wall.y + 18; y < wall.y + wall.h; y += step) {
      ctx.fillRect(wall.x + 8, y, 5, 5);
    }
  }
}

function drawUpsideDownWallDetail(wall, style, horizontal) {
  ctx.lineCap = "round";
  ctx.fillStyle = "rgba(6, 7, 9, 0.26)";
  if (horizontal) {
    for (let x = wall.x + 18; x < wall.x + wall.w - 20; x += 72) {
      ctx.beginPath();
      ctx.ellipse(x + 16, wall.y + wall.h / 2, 24, Math.max(5, wall.h * 0.22), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    for (let y = wall.y + 18; y < wall.y + wall.h - 20; y += 72) {
      ctx.beginPath();
      ctx.ellipse(wall.x + wall.w / 2, y + 16, Math.max(5, wall.w * 0.22), 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(82, 38, 31, 0.6)";
  ctx.lineWidth = 7;
  if (horizontal) {
    for (let x = wall.x + 24; x < wall.x + wall.w - 12; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, wall.y + wall.h - 6);
      ctx.quadraticCurveTo(x + 18, wall.y + 5, x + 40, wall.y + wall.h - 12);
      ctx.stroke();
    }
  } else {
    for (let y = wall.y + 24; y < wall.y + wall.h - 12; y += 56) {
      ctx.beginPath();
      ctx.moveTo(wall.x + wall.w - 6, y);
      ctx.quadraticCurveTo(wall.x + 5, y + 18, wall.x + wall.w - 12, y + 40);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "rgba(255, 82, 92, 0.32)";
  ctx.lineWidth = 3;
  if (horizontal) {
    ctx.beginPath();
    ctx.moveTo(wall.x + 10, wall.y + wall.h / 2);
    for (let x = wall.x + 44; x < wall.x + wall.w - 10; x += 48) {
      ctx.lineTo(x, wall.y + wall.h / 2 + (x % 96 === 0 ? -7 : 6));
    }
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(wall.x + wall.w / 2, wall.y + 10);
    for (let y = wall.y + 44; y < wall.y + wall.h - 10; y += 48) {
      ctx.lineTo(wall.x + wall.w / 2 + (y % 96 === 0 ? -7 : 6), y);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(72, 199, 131, 0.18)";
  ctx.lineWidth = 2;
  if (horizontal) {
    for (let x = wall.x + 30; x < wall.x + wall.w - 20; x += 84) {
      ctx.beginPath();
      ctx.moveTo(x, wall.y + wall.h - 9);
      ctx.lineTo(x + 12, wall.y + wall.h - 18);
      ctx.moveTo(x + 12, wall.y + wall.h - 18);
      ctx.lineTo(x + 23, wall.y + wall.h - 11);
      ctx.stroke();
    }
  } else {
    for (let y = wall.y + 30; y < wall.y + wall.h - 20; y += 84) {
      ctx.beginPath();
      ctx.moveTo(wall.x + wall.w - 9, y);
      ctx.lineTo(wall.x + wall.w - 18, y + 12);
      ctx.moveTo(wall.x + wall.w - 18, y + 12);
      ctx.lineTo(wall.x + wall.w - 11, y + 23);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(255, 82, 92, 0.34)";
  const count = horizontal ? Math.max(2, Math.floor(wall.w / 92)) : Math.max(2, Math.floor(wall.h / 92));
  for (let i = 0; i < count; i += 1) {
    const x = horizontal ? wall.x + 28 + i * 92 : wall.x + wall.w / 2 + ((i % 2) * 8 - 4);
    const y = horizontal ? wall.y + wall.h / 2 + ((i % 2) * 6 - 3) : wall.y + 28 + i * 92;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 82, 92, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawFloorPattern(room) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 1;
  for (let x = 36; x < W; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, 36);
    ctx.lineTo(x, H - 36);
    ctx.stroke();
  }
  for (let y = 36; y < H; y += TILE) {
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(W - 36, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoomAtmosphere(room) {
  if (room.name === "Hawkins Street") {
    ctx.save();
    drawHawkinsStreetGround();
    drawHawkinsHouseApproach();
    drawHawkinsStreetSurfaceWear();
    drawHawkinsStreetMoodCues();
    ctx.restore();
    return;
  }

  if (room.name === "Creel House Entry") {
    ctx.save();
    drawCreelHouseFloorboards();
    drawCreelHouseFloorWear();
    drawCreelHouseFocalPath();
    drawCreelHouseMoodCues();
    ctx.restore();
    return;
  }

  if (room.name === "Creel House Study") {
    ctx.save();
    drawCreelStudyFloor();
    drawCreelStudySurfaceWear();
    drawCreelStudySignalPath();
    drawCreelStudyMoodCues();
    ctx.restore();
    return;
  }

  if (room.name !== "Vecna's Mind Lair") return;

  ctx.save();
  drawUpsideDownFloorCracks();
  drawUpsideDownFloorVeins();
  drawUpsideDownSpores();
  drawPsychicRoomHaze();
  ctx.restore();
}

function drawHawkinsStreetGround() {
  ctx.save();

  const roadY = H - 138;
  const roadH = 102;
  ctx.fillStyle = "#15191c";
  ctx.fillRect(36, roadY, W - 72, roadH);

  ctx.fillStyle = "#232a2c";
  ctx.fillRect(36, roadY, W - 72, 10);
  ctx.fillStyle = "#2b312f";
  ctx.fillRect(36, roadY - 16, W - 72, 16);

  ctx.strokeStyle = "rgba(216, 196, 156, 0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(54, roadY + 47);
  ctx.lineTo(W - 54, roadY + 47);
  ctx.stroke();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 72; x < W - 60; x += 92) {
    ctx.beginPath();
    ctx.moveTo(x, roadY + 18);
    ctx.lineTo(x + 42, roadY + 12);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(7, 12, 9, 0.18)";
  const grassPatches = [
    [86, 186, 130, 42], [732, 214, 142, 44], [110, 354, 180, 36],
    [678, 344, 188, 38], [378, 372, 204, 30]
  ];
  for (const [x, y, w, h] of grassPatches) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, -0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawHawkinsHouseApproach() {
  ctx.save();

  ctx.fillStyle = "rgba(5, 6, 10, 0.28)";
  ctx.beginPath();
  ctx.moveTo(310, 112);
  ctx.lineTo(650, 112);
  ctx.lineTo(690, 338);
  ctx.lineTo(270, 338);
  ctx.closePath();
  ctx.fill();

  const walk = ctx.createLinearGradient(480, 318, 480, H - 142);
  walk.addColorStop(0, "#3d3b34");
  walk.addColorStop(1, "#2e312e");
  ctx.fillStyle = walk;
  ctx.beginPath();
  ctx.moveTo(438, 318);
  ctx.lineTo(522, 318);
  ctx.lineTo(584, H - 142);
  ctx.lineTo(376, H - 142);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(231, 196, 106, 0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(438, 318);
  ctx.lineTo(376, H - 142);
  ctx.moveTo(522, 318);
  ctx.lineTo(584, H - 142);
  ctx.stroke();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.09)";
  ctx.lineWidth = 2;
  for (let y = 344; y < H - 154; y += 42) {
    const inset = (y - 344) * 0.22;
    ctx.beginPath();
    ctx.moveTo(428 - inset, y);
    ctx.lineTo(532 + inset, y + 2);
    ctx.stroke();
  }

  const porchGlow = ctx.createRadialGradient(480, 286, 10, 480, 286, 106);
  porchGlow.addColorStop(0, "rgba(231, 196, 106, 0.11)");
  porchGlow.addColorStop(0.52, "rgba(120, 158, 176, 0.045)");
  porchGlow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = porchGlow;
  ctx.beginPath();
  ctx.arc(480, 286, 106, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHawkinsStreetSurfaceWear() {
  ctx.save();
  ctx.lineCap = "round";

  ctx.strokeStyle = "rgba(246, 240, 223, 0.07)";
  ctx.lineWidth = 2;
  const cracks = [
    [106, 496, 54, -8], [240, 520, 42, 10], [610, 492, 60, -12],
    [764, 532, 48, 8], [410, 382, 46, -6], [530, 394, 42, 8]
  ];
  for (const [x, y, w, dy] of cracks) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + dy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(74, 93, 65, 0.18)";
  ctx.lineWidth = 2;
  for (const [x, y, h] of [[72, 246, 34], [236, 352, 28], [724, 314, 32], [840, 220, 26], [592, 370, 24]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 8, y - 12, x + 2, y - h);
    ctx.moveTo(x + 9, y + 4);
    ctx.quadraticCurveTo(x + 18, y - 8, x + 12, y - h + 4);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHawkinsStreetMoodCues() {
  ctx.save();

  const doorPull = ctx.createLinearGradient(480, H - 134, 480, 276);
  doorPull.addColorStop(0, "rgba(120, 158, 176, 0.025)");
  doorPull.addColorStop(0.45, "rgba(231, 196, 106, 0.045)");
  doorPull.addColorStop(1, "rgba(255, 82, 92, 0.065)");
  ctx.fillStyle = doorPull;
  ctx.beginPath();
  ctx.moveTo(370, H - 142);
  ctx.quadraticCurveTo(430, 368, 454, 300);
  ctx.lineTo(506, 300);
  ctx.quadraticCurveTo(530, 368, 590, H - 142);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(169, 194, 190, 0.045)";
  const fogBands = [
    [84, 402, 210, 20, -0.04],
    [304, 434, 280, 24, 0.03],
    [618, 396, 250, 22, -0.02],
    [164, 500, 330, 18, 0.01],
    [558, 514, 300, 18, -0.03]
  ];
  for (const [x, y, w, h, tilt] of fogBands) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, tilt, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255, 82, 92, 0.16)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  const porchVines = [
    [[410, 286], [382, 304], [366, 338], [336, 360]],
    [[550, 286], [584, 306], [604, 336], [634, 356]],
    [[468, 322], [456, 350], [438, 380], [420, 402]]
  ];
  for (const vine of porchVines) {
    ctx.beginPath();
    ctx.moveTo(vine[0][0], vine[0][1]);
    for (let i = 1; i < vine.length - 1; i += 1) {
      const current = vine[i];
      const next = vine[i + 1];
      ctx.quadraticCurveTo(current[0], current[1], next[0], next[1]);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(116, 242, 163, 0.075)";
  for (const [x, y, r] of [[326, 370, 2], [388, 338, 1.4], [572, 340, 1.8], [648, 374, 1.5], [456, 414, 1.4], [512, 412, 1.5]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelHouseFloorboards() {
  ctx.save();
  ctx.strokeStyle = "rgba(10, 8, 11, 0.34)";
  ctx.lineWidth = 3;

  const rows = [46, 92, 139, 187, 236, 286, 337, 389, 442, 496, 552];
  for (const y of rows) {
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(W - 36, y + ((y / 46) % 2 ? 3 : -2));
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(231, 196, 106, 0.08)";
  ctx.lineWidth = 2;
  for (let i = 0; i < rows.length - 1; i += 1) {
    const y = rows[i] + 8;
    const offset = i % 2 ? 92 : 44;
    for (let x = 72 + offset; x < W - 70; x += 164) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, rows[i + 1] - 8);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawCreelStudyFloor() {
  ctx.save();
  ctx.strokeStyle = "rgba(7, 6, 12, 0.36)";
  ctx.lineWidth = 3;

  for (let y = 52; y < H - 46; y += 58) {
    ctx.beginPath();
    ctx.moveTo(44, y);
    ctx.lineTo(W - 44, y + ((y / 58) % 2 ? 2 : -2));
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(231, 196, 106, 0.08)";
  ctx.lineWidth = 2;
  for (let x = 72; x < W - 58; x += 92) {
    ctx.beginPath();
    ctx.moveTo(x, 44);
    ctx.lineTo(x + 18, H - 46);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(79, 135, 168, 0.08)";
  for (let x = 118; x < W - 70; x += 184) {
    ctx.beginPath();
    ctx.moveTo(x, 52);
    ctx.lineTo(x - 22, H - 60);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCreelStudySurfaceWear() {
  ctx.save();
  ctx.lineCap = "round";

  ctx.fillStyle = "rgba(7, 6, 12, 0.18)";
  for (const [x, y, w, h] of [[220, 168, 180, 24], [650, 170, 180, 24], [246, 456, 190, 28], [674, 454, 190, 28]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(246, 240, 223, 0.075)";
  ctx.lineWidth = 2;
  const scratches = [
    [222, 220, 42, -8], [330, 334, 60, 10], [552, 222, 46, -12],
    [724, 334, 54, 8], [426, 478, 50, -10], [590, 112, 44, 8]
  ];
  for (const [x, y, w, dy] of scratches) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + dy);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(231, 196, 106, 0.055)";
  for (const [x, y, r] of [[170, 88, 1.5], [286, 520, 1.4], [406, 198, 1.3], [560, 440, 1.5], [762, 94, 1.5], [836, 500, 1.4]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelStudySignalPath() {
  const room = rooms.library;
  const lightWall = room.props.find((prop) => prop.type === "christmasLights");
  const radio = room.props.find((prop) => prop.type === "radio");
  if (!lightWall || !radio) return;

  const lightCenter = { x: lightWall.x + lightWall.w / 2, y: lightWall.y + lightWall.h / 2 };
  const radioCenter = { x: radio.x + radio.w / 2, y: radio.y + radio.h / 2 };
  const active = state.libraryPuzzle.clueSeen || state.libraryPuzzle.solved;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const clueGlow = ctx.createRadialGradient(lightCenter.x, lightCenter.y, 8, lightCenter.x, lightCenter.y, 132);
  clueGlow.addColorStop(0, "rgba(231, 196, 106, 0.14)");
  clueGlow.addColorStop(0.55, "rgba(116, 242, 163, 0.045)");
  clueGlow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = clueGlow;
  ctx.beginPath();
  ctx.arc(lightCenter.x, lightCenter.y, 132, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = active ? "rgba(116, 242, 163, 0.28)" : "rgba(231, 196, 106, 0.085)";
  ctx.lineWidth = active ? 4 : 2;
  ctx.setLineDash(active ? [] : [10, 14]);
  ctx.beginPath();
  ctx.moveTo(lightCenter.x, lightCenter.y + 18);
  ctx.bezierCurveTo(420, 306, 528, 292, radioCenter.x, radioCenter.y);
  ctx.stroke();

  const radioGlow = ctx.createRadialGradient(radioCenter.x, radioCenter.y, 6, radioCenter.x, radioCenter.y, active ? 72 : 44);
  radioGlow.addColorStop(0, active ? "rgba(116, 242, 163, 0.16)" : "rgba(231, 196, 106, 0.07)");
  radioGlow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = radioGlow;
  ctx.beginPath();
  ctx.arc(radioCenter.x, radioCenter.y, active ? 72 : 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.setLineDash([]);
  ctx.restore();
}

function drawCreelStudyMoodCues() {
  ctx.save();

  const shelfShadows = [
    [134, 92, 276, 78], [554, 92, 276, 78],
    [134, 236, 276, 78], [554, 236, 276, 78],
    [134, 380, 276, 78], [554, 380, 276, 78]
  ];
  for (const [x, y, w, h] of shelfShadows) {
    const shade = ctx.createLinearGradient(x, y, x, y + h);
    shade.addColorStop(0, "rgba(5, 6, 12, 0.2)");
    shade.addColorStop(0.55, "rgba(5, 6, 12, 0.05)");
    shade.addColorStop(1, "rgba(5, 6, 12, 0.18)");
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, w, h);
  }

  const exitHaze = ctx.createRadialGradient(W - 58, 296, 12, W - 58, 296, 82);
  exitHaze.addColorStop(0, "rgba(79, 135, 168, 0.16)");
  exitHaze.addColorStop(0.6, "rgba(79, 135, 168, 0.045)");
  exitHaze.addColorStop(1, "rgba(79, 135, 168, 0)");
  ctx.fillStyle = exitHaze;
  ctx.beginPath();
  ctx.arc(W - 58, 296, 82, 0, Math.PI * 2);
  ctx.fill();

  const vignette = ctx.createRadialGradient(W / 2, H / 2, 160, W / 2, H / 2, 560);
  vignette.addColorStop(0, "rgba(5, 6, 12, 0)");
  vignette.addColorStop(0.62, "rgba(5, 6, 12, 0.08)");
  vignette.addColorStop(1, "rgba(5, 6, 12, 0.22)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(116, 242, 163, 0.06)";
  const motes = [[156, 190, 1.4], [338, 214, 1.1], [504, 152, 1.3], [612, 492, 1.1], [776, 224, 1.4], [846, 420, 1.2]];
  for (const [x, y, r] of motes) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelHouseFloorWear() {
  ctx.save();
  ctx.lineCap = "round";

  ctx.strokeStyle = "rgba(246, 240, 223, 0.07)";
  ctx.lineWidth = 2;
  const scratches = [
    [292, 212, 40, -10], [330, 392, 54, 8], [604, 250, 42, -14],
    [690, 418, 58, 6], [196, 318, 36, 12], [480, 170, 46, -8],
    [448, 494, 64, 10], [788, 332, 38, -12]
  ];
  for (const [x, y, w, dy] of scratches) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + dy);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(7, 6, 9, 0.12)";
  for (const [x, y, w, h] of [[246, 504, 170, 28], [556, 346, 190, 24], [410, 214, 126, 20]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(231, 196, 106, 0.045)";
  for (const [x, y, r] of [[150, 154, 2], [210, 456, 1.5], [374, 112, 1.5], [740, 178, 2], [812, 484, 1.5], [534, 528, 1.5]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelHouseFocalPath() {
  ctx.save();
  ctx.lineCap = "round";

  const centerPath = ctx.createLinearGradient(480, 520, 480, 118);
  centerPath.addColorStop(0, "rgba(7, 6, 9, 0.16)");
  centerPath.addColorStop(0.5, "rgba(7, 6, 9, 0.08)");
  centerPath.addColorStop(1, "rgba(232, 77, 91, 0.1)");
  ctx.fillStyle = centerPath;
  ctx.beginPath();
  ctx.moveTo(398, 548);
  ctx.quadraticCurveTo(426, 388, 430, 296);
  ctx.quadraticCurveTo(438, 188, 456, 134);
  ctx.lineTo(504, 134);
  ctx.quadraticCurveTo(522, 188, 530, 296);
  ctx.quadraticCurveTo(534, 388, 562, 548);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.085)";
  ctx.lineWidth = 2;
  const scuffs = [
    [420, 510, 28, -12], [528, 496, -30, -10],
    [440, 438, 36, -14], [522, 418, -34, -13],
    [452, 358, 32, -15], [512, 338, -28, -15],
    [462, 272, 26, -17], [500, 248, -22, -17],
    [470, 188, 18, -18], [492, 176, -18, -18]
  ];
  for (const [x, y, dx, dy] of scuffs) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(231, 196, 106, 0.08)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(430, 520);
  ctx.quadraticCurveTo(452, 392, 456, 270);
  ctx.quadraticCurveTo(460, 190, 468, 140);
  ctx.moveTo(530, 520);
  ctx.quadraticCurveTo(508, 392, 504, 270);
  ctx.quadraticCurveTo(500, 190, 492, 140);
  ctx.stroke();

  ctx.fillStyle = "rgba(231, 196, 106, 0.05)";
  for (const [x, y, r] of [[410, 500, 2], [548, 470, 1.8], [426, 394, 1.8], [530, 344, 2], [452, 244, 1.5], [506, 206, 1.5]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelHouseMoodCues() {
  drawCreelHouseColdHallShadows();
  drawCreelHouseCandlePools();
  drawCreelHouseStairDread();
  drawCreelHouseDustMotes();
}

function drawCreelHouseCandlePools() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const candles = [
    [250, 214, 82], [710, 214, 82],
    [320, 492, 72], [640, 492, 72]
  ];

  for (const [x, y, radius] of candles) {
    const glow = ctx.createRadialGradient(x, y - 18, 8, x, y - 18, radius);
    glow.addColorStop(0, "rgba(255, 220, 128, 0.22)");
    glow.addColorStop(0.48, "rgba(231, 196, 106, 0.1)");
    glow.addColorStop(1, "rgba(231, 196, 106, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 18, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelHouseColdHallShadows() {
  ctx.save();
  const shadows = [
    [88, 280, 118, 220],
    [872, 280, 118, 220],
    [480, 120, 260, 86]
  ];

  for (const [x, y, w, h] of shadows) {
    const shadow = ctx.createRadialGradient(x, y, 10, x, y, Math.max(w, h));
    shadow.addColorStop(0, "rgba(5, 8, 18, 0.24)");
    shadow.addColorStop(1, "rgba(5, 8, 18, 0)");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCreelHouseStairDread() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const cx = 480;
  const cy = 92;
  const dread = ctx.createRadialGradient(cx, cy, 10, cx, cy, 128);
  dread.addColorStop(0, "rgba(232, 77, 91, 0.2)");
  dread.addColorStop(0.46, "rgba(232, 77, 91, 0.1)");
  dread.addColorStop(1, "rgba(232, 77, 91, 0)");
  ctx.fillStyle = dread;
  ctx.beginPath();
  ctx.arc(cx, cy, 128, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(232, 77, 91, 0.2)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(390, 142);
  ctx.quadraticCurveTo(438, 116, 480, 92);
  ctx.quadraticCurveTo(522, 116, 570, 142);
  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const infection = [
    [[480, 118], [458, 152], [432, 176], [406, 204]],
    [[480, 118], [502, 154], [534, 180], [566, 206]],
    [[456, 104], [424, 94], [398, 84], [370, 92]],
    [[504, 104], [536, 94], [562, 84], [590, 92]],
    [[480, 132], [474, 170], [480, 204], [470, 238]],
    [[480, 132], [492, 170], [496, 208], [512, 240]]
  ];

  for (const path of infection) {
    ctx.strokeStyle = "rgba(28, 8, 12, 0.68)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    for (let i = 1; i < path.length - 1; i += 1) {
      const current = path[i];
      const next = path[i + 1];
      ctx.quadraticCurveTo(current[0], current[1], next[0], next[1]);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 82, 92, 0.34)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    for (let i = 1; i < path.length - 1; i += 1) {
      const current = path[i];
      const next = path[i + 1];
      ctx.quadraticCurveTo(current[0], current[1], next[0], next[1]);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(116, 242, 163, 0.12)";
  ctx.lineWidth = 2;
  const thornMarks = [
    [430, 176, -18, 10], [538, 178, 18, 10],
    [468, 194, -14, 14], [500, 202, 16, 12],
    [410, 108, -14, -10], [550, 108, 14, -10]
  ];
  for (const [x, y, dx, dy] of thornMarks) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "screen";
  const core = ctx.createRadialGradient(cx, 128, 8, cx, 128, 88);
  core.addColorStop(0, "rgba(255, 82, 92, 0.18)");
  core.addColorStop(0.52, "rgba(116, 242, 163, 0.05)");
  core.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, 128, 88, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCreelHouseDustMotes() {
  ctx.save();
  ctx.fillStyle = "rgba(246, 240, 223, 0.1)";
  const motes = [
    [128, 126, 1.4], [178, 354, 1.2], [268, 164, 1.1],
    [430, 220, 1.3], [548, 186, 1.2], [690, 140, 1.4],
    [782, 368, 1.1], [836, 210, 1.2], [530, 468, 1.2]
  ];
  for (const [x, y, r] of motes) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawUpsideDownFloorCracks() {
  ctx.strokeStyle = "rgba(3, 4, 7, 0.42)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  const cracks = [
    [[78, 398], [144, 362], [206, 380], [270, 340]],
    [[680, 116], [632, 150], [648, 196], [590, 230]],
    [[300, 132], [358, 170], [332, 218], [382, 254]],
    [[820, 410], [754, 384], [706, 420], [642, 398]],
    [[410, 518], [456, 464], [520, 486], [568, 438]]
  ];

  for (const crack of cracks) {
    ctx.beginPath();
    ctx.moveTo(crack[0][0], crack[0][1]);
    for (let i = 1; i < crack.length; i += 1) {
      ctx.lineTo(crack[i][0], crack[i][1]);
    }
    ctx.stroke();

    for (let i = 1; i < crack.length - 1; i += 1) {
      const [x, y] = crack[i];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (i % 2 ? 24 : -22), y + 18);
      ctx.stroke();
    }
  }
}

function drawUpsideDownFloorVeins() {
  ctx.lineCap = "round";

  const veins = [
    [[86, 512], [210, 462], [328, 486], [480, 390]],
    [[118, 94], [250, 158], [348, 132], [480, 190]],
    [[852, 94], [720, 158], [614, 136], [480, 190]],
    [[886, 510], [748, 464], [634, 486], [480, 390]],
    [[480, 190], [452, 244], [480, 304], [506, 356]]
  ];

  for (const vein of veins) {
    ctx.strokeStyle = "rgba(55, 27, 22, 0.62)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(vein[0][0], vein[0][1]);
    for (let i = 1; i < vein.length - 1; i += 1) {
      const current = vein[i];
      const next = vein[i + 1];
      ctx.quadraticCurveTo(current[0], current[1], next[0], next[1]);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 82, 92, 0.24)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(vein[0][0], vein[0][1]);
    for (let i = 1; i < vein.length - 1; i += 1) {
      const current = vein[i];
      const next = vein[i + 1];
      ctx.quadraticCurveTo(current[0], current[1], next[0], next[1]);
    }
    ctx.stroke();

    for (let i = 1; i < vein.length - 1; i += 1) {
      const [x, y] = vein[i];
      ctx.strokeStyle = "rgba(72, 199, 131, 0.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 12);
      ctx.quadraticCurveTo(x, y - 8, x + 18, y + 10);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "rgba(72, 199, 131, 0.1)";
  ctx.lineWidth = 2;
  for (const [x, y] of [[330, 448], [622, 444], [360, 150], [598, 152]]) {
    ctx.beginPath();
    ctx.moveTo(x - 28, y + 14);
    ctx.quadraticCurveTo(x, y - 10, x + 34, y + 12);
    ctx.stroke();
  }
}

function drawUpsideDownSpores() {
  const clusters = [
    [112, 110], [168, 484], [292, 386], [392, 130],
    [620, 414], [782, 298], [846, 498], [878, 132], [712, 218]
  ];

  for (const [x, y] of clusters) {
    ctx.fillStyle = "rgba(255, 82, 92, 0.08)";
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i += 1) {
      const dotX = x + Math.cos(i * 1.4) * (5 + (i % 2) * 6);
      const dotY = y + Math.sin(i * 1.4) * (3 + (i % 2) * 5);
      ctx.fillStyle = i % 2 ? "rgba(246, 240, 223, 0.22)" : "rgba(255, 124, 118, 0.2)";
      ctx.beginPath();
      ctx.arc(dotX, dotY, i === 0 ? 2.4 : 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPsychicRoomHaze() {
  ctx.globalCompositeOperation = "screen";
  const chamberGlow = ctx.createRadialGradient(480, 304, 20, 480, 304, 190);
  chamberGlow.addColorStop(0, "rgba(255, 82, 92, 0.12)");
  chamberGlow.addColorStop(0.48, "rgba(72, 199, 131, 0.06)");
  chamberGlow.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = chamberGlow;
  ctx.beginPath();
  ctx.arc(480, 304, 190, 0, Math.PI * 2);
  ctx.fill();

  const vecnaGlow = ctx.createRadialGradient(694, 266, 10, 694, 266, 110);
  vecnaGlow.addColorStop(0, "rgba(255, 82, 92, 0.12)");
  vecnaGlow.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = vecnaGlow;
  ctx.beginPath();
  ctx.arc(694, 266, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function drawProps(room) {
  for (const prop of room.props) {
    if (room.name === "Vecna's Mind Lair" && (prop.type === "chamber" || prop.type === "scientist")) continue;
    if (prop.type === "path") {
      drawPath(prop);
    }
    if (prop.type === "tree") drawTree(prop);
    if (prop.type === "fence") drawFence(prop);
    if (prop.type === "grave") drawGrave(prop);
    if (prop.type === "streetlamp") drawStreetlamp(prop);
    if (prop.type === "bike") drawBike(prop);
    if (prop.type === "mailbox") drawMailbox(prop);
    if (prop.type === "flyerBoard") drawFlyerBoard(prop);
    if (prop.type === "porch") drawPorch(prop);
    if (prop.type === "rug") drawRug(prop);
    if (prop.type === "candle") drawCandle(prop);
    if (prop.type === "stairs") drawStairs(prop);
    if (prop.type === "portrait") drawPortrait(prop);
    if (prop.type === "familyPortraitWall") drawFamilyPortraitWall(prop);
    if (prop.type === "grandfatherClock") drawGrandfatherClock(prop);
    if (prop.type === "shelf") drawShelf(prop);
    if (prop.type === "clue") drawClue(prop);
    if (prop.type === "christmasLights") drawChristmasLightWall(prop);
    if (prop.type === "radio") drawRadio(prop);
    if (prop.type === "machine") drawMachine(prop);
    if (prop.type === "chamber") drawChamber(prop);
    if (prop.type === "scientist") drawScientist(prop);
  }
}

function drawForegroundProps(room) {
  if (room.name !== "Vecna's Mind Lair") return;

  for (const prop of room.props) {
    if (prop.type === "chamber") drawChamber(prop);
    if (prop.type === "scientist") drawScientist(prop);
  }
}

function drawRoomPropConnections(room) {
  if (room.name !== "Vecna's Mind Lair" || !room.nodes) return;

  ctx.save();
  const machineCore = { x: 480, y: 190 };
  const chamberCore = { x: 480, y: 304 };

  ctx.strokeStyle = room.nodes.some((node) => node.active) ? "rgba(255, 82, 92, 0.34)" : "rgba(143, 239, 255, 0.24)";
  ctx.lineWidth = 7;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(machineCore.x, machineCore.y);
  ctx.bezierCurveTo(444, 226, 516, 258, chamberCore.x, chamberCore.y);
  ctx.stroke();

  for (const node of room.nodes) {
    ctx.strokeStyle = node.active ? "rgba(255, 82, 92, 0.36)" : "rgba(72, 80, 78, 0.22)";
    ctx.lineWidth = node.active ? 6 : 3;
    ctx.setLineDash(node.active ? [12, 8] : [5, 14]);
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.bezierCurveTo(node.x, 300, chamberCore.x, 310, chamberCore.x, chamberCore.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(20, 7, 12, 0.62)";
  ctx.lineWidth = 2;
  for (const node of room.nodes) {
    if (!node.active) continue;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.bezierCurveTo(node.x, 300, chamberCore.x, 310, chamberCore.x, chamberCore.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPath(prop) {
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 8, "#34332b");
  ctx.save();
  ctx.strokeStyle = "rgba(231, 196, 106, 0.12)";
  ctx.lineWidth = 2;
  for (let x = prop.x + 28; x < prop.x + prop.w; x += 86) {
    ctx.beginPath();
    ctx.moveTo(x, prop.y + 10);
    ctx.lineTo(x - 18, prop.y + prop.h - 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTree(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(prop.x, prop.y + 48, 52, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#382819";
  ctx.beginPath();
  ctx.moveTo(prop.x - 17, prop.y + 30);
  ctx.lineTo(prop.x + 15, prop.y + 30);
  ctx.lineTo(prop.x + 22, prop.y + 90);
  ctx.lineTo(prop.x - 22, prop.y + 90);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#6f4a2a";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(prop.x - 4, prop.y + 40);
  ctx.lineTo(prop.x - 28, prop.y + 4);
  ctx.moveTo(prop.x + 5, prop.y + 42);
  ctx.lineTo(prop.x + 32, prop.y + 4);
  ctx.moveTo(prop.x + 1, prop.y + 44);
  ctx.lineTo(prop.x + 2, prop.y - 16);
  ctx.stroke();

  ctx.strokeStyle = "rgba(231, 196, 106, 0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x - 9, prop.y + 44);
  ctx.lineTo(prop.x - 14, prop.y + 82);
  ctx.moveTo(prop.x + 8, prop.y + 42);
  ctx.lineTo(prop.x + 13, prop.y + 80);
  ctx.stroke();

  ctx.fillStyle = "#0b1710";
  ctx.beginPath();
  ctx.arc(prop.x - 38, prop.y - 8, 27, 0, Math.PI * 2);
  ctx.arc(prop.x - 8, prop.y - 34, 36, 0, Math.PI * 2);
  ctx.arc(prop.x + 34, prop.y - 8, 30, 0, Math.PI * 2);
  ctx.arc(prop.x, prop.y + 16, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#17311f";
  ctx.beginPath();
  ctx.arc(prop.x - 28, prop.y - 14, 15, 0, Math.PI * 2);
  ctx.arc(prop.x + 22, prop.y - 18, 16, 0, Math.PI * 2);
  ctx.arc(prop.x + 4, prop.y + 10, 20, 0, Math.PI * 2);
  ctx.arc(prop.x - 4, prop.y - 30, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFence(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(prop.x - 6, prop.y + 36, prop.w + 12, 8);

  ctx.strokeStyle = "#6d5130";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(prop.x, prop.y + 15);
  ctx.lineTo(prop.x + prop.w, prop.y + 15);
  ctx.moveTo(prop.x + 4, prop.y + 30);
  ctx.lineTo(prop.x + prop.w - 4, prop.y + 30);
  ctx.stroke();

  for (let x = prop.x + 12; x < prop.x + prop.w; x += 34) {
    ctx.fillStyle = "#4a351f";
    ctx.beginPath();
    ctx.moveTo(x, prop.y - 6);
    ctx.lineTo(x + 11, prop.y + 7);
    ctx.lineTo(x + 11, prop.y + 40);
    ctx.lineTo(x - 11, prop.y + 40);
    ctx.lineTo(x - 11, prop.y + 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(231, 196, 106, 0.16)";
    ctx.fillRect(x - 7, prop.y + 9, 4, 27);
  }

  ctx.strokeStyle = "rgba(20, 14, 10, 0.36)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w * 0.42, prop.y + 18);
  ctx.lineTo(prop.x + prop.w * 0.52, prop.y + 33);
  ctx.moveTo(prop.x + prop.w * 0.48, prop.y + 16);
  ctx.lineTo(prop.x + prop.w * 0.58, prop.y + 30);
  ctx.stroke();

  ctx.restore();
}

function drawStreetlamp(prop) {
  ctx.save();
  const glow = ctx.createRadialGradient(prop.x, prop.y - 76, 8, prop.x, prop.y - 76, 78);
  glow.addColorStop(0, "rgba(231, 196, 106, 0.18)");
  glow.addColorStop(0.58, "rgba(231, 196, 106, 0.045)");
  glow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(prop.x, prop.y - 76, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(prop.x, prop.y + 4, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#242b2d";
  ctx.fillRect(prop.x - 5, prop.y - 72, 10, 78);
  ctx.fillStyle = "#11181a";
  ctx.fillRect(prop.x - 13, prop.y + 2, 26, 8);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(prop.x - 4, prop.y - 70, 8, 70);

  ctx.fillStyle = "#2e3637";
  ctx.beginPath();
  ctx.roundRect(prop.x - 17, prop.y - 92, 34, 22, 5);
  ctx.fill();
  ctx.fillStyle = "#e7c46a";
  ctx.beginPath();
  ctx.arc(prop.x, prop.y - 80, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(246, 240, 223, 0.4)";
  ctx.strokeRect(prop.x - 12, prop.y - 88, 24, 14);
  ctx.restore();
}

function drawBike(prop) {
  ctx.save();
  ctx.translate(prop.x, prop.y);
  ctx.rotate(-0.16);

  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 62, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#94b9c6";
  ctx.lineWidth = 4;
  for (const wheelX of [-34, 34]) {
    ctx.beginPath();
    ctx.arc(wheelX, 8, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wheelX - 13, 8);
    ctx.lineTo(wheelX + 13, 8);
    ctx.moveTo(wheelX, -5);
    ctx.lineTo(wheelX, 21);
    ctx.stroke();
    ctx.lineWidth = 4;
  }

  ctx.strokeStyle = "#d9a64f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-34, 8);
  ctx.lineTo(-6, -18);
  ctx.lineTo(18, 8);
  ctx.lineTo(-34, 8);
  ctx.moveTo(-6, -18);
  ctx.lineTo(34, 8);
  ctx.moveTo(18, 8);
  ctx.lineTo(34, -16);
  ctx.stroke();

  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(34, -16);
  ctx.lineTo(48, -20);
  ctx.moveTo(-6, -19);
  ctx.lineTo(-18, -24);
  ctx.stroke();
  ctx.restore();
}

function drawMailbox(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(prop.x, prop.y + 34, 38, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4b3321";
  ctx.fillRect(prop.x - 4, prop.y + 2, 8, 34);
  ctx.fillStyle = "#24282b";
  ctx.beginPath();
  ctx.moveTo(prop.x - 30, prop.y - 10);
  ctx.lineTo(prop.x + 30, prop.y - 10);
  ctx.quadraticCurveTo(prop.x + 28, prop.y - 34, prop.x, prop.y - 34);
  ctx.quadraticCurveTo(prop.x - 28, prop.y - 34, prop.x - 30, prop.y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#30383b";
  ctx.fillRect(prop.x - 30, prop.y - 10, 60, 24);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.24)";
  ctx.lineWidth = 2;
  ctx.strokeRect(prop.x - 24, prop.y - 5, 28, 13);
  ctx.fillStyle = "#c4443f";
  ctx.fillRect(prop.x + 26, prop.y - 26, 5, 28);
  ctx.fillRect(prop.x + 26, prop.y - 26, 18, 8);
  ctx.fillStyle = "rgba(231, 196, 106, 0.48)";
  ctx.font = "700 8px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("CREEL", prop.x - 10, prop.y + 5);
  ctx.restore();
}

function drawFlyerBoard(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
  ctx.beginPath();
  ctx.ellipse(prop.x, prop.y + 46, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a351f";
  ctx.fillRect(prop.x - 36, prop.y + 24, 8, 28);
  ctx.fillRect(prop.x + 28, prop.y + 24, 8, 28);
  fillRoundRect(prop.x - 48, prop.y - 28, 96, 58, 5, "#3a2b22");
  ctx.strokeStyle = "rgba(231, 196, 106, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(prop.x - 40, prop.y - 20, 80, 42);

  const papers = [
    [-32, -14, 24, 30, "MISSING"],
    [-2, -18, 24, 34, "HAVE YOU"],
    [26, -12, 18, 26, "?"]
  ];
  for (const [dx, dy, w, h, label] of papers) {
    ctx.fillStyle = "#d9d0b6";
    ctx.fillRect(prop.x + dx, prop.y + dy, w, h);
    ctx.fillStyle = "#2b2421";
    ctx.font = "700 6px Trebuchet MS, Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, prop.x + dx + w / 2, prop.y + dy + 8);
    ctx.strokeStyle = "rgba(31, 24, 22, 0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(prop.x + dx + 2, prop.y + dy + 12, w - 4, h - 16);
  }

  ctx.restore();
}

function drawGrave(prop) {
  if (drawAsset("gravestone", prop.x - 34, prop.y - 52, 68, 78)) return;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(prop.x - 28, prop.y + 20, 56, 10);
  ctx.fillStyle = "#474d4b";
  ctx.beginPath();
  ctx.moveTo(prop.x - 22, prop.y + 18);
  ctx.lineTo(prop.x - 22, prop.y - 20);
  ctx.quadraticCurveTo(prop.x, prop.y - 42, prop.x + 22, prop.y - 20);
  ctx.lineTo(prop.x + 22, prop.y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#252a2a";
  ctx.fillRect(prop.x - 28, prop.y + 16, 56, 11);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x, prop.y - 20);
  ctx.lineTo(prop.x, prop.y + 4);
  ctx.moveTo(prop.x - 10, prop.y - 9);
  ctx.lineTo(prop.x + 10, prop.y - 9);
  ctx.stroke();
  ctx.fillStyle = "rgba(246, 240, 223, 0.24)";
  ctx.font = "700 9px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("RIP", prop.x, prop.y + 12);
  ctx.restore();
}

function drawPorch(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.beginPath();
  ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h + 8, prop.w / 2 + 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 8, "#3a3131");
  ctx.fillStyle = "rgba(246, 240, 223, 0.08)";
  for (let x = prop.x + 14; x < prop.x + prop.w - 10; x += 24) {
    ctx.fillRect(x, prop.y + 8, 3, prop.h - 18);
  }

  ctx.fillStyle = "#271f20";
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y - 26);
  ctx.lineTo(prop.x + prop.w - 8, prop.y + 18);
  ctx.lineTo(prop.x + 8, prop.y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(231, 196, 106, 0.2)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y - 21);
  ctx.lineTo(prop.x + prop.w - 18, prop.y + 15);
  ctx.moveTo(prop.x + prop.w / 2, prop.y - 21);
  ctx.lineTo(prop.x + 18, prop.y + 15);
  ctx.stroke();

  ctx.fillStyle = "#20191d";
  ctx.fillRect(prop.x + prop.w / 2 - 38, prop.y + 20, 76, 74);
  ctx.fillStyle = "#513722";
  ctx.fillRect(prop.x + prop.w / 2 - 28, prop.y + 30, 56, 64);
  ctx.strokeStyle = "rgba(231, 196, 106, 0.42)";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x + prop.w / 2 - 28, prop.y + 30, 56, 64);
  ctx.strokeStyle = "rgba(21, 16, 28, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y + 33);
  ctx.lineTo(prop.x + prop.w / 2, prop.y + 92);
  ctx.stroke();
  ctx.fillStyle = "#e7c46a";
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2 + 17, prop.y + 64, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c2522";
  for (let y = prop.y + prop.h + 4; y < prop.y + prop.h + 34; y += 10) {
    ctx.fillRect(prop.x + 24, y, prop.w - 48, 7);
    ctx.fillStyle = "rgba(231, 196, 106, 0.16)";
    ctx.fillRect(prop.x + 28, y, prop.w - 56, 2);
    ctx.fillStyle = "#2c2522";
  }

  ctx.strokeStyle = "rgba(246, 240, 223, 0.16)";
  ctx.lineWidth = 2;
  for (let y = prop.y + 16; y < prop.y + prop.h; y += 18) {
    ctx.beginPath();
    ctx.moveTo(prop.x + 10, y);
    ctx.lineTo(prop.x + prop.w - 10, y);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(231, 196, 106, 0.34)";
  ctx.fillRect(prop.x + prop.w / 2 - 24, prop.y + 8, 48, 10);
  ctx.restore();
}

function drawRug(prop) {
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 10, "#4a1930");
  ctx.save();
  ctx.strokeStyle = "rgba(231, 196, 106, 0.32)";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x + 12, prop.y + 12, prop.w - 24, prop.h - 24);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.12)";
  ctx.lineWidth = 1;
  for (let x = prop.x + 28; x < prop.x + prop.w - 24; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, prop.y + 22);
    ctx.lineTo(x + 18, prop.y + prop.h - 22);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStairs(prop) {
  if (drawAsset("stairs", prop.x - 10, prop.y - 14, prop.w + 20, prop.h + 28)) return;

  ctx.save();
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 8, "#2e2b36");
  ctx.fillStyle = "#15131b";
  ctx.fillRect(prop.x + 12, prop.y + 8, prop.w - 24, 18);
  for (let i = 0; i < 6; i += 1) {
    const inset = 8 + i * 5;
    const y = prop.y + prop.h - 18 - i * 15;
    ctx.fillStyle = i % 2 === 0 ? "#3a3546" : "#292634";
    ctx.fillRect(prop.x + inset, y, prop.w - inset * 2, 11);
    ctx.strokeStyle = "rgba(246, 240, 223, 0.18)";
    ctx.beginPath();
    ctx.moveTo(prop.x + inset, y);
    ctx.lineTo(prop.x + prop.w - inset, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(231, 196, 106, 0.42)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(prop.x + 16, prop.y + 18);
  ctx.lineTo(prop.x + 16, prop.y + prop.h - 16);
  ctx.moveTo(prop.x + prop.w - 16, prop.y + 18);
  ctx.lineTo(prop.x + prop.w - 16, prop.y + prop.h - 16);
  ctx.stroke();
  ctx.fillStyle = "rgba(231, 196, 106, 0.72)";
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y + 24);
  ctx.lineTo(prop.x + prop.w / 2 - 9, prop.y + 40);
  ctx.lineTo(prop.x + prop.w / 2 - 3, prop.y + 40);
  ctx.lineTo(prop.x + prop.w / 2 - 3, prop.y + 62);
  ctx.lineTo(prop.x + prop.w / 2 + 3, prop.y + 62);
  ctx.lineTo(prop.x + prop.w / 2 + 3, prop.y + 40);
  ctx.lineTo(prop.x + prop.w / 2 + 9, prop.y + 40);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(246, 240, 223, 0.74)";
  ctx.font = "700 10px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("UP", prop.x + prop.w / 2, prop.y + prop.h - 9);
  ctx.restore();
}

function drawPortrait(prop) {
  if (drawAsset("portrait", prop.x - 10, prop.y - 14, prop.w + 20, prop.h + 24)) return;

  ctx.save();
  ctx.strokeStyle = "rgba(231, 196, 106, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y - 13);
  ctx.lineTo(prop.x + 10, prop.y + 8);
  ctx.moveTo(prop.x + prop.w / 2, prop.y - 13);
  ctx.lineTo(prop.x + prop.w - 10, prop.y + 8);
  ctx.stroke();
  fillRoundRect(prop.x - 5, prop.y, prop.w + 10, prop.h, 6, "#3c2a32");
  ctx.fillStyle = "#b58a3d";
  ctx.fillRect(prop.x + 4, prop.y + 8, prop.w - 8, prop.h - 16);
  ctx.fillStyle = "#21151a";
  ctx.fillRect(prop.x + 11, prop.y + 16, prop.w - 22, prop.h - 32);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(prop.x + 15, prop.y + 20, prop.w - 30, prop.h - 40);
  ctx.fillStyle = "#15101c";
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2, prop.y + 34, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#74f2a3";
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2 - 5, prop.y + 32, 2.7, 0, Math.PI * 2);
  ctx.arc(prop.x + prop.w / 2 + 5, prop.y + 32, 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5d3f28";
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y + 48);
  ctx.lineTo(prop.x + prop.w / 2 + 17, prop.y + 74);
  ctx.lineTo(prop.x + prop.w / 2 - 17, prop.y + 74);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e7c46a";
  ctx.lineWidth = 2;
  ctx.strokeRect(prop.x + 8, prop.y + prop.h - 18, prop.w - 16, 10);
  ctx.fillStyle = "#e7c46a";
  ctx.font = "700 7px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("PORTRAIT", prop.x + prop.w / 2, prop.y + prop.h - 10);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x - 5, prop.y, prop.w + 10, prop.h);
  ctx.restore();
}

function drawFamilyPortraitWall(prop) {
  ctx.save();
  const x = prop.x;
  const y = prop.y;

  const wallGlow = ctx.createRadialGradient(x, y, 12, x, y, 120);
  wallGlow.addColorStop(0, "rgba(255, 82, 92, 0.08)");
  wallGlow.addColorStop(0.52, "rgba(231, 196, 106, 0.035)");
  wallGlow.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = wallGlow;
  ctx.beginPath();
  ctx.arc(x, y, 120, 0, Math.PI * 2);
  ctx.fill();

  drawCreelFamilyFrame(x, y, 122, 72, true);
  drawCreelFamilyFrame(x - 92, y + 6, 48, 58, false);
  drawCreelFamilyFrame(x + 92, y + 6, 48, 58, false);

  ctx.strokeStyle = "rgba(255, 82, 92, 0.24)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const cracks = [
    [[x - 22, y - 30], [x - 6, y - 12], [x - 18, y + 10]],
    [[x + 28, y - 26], [x + 12, y - 4], [x + 26, y + 20]],
    [[x - 92, y - 14], [x - 82, y + 2], [x - 98, y + 20]],
    [[x + 94, y - 12], [x + 84, y + 6], [x + 104, y + 22]]
  ];
  for (const crack of cracks) {
    ctx.beginPath();
    ctx.moveTo(crack[0][0], crack[0][1]);
    for (let i = 1; i < crack.length; i += 1) {
      ctx.lineTo(crack[i][0], crack[i][1]);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(231, 196, 106, 0.5)";
  ctx.font = "700 8px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("CREEL FAMILY", x, y + 52);
  ctx.restore();
}

function drawCreelFamilyFrame(x, y, w, h, main) {
  ctx.save();
  const radius = main ? 7 : 5;
  fillRoundRect(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12, radius, "#21151a");
  fillRoundRect(x - w / 2, y - h / 2, w, h, radius - 1, "#6a4a2f");
  ctx.fillStyle = "#151014";
  ctx.fillRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16);

  ctx.strokeStyle = "rgba(231, 196, 106, 0.5)";
  ctx.lineWidth = main ? 3 : 2;
  ctx.strokeRect(x - w / 2 + 5, y - h / 2 + 5, w - 10, h - 10);

  const figureCount = main ? 4 : 1;
  const spacing = main ? 24 : 0;
  for (let i = 0; i < figureCount; i += 1) {
    const figureX = x + (i - (figureCount - 1) / 2) * spacing;
    const headY = y - (main ? 8 : 4);
    ctx.fillStyle = "#221820";
    ctx.beginPath();
    ctx.arc(figureX, headY, main ? 8 : 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5b3a2b";
    ctx.beginPath();
    ctx.moveTo(figureX, headY + 10);
    ctx.lineTo(figureX + (main ? 12 : 13), y + h / 2 - 10);
    ctx.lineTo(figureX - (main ? 12 : 13), y + h / 2 - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#74f2a3";
    ctx.beginPath();
    ctx.arc(figureX - 3, headY - 1, main ? 1.8 : 2.3, 0, Math.PI * 2);
    ctx.arc(figureX + 3, headY - 1, main ? 1.8 : 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(246, 240, 223, 0.12)";
  ctx.fillRect(x - w / 2 + 12, y - h / 2 + 10, main ? 5 : 3, h - 22);
  ctx.restore();
}

function drawGrandfatherClock(prop) {
  ctx.save();

  const x = prop.x;
  const y = prop.y;
  const clockGlow = ctx.createRadialGradient(x, y - 58, 8, x, y - 58, 82);
  clockGlow.addColorStop(0, "rgba(255, 82, 92, 0.14)");
  clockGlow.addColorStop(0.42, "rgba(231, 196, 106, 0.055)");
  clockGlow.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = clockGlow;
  ctx.beginPath();
  ctx.arc(x, y - 58, 82, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
  ctx.beginPath();
  ctx.ellipse(x, y + 42, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  fillRoundRect(x - 30, y - 92, 60, 132, 7, "#2a1d18");
  ctx.fillStyle = "#4b3021";
  ctx.beginPath();
  ctx.moveTo(x - 34, y - 86);
  ctx.lineTo(x, y - 112);
  ctx.lineTo(x + 34, y - 86);
  ctx.lineTo(x + 28, y - 76);
  ctx.lineTo(x - 28, y - 76);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(231, 196, 106, 0.34)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 24, y - 84, 48, 116);
  ctx.strokeStyle = "rgba(20, 8, 10, 0.62)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 17, y - 24, 34, 52);

  ctx.fillStyle = "#151014";
  ctx.beginPath();
  ctx.arc(x, y - 57, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e7c46a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 57, 17, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.78)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i += 1) {
    const angle = -Math.PI / 2 + i * (Math.PI * 2 / 12);
    const inner = i % 3 === 0 ? 10 : 13;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * inner, y - 57 + Math.sin(angle) * inner);
    ctx.lineTo(x + Math.cos(angle) * 15, y - 57 + Math.sin(angle) * 15);
    ctx.stroke();
  }

  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 57);
  ctx.lineTo(x + 1, y - 71);
  ctx.moveTo(x, y - 57);
  ctx.lineTo(x + 11, y - 48);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 82, 92, 0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 65);
  ctx.lineTo(x + 5, y - 58);
  ctx.lineTo(x - 4, y - 46);
  ctx.stroke();

  ctx.strokeStyle = "rgba(231, 196, 106, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 22);
  ctx.lineTo(x, y + 12);
  ctx.stroke();
  ctx.fillStyle = "#e7c46a";
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 8, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(246, 240, 223, 0.18)";
  ctx.fillRect(x - 20, y - 78, 4, 104);
  ctx.fillStyle = "rgba(255, 82, 92, 0.22)";
  ctx.fillRect(x + 17, y - 18, 3, 38);

  ctx.fillStyle = "rgba(231, 196, 106, 0.55)";
  ctx.font = "700 8px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("CREEL", x, y + 40);

  ctx.restore();
}

function drawShelf(prop) {
  if (drawAsset("bookshelf", prop.x - 8, prop.y - 22, prop.w + 16, prop.h + 44)) return;

  ctx.save();
  const caseY = prop.y - 12;
  const caseH = prop.h + 24;
  fillRoundRect(prop.x - 4, caseY, prop.w + 8, caseH, 5, "#4b321f");
  fillRoundRect(prop.x + 6, caseY + 8, prop.w - 12, caseH - 16, 3, "#21151a");

  ctx.fillStyle = "#8a6338";
  ctx.fillRect(prop.x - 4, caseY, prop.w + 8, 8);
  ctx.fillRect(prop.x - 4, caseY + caseH - 8, prop.w + 8, 8);
  ctx.fillRect(prop.x - 4, caseY, 10, caseH);
  ctx.fillRect(prop.x + prop.w - 6, caseY, 10, caseH);
  ctx.fillRect(prop.x + 6, caseY + caseH / 2 - 3, prop.w - 12, 6);

  const bookColors = ["#b84f5f", "#d0a64b", "#4f87a8", "#6f5aa8", "#5f9b68", "#c46f3f"];
  drawBookRow(prop.x + 14, caseY + 12, prop.w - 28, caseH / 2 - 18, bookColors, 0);
  drawBookRow(prop.x + 14, caseY + caseH / 2 + 7, prop.w - 28, caseH / 2 - 19, bookColors, 3);

  ctx.strokeStyle = "rgba(246, 240, 223, 0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(prop.x - 4, caseY, prop.w + 8, caseH);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(prop.x + 8, caseY + caseH - 13, prop.w - 16, 5);
  ctx.restore();
}

function drawBookRow(x, y, width, height, colors, offset) {
  let cursor = x;
  let index = offset;
  while (cursor < x + width - 5) {
    const bookW = 7 + (index % 3) * 3;
    const bookH = Math.max(8, height - ((index * 5) % 9));
    const top = y + height - bookH;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(cursor, top, bookW, bookH);
    ctx.fillStyle = "rgba(255, 244, 184, 0.32)";
    ctx.fillRect(cursor + 2, top + 3, 2, Math.max(3, bookH - 6));
    cursor += bookW + 3;
    index += 1;
  }
}

function drawClue(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(prop.x + 7, prop.y + 7, prop.w, prop.h);
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 7, "#6a4a2f");
  fillRoundRect(prop.x + 9, prop.y + 8, prop.w - 18, prop.h - 16, 4, "#2a1d1f");
  ctx.strokeStyle = "rgba(231, 196, 106, 0.58)";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x + 9, prop.y + 8, prop.w - 18, prop.h - 16);
  ctx.fillStyle = "rgba(255, 244, 184, 0.1)";
  ctx.fillRect(prop.x + 18, prop.y + 18, prop.w - 36, 4);
  ctx.fillRect(prop.x + 18, prop.y + 34, prop.w - 36, 3);
  ctx.fillRect(prop.x + 18, prop.y + 50, prop.w - 36, 3);
  ctx.fillStyle = "#e7c46a";
  ctx.font = "700 11px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("SIGNAL", prop.x + prop.w / 2, prop.y + 21);
  ctx.font = "10px Trebuchet MS, Arial";
  ctx.fillText("Lights speak.", prop.x + prop.w / 2, prop.y + 38);
  ctx.fillText("Clock answers.", prop.x + prop.w / 2, prop.y + 52);
  ctx.strokeStyle = "rgba(116, 242, 163, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(prop.x + prop.w - 18, prop.y + 18, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawChristmasLightWall(prop) {
  const clueVisible = state.libraryPuzzle.solved || state.libraryPuzzle.clueSeen || (
    state.flashlight && pointInFlashlight(prop.x + prop.w / 2, prop.y + prop.h / 2)
  );
  const pulse = 0.5 + Math.sin(performance.now() / 180) * 0.5;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const litLetters = new Set(["F", "O", "U", "R", "N", "E", "I", "V"]);

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.fillRect(prop.x + 8, prop.y + 8, prop.w, prop.h);
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 8, "#21151a");
  ctx.strokeStyle = "rgba(231, 196, 106, 0.42)";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x + 6, prop.y + 6, prop.w - 12, prop.h - 12);

  ctx.strokeStyle = "rgba(246, 240, 223, 0.18)";
  ctx.lineWidth = 2;
  for (let y = prop.y + 28; y <= prop.y + 82; y += 27) {
    ctx.beginPath();
    ctx.moveTo(prop.x + 20, y);
    ctx.bezierCurveTo(prop.x + 86, y - 14, prop.x + 154, y + 14, prop.x + prop.w - 20, y - 2);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.font = "700 12px Trebuchet MS, Arial";
  alphabet.forEach((letter, index) => {
    const col = index % 9;
    const row = Math.floor(index / 9);
    const x = prop.x + 25 + col * 24;
    const y = prop.y + 31 + row * 27;
    const lit = clueVisible && litLetters.has(letter);
    ctx.fillStyle = lit ? `rgba(255, 244, 184, ${0.75 + pulse * 0.25})` : "rgba(169, 163, 181, 0.22)";
    ctx.beginPath();
    ctx.arc(x, y - 4, lit ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lit ? "#1b1117" : "rgba(246, 240, 223, 0.34)";
    ctx.fillText(letter, x, y);
  });

  if (clueVisible) {
    const words = ["FOUR", "ONE", "FIVE"];
    ctx.font = "700 16px Trebuchet MS, Arial";
    for (let i = 0; i < words.length; i += 1) {
      const x = prop.x + 58 + i * 62;
      const y = prop.y + prop.h - 15;
      ctx.fillStyle = i === Math.floor((performance.now() / 520) % 3) ? "#74f2a3" : "#e7c46a";
      ctx.fillText(words[i], x, y);
    }
  } else {
    ctx.fillStyle = "rgba(231, 196, 106, 0.74)";
    ctx.font = "700 11px Trebuchet MS, Arial";
    ctx.fillText("SHINE LIGHT", prop.x + prop.w / 2, prop.y + prop.h - 15);
  }

  ctx.restore();
}

function drawRadio(prop) {
  const puzzle = state.libraryPuzzle;
  const solved = puzzle.solved;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.beginPath();
  ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h + 7, prop.w * 0.48, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 8, solved ? "#2d3c32" : "#4a3524");
  ctx.strokeStyle = solved ? "#74f2a3" : "rgba(231, 196, 106, 0.62)";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x + 5, prop.y + 5, prop.w - 10, prop.h - 10);

  ctx.fillStyle = "#151116";
  ctx.fillRect(prop.x + 12, prop.y + 15, 34, 22);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.26)";
  ctx.lineWidth = 2;
  for (let x = prop.x + 17; x < prop.x + 43; x += 7) {
    ctx.beginPath();
    ctx.moveTo(x, prop.y + 17);
    ctx.lineTo(x, prop.y + 35);
    ctx.stroke();
  }

  ctx.fillStyle = solved ? "#74f2a3" : "#e7c46a";
  ctx.beginPath();
  ctx.arc(prop.x + 61, prop.y + 26, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#151116";
  ctx.font = "700 10px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText(solved ? "415" : "???", prop.x + prop.w / 2, prop.y + 50);

  if (!solved && circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 8, prop)) {
    ctx.fillStyle = "#f6f0df";
    ctx.font = "700 12px Trebuchet MS, Arial";
    ctx.fillText("E: TUNE", prop.x + prop.w / 2, prop.y - 10);
  }

  ctx.restore();
}

function drawCandle(prop) {
  if (drawAsset("candle", prop.x - 24, prop.y - 46, 48, 64)) return;

  ctx.save();
  ctx.fillStyle = "rgba(231, 196, 106, 0.12)";
  ctx.beginPath();
  ctx.arc(prop.x, prop.y - 14, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a3524";
  ctx.fillRect(prop.x - 13, prop.y + 10, 26, 7);
  ctx.fillRect(prop.x - 4, prop.y + 16, 8, 8);
  ctx.fillStyle = "#eadfbe";
  ctx.fillRect(prop.x - 6, prop.y - 18, 12, 30);
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.fillRect(prop.x + 2, prop.y - 16, 3, 26);
  ctx.fillStyle = "#e7c46a";
  ctx.beginPath();
  ctx.moveTo(prop.x, prop.y - 34);
  ctx.bezierCurveTo(prop.x + 10, prop.y - 24, prop.x + 5, prop.y - 13, prop.x, prop.y - 11);
  ctx.bezierCurveTo(prop.x - 8, prop.y - 16, prop.x - 6, prop.y - 25, prop.x, prop.y - 34);
  ctx.fill();
  ctx.fillStyle = "#fff4b8";
  ctx.beginPath();
  ctx.arc(prop.x, prop.y - 22, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMachine(prop) {
  if (drawAsset("labMachine", prop.x - 16, prop.y - 12, prop.w + 32, prop.h + 24)) return;

  ctx.save();
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 10, "#22302d");
  ctx.fillStyle = "#131a19";
  ctx.fillRect(prop.x + 14, prop.y + 16, prop.w - 28, prop.h - 30);
  ctx.strokeStyle = "#74f2a3";
  ctx.lineWidth = 3;
  ctx.strokeRect(prop.x + 18, prop.y + 18, prop.w - 36, prop.h - 36);
  ctx.strokeStyle = "rgba(116, 242, 163, 0.36)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(prop.x + 28, prop.y + prop.h - 24);
  ctx.bezierCurveTo(prop.x + 58, prop.y + 84, prop.x + 92, prop.y + 96, prop.x + prop.w - 28, prop.y + prop.h - 28);
  ctx.moveTo(prop.x + prop.w - 34, prop.y + 28);
  ctx.bezierCurveTo(prop.x + 128, prop.y + 42, prop.x + 92, prop.y + 42, prop.x + 52, prop.y + 28);
  ctx.stroke();
  ctx.fillStyle = "rgba(116, 242, 163, 0.22)";
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2, prop.y + prop.h / 2, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#74f2a3";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2, prop.y + prop.h / 2, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#74f2a3";
  ctx.font = "700 10px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("RIFT", prop.x + prop.w / 2, prop.y + prop.h / 2 + 4);
  ctx.fillStyle = "#74f2a3";
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(prop.x + 34 + i * 22, prop.y + prop.h - 22, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(246, 240, 223, 0.4)";
  ctx.fillRect(prop.x + prop.w - 52, prop.y + 34, 28, 8);
  ctx.restore();
}

function drawChamber(prop) {
  const disabled = currentRoom().nodes?.every((node) => !node.active);
  if (drawAsset("chamber", prop.x - 12, prop.y - 20, prop.w + 24, prop.h + 34)) {
    if (state.endingPhase === "playing" || state.endingPhase === "chamberOpening") {
      drawCaptiveFriend(prop);
    }
    if (disabled) {
      drawReleasedChamberOverlay(prop);
    }
    return;
  }

  ctx.save();
  ctx.fillStyle = disabled ? "rgba(116, 242, 163, 0.18)" : "rgba(116, 242, 163, 0.32)";
  ctx.beginPath();
  ctx.roundRect(prop.x + 14, prop.y, prop.w - 28, prop.h, 34);
  ctx.fill();
  ctx.fillStyle = "rgba(20, 7, 12, 0.38)";
  ctx.fillRect(prop.x + 8, prop.y + prop.h - 12, prop.w - 16, 16);
  ctx.restore();
  ctx.strokeStyle = disabled ? "#f6f0df" : "#74f2a3";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(prop.x + 20, prop.y + 8, prop.w - 40, prop.h - 18, 28);
  ctx.stroke();
  ctx.strokeStyle = "rgba(246, 240, 223, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x + 28, prop.y + 18);
  ctx.lineTo(prop.x + 18, prop.y + prop.h - 24);
  ctx.moveTo(prop.x + prop.w - 24, prop.y + 20);
  ctx.lineTo(prop.x + prop.w - 36, prop.y + prop.h - 20);
  ctx.stroke();
  ctx.fillStyle = "#f6f0df";
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2, prop.y + 44, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(prop.x + prop.w / 2 - 7, prop.y + 56, 14, 30);
  ctx.fillStyle = "#e8caa6";
  ctx.beginPath();
  ctx.arc(prop.x + prop.w / 2, prop.y + 43, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d96b86";
  ctx.fillRect(prop.x + prop.w / 2 - 8, prop.y + 52, 16, 24);
  ctx.strokeStyle = "rgba(246, 240, 223, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2 - 15, prop.y + 52);
  ctx.lineTo(prop.x + prop.w / 2 + 15, prop.y + 52);
  ctx.stroke();
  ctx.strokeStyle = disabled ? "rgba(246, 240, 223, 0.5)" : "rgba(116, 242, 163, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(prop.x + 16, prop.y + 36);
  ctx.lineTo(prop.x + prop.w - 16, prop.y + 36);
  ctx.moveTo(prop.x + 16, prop.y + prop.h - 22);
  ctx.lineTo(prop.x + prop.w - 16, prop.y + prop.h - 22);
  ctx.stroke();
}

function drawReleasedChamberOverlay(prop) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const releaseGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, prop.w * 0.8);
  releaseGlow.addColorStop(0, "rgba(255, 244, 184, 0.38)");
  releaseGlow.addColorStop(0.42, "rgba(143, 239, 255, 0.22)");
  releaseGlow.addColorStop(1, "rgba(143, 239, 255, 0)");
  ctx.fillStyle = releaseGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, prop.w * 0.82, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.78)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(prop.x + 16, prop.y - 8, prop.w - 32, prop.h + 6, 28);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 91, 96, 0.72)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 24, prop.y + 8);
  ctx.lineTo(cx - 8, cy - 16);
  ctx.lineTo(cx - 18, cy + 8);
  ctx.lineTo(cx - 2, prop.y + prop.h - 2);
  ctx.moveTo(cx + 24, prop.y + 10);
  ctx.lineTo(cx + 8, cy - 10);
  ctx.lineTo(cx + 18, cy + 12);
  ctx.lineTo(cx + 4, prop.y + prop.h);
  ctx.stroke();

  ctx.strokeStyle = "rgba(143, 239, 255, 0.58)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, prop.w * 0.42, -0.3, Math.PI * 1.2);
  ctx.arc(cx, cy, prop.w * 0.56, Math.PI * 0.58, Math.PI * 1.82);
  ctx.stroke();
  ctx.restore();
}

function drawCaptiveFriend(prop) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 244, 184, 0.18)";
  ctx.beginPath();
  ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h / 2, prop.w * 0.34, prop.h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (drawAsset("friendCaptive", prop.x + 14, prop.y - 18, prop.w - 28, prop.h + 42)) return;
}

function drawScientist(prop) {
  if (drawAsset("madScientist", prop.x - 38, prop.y - 64, 76, 98)) return;

  ctx.fillStyle = "#f6f0df";
  ctx.fillRect(prop.x - 13, prop.y - 8, 26, 48);
  ctx.strokeStyle = "rgba(21, 16, 28, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x, prop.y - 4);
  ctx.lineTo(prop.x, prop.y + 36);
  ctx.moveTo(prop.x - 10, prop.y + 18);
  ctx.lineTo(prop.x + 10, prop.y + 18);
  ctx.stroke();
  ctx.fillStyle = "#d9c7b3";
  ctx.beginPath();
  ctx.arc(prop.x, prop.y - 18, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#74f2a3";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(prop.x - 5, prop.y - 19, 4, 0, Math.PI * 2);
  ctx.arc(prop.x + 5, prop.y - 19, 4, 0, Math.PI * 2);
  ctx.moveTo(prop.x - 1, prop.y - 19);
  ctx.lineTo(prop.x + 1, prop.y - 19);
  ctx.stroke();
  ctx.strokeStyle = "#74f2a3";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prop.x - 26, prop.y + 10);
  ctx.lineTo(prop.x + 26, prop.y + 10);
  ctx.stroke();
  ctx.fillStyle = "#74f2a3";
  ctx.fillRect(prop.x + 20, prop.y + 6, 8, 8);
}

function drawExits(room) {
  for (const exit of room.exits) {
    const locked = exit.item && !state.inventory.includes(exit.item);
    const isStairs = exit.label.includes("stair") || exit.label.includes("staircase") || exit.label.includes("Vecna's lair");
    const isStudy = exit.label.includes("study");
    const isEstate = exit.label.includes("Creel") || exit.label.includes("Hawkins");
    const usesDoorAsset = !isStairs && drawAsset("door", exit.x - 12, exit.y - 18, exit.w + 24, exit.h + 34);

    if (usesDoorAsset) {
      if (isStudy || isEstate) {
        drawCreelDoorwayFrame(exit, locked, isStudy, isEstate);
      }

      if (locked) {
        ctx.save();
        ctx.fillStyle = "rgba(232, 77, 91, 0.28)";
        fillRoundRect(exit.x - 10, exit.y - 12, exit.w + 20, exit.h + 24, 6, ctx.fillStyle);
        ctx.strokeStyle = "#e84d5b";
        ctx.lineWidth = 3;
        ctx.strokeRect(exit.x - 6, exit.y - 6, exit.w + 12, exit.h + 12);
        ctx.restore();
      }

      if (isStudy || isEstate) {
        ctx.save();
        ctx.fillStyle = "#e7c46a";
        ctx.font = "700 9px Trebuchet MS, Arial";
        ctx.textAlign = "center";
        ctx.fillText(getExitShortLabel(exit, isStudy, isEstate), exit.x + exit.w / 2, exit.y - 12);
        ctx.restore();
      }

      continue;
    }

    ctx.save();
    ctx.fillStyle = "rgba(20, 7, 12, 0.36)";
    ctx.fillRect(exit.x - 8, exit.y - 8, exit.w + 16, exit.h + 16);
    ctx.strokeStyle = locked ? "rgba(232, 77, 91, 0.55)" : "rgba(231, 196, 106, 0.55)";
    ctx.lineWidth = 4;
    ctx.strokeRect(exit.x - 6, exit.y - 6, exit.w + 12, exit.h + 12);
    ctx.restore();

    if (isStairs) {
      drawStairGateExit(exit, locked);
      continue;
    }

    ctx.fillStyle = locked ? "rgba(232, 77, 91, 0.36)" : (isEstate || isStudy ? "#5a3c24" : "rgba(231, 196, 106, 0.42)");
    fillRoundRect(exit.x, exit.y, exit.w, exit.h, isStairs ? 4 : 6, ctx.fillStyle);
    ctx.strokeStyle = locked ? "#e84d5b" : "#e7c46a";
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
    if (isEstate || isStudy) {
      ctx.strokeStyle = "rgba(21, 16, 28, 0.55)";
      ctx.beginPath();
      ctx.moveTo(exit.x + exit.w / 2, exit.y + 6);
      ctx.lineTo(exit.x + exit.w / 2, exit.y + exit.h - 6);
      ctx.stroke();
      ctx.fillStyle = "#e7c46a";
      ctx.beginPath();
      ctx.arc(exit.x + exit.w - 11, exit.y + exit.h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isStudy || isEstate) {
      ctx.fillStyle = "#e7c46a";
      ctx.font = "700 9px Trebuchet MS, Arial";
      ctx.textAlign = "center";
      ctx.fillText(getExitShortLabel(exit, isStudy, isEstate), exit.x + exit.w / 2, exit.y - 10);
    }
  }
}

function drawCreelDoorwayFrame(exit, locked, isStudy, isEstate) {
  ctx.save();
  const frameX = exit.x - 16;
  const frameY = exit.y - 20;
  const frameW = exit.w + 32;
  const frameH = exit.h + 38;
  const thresholdY = exit.y + exit.h + 9;

  ctx.fillStyle = "rgba(4, 4, 7, 0.42)";
  fillRoundRect(frameX + 6, frameY + 8, frameW - 12, frameH - 2, 6, ctx.fillStyle);

  ctx.fillStyle = locked ? "rgba(58, 18, 28, 0.42)" : "rgba(10, 8, 13, 0.48)";
  fillRoundRect(exit.x - 4, exit.y - 9, exit.w + 8, exit.h + 20, 5, ctx.fillStyle);

  ctx.strokeStyle = locked ? "rgba(232, 77, 91, 0.72)" : "rgba(231, 196, 106, 0.58)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(frameX + 8, frameY + frameH - 4);
  ctx.lineTo(frameX + 8, frameY + 8);
  ctx.lineTo(frameX + frameW - 8, frameY + 8);
  ctx.lineTo(frameX + frameW - 8, frameY + frameH - 4);
  ctx.stroke();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(frameX + 16, frameY + 16);
  ctx.lineTo(frameX + frameW - 16, frameY + 16);
  ctx.moveTo(frameX + 17, frameY + 18);
  ctx.lineTo(frameX + 17, frameY + frameH - 10);
  ctx.moveTo(frameX + frameW - 17, frameY + 18);
  ctx.lineTo(frameX + frameW - 17, frameY + frameH - 10);
  ctx.stroke();

  ctx.fillStyle = isStudy ? "rgba(58, 42, 47, 0.5)" : "rgba(90, 60, 36, 0.42)";
  ctx.fillRect(frameX + 10, thresholdY, frameW - 20, 8);
  ctx.strokeStyle = "rgba(231, 196, 106, 0.46)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(frameX + 12, thresholdY);
  ctx.lineTo(frameX + frameW - 12, thresholdY);
  ctx.stroke();

  if (isStudy) {
    ctx.strokeStyle = "rgba(246, 240, 223, 0.22)";
    ctx.lineWidth = 2;
    for (let y = exit.y + 10; y < exit.y + exit.h; y += 13) {
      ctx.beginPath();
      ctx.moveTo(exit.x - 7, y);
      ctx.lineTo(exit.x - 15, y + 5);
      ctx.stroke();
    }
  }

  if (isEstate && exit.label.includes("Hawkins")) {
    ctx.strokeStyle = "rgba(143, 239, 255, 0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(exit.x + 6, exit.y + exit.h + 1);
    ctx.lineTo(exit.x + exit.w / 2, exit.y + exit.h + 13);
    ctx.lineTo(exit.x + exit.w - 6, exit.y + exit.h + 1);
    ctx.stroke();
  }

  ctx.restore();
}

function getExitShortLabel(exit, isStudy, isEstate) {
  if (isStudy) return "STUDY";
  if (isEstate && exit.label.includes("Hawkins")) return "STREET";
  if (isEstate && exit.label.includes("Creel")) return "HOUSE";
  return "GATE";
}

function drawStairGateExit(exit, locked) {
  ctx.save();
  const cx = exit.x + exit.w / 2;
  const cy = exit.y + exit.h / 2;
  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 66);
  glow.addColorStop(0, locked ? "rgba(232, 77, 91, 0.28)" : "rgba(231, 196, 106, 0.22)");
  glow.addColorStop(1, "rgba(232, 77, 91, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 66, 0, Math.PI * 2);
  ctx.fill();

  fillRoundRect(exit.x - 4, exit.y - 5, exit.w + 8, exit.h + 10, 5, locked ? "rgba(84, 24, 34, 0.62)" : "rgba(90, 60, 36, 0.58)");
  ctx.strokeStyle = locked ? "#e84d5b" : "#e7c46a";
  ctx.lineWidth = 4;
  ctx.strokeRect(exit.x - 2, exit.y - 3, exit.w + 4, exit.h + 6);

  ctx.strokeStyle = locked ? "rgba(255, 181, 172, 0.78)" : "rgba(246, 240, 223, 0.64)";
  ctx.lineWidth = 3;
  for (let y = exit.y + 9; y < exit.y + exit.h - 3; y += 11) {
    ctx.beginPath();
    ctx.moveTo(exit.x + 10, y);
    ctx.lineTo(exit.x + exit.w - 10, y);
    ctx.stroke();
  }

  ctx.fillStyle = locked ? "#e84d5b" : "#e7c46a";
  ctx.beginPath();
  ctx.moveTo(cx, exit.y + 7);
  ctx.lineTo(cx - 9, exit.y + 22);
  ctx.lineTo(cx - 3, exit.y + 22);
  ctx.lineTo(cx - 3, exit.y + exit.h - 10);
  ctx.lineTo(cx + 3, exit.y + exit.h - 10);
  ctx.lineTo(cx + 3, exit.y + 22);
  ctx.lineTo(cx + 9, exit.y + 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = locked ? "#ffb5ac" : "#f6f0df";
  ctx.font = "700 10px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText(locked ? "LOCKED" : "GATE", cx, exit.y - 10);
  ctx.restore();
}

function drawItems(room) {
  if (!room.items) return;

  for (const item of room.items) {
    if (item.collected || !isItemVisible(item)) continue;
    drawKeyItem(item);
  }
}

function drawKeyItem(item) {
  const pulse = 0.76 + Math.sin(performance.now() / 160) * 0.16;
  if (assetImages.key?.complete) {
    ctx.save();
    drawSignalKeyReveal(item, pulse);
    ctx.globalAlpha = pulse;
    ctx.drawImage(assetImages.key, item.x - 30, item.y - 30, 60, 60);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = "#fff4b8";
  ctx.fillStyle = "#e7c46a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(item.x - 8, item.y, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(item.x, item.y);
  ctx.lineTo(item.x + 22, item.y);
  ctx.lineTo(item.x + 22, item.y + 8);
  ctx.moveTo(item.x + 12, item.y);
  ctx.lineTo(item.x + 12, item.y + 6);
  ctx.stroke();
  ctx.fillStyle = "rgba(231, 196, 106, 0.18)";
  ctx.beginPath();
  ctx.arc(item.x, item.y, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSignalKeyReveal(item, pulse) {
  if (item.id !== "signal-key") return;

  ctx.save();
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(item.x, item.y, 8, item.x, item.y, 58);
  glow.addColorStop(0, `rgba(231, 196, 106, ${0.22 + pulse * 0.12})`);
  glow.addColorStop(0.5, "rgba(116, 242, 163, 0.08)");
  glow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(item.x, item.y, 58, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(16, 10, 14, 0.72)";
  ctx.beginPath();
  ctx.ellipse(item.x, item.y + 27, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(231, 196, 106, 0.48)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(item.x, item.y, 34, Math.PI * 0.08, Math.PI * 1.86);
  ctx.stroke();
  ctx.restore();
}

function drawNodes(room) {
  if (!room.nodes) return;

  for (const node of room.nodes) {
    drawPsychicAnchor(node);
  }
}

function drawPsychicAnchor(node) {
  ctx.save();
  ctx.translate(node.x, node.y);

  if (!node.active) {
    drawBrokenPsychicAnchor();
    ctx.restore();
    return;
  }

  const pulse = 0.5 + Math.sin(performance.now() / 220 + node.x * 0.01) * 0.5;
  const halo = ctx.createRadialGradient(0, 0, 6, 0, 0, 42 + pulse * 8);
  halo.addColorStop(0, "rgba(255, 82, 92, 0.28)");
  halo.addColorStop(0.45, "rgba(116, 242, 163, 0.14)");
  halo.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(87, 32, 39, 0.82)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i += 1) {
    const angle = i * Math.PI / 2 + pulse * 0.18;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
    ctx.quadraticCurveTo(Math.cos(angle + 0.35) * 30, Math.sin(angle + 0.35) * 30, Math.cos(angle) * 42, Math.sin(angle) * 42);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 91, 96, 0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 25 + pulse * 2, -0.45, Math.PI * 1.48);
  ctx.stroke();
  ctx.strokeStyle = "rgba(182, 255, 218, 0.58)";
  ctx.beginPath();
  ctx.arc(0, 0, 18, Math.PI * 0.64, Math.PI * 1.86);
  ctx.stroke();

  ctx.fillStyle = "#0b080d";
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ff525c";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#74f2a3";
  ctx.beginPath();
  ctx.arc(0, 0, 9 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6f0df";
  ctx.beginPath();
  ctx.arc(-3, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1a0c12";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, -14);
  ctx.lineTo(-2, -3);
  ctx.lineTo(-9, 9);
  ctx.moveTo(11, -12);
  ctx.lineTo(3, 1);
  ctx.lineTo(13, 11);
  ctx.stroke();

  ctx.restore();
}

function drawBrokenPsychicAnchor() {
  ctx.fillStyle = "rgba(4, 4, 7, 0.46)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(135, 144, 140, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 21, Math.PI * 0.08, Math.PI * 0.82);
  ctx.arc(0, 0, 21, Math.PI * 1.12, Math.PI * 1.78);
  ctx.stroke();

  ctx.fillStyle = "#343939";
  ctx.strokeStyle = "#111417";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(-2, -17);
  ctx.lineTo(4, -2);
  ctx.lineTo(-9, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(7, -9);
  ctx.lineTo(19, -2);
  ctx.lineTo(13, 14);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 82, 92, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, 8);
  ctx.lineTo(-6, 1);
  ctx.moveTo(5, 4);
  ctx.lineTo(22, 13);
  ctx.stroke();
}

function drawEnemies(room) {
  if (!room.enemies) return;

  for (const enemy of room.enemies) {
    const slowed = state.flashlight && pointInFlashlight(enemy.x, enemy.y);
    if (enemy.id.includes("ghost")) {
      drawGhostEnemy(enemy, slowed);
    } else {
      drawExperimentEnemy(enemy, slowed);
    }
  }
}

function drawGhostEnemy(enemy, slowed) {
  if (assetImages.ghost?.complete) {
    ctx.save();
    ctx.globalAlpha = slowed ? 0.58 : 0.96;
    ctx.drawImage(assetImages.ghost, enemy.x - 30, enemy.y - 34, 60, 60);
    if (slowed) {
      ctx.strokeStyle = "rgba(255, 244, 184, 0.72)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 12, -0.4, Math.PI + 0.4);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.globalAlpha = slowed ? 0.52 : 0.92;
  const flicker = Math.sin(performance.now() / 180) * 2;
  const drift = Math.sin(performance.now() / 240) * 4;

  ctx.fillStyle = slowed ? "rgba(183, 255, 240, 0.22)" : "rgba(183, 255, 240, 0.12)";
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius + 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(183, 255, 240, 0.26)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(-20 + i * 20 + drift * 0.25, 19 + i * 2, 8 + i * 2, 0.1, Math.PI * 1.25);
    ctx.stroke();
  }

  ctx.fillStyle = "#b7fff0";
  ctx.beginPath();
  ctx.arc(0, -5 + flicker, enemy.radius, Math.PI, 0);
  ctx.lineTo(enemy.radius, 12);
  ctx.quadraticCurveTo(enemy.radius * 0.58, 22, enemy.radius * 0.18, 13);
  ctx.quadraticCurveTo(-enemy.radius * 0.18, 24, -enemy.radius * 0.48, 13);
  ctx.quadraticCurveTo(-enemy.radius * 0.86, 22, -enemy.radius, 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(246, 240, 223, 0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -5 + flicker, enemy.radius, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();

  ctx.strokeStyle = "rgba(246, 240, 223, 0.46)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-enemy.radius - 8, 5);
  ctx.quadraticCurveTo(-enemy.radius - 18, -8, -enemy.radius - 5, -19);
  ctx.moveTo(enemy.radius + 8, 5);
  ctx.quadraticCurveTo(enemy.radius + 18, -8, enemy.radius + 5, -19);
  ctx.stroke();

  ctx.fillStyle = "#11201f";
  ctx.beginPath();
  ctx.arc(-6, -6, 3.6, 0, Math.PI * 2);
  ctx.arc(6, -6, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#11201f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 2, 5, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "rgba(17, 32, 31, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.quadraticCurveTo(-10, 13, -5, 18);
  ctx.moveTo(2, 7);
  ctx.quadraticCurveTo(-1, 14, 3, 20);
  ctx.moveTo(11, 6);
  ctx.quadraticCurveTo(8, 13, 12, 17);
  ctx.stroke();

  if (slowed) {
    ctx.strokeStyle = "rgba(255, 244, 184, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 8, -0.4, Math.PI + 0.4);
    ctx.stroke();
  }

  ctx.restore();
}

function drawExperimentEnemy(enemy, slowed) {
  if (assetImages.experiment?.complete) {
    ctx.save();
    ctx.globalAlpha = slowed ? 0.62 : 0.96;
    ctx.drawImage(assetImages.experiment, enemy.x - 34, enemy.y - 36, 68, 72);
    if (slowed) {
      ctx.strokeStyle = "rgba(182, 255, 218, 0.46)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 18, 0.3, Math.PI * 1.85);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.globalAlpha = slowed ? 0.58 : 0.96;
  const twitch = Math.sin(performance.now() / 120) * 2;

  ctx.fillStyle = slowed ? "rgba(116, 242, 163, 0.18)" : "rgba(116, 242, 163, 0.1)";
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(116, 242, 163, 0.34)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius + 12 + twitch, 0.3, Math.PI * 1.8);
  ctx.stroke();

  ctx.fillStyle = "#285d44";
  ctx.beginPath();
  ctx.ellipse(0, 3, enemy.radius + 4, enemy.radius - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#74f2a3";
  ctx.beginPath();
  ctx.arc(-7, -6, 7, 0, Math.PI * 2);
  ctx.arc(8, -8, 9, 0, Math.PI * 2);
  ctx.arc(1, 4, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#193126";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, 1);
  ctx.lineTo(-30, -12 + twitch);
  ctx.moveTo(18, 1);
  ctx.lineTo(32, -10 - twitch);
  ctx.moveTo(-10, 16);
  ctx.lineTo(-18, 28);
  ctx.moveTo(10, 16);
  ctx.lineTo(18, 28);
  ctx.stroke();
  ctx.fillStyle = "#74f2a3";
  ctx.beginPath();
  ctx.arc(-30, -12 + twitch, 4, 0, Math.PI * 2);
  ctx.arc(32, -10 - twitch, 4, 0, Math.PI * 2);
  ctx.arc(-18, 28, 4, 0, Math.PI * 2);
  ctx.arc(18, 28, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0b1710";
  ctx.beginPath();
  ctx.arc(-6, -6, 3, 0, Math.PI * 2);
  ctx.arc(7, -6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d6ffe4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 1, enemy.radius + 5, 0.2, Math.PI * 1.15);
  ctx.stroke();
  ctx.strokeStyle = "#193126";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, 5);
  ctx.lineTo(3, -2);
  ctx.lineTo(13, 8);
  ctx.moveTo(-2, 13);
  ctx.lineTo(9, 1);
  ctx.stroke();
  ctx.fillStyle = "rgba(246, 240, 223, 0.7)";
  ctx.fillRect(-4, 14, 8, 3);

  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(state.player.x, state.player.y);

  const angle = Math.atan2(state.player.vy, state.player.vx);
  ctx.rotate(angle + Math.PI / 2);

  if (drawAsset("player", -22, -38, 44, 58)) {
    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 9, 17, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#24345f";
  fillRoundRect(-10, -1, 20, 24, 6, "#24345f");
  ctx.fillStyle = "#5677d9";
  fillRoundRect(-8, -6, 16, 25, 6, "#5677d9");
  ctx.fillStyle = "#e7c46a";
  ctx.fillRect(-7, -2, 14, 3);
  ctx.fillStyle = "#314c9a";
  ctx.fillRect(-7, 7, 14, 3);

  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(0, 18);
  ctx.stroke();

  ctx.fillStyle = "#2b2a32";
  fillRoundRect(-13, 1, 6, 17, 3, "#2b2a32");
  ctx.fillStyle = "#b04b52";
  ctx.fillRect(-12, 5, 4, 8);
  ctx.strokeStyle = "#11131b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(-10, 18);
  ctx.stroke();

  ctx.strokeStyle = "#e8caa6";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(-17, 9);
  ctx.moveTo(8, 2);
  ctx.lineTo(17, 9);
  ctx.stroke();

  ctx.strokeStyle = "#24212a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-5, 18);
  ctx.lineTo(-9, 29);
  ctx.moveTo(5, 18);
  ctx.lineTo(9, 29);
  ctx.stroke();
  ctx.fillStyle = "#171820";
  ctx.fillRect(-13, 27, 9, 5);
  ctx.fillRect(4, 27, 9, 5);

  ctx.fillStyle = "#e8caa6";
  ctx.beginPath();
  ctx.arc(0, -14, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b1d16";
  ctx.beginPath();
  ctx.arc(-3, -15, 1.4, 0, Math.PI * 2);
  ctx.arc(3, -15, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4b3424";
  ctx.beginPath();
  ctx.arc(0, -18, 8, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-7, -19, 14, 4);

  ctx.fillStyle = "#d9f8ff";
  ctx.beginPath();
  ctx.moveTo(0, -29);
  ctx.lineTo(-6, -20);
  ctx.lineTo(6, -20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(217, 248, 255, 0.36)";
  ctx.beginPath();
  ctx.moveTo(0, -35);
  ctx.lineTo(-10, -19);
  ctx.lineTo(10, -19);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(0, -31);
  ctx.stroke();

  ctx.restore();
}

function drawLighting(room) {
  ctx.save();
  ctx.fillStyle = state.roomId === "yard" ? "rgba(2, 3, 8, 0.18)" : "rgba(2, 3, 8, 0.56)";
  ctx.fillRect(0, 0, W, H);

  if (state.flashlight) {
    clearFlashlightBeam();
    brightenFlashlightBeam(room);
  }

  drawPlayerAura();
  drawRoomLightAccents(room);
  if (room.nodes) {
    ctx.globalCompositeOperation = "screen";
    for (const node of room.nodes) {
      if (!node.active) continue;
      const glow = ctx.createRadialGradient(node.x, node.y, 8, node.x, node.y, 82);
      glow.addColorStop(0, "rgba(116, 242, 163, 0.34)");
      glow.addColorStop(1, "rgba(116, 242, 163, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 82, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}

function drawRoomLightAccents(room) {
  if (room.name === "Hawkins Street") {
    drawHawkinsStreetLightAccents();
    return;
  }

  if (room.name !== "Creel House Entry") return;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const pathGlow = ctx.createLinearGradient(480, 530, 480, 120);
  pathGlow.addColorStop(0, "rgba(231, 196, 106, 0.02)");
  pathGlow.addColorStop(0.62, "rgba(231, 196, 106, 0.04)");
  pathGlow.addColorStop(1, "rgba(232, 77, 91, 0.07)");
  ctx.fillStyle = pathGlow;
  ctx.beginPath();
  ctx.moveTo(430, 536);
  ctx.quadraticCurveTo(454, 368, 462, 136);
  ctx.lineTo(498, 136);
  ctx.quadraticCurveTo(506, 368, 530, 536);
  ctx.closePath();
  ctx.fill();

  for (const [x, y, radius] of [[250, 214, 96], [710, 214, 96], [320, 492, 78], [640, 492, 78]]) {
    const glow = ctx.createRadialGradient(x, y - 16, 6, x, y - 16, radius);
    glow.addColorStop(0, "rgba(255, 220, 128, 0.2)");
    glow.addColorStop(0.42, "rgba(231, 196, 106, 0.08)");
    glow.addColorStop(1, "rgba(231, 196, 106, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 16, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const gateGlow = ctx.createRadialGradient(480, 92, 10, 480, 92, 120);
  gateGlow.addColorStop(0, "rgba(232, 77, 91, 0.14)");
  gateGlow.addColorStop(1, "rgba(232, 77, 91, 0)");
  ctx.fillStyle = gateGlow;
  ctx.beginPath();
  ctx.arc(480, 92, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHawkinsStreetLightAccents() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const streetlampGlow = ctx.createRadialGradient(112, 284, 10, 112, 284, 154);
  streetlampGlow.addColorStop(0, "rgba(231, 196, 106, 0.22)");
  streetlampGlow.addColorStop(0.34, "rgba(231, 196, 106, 0.09)");
  streetlampGlow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = streetlampGlow;
  ctx.beginPath();
  ctx.arc(112, 284, 154, 0, Math.PI * 2);
  ctx.fill();

  const lampPool = ctx.createRadialGradient(132, 456, 10, 132, 456, 136);
  lampPool.addColorStop(0, "rgba(143, 239, 255, 0.08)");
  lampPool.addColorStop(0.42, "rgba(231, 196, 106, 0.05)");
  lampPool.addColorStop(1, "rgba(143, 239, 255, 0)");
  ctx.fillStyle = lampPool;
  ctx.beginPath();
  ctx.ellipse(132, 456, 136, 62, -0.08, 0, Math.PI * 2);
  ctx.fill();

  const houseRift = ctx.createRadialGradient(480, 282, 12, 480, 282, 150);
  houseRift.addColorStop(0, "rgba(255, 82, 92, 0.18)");
  houseRift.addColorStop(0.42, "rgba(120, 158, 176, 0.07)");
  houseRift.addColorStop(1, "rgba(255, 82, 92, 0)");
  ctx.fillStyle = houseRift;
  ctx.beginPath();
  ctx.arc(480, 282, 150, 0, Math.PI * 2);
  ctx.fill();

  const pathSignal = ctx.createLinearGradient(142, 470, 480, 286);
  pathSignal.addColorStop(0, "rgba(143, 239, 255, 0.025)");
  pathSignal.addColorStop(0.55, "rgba(231, 196, 106, 0.04)");
  pathSignal.addColorStop(1, "rgba(255, 82, 92, 0.08)");
  ctx.fillStyle = pathSignal;
  ctx.beginPath();
  ctx.moveTo(112, 488);
  ctx.quadraticCurveTo(288, 438, 444, 310);
  ctx.lineTo(516, 310);
  ctx.quadraticCurveTo(350, 448, 176, 520);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(116, 242, 163, 0.1)";
  for (const [x, y, r] of [[408, 326, 2.4], [450, 304, 1.8], [528, 306, 2], [568, 330, 1.7], [612, 360, 1.5]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function clearFlashlightBeam() {
  const angle = Math.atan2(state.player.vy, state.player.vx);

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#fff";
  traceFlashlightCone(angle, FLASHLIGHT_REACH, FLASHLIGHT_SPREAD);
  ctx.fill();

  const feather = ctx.createRadialGradient(state.player.x, state.player.y, FLASHLIGHT_REACH * 0.62, state.player.x, state.player.y, FLASHLIGHT_REACH);
  feather.addColorStop(0, "rgba(255, 255, 255, 0)");
  feather.addColorStop(1, "rgba(255, 255, 255, 0.42)");
  ctx.fillStyle = feather;
  traceFlashlightCone(angle, FLASHLIGHT_REACH, FLASHLIGHT_SPREAD);
  ctx.fill();
  ctx.restore();
}

function brightenFlashlightBeam(room) {
  const angle = Math.atan2(state.player.vy, state.player.vx);

  ctx.save();
  traceFlashlightCone(angle, FLASHLIGHT_REACH * 0.96, FLASHLIGHT_SPREAD * 0.96);
  ctx.clip();
  ctx.filter = "brightness(2.15) contrast(1.12) saturate(1.12)";
  drawRoom(room);
  drawExits(room);
  drawItems(room);
  drawNodes(room);
  drawEnemies(room);
  drawPlayer();
  ctx.filter = "none";

  ctx.globalCompositeOperation = "screen";
  const hotSpotX = state.player.x + Math.cos(angle) * 132;
  const hotSpotY = state.player.y + Math.sin(angle) * 132;
  const hotSpot = ctx.createRadialGradient(hotSpotX, hotSpotY, 0, hotSpotX, hotSpotY, 54);
  hotSpot.addColorStop(0, "rgba(255, 250, 214, 0.22)");
  hotSpot.addColorStop(1, "rgba(255, 250, 214, 0)");
  ctx.fillStyle = hotSpot;
  ctx.beginPath();
  ctx.arc(hotSpotX, hotSpotY, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function traceFlashlightCone(angle, reach, spread) {
  ctx.beginPath();
  ctx.moveTo(state.player.x, state.player.y);
  ctx.arc(state.player.x, state.player.y, reach, angle - spread, angle + spread);
  ctx.closePath();
}

function drawPlayerAura() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const playerLight = ctx.createRadialGradient(state.player.x, state.player.y, 6, state.player.x, state.player.y, 78);
  playerLight.addColorStop(0, "rgba(255, 240, 190, 0.28)");
  playerLight.addColorStop(1, "rgba(255, 240, 190, 0)");
  ctx.fillStyle = playerLight;
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEndingSequence() {
  if (state.roomId !== "lab" || state.endingPhase === "playing") return;

  const chamber = { x: 424, y: 256, w: 112, h: 96 };
  const centerX = chamber.x + chamber.w / 2;
  const centerY = chamber.y + chamber.h / 2;

  if (state.endingPhase === "chamberOpening") {
    drawChamberBurst(centerX, centerY);
  }

  if (state.endingPhase === "reunited" || state.endingPhase === "complete" || state.won) {
    drawReunionMoment();
  }
}

function drawChamberBurst(x, y) {
  const t = Math.min(1, state.endingTimer / 1.25);
  const pulse = 1 + Math.sin(state.pulse * 18) * 0.08;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(x, y, 10, x, y, 140 * pulse);
  glow.addColorStop(0, `rgba(255, 244, 184, ${0.48 * (1 - t * 0.35)})`);
  glow.addColorStop(0.48, "rgba(116, 242, 163, 0.22)");
  glow.addColorStop(1, "rgba(116, 242, 163, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 140 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 244, 184, ${0.82 - t * 0.32})`;
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x, y, 28 + t * 96 + i * 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(246, 240, 223, 0.78)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 52);
  ctx.lineTo(x - 4, y - 22);
  ctx.lineTo(x - 16, y + 10);
  ctx.moveTo(x + 20, y - 48);
  ctx.lineTo(x + 5, y - 18);
  ctx.lineTo(x + 18, y + 16);
  ctx.moveTo(x - 28, y + 32);
  ctx.lineTo(x, y + 12);
  ctx.lineTo(x + 26, y + 34);
  ctx.stroke();
  ctx.restore();
}

function drawReunionMoment() {
  const friendX = state.player.x + 46;
  const friendY = state.player.y + 2;
  const midX = (state.player.x + friendX) / 2;
  const midY = (state.player.y + friendY) / 2;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const reunionGlow = ctx.createRadialGradient(midX, midY, 8, midX, midY, 118);
  reunionGlow.addColorStop(0, "rgba(255, 244, 184, 0.42)");
  reunionGlow.addColorStop(0.5, "rgba(231, 196, 106, 0.2)");
  reunionGlow.addColorStop(1, "rgba(231, 196, 106, 0)");
  ctx.fillStyle = reunionGlow;
  ctx.beginPath();
  ctx.arc(midX, midY, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawFreedFriend(friendX, friendY);
  drawReunionSparks(midX, midY);
  drawScientistDefeatCue();
}

function drawFreedFriend(x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + 28, 19, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d96b86";
  fillRoundRect(x - 11, y - 6, 22, 31, 6, "#d96b86");
  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 2);
  ctx.lineTo(x - 24, y - 6);
  ctx.moveTo(x + 10, y + 2);
  ctx.lineTo(x + 24, y - 6);
  ctx.stroke();

  ctx.strokeStyle = "#24212a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 23);
  ctx.lineTo(x - 10, y + 39);
  ctx.moveTo(x + 5, y + 23);
  ctx.lineTo(x + 10, y + 39);
  ctx.stroke();

  ctx.fillStyle = "#e8caa6";
  ctx.beginPath();
  ctx.arc(x, y - 21, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3c24";
  ctx.beginPath();
  ctx.arc(x - 2, y - 25, 13, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 12, y - 26, 24, 5);
  ctx.fillStyle = "#21151a";
  ctx.beginPath();
  ctx.arc(x - 4, y - 21, 2, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 21, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a533c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 1, y - 15, 5, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawReunionSparks(x, y) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(255, 244, 184, 0.78)";
  for (let i = 0; i < 12; i += 1) {
    const angle = i * (Math.PI * 2 / 12) + state.pulse * 1.6;
    const radius = 42 + Math.sin(state.pulse * 3 + i) * 9;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, i % 3 === 0 ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawScientistDefeatCue() {
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(9, 10, 16, 0.72)";
  fillRoundRect(640, 162, 74, 32, 7, "rgba(9, 10, 16, 0.72)");
  ctx.strokeStyle = "rgba(232, 77, 91, 0.72)";
  ctx.lineWidth = 2;
  ctx.strokeRect(642, 164, 70, 28);
  ctx.fillStyle = "#e84d5b";
  ctx.font = "700 16px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("NO!", 677, 184);

  ctx.strokeStyle = "rgba(246, 240, 223, 0.28)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(694, 270, 42 + Math.sin(state.pulse * 8) * 4, 0.2, Math.PI * 1.6);
  ctx.stroke();
  ctx.restore();
}

function drawWinOverlay() {
  if (!state.won) return;

  const glow = 0.2 + Math.sin(state.pulse * 3) * 0.05;
  ctx.fillStyle = `rgba(231, 196, 106, ${glow})`;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(9, 10, 16, 0.74)";
  fillRoundRect(W / 2 - 290, 214, 580, 128, 8, "rgba(9, 10, 16, 0.74)");
  ctx.strokeStyle = "rgba(231, 196, 106, 0.58)";
  ctx.lineWidth = 2;
  ctx.strokeRect(W / 2 - 286, 218, 572, 120);
  ctx.fillStyle = "#f6f0df";
  ctx.textAlign = "center";
  ctx.font = "700 42px Trebuchet MS, Arial";
  ctx.fillText("Rescue Complete", W / 2, 262);
  ctx.font = "20px Trebuchet MS, Arial";
  ctx.fillText("You pulled Eleven back from Vecna's hold.", W / 2, 300);
  ctx.fillText("Hawkins still has a chance.", W / 2, 326);
}

function drawRadioTuningOverlay() {
  if (!state.libraryPuzzle.radioOpen) return;

  const puzzle = state.libraryPuzzle;
  const panelX = W / 2 - 250;
  const panelY = H - 180;
  const panelW = 500;
  const panelH = 128;

  ctx.save();
  ctx.fillStyle = "rgba(4, 5, 9, 0.82)";
  fillRoundRect(panelX, panelY, panelW, panelH, 8, ctx.fillStyle);
  ctx.strokeStyle = "rgba(231, 196, 106, 0.62)";
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8);

  ctx.fillStyle = "#e7c46a";
  ctx.textAlign = "center";
  ctx.font = "700 18px Trebuchet MS, Arial";
  ctx.fillText("Tune the Radio Signal", W / 2, panelY + 30);

  ctx.font = "12px Trebuchet MS, Arial";
  ctx.fillStyle = "rgba(246, 240, 223, 0.72)";
  ctx.fillText("A/D choose digit  |  W/S change number  |  E submit  |  Esc close", W / 2, panelY + 108);

  for (let i = 0; i < 3; i += 1) {
    const x = W / 2 - 78 + i * 78;
    const selected = puzzle.selectedDigit === i;
    const solvedDigit = puzzle.frequency[i] === puzzle.answer[i];
    fillRoundRect(x - 25, panelY + 48, 50, 42, 6, selected ? "rgba(231, 196, 106, 0.2)" : "rgba(18, 19, 27, 0.92)");
    ctx.strokeStyle = selected ? "#e7c46a" : "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = selected ? 3 : 2;
    ctx.strokeRect(x - 25, panelY + 48, 50, 42);
    ctx.fillStyle = solvedDigit ? "#74f2a3" : "#f6f0df";
    ctx.font = "700 30px Trebuchet MS, Arial";
    ctx.fillText(String(puzzle.frequency[i]), x, panelY + 79);
  }

  ctx.strokeStyle = state.libraryPuzzle.clueSeen ? "rgba(116, 242, 163, 0.52)" : "rgba(232, 77, 91, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 156, panelY + 95);
  ctx.lineTo(W / 2 + 156, panelY + 95);
  ctx.stroke();

  ctx.fillStyle = state.libraryPuzzle.clueSeen ? "#74f2a3" : "#e84d5b";
  ctx.font = "700 11px Trebuchet MS, Arial";
  ctx.fillText(state.libraryPuzzle.clueSeen ? "LIGHTS SAY: FOUR ONE FIVE" : "THE LIGHT WALL HAS THE CLUE", W / 2, panelY + 49);
  ctx.restore();
}

function isItemVisible(item) {
  if (item.requiresPuzzle && !state.libraryPuzzle.solved) return false;
  if (item.requiresPuzzle && state.libraryPuzzle.solved) return true;
  return !item.hidden || (state.flashlight && pointInFlashlight(item.x, item.y));
}

function getLibraryObjective() {
  if (state.libraryPuzzle.solved && !state.inventory.includes("signal key")) return "Take the signal key";
  if (state.libraryPuzzle.solved) return "Return to the Creel House entry";
  if (state.libraryPuzzle.radioOpen) return "Tune the radio to 415";
  if (state.libraryPuzzle.clueSeen) return "Tune the radio frequency";
  return "Reveal the light-wall message";
}

function pointInFlashlight(x, y) {
  const dx = x - state.player.x;
  const dy = y - state.player.y;
  const distance = Math.hypot(dx, dy);
  if (distance > FLASHLIGHT_REACH) return false;

  const facing = Math.atan2(state.player.vy, state.player.vx);
  const pointAngle = Math.atan2(dy, dx);
  const diff = Math.abs(angleDiff(facing, pointAngle));
  return diff < FLASHLIGHT_SPREAD;
}

function circleRectOverlap(cx, cy, radius, box) {
  const closestX = clamp(cx, box.x, box.x + box.w);
  const closestY = clamp(cy, box.y, box.y + box.h);
  return Math.hypot(cx - closestX, cy - closestY) <= radius;
}

function distanceToPlayer(point) {
  return Math.hypot(point.x - state.player.x, point.y - state.player.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function angleDiff(a, b) {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

function fillRoundRect(x, y, w, h, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function loop(now) {
  if (!gameStarted) return;
  const dt = Math.min(0.08, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function startGame() {
  if (gameStarted) return;
  retryAudioAfterInteraction();
  gameStarted = true;
  startBriefingEl.classList.add("hidden");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const isButtonTarget = event.target.closest?.("button");

  retryAudioAfterInteraction();

  if (!isButtonTarget && ["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e"].includes(key)) {
    event.preventDefault();
  }
  if (!gameStarted) {
    if (key === "enter" && !isButtonTarget) startGame();
    return;
  }
  if (isButtonTarget) return;
  if (!keys.has(key)) justPressed.add(key);
  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("pointerdown", retryAudioAfterInteraction);
restartButton.addEventListener("click", resetGame);
startButton.addEventListener("click", startGame);
musicToggleButton.addEventListener("click", toggleIntroMusic);
briefingMusicToggleButton.addEventListener("click", toggleIntroMusic);

resetGame();
updateIntroMusicButtons();
playIntroMusic();
loadAssets().then(() => {
  render();
  startButton.focus();
});
