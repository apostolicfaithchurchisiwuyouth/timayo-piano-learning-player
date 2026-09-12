// ==========================================
// PIANO LEARNING PLAYER
// 3 OCTAVE VERSION
// ==========================================


// ------------------------------------------
// DOM ELEMENTS
// ------------------------------------------

const piano = document.getElementById("piano");

const statusText =
  document.getElementById("status");

const currentNotes =
  document.getElementById("currentNotes");

const speedSelect =
  document.getElementById("speedSelect");


// ------------------------------------------
// CREATE THE PIANO
// ------------------------------------------

const noteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];

const whiteNotes = [
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "B"
];

const blackNotes = [
  "C#",
  "D#",
  "F#",
  "G#",
  "A#"
];


// Our piano range:
// C3 → C6

const pianoNotes = [];

for (let octave = 3; octave <= 5; octave++) {

  noteNames.forEach(note => {

    pianoNotes.push(
      `${note}${octave}`
    );

  });

}

// Add final C6
pianoNotes.push("C6");


// Create white keys first

const whiteKeyNotes =
  pianoNotes.filter(note => {

    const name =
      note.replace(/[0-9]/g, "");

    return whiteNotes.includes(name);

  });


whiteKeyNotes.forEach(note => {

  const key =
    document.createElement("div");

  key.className =
    "key white";

  key.dataset.note = note;

  key.textContent = note;

  piano.appendChild(key);

});


// ------------------------------------------
// CREATE BLACK KEYS
// ------------------------------------------

function createBlackKeys() {

  const totalWhiteKeys =
    whiteKeyNotes.length;

  pianoNotes.forEach(note => {

    const name =
      note.replace(/[0-9]/g, "");

    if (!blackNotes.includes(name)) {
      return;
    }


    const octave =
      Number(
        note.match(/[0-9]/)[0]
      );


    // Position of the black key
    // within each octave

    const blackPositions = {
      "C#": 1,
      "D#": 2,
      "F#": 4,
      "G#": 5,
      "A#": 6
    };


    const positionInOctave =
      blackPositions[name];


    const octaveOffset =
      (octave - 3) * 7;


    const whiteKeyPosition =
      octaveOffset +
      positionInOctave;


    const left =
      (whiteKeyPosition /
        totalWhiteKeys) * 100;


    const key =
      document.createElement("div");

    key.className =
      "key black";

    key.dataset.note =
      note;

    key.textContent =
      note;


    key.style.left =
      `${left - 1.7}%`;


    piano.appendChild(key);

  });

}

createBlackKeys();


// ------------------------------------------
// REAL PIANO SAMPLER
// ------------------------------------------

const pianoSampler =
  new Tone.Sampler({

    urls: {
      A1: "A1.mp3",
      A2: "A2.mp3",
      A3: "A3.mp3",
      A4: "A4.mp3",
      A5: "A5.mp3"
    },

    release: 1,

    baseUrl:
      "https://tonejs.github.io/audio/salamander/"

  }).toDestination();


// ------------------------------------------
// AUDIO START
// ------------------------------------------

async function startAudio() {

  await Tone.start();

  if (Tone.context.state !== "running") {

    await Tone.context.resume();

  }

}


// ------------------------------------------
// GET PIANO KEY
// ------------------------------------------

function getKey(note) {

  return document.querySelector(
    `.key[data-note="${note}"]`
  );

}


// ------------------------------------------
// SHOW NOTES
// ------------------------------------------

function showNotes(notes) {

  currentNotes.innerHTML = "";

  if (!notes.length) {

    currentNotes.innerHTML =
      `<span class="empty-note">—</span>`;

    return;

  }


  notes.forEach(note => {

    const item =
      document.createElement("span");

    item.className =
      "note";

    item.textContent =
      note;

    currentNotes.appendChild(item);

  });

}


// ------------------------------------------
// PLAY NOTES
// ------------------------------------------

function playNotes(
  notes,
  duration = 0.7,
  hand = "right"
) {

  if (!notes || !notes.length) {
    return;
  }


  pianoSampler.triggerAttackRelease(
    notes,
    duration
  );


  showNotes(notes);


  notes.forEach(note => {

    const key =
      getKey(note);

    if (!key) return;


    key.classList.add(
      "active",
      `${hand}-hand`
    );


    setTimeout(() => {

      key.classList.remove(
        "active",
        "right-hand",
        "left-hand"
      );

    }, duration * 1000);

  });

}


// ------------------------------------------
// TOUCH / CLICK PLAYING
// ------------------------------------------

document.addEventListener(
  "pointerdown",
  async event => {

    const key =
      event.target.closest(".key");

    if (!key) return;


    await startAudio();


    const note =
      key.dataset.note;


    playNotes(
      [note],
      0.8,
      "right"
    );

  }
);


// ------------------------------------------
// TEST SONG DATA
// ------------------------------------------

// Later, this will be replaced
// with your learning arrangement.

const testSong = [

  {
    left: ["C3"],
    right: ["C4", "E4", "G4"],
    duration: 1
  },

  {
    left: ["A2"],
    right: ["A3", "C4", "E4"],
    duration: 1
  },

  {
    left: ["F3"],
    right: ["A3", "C4", "F4"],
    duration: 1
  },

  {
    left: ["G3"],
    right: ["B3", "D4", "G4"],
    duration: 1
  }

];


// ------------------------------------------
// PLAYBACK VARIABLES
// ------------------------------------------

let currentStep = 0;

let playing = false;

let timer = null;

let practiceMode = "both";


// ------------------------------------------
// PLAY SONG
// ------------------------------------------

async function playSong() {

  if (playing) return;


  await startAudio();


  playing = true;

  statusText.textContent =
    "Playing...";


  playNextStep();

}


// ------------------------------------------
// PLAY NEXT STEP
// ------------------------------------------

function playNextStep() {

  if (!playing) return;


  if (currentStep >= testSong.length) {

    playing = false;

    currentStep = 0;

    statusText.textContent =
      "Finished";

    return;

  }


  const step =
    testSong[currentStep];


  const speed =
    Number(speedSelect.value);


  const duration =
    step.duration / speed;


  if (
    practiceMode === "right"
  ) {

    playNotes(
      step.right,
      duration,
      "right"
    );

  }


  else if (
    practiceMode === "left"
  ) {

    playNotes(
      step.left,
      duration,
      "left"
    );

  }


  else {

    playNotes(
      step.left,
      duration,
      "left"
    );


    playNotes(
      step.right,
      duration,
      "right"
    );

  }


  currentStep++;


  timer = setTimeout(
    playNextStep,
    duration * 1000
  );

}


// ------------------------------------------
// PAUSE
// ------------------------------------------

function pauseSong() {

  playing = false;

  clearTimeout(timer);

  pianoSampler.releaseAll();

  statusText.textContent =
    "Paused";

}


// ------------------------------------------
// RESTART
// ------------------------------------------

function restartSong() {

  playing = false;

  clearTimeout(timer);

  pianoSampler.releaseAll();

  currentStep = 0;


  statusText.textContent =
    "Ready";


  showNotes([]);

}


// ------------------------------------------
// BUTTONS
// ------------------------------------------

document
  .getElementById("playButton")
  .addEventListener(
    "click",
    playSong
  );


document
  .getElementById("pauseButton")
  .addEventListener(
    "click",
    pauseSong
  );


document
  .getElementById("restartButton")
  .addEventListener(
    "click",
    restartSong
  );


// ------------------------------------------
// PRACTICE MODE
// ------------------------------------------

document
  .querySelectorAll(".mode-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        practiceMode =
          button.dataset.mode;


        document
          .querySelectorAll(
            ".mode-button"
          )
          .forEach(btn => {

            btn.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        const titles = {
          both: "Both Hands",
          right: "Right Hand",
          left: "Left Hand"
        };


        document.getElementById(
          "modeTitle"
        ).textContent =
          titles[practiceMode];

      }
    );

  });


// ------------------------------------------
// READY
// ------------------------------------------

console.log(
  "3 Octave Piano Learning Player loaded."
);
 
