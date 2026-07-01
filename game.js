const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  startPanel: document.getElementById("startPanel"),
  endPanel: document.getElementById("endPanel"),
  endTitle: document.getElementById("endTitle"),
  endText: document.getElementById("endText"),
  choicePanel: document.getElementById("choicePanel"),
  choiceText: document.getElementById("choiceText"),
  allyPanel: document.getElementById("allyPanel"),
  allyChoiceText: document.getElementById("allyChoiceText"),
  allyButtons: document.getElementById("allyButtons"),
  allyCancelBtn: document.getElementById("allyCancelBtn"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  befriendBtn: document.getElementById("befriendBtn"),
  betrayBtn: document.getElementById("betrayBtn"),
  heroName: document.getElementById("heroName"),
  hpBar: document.getElementById("hpBar"),
  timeLeftMobile: document.getElementById("timeLeftMobile"),
  roomDepthMobile: document.getElementById("roomDepthMobile"),
  hpMobile: document.getElementById("hpMobile"),
  inventoryBtn: document.getElementById("inventoryBtn"),
  mobileDrawerClose: document.getElementById("mobileDrawerClose"),
  mobileHudBar: document.getElementById("mobileHudBar"),
  tradePrompt: document.getElementById("tradePrompt"),
  tradeEnterBtn: document.getElementById("tradeEnterBtn"),
  tradePanel: document.getElementById("tradePanel"),
  tradeCloseBtn: document.getElementById("tradeCloseBtn"),
  tradeCoins: document.getElementById("tradeCoins"),
  tradeSubtitle: document.getElementById("tradeSubtitle"),
  weaponGachaInfo: document.getElementById("weaponGachaInfo"),
  weaponGachaBtn: document.getElementById("weaponGachaBtn"),
  weaponGachaResult: document.getElementById("weaponGachaResult"),
  goodieGachaInfo: document.getElementById("goodieGachaInfo"),
  goodieGachaBtn: document.getElementById("goodieGachaBtn"),
  goodieGachaResult: document.getElementById("goodieGachaResult"),
  sellInfo: document.getElementById("sellInfo"),
  sellExtrasBtn: document.getElementById("sellExtrasBtn"),
  sellConfirmBtn: document.getElementById("sellConfirmBtn"),
  sellCancelBtn: document.getElementById("sellCancelBtn"),
  materialRows: document.getElementById("materialRows"),
  hud: document.querySelector(".hud"),
  genderButtons: [...document.querySelectorAll("[data-gender]")],
  deviceButtons: [...document.querySelectorAll("[data-device]")],
  timeLeft: document.getElementById("timeLeft"),
  darknessBar: document.getElementById("darknessBar"),
  depth: document.getElementById("roomDepth"),
  hp: document.getElementById("hp"),
  food: document.getElementById("food"),
  water: document.getElementById("water"),
  cores: document.getElementById("cores"),
  gear: document.getElementById("gear"),
  coins: document.getElementById("coins"),
  pack: document.getElementById("pack"),
  materials: document.getElementById("materials"),
  allies: document.getElementById("allies"),
  log: document.getElementById("log"),
  mobileControls: document.getElementById("mobileControls"),
  joystick: document.getElementById("joystick"),
  joystickStick: document.querySelector("#joystick .joystick-stick"),
  mobileActionButtons: [...document.querySelectorAll("[data-mobile-action]")]
};

const TILE = 32;
const WORLD_W = 40;
const WORLD_H = 28;
const keys = {};
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const people = [
  { name: "Mira", role: "cartographer", gift: "Rope", text: "A cartographer counts breaths between moving walls. Her map is tattooed in ash across both palms.",
    dialogues: [
      "The walls shift every 120 seconds. My maps show the pattern... but only fragments.",
      "I've seen this dungeon before. In another life. Or maybe another prisoner's dream.",
      "If you find a room with no enemies, trust it. The dungeon lies when it's empty.",
      "The exit only opens when blood stains the floor. I don't make the rules."
    ],
    hints: () => [`Room ${game.depth} has ${game.enemies.length} enemies remaining.`, `The darkness tightens with ${formatTime(game.roomTime)} left.`]
  },
  { name: "Oren", role: "blacksmith", gift: "Forge kit", text: "A blacksmith feeds blue monster cores into a cracked travel forge and refuses to say how long he has been here.",
    dialogues: [
      "Cores burn hotter the deeper you go. I could forge something if you bring me three.",
      "My forge cracked on day... I stopped counting. The metal remembers time better than I do.",
      "Your weapon feels light. Bring me cores and I'll fix that.",
      "The dungeon feeds on metal. I've seen it swallow entire armories."
    ],
    hints: () => [`You have ${game.cores} cores. Bring me 3 and I'll upgrade your weapon.`, `Your gear: ${gearNames[game.gear]}. I can do better.`]
  },
  { name: "Sable", role: "blade saint", gift: "Parry charm", text: "A masked duelist waits beside three empty packs. They bow before asking whether mercy still has meaning.",
    dialogues: [
      "Parry timing is everything. Half a second before impact. I'll show you if you trust me.",
      "Mercy? I haven't seen it since room seven. Maybe we'll find it together.",
      "Your fighting is... adequate. But the dungeon demands more than adequate.",
      "I've parried death itself down here. It cheats, just like everything else."
    ],
    hints: () => [`Press K to parry - I'll make your parry window longer with enough trust.`, `Enemies hit harder at depth ${game.depth}. Stay sharp.`]
  },
  { name: "Nix", role: "lantern child", gift: "Lantern oil", text: "A child carrying a green lantern knows lullabies the dungeon seems afraid to hear.",
    dialogues: [
      "The dark is scared of my light. I sing to it sometimes. It hums back.",
      "Do you hear them? The ones who came before us? They're still walking.",
      "My lantern shows things the watch can't. Hidden chests, I mean. Sometimes worse.",
      "The dungeon rearranges when we sleep. I don't sleep anymore."
    ],
    hints: () => [`My lantern extends your vision radius by ${game.allies.length * 10} pixels.`, `I can sense ${game.loot.length} items nearby.`, `The darkness feels thinner here.`]
  },
  { name: "Vey", role: "lost prince", gift: "Silver key", text: "A wounded royal offers a key for protection, but watches your food pouch more than the dark.",
    dialogues: [
      "That key opens doors most prisoners never find. Protect me and I'll share them.",
      "My kingdom fell to this place. I won't let it take me without a fight.",
      "I've been counting our food. We need to ration better. Or find more.",
      "There are treasures in the deep rooms. My family's vaults. If we reach them..."
    ],
    hints: () => [`We have ${game.food} food and ${game.water} water. We should hunt for more.`, `I sense a special room ahead. My key might be useful.`]
  },
  { name: "The Hollow Nun", role: "oracle", gift: "Mirror shard", text: "An oracle stitched into shadow promises one true answer for one terrible kindness.",
    dialogues: [
      "I see threads connecting us to the surface. Most are already cut.",
      "Your watch stops in three rooms. Or four. Time lies to me now.",
      "The dungeon will offer you a choice soon. Choose with your heart, not your hunger.",
      "I've tasted your future. It tastes like copper and old promises."
    ],
    hints: () => [`The next room holds ${game.depth % 2 === 0 ? "danger" : "opportunity"}.`, `Trust is fracturing. I see betrayal in the shadows.`]
  }
];

const weaponCatalog = [
  { name: "Stone dagger", damage: 0, rarity: "common" },
  { name: "Core knife", damage: 4, rarity: "common" },
  { name: "Iron fang", damage: 7, rarity: "common" },
  { name: "Lantern spear", damage: 10, rarity: "rare" },
  { name: "Oathbreaker edge", damage: 14, rarity: "rare" },
  { name: "Watchmade glaive", damage: 18, rarity: "rare" },
  { name: "Sunsteel saber", damage: 22, rarity: "epic" },
  { name: "Moon cleaver", damage: 26, rarity: "epic" },
  { name: "Gravemark halberd", damage: 31, rarity: "mythic" },
  { name: "Riftbreaker", damage: 37, rarity: "mythic" }
];
const gearNames = weaponCatalog.map(weapon => weapon.name);
const lootNames = ["Water skin", "Dry rations", "Rope", "Storage pouch", "Strange potion", "Iron scrap", "Lantern oil", "Silver thread", "Bone hook", "Chalk marks"];
const materialItems = new Set(["Rope", "Storage pouch", "Iron scrap", "Lantern oil", "Silver thread", "Bone hook", "Chalk marks"]);
const materialValues = {
  Rope: 1,
  "Storage pouch": 2,
  "Iron scrap": 2,
  "Lantern oil": 2,
  "Silver thread": 3,
  "Bone hook": 3,
  "Chalk marks": 2
};
const goodiePool = [
  { name: "Watch spring", desc: "+20 room time", apply: game => { game.roomTime += 20; } },
  { name: "Field rations", desc: "+2 food", apply: game => { game.food += 2; } },
  { name: "Water flask", desc: "+2 water", apply: game => { game.water += 2; } },
  { name: "Core cache", desc: "+2 cores", apply: game => { game.cores += 2; } },
  { name: "First aid kit", desc: "+24 hp", apply: game => { game.player.hp = clamp(game.player.hp + 24, 0, 100); } },
  { name: "Lucky charm", desc: "+2 coins from each chest", apply: game => { game.coinBonus += 2; } },
  { name: "Signal flare", desc: "+15 room time and +1 coin bonus", apply: game => { game.roomTime += 15; game.coinBonus += 1; } }
];
let gender = "female";
let deviceMode = "laptop";
let game;
const mobileInput = { x: 0, y: 0, pointerId: null, active: false };

function setDeviceMode(mode) {
  deviceMode = mode === "mobile" ? "mobile" : "laptop";
  ui.deviceButtons.forEach(button => {
    button.classList.toggle("selected", button.dataset.device === deviceMode);
  });
  document.body.classList.toggle("mobile-mode", deviceMode === "mobile");
  if (game) {
    if (deviceMode !== "laptop" && game.tradePanelOpen) closeTradePanel();
    if (deviceMode === "laptop" && game.nextTradingPostDepth === Infinity) {
      game.nextTradingPostDepth = game.depth + rnd(2, 3);
    }
    game.mobile = deviceMode === "mobile";
    syncMobileChrome();
    syncTradeUi();
  }
}

function syncMobileChrome() {
  const hasGame = !!game;
  const drawerOpen = !!(hasGame && game.mobileDrawerOpen);
  const mobileActive = deviceMode === "mobile" && hasGame && game.state !== "title" && game.state !== "end";
  const playing = mobileActive && game.state === "play";
  ui.mobileHudBar.classList.toggle("hidden", !mobileActive);
  ui.mobileControls.classList.toggle("hidden", !playing || drawerOpen);
  ui.hud.classList.toggle("mobile-open", drawerOpen);
  ui.inventoryBtn.textContent = drawerOpen ? "Close" : "Menu";
  document.body.classList.toggle("mobile-drawer-open", drawerOpen);
  if (deviceMode !== "mobile") {
    resetMobileInput();
  }
}

function setMobileDrawer(open) {
  if (!game || deviceMode !== "mobile") return;
  if (open) {
    if (game.state !== "play") return;
    game.previousState = game.state;
    game.mobileDrawerOpen = true;
    game.state = "paused";
    Object.keys(keys).forEach(key => {
      keys[key] = false;
    });
    resetMobileInput();
    syncMobileChrome();
    return;
  }
  if (!game.mobileDrawerOpen) return;
  game.mobileDrawerOpen = false;
  if (game.state === "paused") {
    game.state = game.previousState || "play";
  }
  game.previousState = null;
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });
  resetMobileInput();
  syncMobileChrome();
}

function resetMobileInput() {
  mobileInput.x = 0;
  mobileInput.y = 0;
  mobileInput.active = false;
  mobileInput.pointerId = null;
  if (ui.joystickStick) {
    ui.joystickStick.style.transform = "translate(-50%, -50%)";
  }
}

function updateJoystickVisual() {
  if (!ui.joystick || !ui.joystickStick) return;
  const rect = ui.joystick.getBoundingClientRect();
  const radius = Math.max(1, rect.width / 2 - 22);
  const offsetX = mobileInput.x * radius;
  const offsetY = mobileInput.y * radius;
  ui.joystickStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
}

function handleJoystickPointer(event) {
  if (deviceMode !== "mobile") return;
  event.preventDefault();
  if (event.type === "pointerdown") {
    mobileInput.pointerId = event.pointerId;
    mobileInput.active = true;
    ui.joystick.setPointerCapture(event.pointerId);
  }
  if (!mobileInput.active || mobileInput.pointerId !== event.pointerId) return;
  const rect = ui.joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const maxRadius = Math.max(1, rect.width / 2 - 18);
  const distance = Math.hypot(dx, dy);
  const clampRatio = distance > maxRadius ? maxRadius / distance : 1;
  mobileInput.x = clamp((dx * clampRatio) / maxRadius, -1, 1);
  mobileInput.y = clamp((dy * clampRatio) / maxRadius, -1, 1);
  updateJoystickVisual();
}

function releaseJoystick(event) {
  if (deviceMode !== "mobile") return;
  if (mobileInput.pointerId !== event.pointerId) return;
  mobileInput.active = false;
  mobileInput.pointerId = null;
  resetMobileInput();
}

function triggerMobileAction(action) {
  if (!game || game.state !== "play" || game.mobileDrawerOpen) return;
  switch (action) {
    case "interact":
      interact();
      break;
    case "attack":
      attack();
      break;
    case "jump":
      if (game.state === "play") game.player.jump = .18;
      break;
    case "skill":
      useSkill();
      break;
    case "parry":
      parry();
      break;
  }
}

function syncTradeUi() {
  const tradeEnabled = deviceMode === "laptop" && game && game.roomType === "trade";
  const nearTradingPost = tradeEnabled && game.state === "play" && isNearTradingPost();
  const tradeOpen = !!(game && game.tradePanelOpen);
  ui.tradePrompt.classList.toggle("hidden", !nearTradingPost || tradeOpen);
  ui.tradePanel.classList.toggle("hidden", !tradeOpen);
  if (tradeOpen) {
    renderTradePanel();
  }
}

function isNearTradingPost() {
  return !!(game.tradingPost && dist(game.player, game.tradingPost) < 72);
}

function openTradePanel() {
  if (!game || deviceMode !== "laptop" || game.roomType !== "trade" || !isNearTradingPost()) return;
  game.tradePanelOpen = true;
  game.tradeSellMode = false;
  game.tradeSellDraft = {};
  game.previousState = game.state;
  game.state = "trade";
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });
  syncTradeUi();
}

function closeTradePanel() {
  if (!game || !game.tradePanelOpen) return;
  game.tradePanelOpen = false;
  game.tradeSellMode = false;
  game.tradeSellDraft = {};
  game.state = game.previousState || "play";
  game.previousState = null;
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });
  syncTradeUi();
}

function renderTradePanel() {
  ui.tradeCoins.textContent = game.coins;
  ui.tradeSubtitle.textContent = game.roomType === "trade"
    ? `Trading post at depth ${game.depth}. Sell materials, then spin for upgrades.`
    : "Trading posts appear only in dedicated rooms.";
  ui.weaponGachaInfo.textContent = `Cost ${weaponGachaCost()} coins. Current weapon: ${gearNames[game.gear]}.`;
  ui.goodieGachaInfo.textContent = `Cost ${goodieGachaCost()} coins. Helpful consumables and passives.`;
  syncSellSelectionUi();
  if (game.tradeSellMode) {
    ui.sellInfo.textContent = summarizeSelectedMaterials();
    ui.materialRows.innerHTML = renderSellRows();
  } else {
    ui.sellInfo.textContent = summarizeSellables();
    ui.materialRows.innerHTML = renderMaterialRows();
  }
  if (!ui.weaponGachaResult.innerHTML) ui.weaponGachaResult.innerHTML = "<li>Higher-tier weapons become more likely as you progress.</li>";
  if (!ui.goodieGachaResult.innerHTML) ui.goodieGachaResult.innerHTML = "<li>Goodies can heal, restore supplies, or boost coin gains.</li>";
}

function syncSellSelectionUi() {
  const selling = !!(game && game.tradeSellMode);
  ui.sellExtrasBtn.classList.toggle("hidden", selling);
  ui.sellConfirmBtn.classList.toggle("hidden", !selling);
  ui.sellCancelBtn.classList.toggle("hidden", !selling);
}

function weaponGachaCost() {
  return 6 + game.gear * 2;
}

function goodieGachaCost() {
  return 4 + Math.floor(game.depth / 2);
}

function currentWeapon() {
  return weaponCatalog[clamp(game.gear, 0, weaponCatalog.length - 1)] || weaponCatalog[0];
}

function summarizeSellables() {
  const extras = Object.entries(game.materials).reduce((sum, [name, count]) => {
    if (!count) return sum;
    return sum + Math.max(0, count - 1) * (materialValues[name] || 1);
  }, 0);
  if (!Object.values(game.materials).some(count => count > 0)) return "No materials yet.";
  return extras > 0
    ? `You can sell extras for ${extras} coins, or open the picker to sell any material.`
    : "You can still open the picker to sell any material, even your last copy.";
}

function renderMaterialRows() {
  const entries = Object.entries(game.materials).filter(([, count]) => count > 0);
  if (!entries.length) return "<div class=\"material-row\"><span>No materials yet.</span></div>";
  return entries.map(([name, count]) => {
    const value = materialValues[name] || 1;
    const extras = Math.max(0, count - 1);
    return `<div class="material-row"><div><strong>${escapeHtml(name)}</strong><br><small>${count} on hand, ${value} coin${value === 1 ? "" : "s"} each</small></div><small>Extras: ${extras}</small></div>`;
  }).join("");
}

function renderSellRows() {
  const entries = Object.entries(game.materials).filter(([, count]) => count > 0);
  if (!entries.length) return "<div class=\"material-row\"><span>No materials yet.</span></div>";
  return entries.map(([name, count]) => {
    const value = materialValues[name] || 1;
    const selected = game.tradeSellDraft[name] || 0;
    return `<div class="material-row material-row--sell">
      <div>
        <strong>${escapeHtml(name)}</strong><br>
        <small>${count} owned, ${value} coin${value === 1 ? "" : "s"} each</small>
      </div>
      <div class="material-row-controls">
        <button type="button" data-sell-adjust="-1" data-material="${escapeHtml(name)}">-</button>
        <strong>${selected}</strong>
        <button type="button" data-sell-adjust="1" data-material="${escapeHtml(name)}">+</button>
      </div>
    </div>`;
  }).join("");
}

function summarizeSelectedMaterials() {
  const selectedEntries = Object.entries(game.tradeSellDraft || {}).filter(([, count]) => count > 0);
  const total = selectedEntries.reduce((sum, [name, count]) => sum + count * (materialValues[name] || 1), 0);
  if (!selectedEntries.length) {
    return "Select any materials to sell. You can sell your last copy, too.";
  }
  const parts = selectedEntries.map(([name, count]) => `${count} ${name}`);
  return `Selling ${parts.join(", ")} for ${total} coins.`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function beginSellSelection() {
  if (!game || !game.tradePanelOpen) return;
  if (!Object.values(game.materials).some(count => count > 0)) {
    showMessage("No materials to sell.");
    return;
  }
  game.tradeSellMode = true;
  game.tradeSellDraft = {};
  renderTradePanel();
}

function cancelSellSelection() {
  if (!game || !game.tradeSellMode) return;
  game.tradeSellMode = false;
  game.tradeSellDraft = {};
  renderTradePanel();
}

function adjustSellSelection(name, delta) {
  if (!game || !game.tradeSellMode) return;
  const owned = game.materials[name] || 0;
  if (owned <= 0) return;
  const draft = game.tradeSellDraft[name] || 0;
  const next = clamp(draft + delta, 0, owned);
  if (next <= 0) delete game.tradeSellDraft[name];
  else game.tradeSellDraft[name] = next;
  renderTradePanel();
}

function confirmSellSelection() {
  if (!game || !game.tradeSellMode) return;
  const entries = Object.entries(game.tradeSellDraft).filter(([, count]) => count > 0);
  if (!entries.length) {
    showMessage("Pick at least one material to sell.");
    return;
  }
  let gained = 0;
  for (const [name, count] of entries) {
    const owned = game.materials[name] || 0;
    const selling = Math.min(count, owned);
    if (selling <= 0) continue;
    gained += selling * (materialValues[name] || 1);
    game.materials[name] = Math.max(0, owned - selling);
  }
  game.coins += gained;
  game.tradeSellMode = false;
  game.tradeSellDraft = {};
  addLog(`Sold selected materials for ${gained} coins.`);
  showMessage(`You sold materials for ${gained} coins.`);
  updateUi();
}

function drawWeaponGacha() {
  const cost = weaponGachaCost();
  if (game.coins < cost) {
    showMessage("Not enough coins for a weapon pull.");
    return;
  }
  game.coins -= cost;
  const startIndex = Math.min(game.gear + 1, weaponCatalog.length - 1);
  const pool = weaponCatalog.slice(startIndex);
  const roll = pool[rnd(0, pool.length - 1)] || weaponCatalog[weaponCatalog.length - 1];
  game.gear = weaponCatalog.findIndex(weapon => weapon.name === roll.name);
  addLog(`Trading post weapon pull: ${roll.name}.`);
  showMessage(`You pulled ${roll.name}.`);
  ui.weaponGachaResult.innerHTML = `<li>You got <strong>${roll.name}</strong>.</li>`;
  game.tradeLastDraw = `Weapon: ${roll.name}`;
  renderTradePanel();
  updateUi();
}

function drawGoodieGacha() {
  const cost = goodieGachaCost();
  if (game.coins < cost) {
    showMessage("Not enough coins for a goodie pull.");
    return;
  }
  game.coins -= cost;
  const roll = goodiePool[rnd(0, goodiePool.length - 1)];
  roll.apply(game);
  addLog(`Trading post goodie pull: ${roll.name}.`);
  showMessage(`You pulled ${roll.name}. ${roll.desc}.`);
  ui.goodieGachaResult.innerHTML = `<li>You got <strong>${roll.name}</strong> (${roll.desc}).</li>`;
  game.tradeLastDraw = `Goodie: ${roll.name}`;
  renderTradePanel();
  updateUi();
}

function resetGame() {
  game = {
    state: "title",
    mobile: deviceMode === "mobile",
    mobileDrawerOpen: false,
    previousState: null,
    tradePanelOpen: false,
    tradeSellMode: false,
    tradeSellDraft: {},
    player: { x: 120, y: 120, w: 22, h: 26, vx: 0, vy: 0, hp: 100, speed: 2.45, facing: 1, invuln: 0, jump: 0, parry: 0, skill: 0, attack: 0 },
    heroName: "Ari",
    gender: "female",
    depth: 1,
    roomTime: 120,
    maxRoomTime: 120,
    hungerTick: 0,
    food: 6,
    water: 6,
    cores: 0,
    coins: 0,
    coinBonus: 0,
    gear: 0,
    pack: ["Watch", "Small food pack", "Stone dagger"],
    materials: Object.fromEntries([...materialItems].map(name => [name, 0])),
    allies: [],
    allyDialogues: {},
    allyRequests: {},
    enemies: [],
    loot: [],
    npcs: [],
    walls: [],
    exit: { x: 0, y: 0, w: 42, h: 74 },
    tradingPost: null,
    roomType: "normal",
    nextTradingPostDepth: deviceMode === "laptop" ? rnd(2, 3) : Infinity,
    shake: 0,
    message: "",
    messageTime: 0,
    choiceNpc: null,
    last: performance.now(),
    ending: false,
    enemiesCleared: true,
    log: []
  };
  document.body.classList.remove("mobile-drawer-open");
  ui.hud.classList.remove("mobile-open");
  resetMobileInput();
  syncMobileChrome();
  syncTradeUi();
  makeRoom(true);
  addLog("You wake at the entrance with only a watch, a small pack, and a stone dagger.");
  updateUi();
}

function makeRoom(first = false) {
  const margin = TILE * 2;
  game.roomTime = Math.max(42, 125 - game.depth * 5);
  game.maxRoomTime = game.roomTime;
  game.walls = [];
  game.enemies = [];
  game.loot = [];
  const isTradingRoom = deviceMode === "laptop" && !first && game.depth === game.nextTradingPostDepth;
  game.roomType = isTradingRoom ? "trade" : "normal";
  game.tradingPost = isTradingRoom ? { x: canvas.width / 2 - 36, y: canvas.height / 2 - 24, w: 72, h: 48 } : null;
  game.tradePanelOpen = false;
  game.tradeSellMode = false;
  game.tradeSellDraft = {};
  
  // Keep allied NPCs and recreate them for the new room
  const alliedNpcs = [];
  for (const ally of game.allies) {
    const person = people.find(p => p.name === ally.name);
    if (person) {
      alliedNpcs.push({
        ...person,
        x: game.player.x - 40,
        y: game.player.y,
        w: 24,
        h: 30,
        met: true,
        isAlly: true,
        waiting: !first, // Wait if not first room
        dialogueIndex: game.allyDialogues[ally.name] || 0
      });
    }
  }
  game.npcs = [];
  
  game.exit = { x: canvas.width - 80, y: rnd(120, canvas.height - 160), w: 42, h: 74 };
  game.player.x = first ? 90 : 72;
  game.player.y = first ? canvas.height / 2 : game.exit.y;
  game.enemiesCleared = first || isTradingRoom;
  if (isTradingRoom) {
    game.nextTradingPostDepth = game.depth + rnd(2, 3);
    game.loot = [];
  }

  for (let x = 0; x < WORLD_W; x++) {
    game.walls.push({ x: x * TILE, y: 0, w: TILE, h: TILE });
    game.walls.push({ x: x * TILE, y: canvas.height - TILE, w: TILE, h: TILE });
  }
  for (let y = 1; y < WORLD_H; y++) {
    game.walls.push({ x: 0, y: y * TILE, w: TILE, h: TILE });
    game.walls.push({ x: canvas.width - TILE, y: y * TILE, w: TILE, h: TILE });
  }
  for (let i = 0; i < 12 + game.depth; i++) {
    const w = rnd(1, 4) * TILE;
    const h = rnd(1, 3) * TILE;
    const wall = { x: rnd(4, 25) * TILE, y: rnd(2, 17) * TILE, w, h };
    if (Math.abs(wall.x - game.player.x) > 130 && Math.abs(wall.x - game.exit.x) > 120) game.walls.push(wall);
  }

  const enemyCount = isTradingRoom ? 0 : (first ? 2 : clamp(2 + Math.floor(game.depth / 2), 2, 9));
  for (let i = 0; i < enemyCount; i++) spawnEnemy();
  for (let i = 0; i < (isTradingRoom ? 1 : rnd(2, 4)); i++) spawnLoot(Math.random() < .25 ? "chest" : "fallen");
  if (!first && !isTradingRoom && Math.random() < .62) spawnNpc();
  
  // Add allied NPCs back (they wait at entrance until room is cleared)
  for (const alliedNpc of alliedNpcs) {
    alliedNpc.waiting = !game.enemiesCleared; // Wait if enemies present
    game.npcs.push(alliedNpc);
  }
  
  if (isTradingRoom) addLog(`Room ${game.depth}: a trading post hums in the shadows.`);
  else if (game.depth % 5 === 0) addLog(`The watch scratches a warning: room ${game.depth} is an illusion maze.`);
  syncTradeUi();
  updateUi();
}

function spawnEnemy() {
  const names = ["Gnawer", "Ash Warden", "Glass Mite", "Mourner", "Hook Shade", "Clock Eater"];
  const spot = findOpenSpot(24, 24, 165);
  game.enemies.push({
    x: spot.x,
    y: spot.y,
    w: 24,
    h: 24,
    hp: 22 + game.depth * 4,
    speed: 0.7 + game.depth * 0.04,
    name: names[rnd(0, names.length - 1)],
    hit: 0
  });
}

function spawnLoot(kind, x, y) {
  const spot = findOpenSpot(20, 20, 70, x, y);
  const item = lootNames[rnd(0, lootNames.length - 1)];
  const coins = kind === "chest" ? rnd(4, 8) + game.coinBonus : 0;
  game.loot.push({ x: spot.x, y: spot.y, w: 20, h: 20, item, kind, coins });
}

function spawnNpc() {
  const template = people[(game.depth + rnd(0, people.length - 1)) % people.length];
  const spot = findOpenSpot(24, 30, 130);
  game.npcs.push({ ...template, x: spot.x, y: spot.y, w: 24, h: 30, met: false, dialogueIndex: 0 });
}

function rects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function isOpenSpot(rect, minPlayerDistance = 0) {
  if (rect.x < 36 || rect.y < 36 || rect.x + rect.w > canvas.width - 36 || rect.y + rect.h > canvas.height - 36) return false;
  if (dist(rect, game.player) < minPlayerDistance) return false;
  if (game.walls.some(wall => rects(rect, wall))) return false;
  if (game.enemies.some(enemy => rects(rect, enemy))) return false;
  if (game.loot.some(loot => rects(rect, loot))) return false;
  if (game.npcs.some(npc => rects(rect, npc))) return false;
  return true;
}

function findOpenSpot(w, h, minPlayerDistance = 0, preferredX, preferredY) {
  if (Number.isFinite(preferredX) && Number.isFinite(preferredY)) {
    const near = { x: clamp(preferredX, 40, canvas.width - w - 40), y: clamp(preferredY, 40, canvas.height - h - 40), w, h };
    if (isOpenSpot(near, 0)) return near;
  }
  for (let i = 0; i < 250; i++) {
    const rect = { x: rnd(70, canvas.width - w - 80), y: rnd(55, canvas.height - h - 60), w, h };
    if (isOpenSpot(rect, minPlayerDistance)) return rect;
  }
  return { x: 72, y: 72, w, h };
}

function moveEntity(ent, dx, dy) {
  ent.x += dx;
  for (const wall of game.walls) if (rects(ent, wall)) ent.x -= dx;
  ent.y += dy;
  for (const wall of game.walls) if (rects(ent, wall)) ent.y -= dy;
  ent.x = clamp(ent.x, 34, canvas.width - ent.w - 34);
  ent.y = clamp(ent.y, 34, canvas.height - ent.h - 34);
}

function update(dt) {
  if (game.state !== "play") return;
  const p = game.player;
  game.roomTime -= dt;
  game.hungerTick += dt;
  if (game.hungerTick > 16) {
    game.hungerTick = 0;
    if (game.food > 0) game.food--;
    if (game.water > 0) game.water--;
    if (game.food <= 0 || game.water <= 0) {
      p.hp -= 8;
      showMessage(game.food <= 0 ? "Hunger gnaws at you. Press F to eat." : "Thirst claws at you. Press R to drink.");
    }
  }
  if (game.roomTime <= 0) endGame("Lost to the Darkness", "You checked the watch too late. The room folded inward and kept your shadow walking after your body stopped.");

  let inputX = 0;
  let inputY = 0;
  if (keys.a) inputX -= 1;
  if (keys.d) inputX += 1;
  if (keys.w) inputY -= 1;
  if (keys.s) inputY += 1;
  if (game.mobile) {
    inputX += mobileInput.x;
    inputY += mobileInput.y;
  }
  if (inputX || inputY) {
    const magnitude = Math.hypot(inputX, inputY);
    const scale = p.speed / Math.max(1, magnitude);
    let dx = inputX * scale;
    let dy = inputY * scale;
    if (dx) p.facing = dx > 0 ? 1 : -1;
    if (p.jump > 0) { dx *= 1.7; dy *= 1.7; p.jump -= dt; }
    moveEntity(p, dx, dy);
  } else if (p.jump > 0) {
    p.jump -= dt;
  }

  p.attack = Math.max(0, p.attack - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.parry = Math.max(0, p.parry - dt);
  p.skill = Math.max(0, p.skill - dt);
  game.messageTime = Math.max(0, game.messageTime - dt);
  game.shake = Math.max(0, game.shake - dt * 14);

  for (const enemy of game.enemies) {
    const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
    moveEntity(enemy, Math.cos(angle) * enemy.speed, Math.sin(angle) * enemy.speed);
    enemy.hit = Math.max(0, enemy.hit - dt);
    if (rects(p, enemy) && p.invuln <= 0) {
      const blocked = p.parry > 0;
      const betrayalShield = game.allies.some(a => a.trust > 60) && Math.random() < .18;
      if (blocked || betrayalShield) {
        enemy.hp -= 12;
        p.invuln = .35;
        showMessage(blocked ? "Parried." : "An ally pulls you clear.");
      } else {
        p.hp -= 9;
        p.invuln = .75;
        game.shake = 7;
        showMessage(`${enemy.name} cuts through the dark.`);
      }
    }
  }
  game.enemies = game.enemies.filter(enemy => {
    if (enemy.hp > 0) return true;
    game.cores++;
    if (Math.random() < .45) spawnLoot("core", enemy.x, enemy.y);
    addLog(`You killed a ${enemy.name} and took its core.`);
    return false;
  });
  
  // Check if room is cleared
  if (game.enemies.length === 0 && !game.enemiesCleared) {
    game.enemiesCleared = true;
    // Release waiting allies
    for (const alliedNpc of game.npcs) {
      if (game.allies.some(ally => ally.name === alliedNpc.name)) {
        alliedNpc.waiting = false;
        addLog(`Allies step forward as the room clears.`);
      }
    }
  }
  
  // Allied NPCs follow the player (only when not waiting)
  for (const ally of game.allies) {
    const allyNpc = game.npcs.find(n => n.name === ally.name);
    if (allyNpc && !allyNpc.waiting) {
      const angle = Math.atan2(game.player.y - allyNpc.y, game.player.x - allyNpc.x);
      const followDist = 45 + game.allies.indexOf(ally) * 20;
      const targetX = game.player.x - Math.cos(angle) * followDist;
      const targetY = game.player.y - Math.sin(angle) * followDist;
      const moveX = (targetX - allyNpc.x) * 0.05;
      const moveY = (targetY - allyNpc.y) * 0.05;
      moveEntity(allyNpc, moveX, moveY);
    }
  }

  // Ally passive abilities and actions
  for (const ally of game.allies) {
    if (ally.trust > 50 && Math.random() < .002) {
      // High trust allies occasionally help
      if (game.enemies.length > 0) {
        const target = game.enemies[rnd(0, game.enemies.length - 1)];
        if (target) {
          target.hp -= 5;
          showMessage(`${ally.name} assists in combat!`);
        }
      }
    }
    
    // Low trust allies consume resources
    if (ally.trust < 30 && Math.random() < .001) {
      if (game.food > 0) {
        game.food--;
        showMessage(`${ally.name} takes food without asking.`);
      }
    }
  }
  
  if (p.hp <= 0) endGame("Killed in the Deep", "The dungeon grows quiet around you. Somewhere nearby, another lost player finds your pack.");
  if (rects(p, game.exit) && game.enemies.length === 0) nextRoom();
  if (game.depth >= 18 && game.cores >= 12 && game.allies.length >= 2) endGame("A Door Remembers Home", "Your allies hold the darkness back while your watch unlocks a real sunrise. Not everyone trusts you, but enough of them chose to stand beside you.");
  updateUi();
}

function attack() {
  if (game.state !== "play") return;
  const p = game.player;
  p.attack = .16;
  const blade = { x: p.x + (p.facing > 0 ? 12 : -34), y: p.y - 8, w: 46, h: 42 };
  const weapon = currentWeapon();
  for (const enemy of game.enemies) {
    if (rects(blade, enemy)) {
      enemy.hp -= 16 + Math.round(weapon.damage * .9);
      enemy.hit = .25;
    }
  }
}

function useSkill() {
  if (game.state !== "play" || game.player.skill > 0) return;
  if (game.cores <= 0) {
    showMessage("No cores to burn.");
    return;
  }
  game.cores--;
  game.player.skill = 5;
  const weapon = currentWeapon();
  for (const enemy of game.enemies) {
    if (dist(game.player, enemy) < 135) enemy.hp -= 30 + Math.round(weapon.damage * .6);
  }
  showMessage("You bite a core and exhale blue fire.");
}

function parry() {
  if (game.state !== "play") return;
  const baseDuration = .42;
  const hasSable = game.allies.find(a => a.name === "Sable" && a.trust > 50);
  const duration = hasSable ? baseDuration + .15 : baseDuration;
  game.player.parry = duration;
  if (hasSable) showMessage("Sable's training extends your parry window!");
}

function eatFood() {
  if (game.state !== "play") return;
  if (game.food > 0) {
    game.food--;
    game.hungerTick = 0;
    game.player.hp = clamp(game.player.hp + 14, 0, 100);
    showMessage("You eat from the ration pack.");
    updateUi();
    return;
  }
  if (game.cores > 0) {
    game.cores--;
    game.hungerTick = 0;
    game.player.hp = clamp(game.player.hp + 10, 0, 100);
    game.food += 1;
    showMessage("You eat a core. It tastes like lightning and old blood.");
    updateUi();
    return;
  }
  showMessage("No food or edible cores left.");
}

function drinkWater() {
  if (game.state !== "play") return;
  if (game.water <= 0) {
    showMessage("No water left.");
    return;
  }
  game.water--;
  game.hungerTick = 0;
  game.player.hp = clamp(game.player.hp + 8, 0, 100);
  showMessage("You drink from the water skin.");
  updateUi();
}

function interact() {
  if (game.state !== "play") return;
  const p = game.player;

  if (deviceMode === "laptop" && game.roomType === "trade" && isNearTradingPost()) {
    openTradePanel();
    return;
  }
  
  // Check for loot first
  for (let i = game.loot.length - 1; i >= 0; i--) {
    const loot = game.loot[i];
    if (dist(p, loot) < 42) {
      collectLoot(loot);
      game.loot.splice(i, 1);
      return;
    }
  }
  
  // Check for nearby NPCs and allies (only when room is cleared)
  if (game.enemiesCleared) {
    const nearbyAllies = [];
    const nearbyNewNpcs = [];
    
    // Find nearby allies
    for (const ally of game.allies) {
      const allyNpc = game.npcs.find(n => n.name === ally.name);
      if (allyNpc && !allyNpc.waiting && dist(p, allyNpc) < 70) {
        nearbyAllies.push(ally);
      }
    }
    
    // Find nearby new NPCs
    for (const npc of game.npcs) {
      if (!npc.isAlly && !npc.met && dist(p, npc) < 70) {
        nearbyNewNpcs.push(npc);
      }
    }
    
    // If we have multiple options (allies + new NPCs), show combined selection
    const totalOptions = nearbyAllies.length + nearbyNewNpcs.length;
    if (totalOptions > 1) {
      showInteractionSelection(nearbyAllies, nearbyNewNpcs);
      return;
    }
    
    // If only one ally is nearby, talk to them
    if (nearbyAllies.length === 1 && nearbyNewNpcs.length === 0) {
      talkToAlly(nearbyAllies[0]);
      return;
    }
    
    // If only one new NPC is nearby, show befriend/betray choice
    if (nearbyNewNpcs.length === 1 && nearbyAllies.length === 0) {
      const npc = nearbyNewNpcs[0];
      npc.met = true;
      game.choiceNpc = npc;
      game.state = "choice";
      ui.choiceText.textContent = `${npc.text} Do you keep ${npc.name} close, or take what they carry before the darkness does?`;
      ui.choicePanel.classList.remove("hidden");
      return;
    }
  }
  
  // Default: check for single unmet NPCs (fallback for edge cases)
  for (const npc of game.npcs) {
    if (npc.isAlly) continue;
    if (!npc.met && dist(p, npc) < 56) {
      npc.met = true;
      game.choiceNpc = npc;
      game.state = "choice";
      ui.choiceText.textContent = `${npc.text} Do you keep ${npc.name} close, or take what they carry before the darkness does?`;
      ui.choicePanel.classList.remove("hidden");
      return;
    }
  }
  
  // Default: forge weapon with cores
  if (game.cores >= 3) {
    game.cores -= 3;
    game.gear = clamp(game.gear + 1, 0, gearNames.length - 1);
    addLog(`You forged monster cores into ${gearNames[game.gear]}.`);
    showMessage("Cores harden into a better weapon.");
  }
}

function collectLoot(loot) {
  if (loot.item.includes("Water")) game.water += 2;
  else if (loot.item.includes("ration")) game.food += 2;
  else if (loot.item.includes("potion")) game.player.hp = clamp(game.player.hp + 24, 0, 100);
  else if (loot.kind === "core") game.cores++;
  else if (materialItems.has(loot.item)) game.materials[loot.item] = (game.materials[loot.item] || 0) + 1;
  else if (!game.pack.includes(loot.item)) game.pack.push(loot.item);
  if (loot.coins) game.coins += loot.coins;
  const source = loot.kind === "chest" ? "a chest" : "the fallen";
  addLog(`Found ${loot.item} from ${source}${loot.coins ? ` (+${loot.coins} coins)` : ""}.`);
}

function chooseNpc(befriend) {
  const npc = game.choiceNpc;
  ui.choicePanel.classList.add("hidden");
  game.state = "play";
  game.choiceNpc = null;
  if (!npc) return;
  if (befriend) {
    const trust = rnd(38, 86);
    game.allies.push({ name: npc.name, role: npc.role, trust, hunger: rnd(1, 3), abilitiesUsed: 0 });
    game.pack.push(npc.gift);
    game.allyDialogues[npc.name] = 0;
    game.allyRequests[npc.name] = { type: null, timer: 0 };
    
    // Keep the NPC in the array but mark as ally
    npc.met = true;
    npc.isAlly = true;
    
    addLog(`${npc.name} joins you. Trust: ${trust}. Gift: ${npc.gift}.`);
    showMessage(`${npc.name}: "I'll walk with you. For now."`);
  } else {
    game.food += 1;
    game.water += 1;
    game.cores += Math.random() < .5 ? 1 : 0;
    addLog(`You betrayed ${npc.name}. The dungeon remembers.`);
    if (Math.random() < .28) {
      game.player.hp -= 18;
      showMessage(`${npc.name} left a hidden blade in your ribs.`);
    }
    // Only remove NPC if betrayed
    game.npcs = game.npcs.filter(n => n !== npc);
  }
}

function nextRoom() {
  const allyBetrayal = game.allies.find(a => Math.random() * 100 > a.trust + 28);
  if (allyBetrayal) {
    game.food = Math.max(0, game.food - 2);
    game.water = Math.max(0, game.water - 1);
    game.allies = game.allies.filter(a => a !== allyBetrayal);
    addLog(`${allyBetrayal.name} vanishes with supplies before the next door opens.`);
  }
  
  // Update ally requests and triggers
  for (const ally of game.allies) {
    const request = game.allyRequests[ally.name];
    if (request) {
      request.timer++;
      if (request.timer > 3 && !request.type) {
        triggerAllyRequest(ally);
      }
    }
  }
  
  game.depth++;
  addLog(`Room ${game.depth}: the dungeon rearranges around your watch.`);
  makeRoom(false);
}

function talkToAlly(ally) {
  const person = people.find(p => p.name === ally.name);
  if (!person || !person.dialogues) return;
  
  const dialogueIdx = game.allyDialogues[ally.name] || 0;
  const dialogue = person.dialogues[dialogueIdx % person.dialogues.length];
  game.allyDialogues[ally.name] = (dialogueIdx + 1) % person.dialogues.length;
  
  showMessage(`${ally.name}: "${dialogue}"`);
  
  // Small trust boost for conversation
  if (ally.trust < 100) {
    ally.trust = clamp(ally.trust + 2, 0, 100);
  }
}

function showInteractionSelection(nearbyAllies, nearbyNewNpcs) {
  game.state = "allyChoice";
  ui.allyChoiceText.textContent = "Who would you like to interact with?";
  ui.allyButtons.innerHTML = "";
  
  // Add ally buttons
  for (const ally of nearbyAllies) {
    const btn = document.createElement("button");
    const request = game.allyRequests[ally.name];
    const hasRequest = request && request.type;
    btn.textContent = `[Ally] ${ally.name} (${ally.role}) - Trust: ${ally.trust}${hasRequest ? ' ⚠️' : ''}`;
    btn.addEventListener("click", () => {
      ui.allyPanel.classList.add("hidden");
      game.state = "play";
      talkToAlly(ally);
    });
    ui.allyButtons.appendChild(btn);
  }
  
  // Add new NPC buttons
  for (const npc of nearbyNewNpcs) {
    const btn = document.createElement("button");
    btn.textContent = `[New] ${npc.name} (${npc.role})`;
    btn.addEventListener("click", () => {
      ui.allyPanel.classList.add("hidden");
      game.state = "play";
      // Show befriend/betray choice for this NPC
      npc.met = true;
      game.choiceNpc = npc;
      game.state = "choice";
      ui.choiceText.textContent = `${npc.text} Do you keep ${npc.name} close, or take what they carry before the darkness does?`;
      ui.choicePanel.classList.remove("hidden");
    });
    ui.allyButtons.appendChild(btn);
  }
  
  ui.allyPanel.classList.remove("hidden");
}

function fulfillNearestAllyRequest() {
  if (!game.enemiesCleared) {
    showMessage("Allies are waiting for combat to end.");
    return;
  }
  
  const p = game.player;
  for (const ally of game.allies) {
    const request = game.allyRequests[ally.name];
    if (request && request.type) {
      const allyNpc = game.npcs.find(n => n.name === ally.name);
      if (allyNpc && !allyNpc.waiting && dist(p, allyNpc) < 70) {
        fulfillAllyRequest(ally.name);
        return;
      }
    }
  }
  showMessage("No allies nearby have pending requests.");
}

function triggerAllyRequest(ally) {
  const request = game.allyRequests[ally.name];
  const requestTypes = [];
  
  if (game.food < 3) requestTypes.push("food");
  if (game.water < 3) requestTypes.push("water");
  if (game.cores < 2) requestTypes.push("cores");
  if (game.player.hp < 50) requestTypes.push("healing");
  
  if (requestTypes.length === 0) return;
  
  const type = requestTypes[rnd(0, requestTypes.length - 1)];
  request.type = type;
  request.timer = 0;
  
  const messages = {
    food: `${ally.name} looks at your food pouch. "Mind sharing a ration? I haven't eaten in days."`,
    water: `${ally.name} holds out a hand. "Water. Please. Just a sip."`,
    cores: `${ally.name} eyes your cores. "I could use those. I'll make it worth your while."`,
    healing: `${ally.name} notices your wounds. "Let me help. I know some old remedies."`
  };
  
  showMessage(messages[type]);
  addLog(`${ally.name} has a request.`);
}

function fulfillAllyRequest(allyName) {
  const ally = game.allies.find(a => a.name === allyName);
  const request = game.allyRequests[allyName];
  if (!ally || !request || !request.type) return;
  
  let fulfilled = false;
  
  switch(request.type) {
    case "food":
      if (game.food >= 1) {
        game.food--;
        fulfilled = true;
      }
      break;
    case "water":
      if (game.water >= 1) {
        game.water--;
        fulfilled = true;
      }
      break;
    case "cores":
      if (game.cores >= 1) {
        game.cores--;
        fulfilled = true;
      }
      break;
    case "healing":
      game.player.hp = clamp(game.player.hp + 15, 0, 100);
      fulfilled = true;
      break;
  }
  
  if (fulfilled) {
    ally.trust = clamp(ally.trust + 12, 0, 100);
    showMessage(`${ally.name}: "Thank you. I won't forget this."`);
    addLog(`${ally.name}'s trust increased. Current trust: ${ally.trust}`);
    
    // Grant bonus based on ally
    if (ally.trust >= 70 && ally.abilitiesUsed < 3) {
      grantAllyBonus(ally);
      ally.abilitiesUsed++;
    }
  } else {
    ally.trust = clamp(ally.trust - 8, 0, 100);
    showMessage(`${ally.name}: "You can't help? I understand... or maybe I don't."`);
  }
  
  request.type = null;
  request.timer = 0;
}

function grantAllyBonus(ally) {
  switch (ally.role) {
    case "cartographer":
      game.roomTime += 15;
      showMessage(`${ally.name} reveals a hidden path, buying you time! (+15s)`);
      break;
    case "blacksmith":
      game.gear = clamp(game.gear + 1, 0, gearNames.length - 1);
      showMessage(`${ally.name} forges a weapon upgrade on the march!`);
      break;
    case "blade saint":
      game.player.parry = 2;
      showMessage(`${ally.name} teaches you an advanced parry technique!`);
      break;
    case "lantern child":
      game.food += 2;
      game.water += 2;
      showMessage(`${ally.name}'s lantern reveals hidden supplies!`);
      break;
    case "lost prince":
      game.cores += 3;
      showMessage(`${ally.name} shares royal reserves from hidden vaults!`);
      break;
    case "oracle":
      game.player.hp = clamp(game.player.hp + 20, 0, 100);
      showMessage(`${ally.name} channels shadow healing through you.`);
      break;
  }
  updateUi();
}

function showMessage(text) {
  game.message = text;
  game.messageTime = 2.2;
}

function addLog(text) {
  game.log.unshift(text);
  game.log = game.log.slice(0, 8);
}

function endGame(title, text) {
  if (game.ending) return;
  game.ending = true;
  game.state = "end";
  ui.endTitle.textContent = title;
  ui.endText.textContent = text;
  ui.endPanel.classList.remove("hidden");
}

function updateUi() {
  ui.timeLeft.textContent = formatTime(game.roomTime);
  ui.timeLeftMobile.textContent = formatTime(game.roomTime);
  ui.darknessBar.style.width = `${clamp(game.roomTime / game.maxRoomTime, 0, 1) * 100}%`;
  ui.depth.textContent = `Depth ${game.depth}`;
  ui.roomDepthMobile.textContent = `Depth ${game.depth}`;
  ui.hp.textContent = Math.ceil(game.player.hp);
  ui.hpMobile.textContent = Math.ceil(game.player.hp);
  ui.hpBar.style.width = `${clamp(game.player.hp, 0, 100)}%`;
  ui.food.textContent = game.food;
  ui.water.textContent = game.water;
  ui.cores.textContent = game.cores;
  ui.coins.textContent = game.coins;
  ui.gear.textContent = gearNames[game.gear];
  ui.pack.innerHTML = game.pack.slice(-8).map(item => `<li>${item}</li>`).join("");
  const materialEntries = Object.entries(game.materials).filter(([, count]) => count > 0);
  ui.materials.innerHTML = materialEntries.length
    ? materialEntries.map(([name, count]) => `<li>${name} x${count}</li>`).join("")
    : "<li>None yet</li>";
  ui.allies.innerHTML = game.allies.length ? game.allies.map(a => {
    const request = game.allyRequests[a.name];
    const hasRequest = request && request.type;
    return `<li>${a.name}, ${a.role} (${a.trust})${hasRequest ? ' ⚠️' : ''}</li>`;
  }).join("") : "<li>Alone</li>";
  ui.log.innerHTML = game.log.map(entry => `<li>${entry}</li>`).join("");
  syncTradeUi();
}

function formatTime(seconds) {
  seconds = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function draw() {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (game.shake > 0) ctx.translate(rnd(-game.shake, game.shake), rnd(-game.shake, game.shake));
  drawFloor();
  game.walls.forEach(drawWall);
  drawExit();
  if (game.tradingPost) drawTradingPost();
  game.loot.forEach(drawLoot);
  game.npcs.forEach(drawNpc);
  game.enemies.forEach(drawEnemy);
  drawPlayer();
  drawDarkness();
  drawTextOverlays();
  ctx.restore();
}

function drawFloor() {
  ctx.fillStyle = "#15181c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += TILE) {
    for (let x = 0; x < canvas.width; x += TILE) {
      ctx.fillStyle = (x / TILE + y / TILE) % 2 ? "#1d2025" : "#171a1f";
      ctx.fillRect(x, y, TILE, TILE);
      if (Math.random() < .012) {
        ctx.fillStyle = "#3a3d45";
        ctx.fillRect(x + rnd(2, 20), y + rnd(2, 20), rnd(3, 8), 2);
      }
    }
  }
}

function drawWall(wall) {
  ctx.fillStyle = "#303641";
  ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  ctx.fillStyle = "#191d23";
  ctx.fillRect(wall.x + 4, wall.y + 4, wall.w - 8, wall.h - 8);
  ctx.fillStyle = "#4b5360";
  ctx.fillRect(wall.x, wall.y, wall.w, 4);
}

function drawExit() {
  const e = game.exit;
  ctx.fillStyle = game.enemies.length ? "#261014" : "#73602d";
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = game.enemies.length ? "#5a2025" : "#f0c36c";
  ctx.fillRect(e.x + 10, e.y + 8, e.w - 20, e.h - 16);
}

function drawPlayer() {
  const p = game.player;
  const coat = game.gender === "female" ? "#7d384f" : "#2f5970";
  if (p.attack > 0) {
    ctx.fillStyle = "#d9d1bd";
    ctx.fillRect(p.x + (p.facing > 0 ? 18 : -22), p.y + 8, 30, 5);
  }
  ctx.fillStyle = "#14181f";
  ctx.fillRect(p.x + 3, p.y + 24, 16, 5);
  ctx.fillStyle = coat;
  ctx.fillRect(p.x + 2, p.y + 9 - p.jump * 18, 18, 18);
  ctx.fillStyle = "#c99567";
  ctx.fillRect(p.x + 5, p.y + 1 - p.jump * 18, 12, 10);
  ctx.fillStyle = "#f0c36c";
  ctx.fillRect(p.x + (p.facing > 0 ? 18 : -4), p.y + 14 - p.jump * 18, 5, 8);
  if (p.parry > 0) {
    ctx.strokeStyle = "#89d7d1";
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x - 7, p.y - 7, p.w + 14, p.h + 14);
  }
}

function drawEnemy(enemy) {
  ctx.fillStyle = enemy.hit > 0 ? "#f0c36c" : "#82322f";
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
  ctx.fillStyle = "#111";
  ctx.fillRect(enemy.x + 5, enemy.y + 7, 4, 4);
  ctx.fillRect(enemy.x + 15, enemy.y + 7, 4, 4);
  ctx.fillStyle = "#cf5a47";
  ctx.fillRect(enemy.x - 2, enemy.y + enemy.h, enemy.w + 4, 4);
}

function drawLoot(loot) {
  ctx.fillStyle = loot.kind === "chest" ? "#8f6b35" : loot.kind === "core" ? "#4da6a0" : "#656b74";
  ctx.fillRect(loot.x, loot.y, loot.w, loot.h);
  ctx.fillStyle = "#f0c36c";
  ctx.fillRect(loot.x + 7, loot.y + 5, 6, 4);
}

function drawTradingPost() {
  const p = game.tradingPost;
  ctx.fillStyle = "#5f4224";
  ctx.fillRect(p.x, p.y + 12, p.w, p.h - 12);
  ctx.fillStyle = "#9d6a35";
  ctx.fillRect(p.x + 6, p.y, p.w - 12, 16);
  ctx.fillStyle = "#f0c36c";
  ctx.fillRect(p.x + 16, p.y + 18, 8, 20);
  ctx.fillRect(p.x + p.w - 24, p.y + 18, 8, 20);
  ctx.fillStyle = "#302218";
  ctx.fillRect(p.x + 12, p.y + 28, p.w - 24, 10);
  ctx.fillStyle = "#d9d1bd";
  ctx.fillRect(p.x + 26, p.y + 8, 20, 8);
}

function drawNpc(npc) {
  // Dim appearance while waiting
  if (npc.waiting) {
    ctx.globalAlpha = 0.5;
  }
  
  ctx.fillStyle = npc.met ? "#5a7070" : "#314f4b";
  ctx.fillRect(npc.x + 2, npc.y + 10, 20, 20);
  ctx.fillStyle = "#bda078";
  ctx.fillRect(npc.x + 6, npc.y, 12, 12);
  ctx.fillStyle = "#cfd06e";
  ctx.fillRect(npc.x - 4, npc.y + 14, 5, 8);
  
  // Draw lantern glow for Nix
  if (npc.name === "Nix") {
    ctx.fillStyle = "rgba(74, 166, 160, 0.3)";
    ctx.beginPath();
    ctx.arc(npc.x + 12, npc.y + 15, 25, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw waiting indicator
  if (npc.waiting) {
    ctx.fillStyle = "#cf5a47";
    ctx.font = "12px Courier New";
    ctx.fillText("Waiting...", npc.x - 12, npc.y - 8);
  }
  // Draw interaction indicator (only when not waiting)
  else if (dist(game.player, npc) < 70) {
    ctx.fillStyle = "#f0c36c";
    ctx.font = "12px Courier New";
    ctx.fillText("[E] Talk", npc.x - 8, npc.y - 8);
  }
  
  ctx.globalAlpha = 1.0;
}

function drawDarkness() {
  const p = game.player;
  const danger = 1 - clamp(game.roomTime / game.maxRoomTime, 0, 1);
  const radius = 340 - danger * 80 + game.allies.length * 10;
  const g = ctx.createRadialGradient(p.x + 10, p.y + 12, 45, p.x + 10, p.y + 12, radius);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(.56, "rgba(0,0,0,.24)");
  g.addColorStop(1, `rgba(0,0,0,${.66 + danger * .18})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgba(22, 0, 20, ${danger * .22})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTextOverlays() {
  ctx.font = "16px Courier New";
  ctx.fillStyle = "#f0c36c";
  if (!game.mobile) {
    ctx.fillText("Exit opens when hostile entities are dead", 22, 28);
    if (game.roomType === "trade" && isNearTradingPost() && !game.tradePanelOpen) {
      ctx.fillStyle = "#89d7d1";
      ctx.fillText("Trading Post ready - click Open or press E", 22, 50);
    }
    // Show ally hints only on the desktop HUD path.
    const nearbyAlly = game.enemiesCleared ? game.allies.find(ally => {
      const allyNpc = game.npcs.find(n => n.name === ally.name);
      return allyNpc && !allyNpc.waiting && dist(game.player, allyNpc) < 70;
    }) : null;
    
    if (nearbyAlly) {
      const request = game.allyRequests[nearbyAlly.name];
      if (request && request.type) {
        ctx.fillStyle = "#cf5a47";
        ctx.fillText(`Press T to fulfill ${nearbyAlly.name}'s request`, 22, 50);
      } else {
        ctx.fillStyle = "#627e4f";
        ctx.fillText(`Press E to talk with ${nearbyAlly.name}`, 22, 50);
      }
    }
    
    if (!game.enemiesCleared && game.allies.length > 0) {
      ctx.fillStyle = "#a7a090";
      ctx.fillText(`Allies waiting for room to clear (${game.enemies.length} enemies left)`, 22, 50);
    }
  }
  
  if (game.messageTime > 0) {
    const boxWidth = game.mobile ? Math.min(520, game.message.length * 9 + 24) : Math.min(760, game.message.length * 10 + 24);
    const boxHeight = game.mobile ? 40 : 34;
    const boxY = game.mobile ? canvas.height - 62 : canvas.height - 54;
    ctx.fillStyle = "#f4efe1";
    ctx.fillRect(18, boxY, boxWidth, boxHeight);
    ctx.fillStyle = "#111317";
    ctx.fillText(game.message, 30, boxY + (game.mobile ? 26 : 23));
  }
}

function loop(now) {
  const dt = Math.min(.05, (now - game.last) / 1000);
  game.last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

ui.genderButtons.forEach(button => {
  button.addEventListener("click", () => {
    gender = button.dataset.gender;
    ui.genderButtons.forEach(b => b.classList.toggle("selected", b === button));
  });
});

ui.deviceButtons.forEach(button => {
  button.addEventListener("click", () => {
    setDeviceMode(button.dataset.device);
  });
});

ui.startBtn.addEventListener("click", () => {
  resetGame();
  game.state = "play";
  game.heroName = ui.heroName.value.trim() || "Ari";
  game.gender = gender;
  game.mobile = deviceMode === "mobile";
  ui.startPanel.classList.add("hidden");
  syncMobileChrome();
  addLog(`${game.heroName} steps past the threshold. The door behind them becomes stone.`);
});

ui.restartBtn.addEventListener("click", () => {
  ui.endPanel.classList.add("hidden");
  ui.startPanel.classList.remove("hidden");
  resetGame();
});

ui.befriendBtn.addEventListener("click", () => chooseNpc(true));
ui.betrayBtn.addEventListener("click", () => chooseNpc(false));
ui.allyCancelBtn.addEventListener("click", () => {
  ui.allyPanel.classList.add("hidden");
  game.state = "play";
});

ui.inventoryBtn.addEventListener("click", () => {
  if (game && game.mobileDrawerOpen) setMobileDrawer(false);
  else setMobileDrawer(true);
});

ui.mobileDrawerClose.addEventListener("click", () => setMobileDrawer(false));
ui.tradeEnterBtn.addEventListener("click", () => openTradePanel());
ui.tradeCloseBtn.addEventListener("click", () => closeTradePanel());
ui.weaponGachaBtn.addEventListener("click", () => drawWeaponGacha());
ui.goodieGachaBtn.addEventListener("click", () => drawGoodieGacha());
ui.sellExtrasBtn.addEventListener("click", () => beginSellSelection());
ui.sellCancelBtn.addEventListener("click", () => cancelSellSelection());
ui.sellConfirmBtn.addEventListener("click", () => confirmSellSelection());
ui.materialRows.addEventListener("click", event => {
  const button = event.target.closest("button[data-sell-adjust]");
  if (!button) return;
  adjustSellSelection(button.dataset.material, Number(button.dataset.sellAdjust));
});

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  if (key === "escape") {
    if (game && game.tradePanelOpen) {
      closeTradePanel();
      return;
    }
    if (game && game.mobileDrawerOpen) setMobileDrawer(false);
    return;
  }
  if (!game || (game.state !== "play" && game.state !== "trade")) return;
  if (game.state !== "play") return;
  keys[key] = true;
  if ([" ", "w", "a", "s", "d", "e", "f", "r", "h", "j", "k", "t"].includes(key)) event.preventDefault();
  if (key === " " && game.state === "play") game.player.jump = .18;
  if (key === "e") interact();
  if (key === "f") eatFood();
  if (key === "r") drinkWater();
  if (key === "h") attack();
  if (key === "j") useSkill();
  if (key === "k") parry();
  if (key === "t") {
    fulfillNearestAllyRequest();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

ui.joystick.addEventListener("pointerdown", handleJoystickPointer);
window.addEventListener("pointermove", handleJoystickPointer);
window.addEventListener("pointerup", releaseJoystick);
window.addEventListener("pointercancel", releaseJoystick);
ui.mobileActionButtons.forEach(button => {
  button.addEventListener("pointerdown", event => {
    if (event.type === "pointerdown") event.preventDefault();
    triggerMobileAction(button.dataset.mobileAction);
  });
});

setDeviceMode(deviceMode);
resetGame();
requestAnimationFrame(loop);
