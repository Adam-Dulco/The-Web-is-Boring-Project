/* ======================= */
/*   FRONT DOOR CONTROLS   */
/* ======================= */

const doorOverlay = document.getElementById("doorOverlay");
const doorOpenBtn = document.getElementById("doorOpenBtn");
const exitBtn = document.querySelector(".exit-btn");

/* DISCLAIMER */
const doorDisclaimer = document.getElementById("doorDisclaimer");
const disclaimerCloseBtn = document.getElementById("disclaimerCloseBtn");
const disclaimerMiniBtn = document.getElementById("disclaimerMiniBtn");

let doorState = "closed"; // "closed" | "opening" | "open" | "closing"
let doorTimer = null;

/* disclaimer accepted state */
let disclaimerAccepted =
  sessionStorage.getItem("doorDisclaimerCollapsed") === "true";

/* ================ */
/*   WINDOW TEXT    */
/* ================ */

const container = document.getElementById("windowText");
let originalLines = [];
let lineIndex = 0;
let typingTimeout = null;

if (container) {
  originalLines = Array.from(container.querySelectorAll("p")).map(
    (p) => p.textContent,
  );
  container.innerHTML = "";
}

function clearDoorTimer() {
  if (doorTimer) {
    clearTimeout(doorTimer);
    doorTimer = null;
  }
}

function typeLine(text, element, callback) {
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      typingTimeout = setTimeout(typeChar, 50);
    } else {
      typingTimeout = setTimeout(callback, 400);
    }
  }

  typeChar();
}

function startTyping() {
  if (!container) return;

  if (lineIndex < originalLines.length) {
    const p = document.createElement("p");
    container.appendChild(p);

    typeLine(originalLines[lineIndex], p, () => {
      lineIndex++;
      startTyping();
    });
  }
}

function resetTyping() {
  clearTimeout(typingTimeout);

  if (container) {
    container.innerHTML = "";
  }

  lineIndex = 0;
}

/* ======================= */
/*   DISCLAIMER CONTROL    */
/* ======================= */

function updateDisclaimerButtonState() {
  if (!disclaimerMiniBtn) return;

  disclaimerMiniBtn.classList.toggle("is-accepted", disclaimerAccepted);
  disclaimerMiniBtn.classList.toggle("is-not-accepted", !disclaimerAccepted);

  disclaimerMiniBtn.setAttribute(
    "aria-label",
    disclaimerAccepted ? "Disclaimer accepted" : "Disclaimer not yet accepted",
  );
}

function collapseDisclaimer() {
  if (!doorDisclaimer) return;

  doorDisclaimer.classList.add("is-collapsed");
  doorDisclaimer.classList.remove("is-gone");

  disclaimerAccepted = true;

  if (disclaimerMiniBtn) {
    disclaimerMiniBtn.setAttribute("aria-expanded", "false");
    disclaimerMiniBtn.classList.add("is-accepted");
    disclaimerMiniBtn.classList.remove("is-fading-out");
  }

  sessionStorage.setItem("doorDisclaimerCollapsed", "true");

  // wait long enough for the fade animation to actually finish
  setTimeout(() => {
    hideDisclaimerCompletely();

    if (disclaimerMiniBtn) {
      disclaimerMiniBtn.classList.remove("is-fading-out");
    }
  }, 2500);
}

function expandDisclaimer() {
  if (!doorDisclaimer) return;

  doorDisclaimer.classList.remove("is-collapsed", "is-gone");

  if (disclaimerMiniBtn) {
    disclaimerMiniBtn.setAttribute("aria-expanded", "true");
  }

  updateDisclaimerButtonState();
}

function hideDisclaimerCompletely() {
  if (!doorDisclaimer) return;
  doorDisclaimer.classList.add("is-gone");
}

/* ===================== */
/*   DOOR OPEN WARNING   */
/* ===================== */

const doorWarning = document.getElementById("doorWarning");

function showDoorWarning() {
  if (!doorWarning) return;

  doorWarning.classList.add("is-visible");

  setTimeout(() => {
    doorWarning.classList.remove("is-visible");
  }, 5000);
}

/* ======================= */
/*   DOOR STATE CONTROL    */
/* ======================= */

function showDoorOverlay() {
  if (!doorOverlay) return;
  doorOverlay.classList.remove("hidden");
}

function hideDoorOverlay() {
  if (!doorOverlay) return;
  doorOverlay.classList.add("hidden");
}

function setDoorsOpen() {
  if (!doorOverlay) return;
  doorOverlay.classList.add("open");
}

function setDoorsClosed() {
  if (!doorOverlay) return;
  doorOverlay.classList.remove("open");
}

function nextPaint(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

function openDoors() {
  if (!disclaimerAccepted) {
    showDoorWarning(); // themed warning instead of alert
    return;
  }

  if (!doorOverlay) return;
  if (doorState === "opening" || doorState === "open") return;

  clearDoorTimer();
  resetTyping();

  doorState = "opening";
  sessionStorage.setItem("doorsOpened", "true");

  showDoorOverlay();

  nextPaint(() => {
    hideDisclaimerCompletely();
    setDoorsOpen();

    doorTimer = setTimeout(() => {
      hideDoorOverlay();
      doorState = "open";
      startTyping();
      doorTimer = null;
    }, 3000);
  });
}

function closeDoors() {
  if (!doorOverlay) return;
  if (doorState === "closing" || doorState === "closed") return;

  clearDoorTimer();
  resetTyping();

  doorState = "closing";

  // reset door + disclaimer state on exit
  sessionStorage.removeItem("doorsOpened");
  sessionStorage.removeItem("doorDisclaimerCollapsed");
  disclaimerAccepted = false;

  if (disclaimerMiniBtn) {
    disclaimerMiniBtn.classList.remove("is-accepted");
  }

  updateDisclaimerButtonState();

  showDoorOverlay();

  nextPaint(() => {
    setDoorsClosed();

    doorTimer = setTimeout(() => {
      doorState = "closed";
      doorTimer = null;

      window.location.href = "../index.html";
    }, 1600);
  });
}

/* INITIAL STATE */

updateDisclaimerButtonState();

if (doorOverlay) {
  if (sessionStorage.getItem("doorsOpened")) {
    setDoorsOpen();
    hideDoorOverlay();
    hideDisclaimerCompletely();
    doorState = "open";
    startTyping();
  } else {
    setDoorsClosed();
    showDoorOverlay();
    doorState = "closed";

    if (doorDisclaimer) {
      const disclaimerCollapsed =
        sessionStorage.getItem("doorDisclaimerCollapsed") === "true";

      if (disclaimerCollapsed) {
        collapseDisclaimer();
      } else {
        expandDisclaimer();
      }
    }
  }
}

/* BUTTON EVENTS */

if (doorOpenBtn) {
  doorOpenBtn.addEventListener("click", openDoors);
}

if (exitBtn) {
  exitBtn.addEventListener("click", closeDoors);
}

/* DISCLAIMER BUTTON EVENTS */

if (disclaimerCloseBtn) {
  disclaimerCloseBtn.addEventListener("click", collapseDisclaimer);
}

if (disclaimerMiniBtn) {
  disclaimerMiniBtn.addEventListener("click", expandDisclaimer);
}

/*====================*/
/* TANK SOUND EFFECTS */
/*====================*/

const tank = document.getElementById("tank");
const sound = document.getElementById("tankSound");

let audioUnlocked = false;

document.addEventListener(
  "click",
  () => {
    if (!audioUnlocked && sound) {
      sound
        .play()
        .then(() => {
          sound.pause();
          sound.currentTime = 0;
          audioUnlocked = true;
        })
        .catch((err) => {
          console.log("Audio unlock failed:", err);
        });
    }
  },
  { once: true },
);

if (tank && sound) {
  tank.addEventListener("animationstart", () => {
    sound.currentTime = 0;
    sound.volume = 0.5;

    sound.play().catch((err) => {
      console.log("Sound play blocked:", err);
    });
  });

  tank.addEventListener("animationend", () => {
    tank.setAttribute("camera-controls", "");
    tank.style.pointerEvents = "auto";

    const fade = setInterval(() => {
      if (sound.volume > 0.05) {
        sound.volume -= 0.05;
      } else {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = 0.5;
        clearInterval(fade);
      }
    }, 100);
  });
}

/*====================*/
/* RAIN + LIGHTNING   */
/*====================*/

window.addEventListener("DOMContentLoaded", () => {
  const rainContainer = document.querySelector(".rain");
  const imageContainer = document.querySelector(".rain-img-container");
  const lightning = document.querySelector(".lightning");

  if (rainContainer) {
    const dropCount = 180;

    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement("span");
      drop.classList.add("rain-drop");

      const size = Math.random();
      if (size < 0.33) {
        drop.classList.add("small");
      } else if (size < 0.66) {
        drop.classList.add("medium");
      } else {
        drop.classList.add("large");
      }

      drop.style.left = Math.random() * 100 + "%";
      drop.style.animationDuration = 0.45 + Math.random() * 0.55 + "s";
      drop.style.animationDelay = -Math.random() * 2 + "s";

      rainContainer.appendChild(drop);
    }
  }

  if (!rainContainer || !imageContainer || !lightning) return;

  function triggerLightning() {
    const isDouble = Math.random() > 0.55;

    lightning.classList.remove("flash", "flash-double");
    void lightning.offsetWidth;

    imageContainer.classList.add("lightning-active");
    lightning.classList.add(isDouble ? "flash-double" : "flash");

    setTimeout(
      () => {
        imageContainer.classList.remove("lightning-active");
        lightning.classList.remove("flash", "flash-double");
      },
      isDouble ? 450 : 220,
    );

    const nextStrike = 1500 + Math.random() * 7000;
    setTimeout(triggerLightning, nextStrike);
  }

  const firstStrike = 1000 + Math.random() * 1000;
  setTimeout(triggerLightning, firstStrike);
});

/* CLOCK */

function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

if (document.getElementById("clock")) {
  updateClock();
  setInterval(updateClock, 1000);
}

/* MEDIA TEXT BOX REVEAL ON SCROLL */

function updateMediaTextReveal() {
  const section = document.querySelector(".media-room-container");
  const box1 = document.querySelector(".box-1");
  const box2 = document.querySelector(".box-2");
  const box3 = document.querySelector(".box-3");

  if (!section || !box1 || !box2 || !box3) return;

  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);

  const trigger = 0.5;

  box1.classList.toggle("is-visible", progress > trigger);
  box2.classList.toggle("is-visible", progress > trigger);
  box3.classList.toggle("is-visible", progress > trigger);
}

window.addEventListener("scroll", updateMediaTextReveal);
window.addEventListener("resize", updateMediaTextReveal);
window.addEventListener("DOMContentLoaded", updateMediaTextReveal);

/* ================================ */
/*   RETURN TO TOP OF PAGE BUTTON   */
/* ================================ */

const returnToLandingDestinationButton = document.getElementById(
  "returnToLandingDestinationButton",
);

if (returnToLandingDestinationButton) {
  returnToLandingDestinationButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ========================== */
/* WHITEBOARD WRITING SYSTEM  */
/* ========================== */

const whiteboardTextBox = document.getElementById("whiteboardTextBox");

let whiteboardLines = [];
let whiteboardLineIndex = 0;
let whiteboardTypingTimeout = null;
let whiteboardAutoScroll = true;

if (whiteboardTextBox) {
  whiteboardLines = Array.from(whiteboardTextBox.querySelectorAll("p")).map(
    (p) => p.textContent,
  );

  whiteboardTextBox.innerHTML = "";

  whiteboardTextBox.addEventListener("scroll", () => {
    const distanceFromBottom =
      whiteboardTextBox.scrollHeight -
      whiteboardTextBox.scrollTop -
      whiteboardTextBox.clientHeight;

    whiteboardAutoScroll = distanceFromBottom < 30;
  });
}

function clearWhiteboardTypingTimeout() {
  if (whiteboardTypingTimeout) {
    clearTimeout(whiteboardTypingTimeout);
    whiteboardTypingTimeout = null;
  }
}

function whiteboardScrollToBottom(force = false) {
  if (!whiteboardTextBox) return;

  if (force || whiteboardAutoScroll) {
    whiteboardTextBox.scrollTop = whiteboardTextBox.scrollHeight;
  }
}

function typeWhiteboardLine(text, element, callback) {
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;

      whiteboardScrollToBottom();

      const char = text.charAt(i - 1);
      const nextDelay = [".", ",", "!", "?", ":"].includes(char) ? 100 : 35;

      whiteboardTypingTimeout = setTimeout(typeChar, nextDelay);
    } else {
      whiteboardTypingTimeout = setTimeout(callback, 180);
    }
  }

  typeChar();
}

function startWhiteboardTyping() {
  if (!whiteboardTextBox) return;

  if (whiteboardLineIndex < whiteboardLines.length) {
    const p = document.createElement("p");
    whiteboardTextBox.appendChild(p);

    whiteboardScrollToBottom();

    typeWhiteboardLine(whiteboardLines[whiteboardLineIndex], p, () => {
      whiteboardLineIndex++;
      startWhiteboardTyping();
    });
  }
}

function resetWhiteboardTyping() {
  clearWhiteboardTypingTimeout();

  if (whiteboardTextBox) {
    whiteboardTextBox.innerHTML = "";
    whiteboardTextBox.scrollTop = 0;
  }

  whiteboardLineIndex = 0;
  whiteboardAutoScroll = true;
}

window.addEventListener("DOMContentLoaded", () => {
  startWhiteboardTyping();
});

/* ======================= */
/* PARCEL CONFETTI BURST   */
/* ======================= */

const parcelImage = document.querySelector(".parcel-img");
const donateButton = document.querySelector(".donate");

if (parcelImage) {
  parcelImage.addEventListener("click", burstConfettiFromParcel);
}

if (donateButton) {
  donateButton.addEventListener("click", burstConfettiFromParcel);
}

function burstConfettiFromParcel() {
  const container = document.querySelector(".parcel-container");
  const parcelImage = document.querySelector(".parcel-img");

  if (!container || !parcelImage) return;

  const containerRect = container.getBoundingClientRect();
  const parcelRect = parcelImage.getBoundingClientRect();

  const originX = parcelRect.left - containerRect.left + parcelRect.width / 2;
  const originY = parcelRect.top - containerRect.top + parcelRect.height / 2;

  const colours = [
    "#ff4d6d",
    "#ffd166",
    "#06d6a0",
    "#118ab2",
    "#8338ec",
    "#ffffff",
  ];

  const totalPieces = 36;

  for (let i = 0; i < totalPieces; i++) {
    const piece = document.createElement("span");
    piece.classList.add("confetti-piece");

    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 140;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance + 40;
    const rotate = `${Math.random() * 720 - 360}deg`;

    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.backgroundColor =
      colours[Math.floor(Math.random() * colours.length)];
    piece.style.setProperty("--confetti-x", `${x}px`);
    piece.style.setProperty("--confetti-y", `${y}px`);
    piece.style.setProperty("--confetti-rotate", rotate);

    if (Math.random() > 0.5) {
      piece.style.width = "8px";
      piece.style.height = "8px";
      piece.style.borderRadius = "50%";
    }

    container.appendChild(piece);

    piece.addEventListener("animationend", () => {
      piece.remove();
    });
  }
}

/* ================================== */
/* ABOUT PAGE HORIZONTAL IMAGE MOTION */
/* ================================== */

window.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("about-horizontal")) return;

  const stage = document.querySelector(".about-horizontal-container");
  const track = document.getElementById("aboutHorizontalTrack");
  const spinBtn = document.getElementById("spinBtn");
  if (!stage || !track) return;

  const originalPanels = Array.from(track.children);
  originalPanels.forEach((panel) => {
    const clone = panel.cloneNode(true);
    track.appendChild(clone);
  });

  let currentX = 0;
  let targetX = 0;
  let loopPoint = 0;
  let ticking = false;

  let isSpinning = false;
  let spinTimeout = null;

  const spinSpeed = 700;
  const spinDuration = 2200;

  let currentPanelIndex = 0;

  function updateBounds() {
    const trackWidth = track.scrollWidth;
    loopPoint = trackWidth / 2;

    track.style.transform = `translate3d(${-currentX}px, 0, 0)`;
  }

  function wrapLoop() {
    if (currentX >= loopPoint) {
      currentX -= loopPoint;
      targetX -= loopPoint;
    }

    if (currentX < 0) {
      currentX += loopPoint;
      targetX += loopPoint;
    }
  }

  function getNearestPanelIndex() {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    originalPanels.forEach((panel, index) => {
      const distance = Math.abs(panel.offsetLeft - currentX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  function getRandomPanelIndexExcludingCurrent() {
    if (originalPanels.length <= 1) return 0;

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * originalPanels.length);
    } while (newIndex === currentPanelIndex);

    return newIndex;
  }

  function getSnapXForPanel(index) {
    const panel = originalPanels[index];
    const panelX = panel.offsetLeft;

    const minimumForwardTravel = 300;

    let snapX = panelX;

    while (snapX <= currentX + minimumForwardTravel) {
      snapX += loopPoint;
    }

    return snapX;
  }

  function animate() {
    if (isSpinning) {
      targetX += spinSpeed;
    }

    currentX += (targetX - currentX) * 0.12;

    wrapLoop();

    track.style.transform = `translate3d(${-currentX}px, 0, 0)`;

    const stillEasing = Math.abs(targetX - currentX) > 0.2;
    const stillSpinning = isSpinning;

    if (stillEasing || stillSpinning) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function startAnimation() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  }

  updateBounds();
  window.addEventListener("resize", updateBounds);

  window.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      targetX += event.deltaY;
      startAnimation();
    },
    { passive: false },
  );

  if (spinBtn) {
    spinBtn.addEventListener("click", () => {
      if (isSpinning) return;

      if (spinTimeout) {
        clearTimeout(spinTimeout);
      }

      currentPanelIndex = getNearestPanelIndex();

      isSpinning = true;
      startAnimation();

      spinTimeout = setTimeout(() => {
        isSpinning = false;

        const nextPanelIndex = getRandomPanelIndexExcludingCurrent();
        const snapX = getSnapXForPanel(nextPanelIndex);

        targetX = snapX;
        currentPanelIndex = nextPanelIndex;

        spinTimeout = null;
        startAnimation();
      }, spinDuration);
    });
  }
});

/* ============================== */
/*   PAGE VORTEX NAV TRANSITION   */
/* ============================== */

function setupPageLinkTransitions() {
  const links = document.querySelectorAll("a[href]");
  const vortex = document.querySelector(
    ".center-vortex-container model-viewer",
  );

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const url = new URL(href, window.location.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();

      document.body.classList.add("is-transitioning");
      document.body.style.overflow = "hidden";

      if (vortex) {
        vortex.setAttribute("rotation-per-second", "-3000deg");
      }

      setTimeout(() => {
        window.location.href = url.href;
      }, 700);
    });
  });
}

window.addEventListener("DOMContentLoaded", setupPageLinkTransitions);

/* ============================ */
/*   HELP PAGE - PAPER POPUPS   */
/* ============================ */

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("helpPaperModal");
  const backdrop = document.getElementById("helpPaperBackdrop");
  const closeBtn = document.getElementById("helpPaperClose");
  const titleEl = document.getElementById("helpPaperTitle");
  const bodyEl = document.getElementById("helpPaperBody");
  const triggers = document.querySelectorAll(".help-desk-scene .desk-text");

  if (
    !modal ||
    !backdrop ||
    !closeBtn ||
    !titleEl ||
    !bodyEl ||
    !triggers.length
  ) {
    return;
  }

  let lastTrigger = null;

  function openHelpPaperFromSource(sourceId, triggerEl) {
    const source = document.getElementById(sourceId);
    if (!source) return;

    const heading = source.querySelector("h1, h2, h3, h4, h5, h6");
    titleEl.textContent = heading ? heading.textContent : "Help";

    bodyEl.innerHTML = source.innerHTML;

    const duplicateHeading = bodyEl.querySelector("h1, h2, h3, h4, h5, h6");
    if (duplicateHeading) {
      duplicateHeading.remove();
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    lastTrigger = triggerEl;
    closeBtn.focus();
  }

  function closeHelpPaper() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const sourceId = trigger.dataset.helpTarget;
      openHelpPaperFromSource(sourceId, trigger);
    });
  });

  closeBtn.addEventListener("click", closeHelpPaper);
  backdrop.addEventListener("click", closeHelpPaper);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeHelpPaper();
    }
  });
});

/* =================================*/
/*  HELP PAGE - FIREPLACE + EMBERS  */
/* =================================*/

document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector(".help-desk-scene");
  const fire = document.getElementById("fireplaceFire");
  const light = document.querySelector(".fireplace-light");
  const canvas = document.getElementById("fireplaceEmbers");

  if (!scene || !fire || !light || !canvas) return;

  const ctx = canvas.getContext("2d");
  let embers = [];
  let rafId = null;
  let lastTime = 0;

  function resizeCanvas() {
    const rect = scene.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getFireOrigin() {
    const sceneRect = scene.getBoundingClientRect();
    const fireRect = fire.getBoundingClientRect();

    return {
      x: fireRect.left - sceneRect.left + fireRect.width / 2,
      y: fireRect.top - sceneRect.top + fireRect.height * 0.9,
      width: fireRect.width,
      height: fireRect.height,
    };
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createEmber() {
    const origin = getFireOrigin();

    return {
      x: origin.x + rand(-origin.width * 0.18, origin.width * 0.18),
      y: origin.y + rand(-4, 4),
      vx: rand(-0.08, 0.08),
      vy: rand(-0.8, -0.35),
      size: rand(1.5, 3.8),
      alpha: rand(0.45, 0.95),
      life: rand(45, 95),
      age: 0,
      drift: rand(0.2, 1.1),
      glow: rand(4, 10),
    };
  }

  function spawnEmbers() {
    const origin = getFireOrigin();
    const count = Math.random() < 0.35 ? 2 : 1;

    for (let i = 0; i < count; i++) {
      embers.push(createEmber());
    }

    embers = embers.filter(
      (ember) =>
        ember.age < ember.life && ember.y > origin.y - origin.height * 7.2,
    );
  }

  function updateEmbers() {
    embers.forEach((ember) => {
      ember.age += 1;
      ember.x += ember.vx + Math.sin(ember.age * 0.08) * ember.drift * 0.08;
      ember.y += ember.vy;
      ember.alpha *= 0.988;
      ember.size *= 0.996;
    });
  }

  function drawEmbers() {
    const rect = scene.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    embers.forEach((ember) => {
      const gradient = ctx.createRadialGradient(
        ember.x,
        ember.y,
        0,
        ember.x,
        ember.y,
        ember.glow,
      );

      gradient.addColorStop(0, `rgba(255,255,220,${ember.alpha})`);
      gradient.addColorStop(0.25, `rgba(255,210,110,${ember.alpha * 0.95})`);
      gradient.addColorStop(0.55, `rgba(255,120,40,${ember.alpha * 0.55})`);
      gradient.addColorStop(1, "rgba(255,80,20,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,220,140,${ember.alpha})`;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function updateFireVisual(time) {
    const t = time * 0.001;

    const scaleX = 1 + Math.sin(t * 6) * 0.01;
    const scaleY = 1 + Math.sin(t * 8) * 0.015;

    fire.style.transform = `translate(-50%, 0) scale(${scaleX}, ${scaleY})`;

    const lightOpacity = 0.66 + Math.sin(t * 5) * 0.03;
    light.style.opacity = lightOpacity;
  }

  function animate(time) {
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    updateFireVisual(time);

    if (delta > 0) {
      if (Math.random() < 0.02) {
        spawnEmbers();
      }
      updateEmbers();
      drawEmbers();
    }

    rafId = requestAnimationFrame(animate);
  }

  function startFireplace() {
    resizeCanvas();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resizeCanvas);
  startFireplace();
});
