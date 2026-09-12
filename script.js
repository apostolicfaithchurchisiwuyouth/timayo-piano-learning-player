/* ==========================================
   PIANO LAB
   Piano Engine
========================================== */


const piano = document.getElementById("piano");

const statusText =
  document.getElementById("status");

const currentNotes =
  document.getElementById("currentNotes");

const speedSelect =
  document.getElementById("speedSelect");


/* ==========================================
   PIANO NOTES
========================================== */

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


/* ==========================================
   CREATE 3 OCTAVES
   C3 → C6
========================================== */

const pianoNotes = [];


for (let octave = 3; octave <= 5; octave++) {

  noteNames.forEach(note => {

    pianoNotes.push(
      `${note}${octave}`
    );

  });

}


pianoNotes.push("C6");


/* ==========================================
   WHITE KEYS
========================================== */

const whiteKeyNotes =
  pianoNotes.filter(note => {

    const name =
      note.replace(/[0-9]/g, "");

    return whiteNotes.includes(name);

  });


whiteKeyNotes.forEach(note => {

  const key =
    document.createElement("div");

  key.className = "key white";

  key.dataset.note = note;

  key.textContent = note;

  piano.appendChild(key);

});


/* ==========================================
   BLACK KEYS
========================================== */

const blackPositions = {

  "C#": 1,
  "D#": 2,
  "F#": 4,
  "G#": 5,
  "A#": 6

};


pianoNotes.forEach(note => {

  const name =
    note.replace(/[0-9]/g, "");


  if (!blackNotes.includes(name)) {
    return;
  }


  const octave =
    Number(note.match(/[0-9]/)[0]);


  const octaveOffset =
    (octave - 3) * 7;


  const whitePosition =
    octaveOffset +
    blackPositions[name];


  const position =
    whitePosition /
    whiteKeyNotes.length *
    100;


  const key =
    document.createElement("div");


  key.className = "key black";

  key.dataset.note = note;

  key.textContent = note;


  key.style.left =
    `${position - 2}%`;


  piano.appendChild(key);

});


/* ==========================================
   PIANO SAMPLE ENGINE
========================================== */

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


/* ==========================================
   START AUDIO
========================================== */

async function startAudio() {

  await Tone.start();

  if (
    Tone.context.state !== "running"
  ) {

    await Tone.context.resume();

  }

}


/* ==========================================
   GET KEY
========================================== */

function getKey(note) {

  return document.querySelector(
    `.key[data-note="${note}"]`
  );

}


/* ==========================================
   SHOW CURRENT NOTES
========================================== */

function showNotes(notes) {

  currentNotes.innerHTML = "";


  if (!notes.length) {

    currentNotes.innerHTML =
      `<span class="empty-note">
        Ready when you are
      </span>`;

    return;

  }


  notes.forEach(note => {

    const element =
      document.createElement("span");

    element.className = "note";

    element.textContent = note;

    currentNotes.appendChild(element);

  });

}


/* ==========================================
   HIGHLIGHT KEY
========================================== */

function highlightKey(
  note,
  duration,
  hand = "right"
) {

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

}


/* ==========================================
   PLAY NOTES
========================================== */

function playNotes(
  notes,
  duration = 0.7,
  hand = "right"
) {

  if (
    !notes ||
    !notes.length
  ) {
    return;
  }


  pianoSampler.triggerAttackRelease(
    notes,
    duration
  );


  notes.forEach(note => {

    highlightKey(
      note,
      duration,
      hand
    );

  });


  showNotes(notes);

}


/* ==========================================
   PLAY A KEY MANUALLY
========================================== */

piano.addEventListener(
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


/* ==========================================
   TEST MUSIC DATA
========================================== */

const testSong = [

  {
    left: ["C3"],
    right: ["C4", "E4", "G4"],
    duration: 1
  },

  {
    left: ["A3"],
    right: ["A4", "C5", "E5"],
    duration: 1
  },

  {
    left: ["F3"],
    right: ["A4", "C5", "F5"],
    duration: 1
  },

  {
    left: ["G3"],
    right: ["B4", "D5", "G5"],
    duration: 1
  }

];


/* ==========================================
   PLAYBACK STATE
========================================== */

let currentStep = 0;

let playing = false;

let timer = null;

let practiceMode = "both";


/* ==========================================
   PLAY SONG
========================================== */

async function playSong() {

  if (playing) return;


  await startAudio();


  playing = true;

  statusText.textContent =
    "Playing";


  playNextStep();

}


/* ==========================================
   NEXT STEP
========================================== */

function playNextStep() {

  if (!playing) return;


  if (
    currentStep >=
    testSong.length
  ) {

    playing = false;

    currentStep = 0;

    statusText.textContent =
      "Finished";

    return;

  }


  const step =
    testSong[currentStep];


  const speed =
    Number(
      speedSelect.value
    );


  const duration =
    step.duration /
    speed;


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


/* ==========================================
   PAUSE
========================================== */

function pauseSong() {

  playing = false;

  clearTimeout(timer);

  pianoSampler.releaseAll();

  statusText.textContent =
    "Paused";

}


/* ==========================================
   RESTART
========================================== */

function restartSong() {

  playing = false;

  clearTimeout(timer);

  pianoSampler.releaseAll();

  currentStep = 0;

  statusText.textContent =
    "Ready";

  showNotes([]);

}


/* ==========================================
   PLAY BUTTON
========================================== */

document
  .getElementById("playButton")
  .addEventListener(
    "click",
    playSong
  );


/* ==========================================
   PAUSE BUTTON
========================================== */

document
  .getElementById("pauseButton")
  .addEventListener(
    "click",
    pauseSong
  );


/* ==========================================
   RESTART BUTTON
========================================== */

document
  .getElementById("restartButton")
  .addEventListener(
    "click",
    restartSong
  );


/* ==========================================
   HAND SELECTION
========================================== */

document
  .querySelectorAll(".hand-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        practiceMode =
          button.dataset.mode;


        document
          .querySelectorAll(
            ".hand-button"
          )
          .forEach(item => {

            item.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );

      }
    );

  });


/* ==========================================
   READY
========================================== */

console.log(
  "Piano Lab loaded successfully."
);
