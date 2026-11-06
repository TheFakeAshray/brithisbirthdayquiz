// Brithi’s Birthday Bonanza
// Edit STAR, the prizes, and the questions here.
// A perfect game is $200 in tokens + the $300 super token = $500.
// The wheel always lands on the super token. That is the gift.

const STAR = "Brithi";
const SUPER_TOKEN = 300;
const SAVE_KEY = "brithi-bonanza-v1";

const ROUNDS = [
  {
    kind: "quiz",
    label: "Main character",
    prize: 15,
    prompt: "Thirteen rounds from now, somebody is going shopping. Who?",
    choices: [
      { text: STAR, correct: true },
      { text: "The ceiling fan", correct: false },
      { text: "A pile of unmatched socks", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Birthday breakfast",
    prize: 12,
    prompt: "Birthday breakfast. Choose wisely.",
    choices: [
      { text: "Cake. Fork optional.", correct: true },
      { text: "One dignified ice cube", correct: false },
      { text: "Plain rice and a lecture", correct: false }
    ]
  },
  {
    kind: "balloons",
    label: "Balloon tax",
    prize: 10,
    prompt: "Pop 8 balloons.",
    detail: "They wobble on purpose. Eight pops pockets the token."
  },
  {
    kind: "quiz",
    label: "Shop doors",
    prize: 8,
    prompt: "The shop doors open. What is the correct first move?",
    choices: [
      { text: "Walk toward the thing that makes you grin", correct: true },
      { text: "Report to the returns desk, just in case", correct: false },
      { text: "Hide in a rack of coats until next year", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "Cake science",
    prize: 15,
    prompt: "Science question. How much birthday cake should be eaten?",
    choices: [
      { text: "Enough that the day feels like a birthday", correct: true },
      { text: "A medically suspicious crumb", correct: false },
      { text: "None. Stare at it. Build character.", correct: false }
    ]
  },
  {
    kind: "memory",
    label: "Match the party",
    prize: 12,
    prompt: "Match the party pairs.",
    detail: "Flip two. Remember where the cake went."
  },
  {
    kind: "quiz",
    label: "Golden token",
    prize: 50,
    golden: true,
    prompt: "The golden rule of this shopping spree is…",
    choices: [
      { text: `If it makes ${STAR} grin, it goes in the cart.`, correct: true },
      { text: "Beige only. Sensible only. Fun never.", correct: false },
      { text: "Put it back if it looks like a good time.", correct: false }
    ]
  },
  {
    kind: "quiz",
    label: "The perfect thing",
    prize: 15,
    prompt: "You have found the exact right thing. Your line is:",
    choices: [
      { text: "This one.", correct: true },
      { text: "I’ll think about it until the season changes.", correct: false },
      { text: "Does it come in a color I don’t like?", correct: false }
    ]
  },
  {
    kind: "catch",
    label: "Gift rain",
    prize: 10,
    prompt: "Catch 7 gifts.",
    detail: "The basket follows your finger. Seven catches and the token is yours."
  },
  {
    kind: "quiz",
    label: "Family duty",
    prize: 8,
    prompt: `While ${STAR} shops, the family should…`,
    choices: [
      { text: "Carry the bags and keep the compliments coming", correct: true },
      { text: "Suggest something practical instead", correct: false },
      { text: "Wait in total silence, for some reason", correct: false }
    ]
  },
  {
    kind: "thisorthat",
    label: "This or that",
    prize: 15,
    prompt: "Fast picks. Trust the birthday instinct.",
    pairs: [
      { prompt: "More birthday?", a: "Sprinkles", b: "Plain oatmeal", correct: "a" },
      { prompt: "Bring which one?", a: "A stapler", b: "Confetti", correct: "b" },
      { prompt: "Better afternoon?", a: "Shopping together", b: "Sorting the junk drawer", correct: "a" },
      { prompt: "What should we hear?", a: "Hold music", b: "The birthday song", correct: "b" }
    ]
  },
  {
    kind: "reaction",
    label: "Present timing",
    prize: 15,
    prompt: "Tap the present the moment it pops.",
    detail: "Three clean taps. Waiting is the whole trick."
  },
  {
    kind: "quiz",
    label: "Name on the ticket",
    prize: 15,
    prompt: "Last one. Whose birthday bonanza is this?",
    choices: [
      { text: `${STAR}’s`, correct: true },
      { text: "The mannequin by the window", correct: false },
      { text: "Whoever finds the receipt later", correct: false }
    ]
  }
];

const SLICES = [
  { label: "$300", color: "#ffe29a" },
  { label: "$40", color: "#ff8b95" },
  { label: "$80", color: "#ffd36a" },
  { label: "$120", color: "#7ee0d2" },
  { label: "$20", color: "#ffb3c7" },
  { label: "$160", color: "#b7c8ff" },
  { label: "$60", color: "#ffc49a" },
  { label: "$250", color: "#ddd0ff" }
];

// Six full turns, then stop with $300 under the pointer.
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
  try {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify({
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
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.results) || data.results.length !== ROUNDS.length) return null;
    return data;
  } catch (err) {
    return null;
  }
}

function clearSave() {
  try { sessionStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
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

function focusHeading(node) {
  const heading = node.querySelector("h1");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function mount(node) {
  halt();
  halt = () => {};
  stage.replaceChildren(node);
  focusHeading(node);
}

function prizeRow(round, index) {
  const row = el("div", "prize-row");
  const meta = el("div");
  meta.append(el("p", "round-count", "Round " + (index + 1) + " of " + ROUNDS.length));
  meta.append(el("p", "kicker", round.golden ? "Golden token" : round.label));
  row.append(meta, coin(round.prize));
  return row;
}

function finishRound(won) {
  if (!roundOpen) return;
  roundOpen = false;
  halt();
  const round = ROUNDS[state.index];
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
  next.addEventListener("click", () => {
    state.index += 1;
    save();
    if (state.index >= ROUNDS.length) renderFinale();
    else renderRound();
  });
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
  card.append(el("h1", "prompt", round.prompt));
  const choices = shuffle(round.choices);
  const list = el("div", "choices");
  const status = el("p", "status", round.golden ? "This token is worth fifty dollars." : "Pick the birthday answer.");
  let strikes = 0;
  let locked = false;

  choices.forEach((choice, choiceIndex) => {
    const choiceBtn = buttonEl(choice.text, "choice");
    choiceBtn.addEventListener("click", () => {
      if (locked || choiceBtn.disabled) return;
      if (choice.correct) {
        locked = true;
        choiceBtn.classList.add("is-correct");
        status.textContent = "Yes. That one.";
        window.setTimeout(() => finishRound(true), 450);
        return;
      }
      strikes += 1;
      choiceBtn.classList.add("is-wrong");
      choiceBtn.disabled = true;
      playWrong();
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
      if (strikes >= 2) {
        locked = true;
        status.textContent = "Not this round.";
        const right = list.querySelectorAll(".choice")[choices.findIndex((item) => item.correct)];
        if (right) right.classList.add("is-correct");
        window.setTimeout(() => finishRound(false), 700);
      } else {
        status.textContent = "Nope. One more try.";
      }
    });
    choiceBtn.dataset.key = String(choiceIndex + 1);
    list.append(choiceBtn);
  });

  card.append(list, status);
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
    lede.textContent = "Three hundred dollars, on top of every token you won.";
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
        const again = button("Play again", "btn secondary");
        again.addEventListener("click", resetGame);
        const actions = el("div", "actions");
        actions.append(again);
        slot.append(actions);
        const perfect = to === 500;
        const signoff = el("p", "fine", perfect
          ? "Every token. A perfect five hundred. Spend it on things that make you grin."
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

function resetGame() {
  clearSave();
  state.started = false;
  state.index = 0;
  state.results = Array(ROUNDS.length).fill(null);
  state.superAwarded = false;
  setPurse(0);
  renderTrack();
  renderIntro();
}

function startFresh() {
  clearSave();
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
  const saved = !state.started ? loadSave() : null;
  const card = el("section", "card");
  card.append(el("p", "kicker", "Admit one"));
  const title = el("h1", "display");
  title.append(document.createTextNode(STAR + "’s "));
  const em = el("em", null, "Birthday");
  title.append(em, document.createTextNode(" Bonanza"));
  card.append(title);
  card.append(el("p", "lede", "A shopping spree is hiding in this quiz. Win a round, pocket a token. Thirteen rounds, then the wheel."));
  const rules = el("ul", "rules");
  [
    ["Most tokens", " are $8 to $15."],
    ["One golden token", " is worth $50."],
    ["The last spin", " pays a super token."]
  ].forEach((parts) => {
    const li = el("li");
    li.append(el("strong", null, parts[0]), document.createTextNode(parts[1]));
    rules.append(li);
  });
  card.append(rules);
  const actions = el("div", "actions");
  if (saved && (saved.index > 0 || saved.results.some(Boolean) || saved.superAwarded)) {
    const cont = button("Continue the spree", "btn");
    cont.addEventListener("click", () => {
      applySave(saved);
      try { ac(); } catch (err) { /* ignore */ }
      continueGame();
    });
    const fresh = button("Start over", "btn secondary");
    fresh.addEventListener("click", () => {
      try { ac(); } catch (err) { /* ignore */ }
      startFresh();
    });
    actions.append(cont, fresh);
    card.append(el("p", "fine", "This tab remembers a game in progress."));
  } else {
    const start = button("Let’s go, " + STAR, "btn");
    start.addEventListener("click", () => {
      try { ac(); } catch (err) { /* ignore */ }
      startFresh();
    });
    actions.append(start);
  }
  card.append(actions);
  mount(card);
}

document.addEventListener("keydown", (event) => {
  if (!roundOpen) return;
  if (event.key !== "1" && event.key !== "2" && event.key !== "3") return;
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
  const params = new URLSearchParams(window.location.search);
  if (params.get("preview") === "ending") {
    state.started = true;
    state.index = ROUNDS.length;
    state.results = ROUNDS.map(() => "won");
    state.superAwarded = false;
    setPurse(tokenTotal());
    renderTrack();
    renderFinale();
    return;
  }
  setPurse(0);
  renderTrack();
  renderIntro();
}

boot();
