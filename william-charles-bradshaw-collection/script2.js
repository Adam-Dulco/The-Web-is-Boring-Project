// const tank = document.getElementById("tank");

// tank.addEventListener("animationend", () => {
//   tank.setAttribute("camera-controls", "");
//   tank.style.pointerEvents = "auto";
// });

/* TANK SOUND EFFECTS */

const tank = document.getElementById("tank");
const sound = document.getElementById("tankSound");

let audioUnlocked = false;

// unlock audio on first user interaction
document.addEventListener(
  "click",
  () => {
    if (!audioUnlocked) {
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

// play when animation starts
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
