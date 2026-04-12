/* ======================= */
/*   FRONT DOOR CONTROLS   */
/* ======================= */

const doorOverlay = document.getElementById("doorOverlay");
const doorOpenBtn = document.getElementById("doorOpenBtn");
const exitBtn = document.querySelector(".exit-btn");

let doorState = "closed"; // "closed" | "opening" | "open" | "closing"
let doorTimer = null;

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
      typingTimeout = setTimeout(typeChar, 40);
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
  if (!doorOverlay) return;
  if (doorState === "opening" || doorState === "open") return;

  clearDoorTimer();
  resetTyping();

  doorState = "opening";
  sessionStorage.setItem("doorsOpened", "true");

  showDoorOverlay();

  nextPaint(() => {
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
  sessionStorage.removeItem("doorsOpened");

  showDoorOverlay();

  nextPaint(() => {
    setDoorsClosed();

    doorTimer = setTimeout(() => {
      doorState = "closed";
      doorTimer = null;

      /* Re-open on homepage each time doors close on exit */
      window.location.href = "../index.html";
    }, 1600);
  });
}

/* INITIAL STATE */

if (doorOverlay) {
  if (sessionStorage.getItem("doorsOpened")) {
    setDoorsOpen();
    hideDoorOverlay();
    doorState = "open";
    startTyping();
  } else {
    setDoorsClosed();
    showDoorOverlay();
    doorState = "closed";
  }
}

/* BUTTON EVENTS */

if (doorOpenBtn) {
  doorOpenBtn.addEventListener("click", openDoors);
}

if (exitBtn) {
  exitBtn.addEventListener("click", closeDoors);
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

/* ============================== */
/*   PAGE VORTEX NAV TRANSITION   */
/* ============================== */

function setupPageLinkTransitions() {
  const links = document.querySelectorAll(".cockpit-nav a");
  const vortex = document.querySelector(
    ".center-vortex-container model-viewer",
  );

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        link.target === "_blank" ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      document.body.classList.add("is-transitioning");
      document.body.style.overflow = "hidden";

      if (vortex) {
        vortex.setAttribute("rotation-per-second", "-3000deg");
      }

      setTimeout(() => {
        window.location.href = link.href;
      }, 700);
    });
  });
}

window.addEventListener("DOMContentLoaded", setupPageLinkTransitions);

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
      const nextDelay = [".", ",", "!", "?", ":"].includes(char) ? 110 : 45;

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

// window.addEventListener("DOMContentLoaded", () => {
//   if (!document.body.classList.contains("about-horizontal")) return;

//   const stage = document.querySelector(".about-horizontal-stage");
//   const track = document.getElementById("aboutHorizontalTrack");
//   if (!stage || !track) return;

//   let currentX = 0;
//   let targetX = 0;
//   let maxScroll = 0;
//   let ticking = false;

//   function updateBounds() {
//     const stageWidth = stage.clientWidth;
//     const trackWidth = track.scrollWidth;
//     maxScroll = Math.max(0, trackWidth - stageWidth);

//     targetX = Math.max(0, Math.min(targetX, maxScroll));
//     currentX = Math.max(0, Math.min(currentX, maxScroll));
//     track.style.transform = `translate3d(${-currentX}px, 0, 0)`;
//   }

//   function animate() {
//     currentX += (targetX - currentX) * 0.12;

//     if (Math.abs(targetX - currentX) < 0.2) {
//       currentX = targetX;
//     }

//     track.style.transform = `translate3d(${-currentX}px, 0, 0)`;

//     if (Math.abs(targetX - currentX) > 0.2) {
//       requestAnimationFrame(animate);
//     } else {
//       ticking = false;
//     }
//   }

//   function startAnimation() {
//     if (!ticking) {
//       ticking = true;
//       requestAnimationFrame(animate);
//     }
//   }

//   updateBounds();
//   window.addEventListener("resize", updateBounds);

//   window.addEventListener(
//     "wheel",
//     (event) => {
//       event.preventDefault();
//       targetX += event.deltaY;
//       targetX = Math.max(0, Math.min(targetX, maxScroll));
//       startAnimation();
//     },
//     { passive: false },
//   );
// });

/* LATEST VERSION (WITH SPIN BUTTON) */

/* ================================== */
/* ABOUT PAGE HORIZONTAL IMAGE MOTION */
/* ================================== */

window.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("about-horizontal")) return;

  const stage = document.querySelector(".about-horizontal-stage");
  const track = document.getElementById("aboutHorizontalTrack");
  const spinBtn = document.getElementById("spinBtn");
  if (!stage || !track) return;

  /* duplicate panels once for seamless looping */
  const panels = Array.from(track.children);
  panels.forEach((panel) => {
    const clone = panel.cloneNode(true);
    track.appendChild(clone);
  });

  let currentX = 0;
  let targetX = 0;
  let loopPoint = 0;
  let ticking = false;

  let isSpinning = false;
  let spinTimeout = null;
  const spinSpeed = 500; // increase for faster spin

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

  function animate() {
    /* force fast spin while active */
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
      if (spinTimeout) {
        clearTimeout(spinTimeout);
      }

      isSpinning = true;
      startAnimation();

      spinTimeout = setTimeout(() => {
        isSpinning = false;
        spinTimeout = null;
      }, 1000);
    });
  }
});
