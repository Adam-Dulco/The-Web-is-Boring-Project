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
const originalLines = Array.from(container.querySelectorAll("p")).map(
  (p) => p.textContent,
);

container.innerHTML = "";

let lineIndex = 0;
let typingTimeout = null;

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
  container.innerHTML = "";
  lineIndex = 0;
}

/* OPEN DOORS */
doorOpenBtn.addEventListener("click", () => {
  doorOverlay.classList.add("open");

  resetTyping();

  // 3s door animation + half a second delay = 3500ms
  setTimeout(() => {
    startTyping();
  }, 3500);
});

/* CLOSE DOORS */
exitBtn.addEventListener("click", () => {
  doorOverlay.classList.remove("open");

  resetTyping(); // optional: clears text when closing
});
