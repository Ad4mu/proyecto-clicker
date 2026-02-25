const emeraldCountEl = document.getElementById("emerald-count");
const epsCountEl = document.getElementById("eps-count");
const upgradeListEl = document.getElementById("upgrade-list");
const catButton = document.getElementById("cat-button");

// Estado principal del juego.
let emeralds = 0;
let emeraldsPerSecond = 0;
const clickPower = 1;

// Definición base de mejoras con coste inicial y producción por segundo.
const upgrades = [
  {
    id: "miner",
    name: "Minero Automático",
    description: "Un aldeano contratado para picar por ti.",
    baseCost: 15,
    eps: 0.2,
    owned: 0,
  },
  {
    id: "village",
    name: "Aldea de Comercio",
    description: "Más aldeanos, más tratos, más esmeraldas.",
    baseCost: 90,
    eps: 1.2,
    owned: 0,
  },
  {
    id: "nether",
    name: "Portal al Nether",
    description: "Recursos exóticos para una economía brutal.",
    baseCost: 650,
    eps: 8,
    owned: 0,
  },
  {
    id: "fortress",
    name: "Fortaleza de Redstone",
    description: "Autómatas que generan esmeraldas sin descanso.",
    baseCost: 4200,
    eps: 45,
    owned: 0,
  },
];

// Construye las tarjetas de mejoras y conecta la acción de compra.
function buildUpgradeCards() {
  const fragment = document.createDocumentFragment();

  upgrades.forEach((upgrade) => {
    const card = document.createElement("article");
    card.className = "upgrade-card";
    card.dataset.id = upgrade.id;

    card.innerHTML = `
      <h3 class="upgrade-title">${upgrade.name}</h3>
      <p class="upgrade-meta">${upgrade.description}</p>
      <p class="upgrade-meta">Poseídos: <span data-role="owned">0</span></p>
      <p class="upgrade-meta">Producción: +${formatNumber(upgrade.eps)} /seg</p>
      <button class="buy-btn" data-role="buy">Comprar (<span data-role="cost">${upgrade.baseCost}</span>)</button>
    `;

    const buyButton = card.querySelector('[data-role="buy"]');
    buyButton.addEventListener("click", () => buyUpgrade(upgrade.id));

    fragment.appendChild(card);
  });

  upgradeListEl.appendChild(fragment);
}

function getUpgradeCost(upgrade) {
  return Math.ceil(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
}

function formatNumber(value) {
  return value >= 1000 ? value.toLocaleString("es-ES", { maximumFractionDigits: 1 }) : value.toFixed(value % 1 === 0 ? 0 : 1);
}

function recalculateEPS() {
  emeraldsPerSecond = upgrades.reduce((sum, upgrade) => sum + upgrade.owned * upgrade.eps, 0);
}

function refreshUpgradeUI() {
  upgrades.forEach((upgrade) => {
    const card = upgradeListEl.querySelector(`[data-id="${upgrade.id}"]`);
    if (!card) return;

    const cost = getUpgradeCost(upgrade);
    card.querySelector('[data-role="owned"]').textContent = String(upgrade.owned);
    card.querySelector('[data-role="cost"]').textContent = formatNumber(cost);
    card.querySelector('[data-role="buy"]').disabled = emeralds < cost;
  });
}

function refreshHUD() {
  emeraldCountEl.textContent = formatNumber(emeralds);
  epsCountEl.textContent = formatNumber(emeraldsPerSecond);
  refreshUpgradeUI();
}

function buyUpgrade(id) {
  const upgrade = upgrades.find((item) => item.id === id);
  if (!upgrade) return;

  const cost = getUpgradeCost(upgrade);
  if (emeralds < cost) return;

  emeralds -= cost;
  upgrade.owned += 1;
  recalculateEPS();
  refreshHUD();
}

function spawnFloatingText(event, amount) {
  const floatingText = document.createElement("span");
  floatingText.className = "floating-text";
  floatingText.textContent = `+${amount}`;

  const rect = catButton.getBoundingClientRect();
  floatingText.style.left = `${event.clientX - rect.left}px`;
  floatingText.style.top = `${event.clientY - rect.top}px`;

  catButton.appendChild(floatingText);
  floatingText.addEventListener("animationend", () => floatingText.remove());
}

function animateCatHit() {
  catButton.classList.remove("hit");
  void catButton.offsetWidth;
  catButton.classList.add("hit");
}

function handleManualClick(event) {
  emeralds += clickPower;
  spawnFloatingText(event, clickPower);
  animateCatHit();
  refreshHUD();
}

// Loop pasivo con setInterval para sumar producción automática.
function startPassiveLoop() {
  const tickMs = 100;
  const tickSeconds = tickMs / 1000;

  setInterval(() => {
    if (emeraldsPerSecond <= 0) return;

    emeralds += emeraldsPerSecond * tickSeconds;
    refreshHUD();
  }, tickMs);
}

catButton.addEventListener("click", handleManualClick);

buildUpgradeCards();
recalculateEPS();
refreshHUD();
startPassiveLoop();
