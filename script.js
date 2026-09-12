// ==========================================
// PIANO LEARNING PLAYER
// Version 1 - Piano Sound + Key Animation
// ==========================================


// ------------------------------------------
// 1. AUDIO ENGINE
// ------------------------------------------

let audioContext;

function startAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}


// ------------------------------------------
// 2. NOTE FREQUENCIES
// ------------------------------------------

const frequencies = {
  "C4": 261.63,
  "C#4": 277.18,
  "D4": 293.66,
  "D#4": 311.13,
  "E4": 329.63,
  "F4": 349.23,
  "F#4": 369.99,
  "G4": 392.00,
  "G#4": 415.30,
  "A4": 440.00,
  "A#4": 466.16,
  "B4": 493.88,
  "C5": 523.25
};


// ------------------------------------------
// 3. FIND A PIANO KEY
// ------------------------------------------

function getKey(note) {
  return document.querySelector(
    `.key[data-note="${note}"]`
  );
}


// ------------------------------------------
// 4. SHOW CURRENT NOTES
// ------------------------------------------

function showNotes(notes) {

  const container =
    document.getElementById("currentNotes");

  container.innerHTML = "";

  notes.forEach(note => {

    const item =
      document.createElement("span");

    item.className = "note";
    item.textContent = note;

    container.appendChild(item);

  });
}


// ------------------------------------------
// 5. PLAY A NOTE
// ------------------------------------------

function playNote(note, duration = 700) {

  startAudio();

  const frequency = frequencies[note];

  if (!frequency) return;

  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();


  oscillator.type = "triangle";

  oscillator.frequency.value =
    frequency;


  oscillator.connect(gain);
  gain.connect(audioContext.destination);


  const now =
    audioContext.currentTime;


  // Gentle attack
  gain.gain.setValueAtTime(
    0,
    now
  );

  gain.gain.linearRampToValueAtTime(
    0.35,
    now + 0.03
  );


  // Gentle release
  gain.gain.setValueAtTime(
    0.35,
    now + duration / 1000 - 0.15
  );

  gain.gain.linearRampToValueAtTime(
    0,
    now + duration / 1000
  );


  oscillator.start(now);

  oscillator.stop(
    now + duration / 1000
  );


  // Highlight the key
  const key = getKey(note);

  if (key) {

    key.classList.add("active");

    setTimeout(() => {
      key.classList.remove("active");
    }, duration);

  }
}


// ------------------------------------------
// 6. PLAY MULTIPLE NOTES TOGETHER
// ------------------------------------------

function playChord(notes, duration = 700) {

  showNotes(notes);

  notes.forEach(note => {
    playNote(note, duration);
  });

}


// ------------------------------------------
// 7. MAKE THE PHYSICAL PIANO PLAYABLE
// ------------------------------------------

document.querySelectorAll(".key")
  .forEach(key => {

    key.addEventListener("pointerdown", () => {

      const note =
        key.dataset.note;

      startAudio();

      playNote(note);

      showNotes([note]);

    });

  });


// ------------------------------------------
// 8. OUR FIRST TEST SONG
// ------------------------------------------

const testSong = [

  {
    notes: ["C4"],
    duration: 600
  },

  {
    notes: ["D4"],
    duration: 600
  },

  {
    notes: ["E4"],
    duration: 600
  },

  {
    notes: ["C4"],
    duration: 600
  },

  {
    notes: ["C4", "E4", "G4"],
    duration: 900
  },

  {
    notes: ["F4", "A4", "C5"],
    duration: 900
  },

  {
    notes: ["G4", "B4", "D5"],
    duration: 900
  }

];


// ------------------------------------------
// 9. SONG PLAYER
// ------------------------------------------

let currentStep = 0;

let playing = false;

let timer = null;


function playSong() {

  if (playing) return;

  playing = true;

  document.getElementById("status")
    .textContent = "Playing...";

  playNextStep();
}


function playNextStep() {

  if (!playing) return;


  if (currentStep >= testSong.length) {

    playing = false;

    currentStep = 0;

    document.getElementById("status")
      .textContent = "Finished";

    return;
  }


  const step =
    testSong[currentStep];


  const speed =
    Number(
      document.getElementById("speedSelect").value
    );


  const duration =
    step.duration / speed;


  playChord(
    step.notes,
    duration
  );


  currentStep++;


  timer = setTimeout(
    playNextStep,
    duration
  );
}


// ------------------------------------------
// 10. PAUSE
// ------------------------------------------

function pauseSong() {

  playing = false;

  clearTimeout(timer);

  document.getElementById("status")
    .textContent = "Paused";
}


// ------------------------------------------
// 11. RESTART
// ------------------------------------------

function restartSong() {

  playing = false;

  clearTimeout(timer);

  currentStep = 0;

  document.getElementById("status")
    .textContent = "Ready to play";

  document.getElementById("currentNotes")
    .innerHTML =
    '<span class="empty-note">—</span>';
}


// ------------------------------------------
// 12. BUTTONS
// ------------------------------------------

document.getElementById("playButton")
  .addEventListener("click", () => {

    startAudio();

    playSong();

  });


document.getElementById("pauseButton")
  .addEventListener("click", () => {

    pauseSong();

  });


document.getElementById("restartButton")
  .addEventListener("click", () => {

    restartSong();

  });


// ------------------------------------------
// 13. INITIAL MESSAGE
// ------------------------------------------

console.log(
  "Piano Learning Player loaded successfully."
);
 
