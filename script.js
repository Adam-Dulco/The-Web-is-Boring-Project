/* =========================================================
   01. FRONT DOOR / DISCLAIMER / WINDOW TEXT
   ========================================================= */

const doorOverlay = document.getElementById("doorOverlay");
const doorOpenBtn = document.getElementById("doorOpenBtn");
const exitBtn = document.querySelector(".exit-btn");

const doorDisclaimer = document.getElementById("doorDisclaimer");
const disclaimerCloseBtn = document.getElementById("disclaimerCloseBtn");
const disclaimerMiniBtn = document.getElementById("disclaimerMiniBtn");
const doorWarning = document.getElementById("doorWarning");

const container = document.getElementById("windowText");

let doorState = "closed"; // "closed" | "opening" | "open" | "closing"
let doorTimer = null;
let typingTimeout = null;
let warningTimeout = null;

let disclaimerAccepted =
  sessionStorage.getItem("doorDisclaimerCollapsed") === "true";

let originalLines = [];
let lineIndex = 0;

if (container) {
  originalLines = Array.from(
    container.querySelectorAll("p"),
    (p) => p.textContent,
  );
  container.innerHTML = "";
}

/* -------------------------
   01A. Shared Helpers
   ------------------------- */

function clearTimer(timerId) {
  if (timerId) {
    clearTimeout(timerId);
  }
  return null;
}

function nextPaint(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/* -------------------------
   01B. Window Typing
   ------------------------- */

function typeLine(text, element, callback) {
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i += 1;
      typingTimeout = setTimeout(typeChar, 50);
    } else {
      typingTimeout = setTimeout(callback, 400);
    }
  }

  typeChar();
}

function startTyping() {
  if (!container || lineIndex >= originalLines.length) return;

  const p = document.createElement("p");
  container.appendChild(p);

  typeLine(originalLines[lineIndex], p, () => {
    lineIndex += 1;
    startTyping();
  });
}

function resetTyping() {
  typingTimeout = clearTimer(typingTimeout);

  if (container) {
    container.innerHTML = "";
  }

  lineIndex = 0;
}

/* -------------------------
   01C. Disclaimer Control
   ------------------------- */

function updateDisclaimerButtonState() {
  if (!disclaimerMiniBtn) return;

  disclaimerMiniBtn.classList.toggle("is-accepted", disclaimerAccepted);
  disclaimerMiniBtn.classList.remove("is-not-accepted");

  disclaimerMiniBtn.setAttribute(
    "aria-label",
    disclaimerAccepted ? "Disclaimer accepted" : "Disclaimer not yet accepted",
  );
}

function hideDisclaimerCompletely() {
  if (!doorDisclaimer) return;
  doorDisclaimer.classList.add("is-gone");
}

function expandDisclaimer() {
  if (!doorDisclaimer) return;

  doorDisclaimer.classList.remove("is-collapsed", "is-gone");

  if (disclaimerMiniBtn) {
    disclaimerMiniBtn.setAttribute("aria-expanded", "true");
  }

  updateDisclaimerButtonState();
}

function collapseDisclaimer() {
  if (!doorDisclaimer) return;

  doorDisclaimer.classList.add("is-collapsed");
  doorDisclaimer.classList.remove("is-gone");

  disclaimerAccepted = true;
  sessionStorage.setItem("doorDisclaimerCollapsed", "true");

  if (disclaimerMiniBtn) {
    disclaimerMiniBtn.setAttribute("aria-expanded", "false");
    disclaimerMiniBtn.classList.add("is-accepted");
    disclaimerMiniBtn.classList.remove("is-fading-out");
  }

  updateDisclaimerButtonState();

  setTimeout(() => {
    hideDisclaimerCompletely();

    if (disclaimerMiniBtn) {
      disclaimerMiniBtn.classList.remove("is-fading-out");
    }
  }, 2500);
}

/* -------------------------
   01D. Door Warning
   ------------------------- */

function showDoorWarning() {
  if (!doorWarning) return;

  doorWarning.classList.add("is-visible");
  warningTimeout = clearTimer(warningTimeout);

  warningTimeout = setTimeout(() => {
    doorWarning.classList.remove("is-visible");
    warningTimeout = null;
  }, 5000);
}

/* -------------------------
   01E. Door State Control
   ------------------------- */

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

function openDoors() {
  if (!disclaimerAccepted) {
    showDoorWarning();
    return;
  }

  if (!doorOverlay || doorState === "opening" || doorState === "open") return;

  doorTimer = clearTimer(doorTimer);
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
  if (!doorOverlay || doorState === "closing" || doorState === "closed") return;

  doorTimer = clearTimer(doorTimer);
  resetTyping();

  doorState = "closing";

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

/* -------------------------
   01F. Door Initial State
   ------------------------- */

function initialiseDoors() {
  updateDisclaimerButtonState();

  if (!doorOverlay) return;

  const doorsOpened = sessionStorage.getItem("doorsOpened") === "true";
  const disclaimerCollapsed =
    sessionStorage.getItem("doorDisclaimerCollapsed") === "true";

  if (doorsOpened) {
    setDoorsOpen();
    hideDoorOverlay();
    hideDisclaimerCompletely();
    doorState = "open";
    startTyping();
    return;
  }

  setDoorsClosed();
  showDoorOverlay();
  doorState = "closed";

  if (!doorDisclaimer) return;

  if (disclaimerCollapsed) {
    collapseDisclaimer();
  } else {
    expandDisclaimer();
  }
}

/* -------------------------
   01G. Door Event Binding
   ------------------------- */

if (doorOpenBtn) {
  doorOpenBtn.addEventListener("click", openDoors);
}

if (exitBtn) {
  exitBtn.addEventListener("click", closeDoors);
}

if (disclaimerCloseBtn) {
  disclaimerCloseBtn.addEventListener("click", collapseDisclaimer);
}

if (disclaimerMiniBtn) {
  disclaimerMiniBtn.addEventListener("click", expandDisclaimer);
}

initialiseDoors();

/* =========================================================
   02. TANK SOUND EFFECTS
   ========================================================= */

const tank = document.getElementById("tank");
const sound = document.getElementById("tankSound");

let audioUnlocked = false;

document.addEventListener(
  "click",
  () => {
    if (!audioUnlocked || !sound) {
      if (!sound) return;
    }

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

/* =========================================================
   03. CLOCK
   ========================================================= */

const clock = document.getElementById("clock");

function updateClock() {
  if (!clock) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

if (clock) {
  updateClock();
  setInterval(updateClock, 1000);
}

/* =========================================================
   04. MEDIA TEXT REVEAL ON SCROLL
   ========================================================= */

const mediaSection = document.querySelector(".media-room-container");
const mediaBox1 = document.querySelector(".box-1");
const mediaBox2 = document.querySelector(".box-2");
const mediaBox3 = document.querySelector(".box-3");

function updateMediaTextReveal() {
  if (!mediaSection || !mediaBox1 || !mediaBox2 || !mediaBox3) return;

  const rect = mediaSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
  const trigger = 0.5;

  mediaBox1.classList.toggle("is-visible", progress > trigger);
  mediaBox2.classList.toggle("is-visible", progress > trigger);
  mediaBox3.classList.toggle("is-visible", progress > trigger);
}

window.addEventListener("scroll", updateMediaTextReveal, { passive: true });
window.addEventListener("resize", updateMediaTextReveal);

/* =========================================================
   05. RETURN TO TOP BUTTON
   ========================================================= */

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

/* =========================================================
   06. WHITEBOARD WRITING SYSTEM
   ========================================================= */

const whiteboardTextBox = document.getElementById("whiteboardTextBox");

let whiteboardLines = [];
let whiteboardLineIndex = 0;
let whiteboardTypingTimeout = null;
let whiteboardAutoScroll = true;

if (whiteboardTextBox) {
  whiteboardLines = Array.from(
    whiteboardTextBox.querySelectorAll("p"),
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
  whiteboardTypingTimeout = clearTimer(whiteboardTypingTimeout);
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
      i += 1;

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
  if (!whiteboardTextBox || whiteboardLineIndex >= whiteboardLines.length)
    return;

  const p = document.createElement("p");
  whiteboardTextBox.appendChild(p);

  whiteboardScrollToBottom();

  typeWhiteboardLine(whiteboardLines[whiteboardLineIndex], p, () => {
    whiteboardLineIndex += 1;
    startWhiteboardTyping();
  });
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

/* =========================================================
   07. PARCEL CONFETTI BURST
   ========================================================= */

const parcelImage = document.querySelector(".parcel-img");
const donateButton = document.querySelector(".donate");
const parcelContainer = document.querySelector(".parcel-container");

function burstConfettiFromParcel() {
  if (!parcelContainer || !parcelImage) return;

  const containerRect = parcelContainer.getBoundingClientRect();
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

  for (let i = 0; i < totalPieces; i += 1) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 140;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance + 40;

    piece.className = "confetti-piece";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.backgroundColor =
      colours[Math.floor(Math.random() * colours.length)];
    piece.style.setProperty("--confetti-x", `${x}px`);
    piece.style.setProperty("--confetti-y", `${y}px`);
    piece.style.setProperty(
      "--confetti-rotate",
      `${Math.random() * 720 - 360}deg`,
    );

    if (Math.random() > 0.5) {
      piece.style.width = "8px";
      piece.style.height = "8px";
      piece.style.borderRadius = "50%";
    }

    piece.addEventListener(
      "animationend",
      () => {
        piece.remove();
      },
      { once: true },
    );

    parcelContainer.appendChild(piece);
  }
}

if (parcelImage) {
  parcelImage.addEventListener("click", burstConfettiFromParcel);
}

if (donateButton) {
  donateButton.addEventListener("click", burstConfettiFromParcel);
}

/* =========================================================
   08. ABOUT PAGE HORIZONTAL IMAGE MOTION
   ========================================================= */

function initialiseAboutHorizontal() {
  if (!document.body.classList.contains("about-horizontal")) return;

  const stage = document.querySelector(".about-horizontal-container");
  const track = document.getElementById("aboutHorizontalTrack");
  const spinBtn = document.getElementById("spinBtn");

  if (!stage || !track) return;

  const originalPanels = Array.from(track.children);
  for (const panel of originalPanels) {
    track.appendChild(panel.cloneNode(true));
  }

  let currentX = 0;
  let targetX = 0;
  let loopPoint = 0;
  let ticking = false;
  let isSpinning = false;
  let spinTimeout = null;
  let currentPanelIndex = 0;

  const spinSpeed = 700;
  const spinDuration = 2200;
  const minimumForwardTravel = 300;

  function updateBounds() {
    loopPoint = track.scrollWidth / 2;
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
    const panelX = originalPanels[index].offsetLeft;
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

    if (stillEasing || isSpinning) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function startAnimation() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(animate);
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
        targetX = getSnapXForPanel(nextPanelIndex);
        currentPanelIndex = nextPanelIndex;
        spinTimeout = null;

        startAnimation();
      }, spinDuration);
    });
  }
}

/* =========================================================
   09. PAGE VORTEX NAV TRANSITION
   ========================================================= */

function setupPageLinkTransitions() {
  const links = document.querySelectorAll("a[href]");
  const vortex = document.querySelector(
    ".center-vortex-container model-viewer",
  );

  if (!links.length) return;

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

/* =========================================================
   10. HELP PAGE PAPER POPUPS
   ========================================================= */

function initialiseHelpPaperPopups() {
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
      openHelpPaperFromSource(trigger.dataset.helpTarget, trigger);
    });
  });

  closeBtn.addEventListener("click", closeHelpPaper);
  backdrop.addEventListener("click", closeHelpPaper);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeHelpPaper();
    }
  });
}

/* =========================================================
   11. HELP PAGE FIREPLACE + EMBERS
   ========================================================= */

function initialiseFireplace() {
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

    for (let i = 0; i < count; i += 1) {
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
    const lightOpacity = 0.66 + Math.sin(t * 5) * 0.03;

    fire.style.transform = `translate(-50%, 0) scale(${scaleX}, ${scaleY})`;
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

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resizeCanvas);
  startFireplace();
}

/* =========================================================
   12. RAIN + LIGHTNING
   ========================================================= */

function initialiseRainAndLightning() {
  const rainContainer = document.querySelector(".rain");
  const imageContainer = document.querySelector(".rain-img-container");
  const lightning = document.querySelector(".lightning");

  if (rainContainer) {
    const dropCount = 180;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < dropCount; i += 1) {
      const drop = document.createElement("span");
      const size = Math.random();

      drop.classList.add("rain-drop");

      if (size < 0.33) {
        drop.classList.add("small");
      } else if (size < 0.66) {
        drop.classList.add("medium");
      } else {
        drop.classList.add("large");
      }

      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.45 + Math.random() * 0.55}s`;
      drop.style.animationDelay = `${-Math.random() * 2}s`;

      fragment.appendChild(drop);
    }

    rainContainer.appendChild(fragment);
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

    setTimeout(triggerLightning, 1500 + Math.random() * 3000);
  }

  setTimeout(triggerLightning, 1000 + Math.random() * 1000);
}

/* =========================================================
   13. DOM READY INITIALISERS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  updateMediaTextReveal();
  startWhiteboardTyping();
  initialiseRainAndLightning();
  initialiseAboutHorizontal();
  setupPageLinkTransitions();
  initialiseHelpPaperPopups();
  initialiseFireplace();
});
