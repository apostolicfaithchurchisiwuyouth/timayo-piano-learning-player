/* =========================================================
   PIANO LAB
========================================================= */


/* =========================================================
   DOM
========================================================= */

const piano = document.getElementById("piano");

const pieceSelect = document.getElementById("pieceSelect");
const handSelect = document.getElementById("handSelect");
const speedSelect = document.getElementById("speedSelect");

const pieceTitle = document.getElementById("pieceTitle");
const pieceControlText = document.getElementById("pieceControlText");

const handControlText = document.getElementById("handControlText");
const speedControlText = document.getElementById("speedControlText");

const pianoStatus = document.getElementById("pianoStatus");
const pianoMode = document.getElementById("pianoMode");

const replayButton = document.getElementById("replayButton");
const playButton = document.getElementById("playButton");

const playIcon = document.getElementById("playIcon");

const playbackStatus = document.getElementById("playbackStatus");
const playbackSubstatus = document.getElementById("playbackSubstatus");


/* =========================================================
   PIANO RANGE
========================================================= */

const START_OCTAVE = 2;
const END_OCTAVE = 5;


/* =========================================================
   STATE
========================================================= */

let selectedSong = "gentle";

let practiceMode = "both";

let playbackSpeed = 1;

let currentStep = 0;

let playing = false;

let playbackTimer = null;

let audioReady = false;

const highlightTimers = new Set();


/* =========================================================
   NOTES
========================================================= */

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


function createNoteList() {

  const notes = [];

  for (
    let octave = START_OCTAVE;
    octave <= END_OCTAVE;
    octave++
  ) {

    for (const note of noteNames) {

      if (
        octave === END_OCTAVE &&
        note !== "C"
      ) {
        continue;
      }

      notes.push(`${note}${octave}`);
    }

  }

  return notes;
}


const pianoNotes = createNoteList();


/* =========================================================
   SONGS
========================================================= */

const songs = {

  gentle: {

    title: "Gentle Beginning",

    description:
      "A simple beginner piano exercise.",

    steps: [

      {
        right: ["C4"],
        left: ["C3"],
        duration: 1
      },

      {
        right: ["E4"],
        left: ["G2"],
        duration: 1
      },

      {
        right: ["G4"],
        left: ["C3"],
        duration: 1
      },

      {
        right: ["E4"],
        left: ["G2"],
        duration: 1
      },

      {
        right: ["C4", "E4"],
        left: ["C3"],
        duration: 1
      },

      {
        right: ["D4", "G4"],
        left: ["G2"],
        duration: 1
      },

      {
        right: ["C4", "E4"],
        left: ["C3"],
        duration: 1
      },

      {
        right: ["G4"],
        left: ["G2"],
        duration: 1
      }

    ]

  },


  /*
    The actual All of Me arrangement will be inserted
    when you provide your own MIDI, MusicXML or notes.
  */

  allofme: {

    title: "All of Me",

    description:
      "Your arrangement will be added here.",

    steps: []

  }

};


/* =========================================================
   REAL PIANO SOUND
========================================================= */

const sampler = new Tone.Sampler({

  urls: {

    A1: "A1.mp3",
    A2: "A2.mp3",
    A3: "A3.mp3",
    A4: "A4.mp3",
    A5: "A5.mp3"

  },

  release: 1.5,

  baseUrl:
    "https://tonejs.github.io/audio/salamander/"

}).toDestination();


/* =========================================================
   AUDIO
========================================================= */

async function ensureAudioReady() {

  if (audioReady) {
    return;
  }

  pianoStatus.textContent =
    "Loading piano sound...";

  playbackStatus.textContent =
    "Loading piano";

  playbackSubstatus.textContent =
    "Preparing piano sound";


  await Tone.start();

  await Tone.loaded();


  audioReady = true;


  pianoStatus.textContent =
    "Ready";

}


/* =========================================================
   BUILD PIANO
========================================================= */

function createPiano() {

  piano.innerHTML = "";


  const whiteNotes =
    pianoNotes.filter(
      note => !note.includes("#")
    );


  /* -----------------------------------------
     WHITE KEYS
  ----------------------------------------- */

  whiteNotes.forEach(note => {

    const key =
      document.createElement("div");


    key.className =
      "white-key";


    key.dataset.note =
      note;


    if (note.startsWith("C")) {

      key.classList.add("is-c");

    }


    key.addEventListener(
      "pointerdown",
      async event => {

        event.preventDefault();

        await playManualNote(
          note,
          key
        );

      }
    );


    piano.appendChild(key);

  });


  /* -----------------------------------------
     BLACK KEY POSITION
  ----------------------------------------- */

  const blackPositions = {

    "C#": 1,
    "D#": 2,
    "F#": 4,
    "G#": 5,
    "A#": 6

  };


  const whiteKeyCount =
    whiteNotes.length;


  pianoNotes
    .filter(note => note.includes("#"))
    .forEach(note => {

      const noteName =
        note.replace(/[0-9]/g, "");


      const octave =
        parseInt(
          note.replace(/\D/g, ""),
          10
        );


      const whitesBefore =
        whiteNotes.filter(
          whiteNote => {

            const whiteOctave =
              parseInt(
                whiteNote.replace(/\D/g, ""),
                10
              );


            return whiteOctave < octave;

          }
        ).length;


      const position =
        whitesBefore +
        blackPositions[noteName];


      const left =
        (position / whiteKeyCount) * 100;


      const key =
        document.createElement("div");


      key.className =
        "black-key";


      key.dataset.note =
        note;


      key.style.left =
        `${left}%`;


      key.addEventListener(
        "pointerdown",
        async event => {

          event.preventDefault();

          await playManualNote(
            note,
            key
          );

        }
      );


      piano.appendChild(key);

    });

}


/* =========================================================
   MANUAL NOTE
========================================================= */

async function playManualNote(
  note,
  key
) {

  try {

    await ensureAudioReady();


    sampler.triggerAttackRelease(
      note,
      "4n"
    );


    highlightKey(
      note,
      0.45,
      "both"
    );


  } catch (error) {

    console.error(
      "Piano audio error:",
      error
    );

  }

}


/* =========================================================
   GET KEY
========================================================= */

function getKey(note) {

  return piano.querySelector(
    `[data-note="${note}"]`
  );

}


/* =========================================================
   CLEAR HIGHLIGHTS
========================================================= */

function clearHighlights() {

  highlightTimers.forEach(
    timer => clearTimeout(timer)
  );

  highlightTimers.clear();


  piano
    .querySelectorAll(".active")
    .forEach(key => {

      key.classList.remove(
        "active",
        "right-hand",
        "left-hand",
        "both-hands"
      );

    });

}


/* =========================================================
   HIGHLIGHT
========================================================= */

function highlightKey(
  note,
  duration,
  hand
) {

  const key =
    getKey(note);


  if (!key) {
    return;
  }


  key.classList.add("active");


  key.classList.remove(
    "right-hand",
    "left-hand",
    "both-hands"
  );


  if (hand === "right") {

    key.classList.add(
      "right-hand"
    );

  }

  else if (hand === "left") {

    key.classList.add(
      "left-hand"
    );

  }

  else {

    key.classList.add(
      "both-hands"
    );

  }


  const timer =
    setTimeout(() => {

      key.classList.remove(
        "active",
        "right-hand",
        "left-hand",
        "both-hands"
      );


      highlightTimers.delete(timer);

    }, duration * 1000);


  highlightTimers.add(timer);

}


/* =========================================================
   PLAY STEP
========================================================= */

function playCurrentStep() {

  const song =
    songs[selectedSong];


  if (
    !song ||
    song.steps.length === 0
  ) {

    playing = false;

    updatePlayButton();

    pianoStatus.textContent =
      "Arrangement needed";

    playbackStatus.textContent =
      "Arrangement needed";

    playbackSubstatus.textContent =
      "Add your arrangement first.";

    return;

  }


  if (
    currentStep >= song.steps.length
  ) {

    finishPlayback();

    return;

  }


  const step =
    song.steps[currentStep];


  const duration =
    step.duration /
    playbackSpeed;


  const notes = [];


  /* RIGHT HAND */

  if (
    practiceMode === "both" ||
    practiceMode === "right"
  ) {

    step.right.forEach(note => {

      notes.push(note);

      highlightKey(
        note,
        duration,
        "right"
      );

    });

  }


  /* LEFT HAND */

  if (
    practiceMode === "both" ||
    practiceMode === "left"
  ) {

    step.left.forEach(note => {

      notes.push(note);

      highlightKey(
        note,
        duration,
        "left"
      );

    });

  }


  /* PLAY TOGETHER */

  if (notes.length > 0) {

    sampler.triggerAttackRelease(
      notes,
      duration
    );

  }


  pianoStatus.textContent =
    `Playing ${currentStep + 1} / ${song.steps.length}`;


  playbackStatus.textContent =
    "Playing";


  playbackSubstatus.textContent =
    `${currentStep + 1} of ${song.steps.length}`;


  playbackTimer =
    setTimeout(() => {

      if (!playing) {
        return;
      }


      currentStep++;


      playCurrentStep();

    }, duration * 1000);

}


/* =========================================================
   START
========================================================= */

async function startPlayback() {

  if (playing) {
    return;
  }


  const song =
    songs[selectedSong];


  if (
    !song ||
    song.steps.length === 0
  ) {

    pianoStatus.textContent =
      "Arrangement needed";

    playbackStatus.textContent =
      "Arrangement needed";

    playbackSubstatus.textContent =
      "Add your arrangement first.";

    return;

  }


  try {

    await ensureAudioReady();


    playing = true;


    updatePlayButton();


    playCurrentStep();

  }

  catch (error) {

    console.error(error);

    playing = false;

    updatePlayButton();

  }

}


/* =========================================================
   PAUSE
========================================================= */

function pausePlayback() {

  if (!playing) {
    return;
  }


  playing = false;


  if (playbackTimer) {

    clearTimeout(
      playbackTimer
    );

    playbackTimer = null;

  }


  sampler.releaseAll();

  clearHighlights();


  updatePlayButton();


  pianoStatus.textContent =
    "Paused";


  playbackStatus.textContent =
    "Paused";


  playbackSubstatus.textContent =
    "Press play to continue.";

}


/* =========================================================
   REPLAY
========================================================= */

function replayPlayback() {

  playing = false;


  if (playbackTimer) {

    clearTimeout(
      playbackTimer
    );

    playbackTimer = null;

  }


  currentStep = 0;


  sampler.releaseAll();

  clearHighlights();


  updatePlayButton();


  pianoStatus.textContent =
    "Ready";


  playbackStatus.textContent =
    "Ready";


  playbackSubstatus.textContent =
    "Press play to begin.";

}


/* =========================================================
   FINISH
========================================================= */

function finishPlayback() {

  playing = false;

  currentStep = 0;

  playbackTimer = null;


  sampler.releaseAll();

  clearHighlights();


  updatePlayButton();


  pianoStatus.textContent =
    "Complete";


  playbackStatus.textContent =
    "Complete";


  playbackSubstatus.textContent =
    "Press play to listen again.";

}


/* =========================================================
   PLAY ICON
========================================================= */

function updatePlayButton() {

  if (playing) {

    playIcon.className =
      "ri-pause-fill";


    playButton.setAttribute(
      "aria-label",
      "Pause"
    );

  }

  else {

    playIcon.className =
      "ri-play-fill";


    playButton.setAttribute(
      "aria-label",
      "Play"
    );

  }

}


/* =========================================================
   PIECE
========================================================= */

function updatePiece() {

  const song =
    songs[selectedSong];


  if (!song) {
    return;
  }


  pieceTitle.textContent =
    song.title;


  pieceControlText.textContent =
    song.title;


  replayPlayback();


  if (
    selectedSong === "allofme"
  ) {

    pianoStatus.textContent =
      "Arrangement needed";

    playbackStatus.textContent =
      "All of Me";

    playbackSubstatus.textContent =
      "Your arrangement will be added here.";

  }

}


/* =========================================================
   HAND
========================================================= */

function updateHand() {

  const labels = {

    both: "Both Hands",

    right: "Right Hand",

    left: "Left Hand"

  };


  const label =
    labels[practiceMode];


  handControlText.textContent =
    label;


  pianoMode.textContent =
    label;


  replayPlayback();

}


/* =========================================================
   SPEED
========================================================= */

function updateSpeed() {

  const labels = {

    "0.5": "0.5× Slow",

    "0.75": "0.75×",

    "1": "1× Normal",

    "1.25": "1.25×",

    "1.5": "1.5× Fast"

  };


  speedControlText.textContent =
    labels[String(playbackSpeed)];

}


/* =========================================================
   EVENTS
========================================================= */


/* PIECE */

pieceSelect.addEventListener(
  "change",
  () => {

    selectedSong =
      pieceSelect.value;


    updatePiece();

  }
);


/* HAND */

handSelect.addEventListener(
  "change",
  () => {

    practiceMode =
      handSelect.value;


    updateHand();

  }
);


/* SPEED */

speedSelect.addEventListener(
  "change",
  () => {

    playbackSpeed =
      Number(
        speedSelect.value
      );


    updateSpeed();

  }
);


/* PLAY */

playButton.addEventListener(
  "click",
  async () => {

    if (playing) {

      pausePlayback();

    }

    else {

      await startPlayback();

    }

  }
);


/* REPLAY */

replayButton.addEventListener(
  "click",
  () => {

    replayPlayback();

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

createPiano();

updatePiece();

updateHand();

updateSpeed();

updatePlayButton();






// ===============================
// PWA SERVICE WORKER
// ===============================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "Piano Lab service worker registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "Piano Lab service worker registration failed:",
          error
        );
      });
  });
}
