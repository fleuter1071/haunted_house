const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const roomNameEl = document.getElementById("roomName");
const objectiveEl = document.getElementById("objective");
const inventoryEl = document.getElementById("inventory");
const fearFillEl = document.getElementById("fearFill");
const messageEl = document.getElementById("message");
const restartButton = document.getElementById("restartButton");

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
    name: "Front Yard",
    objective: "Enter the estate",
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
      { type: "grave", x: 168, y: 336 },
      { type: "grave", x: 762, y: 362 },
      { type: "porch", x: 408, y: 230, w: 144, h: 96 }
    ],
    exits: [
      { x: 454, y: 278, w: 52, h: 42, to: "foyer", spawn: { x: 480, y: 500 }, label: "Enter estate" }
    ],
    items: [],
    enemies: []
  },
  foyer: {
    name: "Grand Foyer",
    objective: "Find the library key",
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
      { type: "candle", x: 250, y: 214 },
      { type: "candle", x: 710, y: 214 },
      { type: "candle", x: 320, y: 492 },
      { type: "candle", x: 640, y: 492 }
    ],
    exits: [
      { x: 438, y: 70, w: 84, h: 48, to: "lab", spawn: { x: 480, y: 500 }, item: "stair key", label: "Unlock staircase" },
      { x: 36, y: 246, w: 42, h: 80, to: "library", spawn: { x: 854, y: 300 }, label: "Enter library" },
      { x: 452, y: H - 38, w: 56, h: 36, to: "yard", spawn: { x: 480, y: 340 }, label: "Back outside" }
    ],
    items: [],
    enemies: []
  },
  library: {
    name: "Moonlit Library",
    objective: "Use the flashlight to reveal the key",
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
      { type: "clue", x: 428, y: 202, w: 104, h: 62 }
    ],
    exits: [
      { x: W - 78, y: 252, w: 42, h: 88, to: "foyer", spawn: { x: 92, y: 286 }, label: "Return to foyer" }
    ],
    symbols: [
      { id: "moon", x: 224, y: 130, activated: false },
      { id: "eye", x: 690, y: 418, activated: false },
      { id: "flame", x: 288, y: 274, activated: false }
    ],
    items: [
      { id: "stair-key", name: "stair key", x: 480, y: 230, hidden: true, requiresPuzzle: true, collected: false }
    ],
    enemies: [
      { id: "library-ghost", x: 482, y: 330, startX: 482, startY: 330, radius: 18, speed: 78, color: "#b7fff0", path: [{ x: 482, y: 174 }, { x: 482, y: 500 }], target: 0, startTarget: 0 }
    ]
  },
  lab: {
    name: "Attic Laboratory",
    objective: "Disable three power nodes",
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
      { x: 452, y: H - 38, w: 56, h: 36, to: "foyer", spawn: { x: 480, y: 144 }, label: "Back downstairs" }
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

function rect(x, y, w, h) {
  return { x, y, w, h };
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
  for (const room of Object.values(rooms)) {
    if (room.items) room.items.forEach((item) => { item.collected = false; });
    if (room.nodes) room.nodes.forEach((node) => { node.active = true; });
    if (room.symbols) room.symbols.forEach((symbol) => { symbol.activated = false; });
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
    libraryPuzzle: { order: ["moon", "eye", "flame"], progress: 0, solved: false, penaltyTimer: 0 },
    won: false,
    pulse: 0
  };

  showMessage("Find her before the experiment begins.");
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

  if (state.won) {
    objectiveEl.textContent = "Escaped together";
  } else if (state.roomId === "foyer" && state.inventory.includes("stair key")) {
    objectiveEl.textContent = "Unlock the staircase";
  } else if (state.roomId === "library") {
    objectiveEl.textContent = getLibraryObjective();
  } else if (state.roomId === "lab") {
    const active = room.nodes.filter((node) => node.active).length;
    objectiveEl.textContent = active > 0 ? `Disable ${active} power node${active === 1 ? "" : "s"}` : "Open the containment chamber";
  } else {
    objectiveEl.textContent = room.objective;
  }

  inventoryEl.textContent = state.inventory.length ? state.inventory.join(", ") : "None";
  fearFillEl.style.width = `${Math.round(state.fear)}%`;
}

function update(dt) {
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) messageEl.classList.remove("show");
  }

  if (state.won) {
    state.pulse += dt;
    return;
  }

  if (state.libraryPuzzle.penaltyTimer > 0) {
    state.libraryPuzzle.penaltyTimer = Math.max(0, state.libraryPuzzle.penaltyTimer - dt);
  }

  handleInput(dt);
  updateEnemies(dt);
  updateFear(dt);
  handleInteract();
  updateHud();
  justPressed.clear();
}

function handleInput(dt) {
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
    showMessage("Panic takes over. You stumble back to the room entrance.");
  }
}

function handleInteract() {
  if (!justPressed.has("e")) return;

  const room = currentRoom();

  for (const exit of room.exits) {
    if (circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 7, exit)) {
      if (exit.item && !state.inventory.includes(exit.item)) {
        showMessage(`The ${exit.label.toLowerCase()} needs the ${exit.item}.`);
        return;
      }

      state.roomId = exit.to;
      state.player.x = exit.spawn.x;
      state.player.y = exit.spawn.y;
      state.fear = Math.max(0, state.fear - 12);
      showMessage(exit.label);
      return;
    }
  }

  if (room.symbols && !state.libraryPuzzle.solved) {
    for (const symbol of room.symbols) {
      if (!symbol.activated && isSymbolVisible(symbol) && distanceToPlayer(symbol) < 50) {
        activateLibrarySymbol(symbol);
        return;
      }
    }
  }

  if (room.items) {
    for (const item of room.items) {
      if (!item.collected && isItemVisible(item) && distanceToPlayer(item) < 44) {
        item.collected = true;
        state.inventory.push(item.name);
        showMessage("You found the stair key.");
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
        showMessage(remaining ? "Power node disabled." : "The machine is vulnerable.");
        return;
      }
    }

    const chamber = { x: 424, y: 256, w: 112, h: 96 };
    const allDisabled = room.nodes.every((node) => !node.active);
    if (allDisabled && circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 9, chamber)) {
      state.won = true;
      showMessage("You pull her free. The estate exhales.");
    } else if (!allDisabled && circleRectOverlap(state.player.x, state.player.y, PLAYER_RADIUS + 9, chamber)) {
      showMessage("The containment field is still powered.");
    }
  }
}

function render() {
  const room = currentRoom();
  drawRoom(room);
  drawExits(room);
  drawItems(room);
  drawSymbols(room);
  drawNodes(room);
  drawEnemies(room);
  drawPlayer();
  drawLighting(room);
  drawWinOverlay();
}

function drawRoom(room) {
  ctx.fillStyle = room.floor;
  ctx.fillRect(0, 0, W, H);

  drawFloorPattern(room);
  drawProps(room);
  drawRoomPropConnections(room);

  ctx.fillStyle = room.wall;
  for (const wall of room.walls) {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(wall.x, wall.y + wall.h - 5, wall.w, 5);
    ctx.fillStyle = room.wall;
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

function drawProps(room) {
  for (const prop of room.props) {
    if (prop.type === "path") {
      drawPath(prop);
    }
    if (prop.type === "tree") drawTree(prop);
    if (prop.type === "fence") drawFence(prop);
    if (prop.type === "grave") drawGrave(prop);
    if (prop.type === "porch") drawPorch(prop);
    if (prop.type === "rug") drawRug(prop);
    if (prop.type === "candle") drawCandle(prop);
    if (prop.type === "stairs") drawStairs(prop);
    if (prop.type === "portrait") drawPortrait(prop);
    if (prop.type === "shelf") drawShelf(prop);
    if (prop.type === "clue") drawClue(prop);
    if (prop.type === "machine") drawMachine(prop);
    if (prop.type === "chamber") drawChamber(prop);
    if (prop.type === "scientist") drawScientist(prop);
  }
}

function drawRoomPropConnections(room) {
  if (room.name !== "Attic Laboratory" || !room.nodes) return;

  ctx.save();
  ctx.strokeStyle = "rgba(116, 242, 163, 0.32)";
  ctx.lineWidth = 5;
  ctx.setLineDash([12, 8]);
  for (const node of room.nodes) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.bezierCurveTo(node.x, 300, 480, 310, 480, 304);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(20, 7, 12, 0.62)";
  ctx.lineWidth = 2;
  for (const node of room.nodes) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.bezierCurveTo(node.x, 300, 480, 310, 480, 304);
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
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(prop.x, prop.y + 44, 42, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#382819";
  ctx.beginPath();
  ctx.moveTo(prop.x - 14, prop.y + 28);
  ctx.lineTo(prop.x + 14, prop.y + 28);
  ctx.lineTo(prop.x + 20, prop.y + 88);
  ctx.lineTo(prop.x - 18, prop.y + 88);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a4728";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(prop.x - 4, prop.y + 40);
  ctx.lineTo(prop.x - 28, prop.y + 4);
  ctx.moveTo(prop.x + 5, prop.y + 42);
  ctx.lineTo(prop.x + 32, prop.y + 4);
  ctx.stroke();
  ctx.fillStyle = "#0b1710";
  ctx.beginPath();
  ctx.arc(prop.x - 32, prop.y - 8, 26, 0, Math.PI * 2);
  ctx.arc(prop.x - 4, prop.y - 30, 34, 0, Math.PI * 2);
  ctx.arc(prop.x + 31, prop.y - 8, 28, 0, Math.PI * 2);
  ctx.arc(prop.x, prop.y + 12, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17311f";
  ctx.beginPath();
  ctx.arc(prop.x - 24, prop.y - 12, 14, 0, Math.PI * 2);
  ctx.arc(prop.x + 20, prop.y - 16, 15, 0, Math.PI * 2);
  ctx.arc(prop.x + 3, prop.y + 8, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFence(prop) {
  ctx.save();
  ctx.strokeStyle = "#6b5233";
  ctx.lineWidth = 6;
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
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 8, "#3a3131");
  ctx.fillStyle = "#271f20";
  ctx.beginPath();
  ctx.moveTo(prop.x + prop.w / 2, prop.y - 26);
  ctx.lineTo(prop.x + prop.w - 8, prop.y + 18);
  ctx.lineTo(prop.x + 8, prop.y + 18);
  ctx.closePath();
  ctx.fill();
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
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.fillRect(prop.x + 6, prop.y + 6, prop.w, prop.h);
  fillRoundRect(prop.x, prop.y, prop.w, prop.h, 6, "#7a6040");
  fillRoundRect(prop.x + 10, prop.y + 8, prop.w - 20, prop.h - 16, 4, "#4b3a2c");
  ctx.fillStyle = "#e7c46a";
  ctx.font = "700 11px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.fillText("CLUE", prop.x + prop.w / 2, prop.y + 20);
  ctx.font = "10px Trebuchet MS, Arial";
  ctx.fillText("Night watches.", prop.x + prop.w / 2, prop.y + 38);
  ctx.fillText("Fire answers.", prop.x + prop.w / 2, prop.y + 52);
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
  ctx.fillText("CORE", prop.x + prop.w / 2, prop.y + prop.h / 2 + 4);
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
    if (disabled) {
      ctx.save();
      ctx.strokeStyle = "rgba(246, 240, 223, 0.62)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(prop.x + 16, prop.y - 8, prop.w - 32, prop.h + 6, 28);
      ctx.stroke();
      ctx.restore();
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

function drawScientist(prop) {
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
    const isStairs = exit.label.includes("stair") || exit.label.includes("staircase");
    const isLibrary = exit.label.includes("library");
    const isEstate = exit.label.includes("estate");
    const usesDoorAsset = !isStairs && drawAsset("door", exit.x - 12, exit.y - 18, exit.w + 24, exit.h + 34);

    if (usesDoorAsset) {
      if (locked) {
        ctx.save();
        ctx.fillStyle = "rgba(232, 77, 91, 0.28)";
        fillRoundRect(exit.x - 10, exit.y - 12, exit.w + 20, exit.h + 24, 6, ctx.fillStyle);
        ctx.strokeStyle = "#e84d5b";
        ctx.lineWidth = 3;
        ctx.strokeRect(exit.x - 6, exit.y - 6, exit.w + 12, exit.h + 12);
        ctx.restore();
      }

      if (isLibrary || isEstate) {
        ctx.save();
        ctx.fillStyle = "#e7c46a";
        ctx.font = "700 9px Trebuchet MS, Arial";
        ctx.textAlign = "center";
        ctx.fillText(isLibrary ? "LIBRARY" : "DOOR", exit.x + exit.w / 2, exit.y - 12);
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
    ctx.fillStyle = locked ? "rgba(232, 77, 91, 0.36)" : (isEstate || isLibrary ? "#5a3c24" : "rgba(231, 196, 106, 0.42)");
    fillRoundRect(exit.x, exit.y, exit.w, exit.h, isStairs ? 4 : 6, ctx.fillStyle);
    ctx.strokeStyle = locked ? "#e84d5b" : "#e7c46a";
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
    if (isEstate || isLibrary) {
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
    if (isStairs) {
      ctx.fillStyle = locked ? "#e84d5b" : "#e7c46a";
      ctx.font = "700 10px Trebuchet MS, Arial";
      ctx.textAlign = "center";
      ctx.fillText("STAIRS", exit.x + exit.w / 2, exit.y - 12);
    } else if (isLibrary || isEstate) {
      ctx.fillStyle = "#e7c46a";
      ctx.font = "700 9px Trebuchet MS, Arial";
      ctx.textAlign = "center";
      ctx.fillText(isLibrary ? "LIBRARY" : "DOOR", exit.x + exit.w / 2, exit.y - 10);
    }
  }
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

function drawSymbols(room) {
  if (!room.symbols) return;

  for (const symbol of room.symbols) {
    const visible = symbol.activated || isSymbolVisible(symbol);
    if (!visible) continue;

    const pulse = symbol.activated ? 1 : 0.72 + Math.sin(performance.now() / 160) * 0.18;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = symbol.activated ? "#74f2a3" : "#fff4b8";
    ctx.fillStyle = symbol.activated ? "rgba(116, 242, 163, 0.22)" : "rgba(231, 196, 106, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(symbol.x, symbol.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (symbol.id === "moon") drawMoonSymbol(symbol.x, symbol.y);
    if (symbol.id === "eye") drawEyeSymbol(symbol.x, symbol.y);
    if (symbol.id === "flame") drawFlameSymbol(symbol.x, symbol.y);
    if (!symbol.activated && distanceToPlayer(symbol) < 50) {
      ctx.fillStyle = "#f6f0df";
      ctx.font = "12px Trebuchet MS, Arial";
      ctx.textAlign = "center";
      ctx.fillText("E", symbol.x, symbol.y - 28);
    }
    ctx.restore();
  }
}

function drawMoonSymbol(x, y) {
  ctx.fillStyle = "#fff4b8";
  ctx.beginPath();
  ctx.arc(x - 3, y, 9, Math.PI * 0.35, Math.PI * 1.65);
  ctx.arc(x + 5, y, 9, Math.PI * 1.65, Math.PI * 0.35, true);
  ctx.closePath();
  ctx.fill();
}

function drawEyeSymbol(x, y) {
  ctx.strokeStyle = "#fff4b8";
  ctx.beginPath();
  ctx.ellipse(x, y, 13, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#fff4b8";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlameSymbol(x, y) {
  ctx.fillStyle = "#fff4b8";
  ctx.beginPath();
  ctx.moveTo(x, y - 13);
  ctx.bezierCurveTo(x + 12, y - 2, x + 8, y + 12, x, y + 13);
  ctx.bezierCurveTo(x - 12, y + 7, x - 7, y - 4, x, y - 13);
  ctx.fill();
}

function drawNodes(room) {
  if (!room.nodes) return;

  for (const node of room.nodes) {
    ctx.fillStyle = node.active ? "#74f2a3" : "#4f5654";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = node.active ? "#d6ffe4" : "#87908c";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
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
  drawSymbols(room);
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

function drawWinOverlay() {
  if (!state.won) return;

  const glow = 0.18 + Math.sin(state.pulse * 3) * 0.05;
  ctx.fillStyle = `rgba(116, 242, 163, ${glow})`;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f6f0df";
  ctx.textAlign = "center";
  ctx.font = "700 44px Trebuchet MS, Arial";
  ctx.fillText("Rescue Complete", W / 2, 252);
  ctx.font = "22px Trebuchet MS, Arial";
  ctx.fillText("The machine is silent. You escaped the haunted estate together.", W / 2, 294);
}

function isItemVisible(item) {
  if (item.requiresPuzzle && !state.libraryPuzzle.solved) return false;
  if (item.requiresPuzzle && state.libraryPuzzle.solved) return true;
  return !item.hidden || (state.flashlight && pointInFlashlight(item.x, item.y));
}

function isSymbolVisible(symbol) {
  return state.flashlight && pointInFlashlight(symbol.x, symbol.y);
}

function activateLibrarySymbol(symbol) {
  const expected = state.libraryPuzzle.order[state.libraryPuzzle.progress];

  if (symbol.id !== expected) {
    resetLibraryPuzzle();
    return;
  }

  symbol.activated = true;
  state.libraryPuzzle.progress += 1;

  if (state.libraryPuzzle.progress >= state.libraryPuzzle.order.length) {
    state.libraryPuzzle.solved = true;
    showMessage("A hidden drawer opens. The stair key appears.");
  } else {
    const next = state.libraryPuzzle.order[state.libraryPuzzle.progress];
    showMessage(`${capitalize(symbol.id)} answers. Seek ${capitalize(next)}.`);
  }
}

function resetLibraryPuzzle() {
  const room = rooms.library;
  room.symbols.forEach((symbol) => { symbol.activated = false; });
  state.libraryPuzzle.progress = 0;
  state.libraryPuzzle.penaltyTimer = 3;
  state.fear = clamp(state.fear + 14, 0, 100);
  showMessage("The shelf rejects the order. The ghost stirs.");
}

function getLibraryObjective() {
  if (state.libraryPuzzle.solved && !state.inventory.includes("stair key")) return "Take the stair key";
  if (state.libraryPuzzle.solved) return "Return to the foyer";
  const next = state.libraryPuzzle.order[state.libraryPuzzle.progress];
  return `Activate ${capitalize(next)}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const dt = Math.min(0.08, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e"].includes(key)) {
    event.preventDefault();
  }
  if (!keys.has(key)) justPressed.add(key);
  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

restartButton.addEventListener("click", resetGame);

resetGame();
loadAssets().then(() => {
  requestAnimationFrame(loop);
});
