// Brithi’s Birthday Quiz
// Edit STAR, the prizes, and the questions here.
// A perfect game is $150 in tokens + the $200 super token = $350.
// The wheel always lands on the super token. That is the gift.

const STAR = "Brithi";
const SUPER_TOKEN = 200;
const SAVE_KEY = "brithi-birthday-quiz";
const rehearsal = new URLSearchParams(window.location.search).get("preview") === "ending";

// One correct choice per question. Marked answers are used even when
// they are not the textbook fact. Unmarked family facts are noted below.
const ROUNDS = [
  {
    kind: "quiz",
    label: "How old",
    prize: 10,
    prompt: "How old is Brithi turning today?",
    choices: [
      { text: "6 years", correct: false },
      { text: "12 years", correct: false },
      { text: "14 years", correct: false },
      { text: "4,748 days", correct: true }
    ]
  },
  {
    kind: "quiz",
    label: "The knife",
    prize: 8,
    prompt: "Who in the family has chased multiple people with a knife?",
    choices: [
      { text: "Amogh", correct: true },
      { text: "Mamu", correct: false },
      { text: "Samith", correct: false },
      { text: "Adish", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Mum’s uncles",
    prize: 8,
    long: true,
    prompt: "How many uncles does Brithi have on her mum’s side whose first names start with A and have an S in them?",
    choices: [
      { text: "2", correct: false },
      { text: "3", correct: true },
      { text: "5", correct: false },
      { text: "7", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Mamu’s age",
    prize: 5,
    prompt: "How old is Mamu?",
    choices: [
      { text: "Old", correct: false },
      { text: "Really old", correct: false },
      { text: "Quite old", correct: false },
      { text: "It’s a problem really", correct: true }
    ]
  },
  {
    kind: "quiz",
    label: "Ashray",
    prize: 10,
    prompt: "What city was Ashray born in?",
    choices: [
      { text: "Auckland", correct: false },
      { text: "Melbourne", correct: false },
      { text: "Sydney", correct: false },
      { text: "Mumbai", correct: true }
    ]
  },
  {
    kind: "quiz",
    label: "Who is this",
    prize: 8,
    image: "img/who-is-this.jpg",
    imageAlt: "A baby in a pink striped outfit, held outdoors.",
    imageZoom: 5,
    prompt: "Who is this?",
    choices: [
      { text: "Sada", correct: true },
      { text: "Adish", correct: false },
      { text: "Sukanya", correct: false },
      { text: "Brithi", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Pavlova",
    prize: 50,
    golden: true,
    note: "Never forget your roots.",
    prompt: "Where was pavlova invented?",
    choices: [
      { text: "Aotearoa", correct: true },
      { text: "Australia", correct: false },
      { text: "England", correct: false },
      { text: "Jamaica", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "5 May 2024",
    prize: 10,
    long: true,
    // Confirm: set to the Forbidden Forest.
    prompt: "Where did we go on 5 May 2024?",
    choices: [
      { text: "A garden", correct: false },
      { text: "Harry Potter: A Forbidden Forest Experience", correct: true },
      { text: "Mount Martha, Victoria", correct: false },
      { text: "Wellington", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Adish",
    prize: 8,
    prompt: "What city was Adish born in?",
    choices: [
      { text: "Shanghai", correct: false },
      { text: "Auckland", correct: true },
      { text: "Mumbai", correct: false },
      { text: "Queenstown", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Apostles",
    prize: 5,
    long: true,
    miss: "It's in the name, silly.",
    prompt: "On 29 December 2023, we took you to see the Twelve Apostles. How many apostles are there?",
    choices: [
      { text: "1", correct: false },
      { text: "7", correct: false },
      { text: "12", correct: true },
      { text: "18", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Chicken fight",
    prize: 10,
    prompt: "True or false: your great great granddad used to chicken fight.",
    choices: [
      { text: "True", correct: true },
      { text: "False", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Number one",
    prize: 10,
    long: true,
    prompt: "What was the number 1 song on the day Brithi was born, 7 November 2013?",
    choices: [
      { text: "Royals, Lorde", correct: true },
      { text: "Radioactive, Imagine Dragons", correct: false },
      { text: "Thrift Shop, Macklemore", correct: false },
      { text: "APT., Bruno Mars and Rosé", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Seashells",
    prize: 8,
    long: true,
    prompt: "Sally sells seashells by the seashore. She sells seashells on the seashell shore. The seashells she sells are seashore shells, of that I’m sure?",
    choices: [
      { text: "Sally", correct: false },
      { text: "Sells", correct: false },
      { text: "Sea", correct: false },
      { text: "Shells", correct: true }
    ]
  }
];

const SLICES = [
  { label: "$200", color: "#ffe29a" },
  { label: "$30", color: "#ff8b95" },
  { label: "$60", color: "#ffd36a" },
  { label: "$90", color: "#7ee0d2" },
  { label: "$20", color: "#ffb3c7" },
  { label: "$120", color: "#b7c8ff" },
  { label: "$40", color: "#ffc49a" },
  { label: "$150", color: "#ddd0ff" }
];

// Six full turns, then stop with $200 under the pointer.
const LANDING_TURN = 337.5;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  started: false,
  index: 0,
  results: Array(ROUNDS.length).fill(null),
  superAwarded: false,
  muted: false
};

let roundOpen = false;
let halt = () => {};
let audioCtx = null;

const stage = document.getElementById("stage");
const track = document.getElementById("track");
const purseTotal = document.getElementById("purse-total");
const purse = document.querySelector(".purse");
const muteBtn = document.getElementById("mute");
const canvas = document.getElementById("confetti");
const ctx2d = canvas.getContext("2d");

function money(n) {
  return "$" + n;
}

function tokenTotal() {
  return state.results.reduce((sum, result, i) => {
    return sum + (result === "won" ? ROUNDS[i].prize : 0);
  }, 0);
}

function grandTotal() {
  return tokenTotal() + (state.superAwarded ? SUPER_TOKEN : 0);
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function button(text, className) {
  const node = buttonEl(text, className || "btn");
  return node;
}

function buttonEl(text, className) {
  const node = el("button", className, text);
  node.type = "button";
  return node;
}

function coin(amount, className) {
  return el("div", "coin" + (className ? " " + className : ""), money(amount));
}

function setPurse(amount) {
  purseTotal.textContent = money(amount);
}

function bumpPurse() {
  purse.classList.remove("bump");
  void purse.offsetWidth;
  purse.classList.add("bump");
}

function save() {
  if (rehearsal) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      started: state.started,
      index: state.index,
      results: state.results,
      superAwarded: state.superAwarded,
      muted: state.muted
    }));
  } catch (err) {
    /* private mode can refuse storage; the party still works */
  }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.results) || data.results.length !== ROUNDS.length) return null;
    return data;
  } catch (err) {
    return null;
  }
}

function applySave(data) {
  state.started = true;
  state.index = data.index;
  state.results = data.results.slice();
  state.superAwarded = Boolean(data.superAwarded);
  state.muted = Boolean(data.muted);
  muteBtn.textContent = state.muted ? "Sound off" : "Sound on";
  muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
}

function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, when, dur, type, gain) {
  if (state.muted) return;
  const c = ac();
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain || 0.05, when);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(amp);
  amp.connect(c.destination);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

function playCorrect() {
  if (state.muted) return;
  const c = ac();
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    tone(freq, c.currentTime + i * 0.08, 0.22, "triangle", 0.06);
  });
}

function playWrong() {
  if (state.muted) return;
  const c = ac();
  tone(196, c.currentTime, 0.16, "sine", 0.04);
}

function playPop() {
  if (state.muted) return;
  const c = ac();
  tone(680 + Math.random() * 180, c.currentTime, 0.08, "square", 0.03);
}

function playFanfare() {
  if (state.muted) return;
  const c = ac();
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(freq, c.currentTime + i * 0.11, 0.32, "triangle", 0.07);
  });
}

function playTick() {
  if (state.muted) return;
  const c = ac();
  tone(880, c.currentTime, 0.04, "square", 0.02);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let bits = [];
let confettiOn = false;

function burst(count) {
  if (reduceMotion) return;
  const colors = ["#ff5a6a", "#ffc14d", "#2ec4b6", "#fff6ea", "#8eabff", "#ff8fab"];
  const n = count || 80;
  for (let i = 0; i < n; i += 1) {
    bits.push({
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 180,
      y: window.innerHeight * 0.32,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -11 - 3,
      g: 0.22 + Math.random() * 0.08,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 6,
      color: colors[i % colors.length],
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.25,
      life: 100 + Math.random() * 30
    });
  }
  if (!confettiOn) {
    confettiOn = true;
    requestAnimationFrame(drawConfetti);
  }
}

function drawConfetti() {
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  bits = bits.filter((bit) => bit.life > 0);
  bits.forEach((bit) => {
    bit.vy += bit.g;
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.rot += bit.vr;
    bit.life -= 1;
    ctx2d.save();
    ctx2d.translate(bit.x, bit.y);
    ctx2d.rotate(bit.rot);
    ctx2d.fillStyle = bit.color;
    ctx2d.fillRect(-bit.w / 2, -bit.h / 2, bit.w, bit.h);
    ctx2d.restore();
  });
  if (bits.length) requestAnimationFrame(drawConfetti);
  else confettiOn = false;
}

function renderTrack() {
  track.replaceChildren();
  ROUNDS.forEach((round, i) => {
    const li = el("li", "bulb");
    if (state.results[i] === "won") li.classList.add("won");
    else if (state.results[i] === "miss") li.classList.add("miss");
    else if (state.started && i === state.index && state.index < ROUNDS.length) li.classList.add("current");
    const status = state.results[i] === "won" ? "won" : state.results[i] === "miss" ? "missed" : "ahead";
    li.setAttribute("aria-label", "Round " + (i + 1) + ", " + round.label + ", " + status);
    track.append(li);
  });
}

function mount(node) {
  halt();
  halt = () => {};
  stage.replaceChildren(node);
}

function prizeRow(round, index) {
  const row = el("div", "prize-row");
  const meta = el("div");
  meta.append(el("p", "round-count", "Round " + (index + 1) + " of " + ROUNDS.length));
  meta.append(el("p", "kicker", round.golden ? "Golden token" : round.label));
  row.append(meta, coin(round.prize));
  return row;
}

function settleRound(won) {
  if (!roundOpen) return false;
  roundOpen = false;
  halt();
  state.results[state.index] = won ? "won" : "miss";
  if (won) {
    playCorrect();
    burst(70);
    bumpPurse();
  } else {
    playWrong();
  }
  setPurse(tokenTotal());
  save();
  renderTrack();
  return true;
}

function advanceRound() {
  state.index += 1;
  save();
  if (state.index >= ROUNDS.length) renderFinale();
  else renderRound();
}

function finishRound(won) {
  const round = ROUNDS[state.index];
  if (!settleRound(won)) return;
  renderResult(round, won);
}

function renderResult(round, won) {
  const card = el("section", "card" + (round.golden ? " golden" : ""));
  card.append(prizeRow(round, state.index));
  card.append(el("h1", "prompt", won ? "Token pocketed." : "No token this round."));
  const note = won
    ? money(round.prize) + " goes in the purse. The spree is now " + money(tokenTotal()) + "."
    : "That one stays in the machine. The next round is still yours.";
  card.append(el("p", "lede", note));
  if (won) {
    const wrap = el("div", "coin-wrap");
    wrap.append(coin(round.prize, "lg"));
    card.append(wrap);
  }
  const next = button(state.index === ROUNDS.length - 1 ? "To the super spin" : "Next round", "btn");
  next.addEventListener("click", advanceRound);
  const actions = el("div", "actions");
  actions.append(next);
  card.append(actions);
  mount(card);
}

function renderRound() {
  roundOpen = true;
  renderTrack();
  const round = ROUNDS[state.index];
  if (round.kind === "quiz") renderQuiz(round);
  else if (round.kind === "balloons") renderBalloons(round);
  else if (round.kind === "memory") renderMemory(round);
  else if (round.kind === "catch") renderCatch(round);
  else if (round.kind === "thisorthat") renderThisOrThat(round);
  else if (round.kind === "reaction") renderReaction(round);
}

function renderQuiz(round) {
  const card = el("section", "card" + (round.golden ? " golden" : ""));
  card.append(prizeRow(round, state.index));
  card.append(el("h1", round.long ? "prompt long" : "prompt", round.prompt));
  let photo = null;
  if (round.image) {
    const frame = el("div", "quiz-frame");
    photo = el("img", "quiz-photo");
    photo.src = round.image;
    photo.alt = round.imageAlt || "";
    frame.append(photo);
    card.append(frame);
  }
  const choices = shuffle(round.choices);
  const list = el("div", "choices");
  const foot = el("div", "round-foot");
  const status = el("p", "status", round.golden ? "This token is worth fifty dollars. One shot." : "One shot.");
  foot.append(status);
  let locked = false;

  choices.forEach((choice, choiceIndex) => {
    const choiceBtn = buttonEl(choice.text, "choice");
    choiceBtn.addEventListener("click", () => {
      if (locked || choiceBtn.disabled) return;
      locked = true;
      list.querySelectorAll(".choice").forEach((btn) => { btn.disabled = true; });
      const won = choice.correct;
      if (won) {
        choiceBtn.classList.add("is-correct");
      } else {
        choiceBtn.classList.add("is-wrong");
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        const right = list.querySelectorAll(".choice")[choices.findIndex((item) => item.correct)];
        if (right) right.classList.add("is-correct");
      }
      settleRound(won);
      if (photo && round.imageZoom) {
        photo.style.setProperty("--photo-zoom", String(round.imageZoom));
        photo.classList.add("is-zoomed");
      }
      if (won) foot.insertBefore(coin(round.prize, "sm"), status);
      status.textContent = round.note || (won ? "Token pocketed." : (round.miss || "No token this round."));
      status.classList.add("round-note");
      const next = button(state.index === ROUNDS.length - 1 ? "To the super spin" : "Next round", "btn compact");
      next.addEventListener("click", advanceRound);
      foot.append(next);
      next.focus({ preventScroll: true });
    });
    choiceBtn.dataset.key = String(choiceIndex + 1);
    list.append(choiceBtn);
  });

  card.append(list, foot);
  mount(card);

  halt = () => {
    locked = true;
  };
}

function renderBalloons(round) {
  const card = el("section", "card");
  card.append(prizeRow(round, state.index));
  card.append(el("h1", "prompt", round.prompt));
  card.append(el("p", "lede", round.detail));
  const arena = el("div", "arena");
  const status = el("p", "status", "0 / 8");
  const spots = [
    [6, 6], [26, 2], [46, 8], [66, 2], [82, 12],
    [12, 36], [34, 30], [56, 38], [76, 28], [42, 54]
  ];
  const colors = ["#ff5a6a", "#ffc14d", "#2ec4b6", "#8eabff", "#ff8fab", "#f4a261", "#c9b6ff", "#7ee0d2", "#ffd36a", "#ff8b95"];
  let popped = 0;
  const need = 8;

  spots.forEach((spot, i) => {
    const balloon = buttonEl("", "balloon");
    balloon.style.left = spot[0] + "%";
    balloon.style.top = spot[1] + "%";
    balloon.style.background = colors[i];
    balloon.style.animationDelay = (i * 0.13) + "s";
    balloon.setAttribute("aria-label", "Balloon " + (i + 1));
    balloon.addEventListener("click", () => {
      if (!roundOpen || balloon.disabled) return;
      balloon.disabled = true;
      balloon.classList.add("popped");
      popped += 1;
      playPop();
      status.textContent = popped + " / " + need;
      if (popped >= need) finishRound(true);
    });
    arena.append(balloon);
  });

  card.append(arena, status);
  mount(card);
}

function renderMemory(round) {
  const card = el("section", "card");
  card.append(prizeRow(round, state.index));
  card.append(el("h1", "prompt", round.prompt));
  card.append(el("p", "lede", round.detail));
  const arena = el("div", "arena memory");
  const grid = el("div", "grid");
  const status = el("p", "status", "0 / 6 pairs");
  const icons = ["🎂", "🎁", "⭐", "🎈", "👑", "🛍️"];
  const deck = shuffle(icons.concat(icons));
  let open = [];
  let lock = false;
  let matched = 0;

  deck.forEach((icon) => {
    const tile = buttonEl("", "mem");
    tile.setAttribute("aria-label", "Hidden card");
    const inner = el("span", "mem-inner");
    inner.append(el("span", "face back", "?"), el("span", "face front", icon));
    tile.append(inner);
    tile.addEventListener("click", () => {
      if (!roundOpen || lock || tile.classList.contains("up") || tile.classList.contains("matched")) return;
      tile.classList.add("up");
      tile.setAttribute("aria-label", icon);
      open.push({ tile, icon });
      if (open.length < 2) return;
      const [first, second] = open;
      if (first.icon === second.icon) {
        first.tile.classList.add("matched");
        second.tile.classList.add("matched");
        open = [];
        matched += 1;
        playPop();
        status.textContent = matched + " / 6 pairs";
        if (matched === 6) window.setTimeout(() => finishRound(true), 350);
      } else {
        lock = true;
        window.setTimeout(() => {
          first.tile.classList.remove("up");
          second.tile.classList.remove("up");
          first.tile.setAttribute("aria-label", "Hidden card");
          second.tile.setAttribute("aria-label", "Hidden card");
          open = [];
          lock = false;
        }, 700);
      }
    });
    grid.append(tile);
  });

  arena.append(grid);
  card.append(arena, status);
  mount(card);
  halt = () => { lock = true; };
}

function renderCatch(round) {
  const card = el("section", "card");
  card.append(prizeRow(round, state.index));
  card.append(el("h1", "prompt", round.prompt));
  card.append(el("p", "lede", round.detail));
  const arena = el("div", "arena");
  const basket = el("div", "basket");
  basket.setAttribute("aria-hidden", "true");
  arena.append(basket);
  const status = el("p", "status", "0 / 7 caught");
  card.append(arena, status);
  mount(card);

  const need = 7;
  const maxGifts = 12;
  const glyphs = ["🎁", "🎀", "⭐", "🛍️", "🎈", "👑"];
  let caught = 0;
  let spawned = 0;
  let alive = true;
  let raf = 0;
  const gifts = [];
  let last = performance.now();
  let sinceSpawn = 0;

  function placeBasket(clientX) {
    const rect = arena.getBoundingClientRect();
    const half = 66;
    const x = Math.max(half, Math.min(rect.width - half, clientX - rect.left));
    basket.style.left = x + "px";
  }

  function onPointer(event) {
    if (event.cancelable) event.preventDefault();
    placeBasket(event.clientX);
  }

  arena.addEventListener("pointerdown", onPointer);
  arena.addEventListener("pointermove", onPointer);

  function spawn() {
    if (spawned >= maxGifts) return;
    spawned += 1;
    const gift = el("span", "gift", glyphs[spawned % glyphs.length]);
    gift.setAttribute("aria-hidden", "true");
    const width = arena.clientWidth || 320;
    const x = 16 + Math.random() * Math.max(20, width - 56);
    gift.style.left = x + "px";
    gift.style.top = "-36px";
    arena.append(gift);
    gifts.push({ el: gift, y: -36, speed: 1.55 + Math.random() * 0.45 });
  }

  function fail() {
    alive = false;
    cancelAnimationFrame(raf);
    const cover = el("div", "overlay");
    cover.append(el("p", "lede", "A few got away. The token is still up for grabs."));
    const again = button("Try again", "btn gold");
    again.addEventListener("click", () => renderCatch(round));
    cover.append(again);
    arena.append(cover);
  }

  function frame(now) {
    if (!alive || !roundOpen) return;
    const dt = Math.min(34, now - last);
    last = now;
    sinceSpawn += dt;
    if (sinceSpawn > 780) {
      sinceSpawn = 0;
      spawn();
    }
    const basketRect = basket.getBoundingClientRect();
    for (let i = gifts.length - 1; i >= 0; i -= 1) {
      const gift = gifts[i];
      gift.y += gift.speed * (dt / 16.6);
      gift.el.style.top = gift.y + "px";
      const rect = gift.el.getBoundingClientRect();
      const hit = rect.bottom >= basketRect.top + 6
        && rect.top <= basketRect.bottom
        && rect.right >= basketRect.left + 6
        && rect.left <= basketRect.right - 6
        && gift.y > arena.clientHeight * 0.42;
      if (hit) {
        caught += 1;
        playPop();
        gift.el.remove();
        gifts.splice(i, 1);
        status.textContent = caught + " / " + need + " caught";
      } else if (gift.y > arena.clientHeight - 8) {
        gift.el.remove();
        gifts.splice(i, 1);
      }
    }
    if (caught >= need) {
      alive = false;
      cancelAnimationFrame(raf);
      finishRound(true);
      return;
    }
    if (spawned >= maxGifts && gifts.length === 0) {
      fail();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  halt = () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}

function renderThisOrThat(round) {
  const card = el("section", "card");
  card.append(prizeRow(round, state.index));
  card.append(el("h1", "prompt", round.prompt));
  const pairStatus = el("p", "kicker");
  const ask = el("p", "lede");
  const row = el("div", "or");
  const status = el("p", "status", "First picks count. A clean sweep takes the token.");
  card.append(pairStatus, ask, row, status);
  mount(card);

  let index = 0;
  let clean = true;
  let retried = false;
  let busy = false;

  function endSet() {
    if (clean) finishRound(true);
    else if (!retried) {
      status.textContent = "One of those was a trap. One clean run still wins the token.";
      row.replaceChildren();
      ask.textContent = "Same four. Trust the grin.";
      const again = button("Try the set again", "btn gold");
      again.addEventListener("click", () => {
        retried = true;
        clean = true;
        index = 0;
        status.textContent = "Clean run. Make it obvious.";
        showPair();
      });
      row.append(again);
    } else {
      finishRound(false);
    }
  }

  function showPair() {
    const pair = round.pairs[index];
    busy = false;
    pairStatus.textContent = (index + 1) + " of " + round.pairs.length;
    ask.textContent = pair.prompt;
    row.replaceChildren();
    const left = buttonEl(pair.a, "or-btn");
    const right = buttonEl(pair.b, "or-btn");
    const divider = el("div", "or-word", "or");

    function pick(side, pressed) {
      if (busy || !roundOpen) return;
      busy = true;
      const ok = side === pair.correct;
      if (!ok) clean = false;
      pressed.classList.add(ok ? "is-correct" : "is-wrong");
      const winner = pair.correct === "a" ? left : right;
      winner.classList.add("is-correct");
      if (ok) playPop();
      else playWrong();
      window.setTimeout(() => {
        index += 1;
        if (index >= round.pairs.length) endSet();
        else showPair();
      }, ok ? 320 : 650);
    }

    left.addEventListener("click", () => pick("a", left));
    right.addEventListener("click", () => pick("b", right));
    row.append(left, divider, right);
  }

  showPair();
  halt = () => { busy = true; };
}

function renderReaction(round) {
  const card = el("section", "card");
  card.append(prizeRow(round, state.index));
  card.append(el("h1", "prompt", round.prompt));
  card.append(el("p", "lede", round.detail));
  const arena = el("div", "arena");
  const stageBox = el("div", "present-stage");
  const present = buttonEl("NOW", "present");
  present.setAttribute("aria-label", "Wrapped present. Wait for it to pop.");
  stageBox.append(present);
  arena.append(stageBox);
  const status = el("p", "status", "Wait for it…");
  card.append(arena, status);
  mount(card);

  let hits = 0;
  const need = 3;
  let phase = "wait";
  let timer = 0;
  let alive = true;

  function arm() {
    if (!alive || !roundOpen) return;
    phase = "wait";
    present.classList.remove("open");
    present.setAttribute("aria-label", "Wrapped present. Wait for it to pop.");
    const delay = 700 + Math.random() * 1300;
    timer = window.setTimeout(() => {
      if (!alive) return;
      phase = "open";
      present.classList.add("open");
      present.setAttribute("aria-label", "Open now");
      status.textContent = "Now.";
      playTick();
      timer = window.setTimeout(() => {
        if (phase !== "open") return;
        phase = "miss";
        present.classList.remove("open");
        status.textContent = "It closed. Watch again.";
        arm();
      }, 1000);
    }, delay);
  }

  present.addEventListener("click", () => {
    if (!alive || !roundOpen) return;
    if (phase === "open") {
      window.clearTimeout(timer);
      phase = "hit";
      hits += 1;
      playPop();
      status.textContent = hits + " / " + need;
      if (hits >= need) {
        alive = false;
        finishRound(true);
        return;
      }
      arm();
      return;
    }
    window.clearTimeout(timer);
    phase = "early";
    status.textContent = "Too soon. Wait for the pop.";
    playWrong();
    arm();
  });

  arm();
  halt = () => {
    alive = false;
    window.clearTimeout(timer);
  };
}

function slicePath(i) {
  const cx = 50;
  const cy = 50;
  const r = 46;
  const start = ((-90 + i * 45) * Math.PI) / 180;
  const end = ((-90 + (i + 1) * 45) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(start);
  const y0 = cy + r * Math.sin(start);
  const x1 = cx + r * Math.cos(end);
  const y1 = cy + r * Math.sin(end);
  return "M " + cx + " " + cy + " L " + x0.toFixed(2) + " " + y0.toFixed(2) + " A " + r + " " + r + " 0 0 1 " + x1.toFixed(2) + " " + y1.toFixed(2) + " Z";
}

function buildWheel() {
  const wrap = el("div", "wheel-wrap");
  wrap.append(el("div", "pointer"));
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("class", "wheel-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Super token wheel");
  const rotor = document.createElementNS("http://www.w3.org/2000/svg", "g");
  rotor.setAttribute("id", "rotor");

  SLICES.forEach((slice, i) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", slicePath(i));
    path.setAttribute("fill", slice.color);
    path.setAttribute("stroke", "#24160f");
    path.setAttribute("stroke-width", "0.6");
    rotor.append(path);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const theta = i * 45 + 22.5;
    const flip = theta > 90 && theta < 270 ? " rotate(180 50 18)" : "";
    text.setAttribute("class", "slice-label");
    text.setAttribute("x", "50");
    text.setAttribute("y", "18");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("transform", "rotate(" + theta + " 50 50)" + flip);
    text.textContent = slice.label;
    rotor.append(text);
  });

  const rim = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rim.setAttribute("cx", "50");
  rim.setAttribute("cy", "50");
  rim.setAttribute("r", "46");
  rim.setAttribute("fill", "none");
  rim.setAttribute("stroke", "#24160f");
  rim.setAttribute("stroke-width", "1.6");
  rotor.append(rim);
  svg.append(rotor);

  const hub = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hub.setAttribute("cx", "50");
  hub.setAttribute("cy", "50");
  hub.setAttribute("r", "12");
  hub.setAttribute("fill", "#24160f");
  svg.append(hub);
  const hubText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  hubText.setAttribute("class", "hub-label");
  hubText.setAttribute("x", "50");
  hubText.setAttribute("y", "52.5");
  hubText.setAttribute("text-anchor", "middle");
  hubText.textContent = "SPIN";
  svg.append(hubText);

  wrap.append(svg);
  return { wrap, rotor };
}

function spinRotor(rotor, done) {
  const duration = reduceMotion ? 400 : 5800;
  const target = 360 * 6 + LANDING_TURN;
  let settled = false;
  function land() {
    if (settled) return;
    settled = true;
    done();
  }
  rotor.style.transition = "none";
  rotor.style.transform = "rotate(0deg)";
  void rotor.getBoundingClientRect();
  rotor.style.transition = "transform " + duration + "ms cubic-bezier(.12,.74,.08,1)";
  rotor.style.transform = "rotate(" + target + "deg)";
  const onEnd = (event) => {
    if (event.propertyName !== "transform") return;
    rotor.removeEventListener("transitionend", onEnd);
    land();
  };
  rotor.addEventListener("transitionend", onEnd);
  const ticks = window.setInterval(playTick, reduceMotion ? 400 : 160);
  window.setTimeout(() => window.clearInterval(ticks), reduceMotion ? 300 : 2400);
  window.setTimeout(() => {
    rotor.removeEventListener("transitionend", onEnd);
    window.clearInterval(ticks);
    land();
  }, duration + 300);
}

function renderFinale() {
  roundOpen = false;
  renderTrack();
  setPurse(grandTotal());
  const card = el("section", "card finale");
  const heading = el("h1", "prompt", state.superAwarded ? "The super token." : "One spin left.");
  const lede = el("p", "lede");
  lede.textContent = state.superAwarded
    ? STAR + ", the purse is closed and the spree is real."
    : STAR + ", the rounds are over. " + money(tokenTotal()) + " is already yours. Spin for the super token.";
  card.append(heading, lede);
  const wheel = buildWheel();
  card.append(wheel.wrap);
  const slot = el("div");
  card.append(slot);

  function showAward() {
    state.superAwarded = true;
    save();
    heading.textContent = "Super token.";
    lede.textContent = "Two hundred dollars, on top of every token you won.";
    playFanfare();
    burst(140);
    slot.replaceChildren();
    const medal = el("div", "medal");
    const wrap = el("div", "coin-wrap");
    wrap.append(coin(SUPER_TOKEN, "super"));
    medal.append(wrap);
    medal.append(el("h2", null, "Super token"));
    const total = el("p", "total-line", money(tokenTotal()));
    medal.append(total);
    medal.append(el("p", "lede", "Your shopping spree"));
    slot.append(medal);
    const from = tokenTotal();
    const to = from + SUPER_TOKEN;
    const duration = reduceMotion ? 200 : 1300;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      total.textContent = money(value);
      setPurse(value);
      if (p < 1) requestAnimationFrame(tick);
      else {
        bumpPurse();
        slot.append(buildReceipt(to));
        const perfect = to === 350;
        const signoff = el("p", "fine", perfect
          ? "Every token. A perfect three hundred and fifty. Spend it on things that make you grin."
          : "Spend it on things that make you grin. Bags are a group activity.");
        slot.append(signoff);
      }
    }
    requestAnimationFrame(tick);
  }

  if (state.superAwarded) {
    wheel.rotor.style.transform = "rotate(" + LANDING_TURN + "deg)";
    showAward();
  } else {
    const spin = button("Spin", "btn gold");
    spin.addEventListener("click", () => {
      spin.disabled = true;
      try { ac(); } catch (err) { /* sound is optional */ }
      spinRotor(wheel.rotor, showAward);
    });
    const spinRow = el("div", "actions center");
    spinRow.append(spin);
    slot.append(spinRow);
  }

  mount(card);
}

function buildReceipt(total) {
  const list = el("ol", "receipt");
  state.results.forEach((result, i) => {
    if (result !== "won") return;
    const item = el("li");
    item.append(el("span", null, ROUNDS[i].label), el("span", null, money(ROUNDS[i].prize)));
    list.append(item);
  });
  const superItem = el("li");
  superItem.append(el("span", null, "Super token"), el("span", null, money(SUPER_TOKEN)));
  list.append(superItem);
  const grand = el("li", "grand");
  grand.append(el("span", null, "Shopping spree"), el("span", null, money(total)));
  list.append(grand);
  return list;
}

function startFresh() {
  state.started = true;
  state.index = 0;
  state.results = Array(ROUNDS.length).fill(null);
  state.superAwarded = false;
  setPurse(0);
  save();
  renderRound();
}

function continueGame() {
  setPurse(grandTotal());
  if (state.index >= ROUNDS.length || state.superAwarded) renderFinale();
  else renderRound();
}

function renderIntro() {
  const card = el("section", "card");
  card.append(el("p", "kicker", "Admit one"));
  const title = el("h1", "display");
  title.append(document.createTextNode(STAR + "’s "));
  const em = el("em", null, "Birthday");
  title.append(em, document.createTextNode(" Quiz"));
  card.append(title);
  const note = el("div", "note");
  note.append(el("p", null, "Hi " + STAR + "! We wanted to treat you but you didn’t know what you wanted, so we thought we’d take you on a shopping spree. You’ll have one day, and we can go to any mall you want. The budget you win here is what you get to spend."));
  const bye = el("p", "signoff");
  bye.append(document.createTextNode("Good luck, have fun."));
  bye.append(document.createElement("br"));
  bye.append(document.createTextNode("Love Ashray and Adish"));
  note.append(bye);
  card.append(note);
  const actions = el("div", "actions");
  const start = button("Let’s go, " + STAR, "btn");
  start.addEventListener("click", () => {
    try { ac(); } catch (err) { /* ignore */ }
    startFresh();
  });
  actions.append(start);
  card.append(actions);
  mount(card);
}

document.addEventListener("keydown", (event) => {
  if (!roundOpen) return;
  if (event.key !== "1" && event.key !== "2" && event.key !== "3" && event.key !== "4") return;
  const target = stage.querySelector('.choice[data-key="' + event.key + '"]');
  if (target && !target.disabled) target.click();
});

muteBtn.addEventListener("click", () => {
  state.muted = !state.muted;
  muteBtn.textContent = state.muted ? "Sound off" : "Sound on";
  muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
  if (!state.muted) {
    try { ac(); playTick(); } catch (err) { /* ignore */ }
  }
  save();
});

function boot() {
  if (rehearsal) {
    state.started = true;
    state.index = ROUNDS.length;
    state.results = ROUNDS.map(() => "won");
    state.superAwarded = false;
    setPurse(tokenTotal());
    renderTrack();
    renderFinale();
    return;
  }
  const saved = loadSave();
  if (saved && saved.started) {
    applySave(saved);
    continueGame();
    return;
  }
  setPurse(0);
  renderTrack();
  renderIntro();
}

boot();
