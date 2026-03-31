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
