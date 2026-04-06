/* ======================= */
/*   FRONT DOOR CONTROLS   */
/* ======================= */

const doorOverlay = document.getElementById("doorOverlay");
const doorOpenBtn = document.getElementById("doorOpenBtn");
const exitBtn = document.querySelector(".exit-btn");

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

/* RESET TEXT */
function resetTyping() {
  clearTimeout(typingTimeout);

  if (container) {
    container.innerHTML = "";
  }

  lineIndex = 0;
}

/* OPEN DOORS */
if (doorOpenBtn && doorOverlay) {
  // If already entered this session, skip the doors immediately
  if (sessionStorage.getItem("doorsOpened")) {
    doorOverlay.classList.add("hidden");
    startTyping();
  }

  doorOpenBtn.addEventListener("click", () => {
    doorOverlay.classList.add("open");
    sessionStorage.setItem("doorsOpened", "true");

    resetTyping();

    setTimeout(() => {
      doorOverlay.classList.add("hidden");
      startTyping();
    }, 3000);
  });
}

/* CLOSE DOORS */
if (exitBtn && doorOverlay) {
  exitBtn.addEventListener("click", () => {
    doorOverlay.classList.remove("hidden");
    doorOverlay.classList.remove("open");
    sessionStorage.removeItem("doorsOpened");

    resetTyping();
  });
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
/*    RAIN EFFECT     */
/*====================*/

window.addEventListener("DOMContentLoaded", () => {
  const rainContainer = document.querySelector(".rain");
  if (!rainContainer) return;

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
});

/*====================*/
/*  LIGHTNING EFFECT  */
/*====================*/

window.addEventListener("DOMContentLoaded", () => {
  const rainContainer = document.querySelector(".rain");
  const imageContainer = document.querySelector(".rain-img-container");
  const lightning = document.querySelector(".lightning");

  if (!rainContainer || !imageContainer || !lightning) return;

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
  const isMobile = window.innerWidth <= 560;

  const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);

  let box1Trigger;
  let box2Trigger;
  let box3Trigger;

  if (isMobile) {
    box1Trigger = 0.5;
    box2Trigger = 0.5;
    box3Trigger = 0.5;
  } else {
    box1Trigger = 0.5;
    box2Trigger = 0.5;
    box3Trigger = 0.5;
  }

  // Only remove if user scrolls back up ABOVE trigger
  if (progress < box1Trigger) box1.classList.remove("is-visible");
  if (progress < box2Trigger) box2.classList.remove("is-visible");
  if (progress < box3Trigger) box3.classList.remove("is-visible");

  if (progress > box1Trigger) box1.classList.add("is-visible");
  if (progress > box2Trigger) box2.classList.add("is-visible");
  if (progress > box3Trigger) box3.classList.add("is-visible");
}

window.addEventListener("scroll", updateMediaTextReveal);
window.addEventListener("resize", updateMediaTextReveal);
window.addEventListener("DOMContentLoaded", updateMediaTextReveal);

/* GRADUALLY FADE IN THE TV & RADIO TEXT ON PAGE LOAD */

// window.addEventListener("DOMContentLoaded", () => {
//   const box1 = document.querySelector(".box-1");

//   if (box1) {
//     setTimeout(() => {
//       box1.classList.add("is-visible");
//     }, 1000); // 1 second delay so CSS transition triggers properly
//   }
// });

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
      }, 2000);
    });
  });
}

window.addEventListener("DOMContentLoaded", setupPageLinkTransitions);
