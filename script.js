/* ======================= */
/*   FRONT DOOR CONTROLS   */
/* ======================= */

const doorOverlay = document.getElementById("doorOverlay");
const doorOpenBtn = document.getElementById("doorOpenBtn");
const exitBtn = document.querySelector(".exit-btn");

/* OPEN DOORS */
doorOpenBtn.addEventListener("click", () => {
  doorOverlay.classList.add("open");
});

/* CLOSE DOORS */
exitBtn.addEventListener("click", () => {
  doorOverlay.classList.remove("open");
});

/* ================ */
/*   WINDOW TEXT    */
/* ================ */

const container = document.getElementById("windowText");
const lines = Array.from(container.querySelectorAll("p"));

container.innerHTML = ""; // clear

let lineIndex = 0;

function typeLine(text, element, callback) {
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeChar, 40);
    } else {
      setTimeout(callback, 400); // pause between lines
    }
  }

  typeChar();
}

function startTyping() {
  if (lineIndex < lines.length) {
    const p = document.createElement("p");
    container.appendChild(p);

    typeLine(lines[lineIndex].textContent, p, () => {
      lineIndex++;
      startTyping();
    });
  }
}

window.addEventListener("DOMContentLoaded", startTyping);
