/* =========================================================
   PIANO LAB
   Main piano + playback controller
========================================================= */


/* =========================================================
   DOM
========================================================= */

const pianoElement = document.getElementById("piano");

const pieceSelect = document.getElementById("pieceSelect");
const handSelect = document.getElementById("handSelect");
const speedSelect = document.getElementById("speedSelect");

const replayButton = document.getElementById("replayButton");
const playButton = document.getElementById("playButton");

const playIcon = document.getElementById("playIcon");

const playbackStatus = document.getElementById("playbackStatus");
const playbackSubstatus = document.getElementById("playbackSubstatus");

const lessonStatus = document.getElementById("lessonStatus");
const lessonModeTitle = document.getElementById("lessonModeTitle");

const speedDisplay = document.getElementById("speedDisplay");

const mainPieceTitle = document.getElementById("mainPieceTitle");
const mainPieceDescription = document.getElementById("mainPieceDescription");

const pianoPieceName = document.getElementById("pianoPieceName");

const notePreview = document.getElementById("notePreview");


/* =========================================================
   PIANO SETTINGS
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
   NOTE DATA
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


function buildNoteList() {

  const notes = [];

  for (let octave = START_OCTAVE; octave <= END_OCTAVE; octave++) {

    for (const note of noteNames) {

      if (octave === END_OCTAVE && note !== "C") {
        continue;
      }

      notes.push(`${note}${octave}`);
    }
  }

  return notes;
}


const pianoNotes = buildNoteList();


/* =========================================================
   SONG DATA
========================================================= */

/*
  NOTE:

  "Gentle Beginning" is an original practice piece.

  "All of Me" is intentionally NOT given a note-for-note
  copyrighted transcription here.

  When you provide your own legally obtained arrangement,
  MIDI or MusicXML, we can replace the All of Me data below.
*/


const songs = {

  gentle: {

    title: "Gentle Beginning",

    description:
      "A simple beginner piece for learning basic piano movement, timing and two-hand coordination.",

    tempo: 72,

    steps: [

      {
        right: ["C4"],
        left: ["C3"],
        duration: 1.0
      },

      {
        right: ["E4"],
        left: ["G2"],
        duration: 1.0
      },

      {
        right: ["G4"],
        left: ["C3"],
        duration: 1.0
      },

      {
        right: ["E4"],
        left: ["G2"],
        duration: 1.0
      },

      {
        right: ["C4", "E4"],
        left: ["C3"],
        duration: 1.0
      },

      {
        right: ["D4", "G4"],
        left: ["G2"],
        duration: 1.0
      },

      {
        right: ["C4", "E4"],
        left: ["C3"],
        duration: 1.0
      },

      {
        right: ["G4"],
        left: ["G2"],
        duration: 1.0
      }

    ]

  },


  allofme: {

    title: "All of Me",

    description:
      "Your arrangement will be added here. Import your own MIDI, MusicXML or note arrangement to make this playable.",

    tempo: 72,

    steps: []

  }

};


/* =========================================================
   TONE.JS PIANO
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
   AUDIO INITIALIZATION
========================================================= */

async function ensureAudioReady() {

  if (!audioReady) {

    updateStatus(
      "Loading piano",
      "Preparing real piano samples..."
    );

    await Tone.start();

    await Tone.loaded();

    audioReady = true;
  }

}


/* =========================================================
   BUILD PIANO
========================================================= */

function createPiano() {

  pianoElement.innerHTML = "";

  const whiteNotes = pianoNotes.filter(
    note => !note.includes("#")
  );

  const whiteKeyElements = {};


  /* -----------------------------------------
     WHITE KEYS
  ----------------------------------------- */

  whiteNotes.forEach((note) => {

    const key = document.createElement("div");

    key.className = "white-key";

    key.dataset.note = note;

    key.addEventListener("pointerdown", async (event) => {

      event.preventDefault();

      await playManualNote(note, key);

    });

    pianoElement.appendChild(key);

    whiteKeyElements[note] = key;

  });


  /* -----------------------------------------
     BLACK KEYS
  ----------------------------------------- */

  const blackPositions = {
    "C#": 1,
    "D#": 2,
    "F#": 4,
    "G#": 5,
    "A#": 6
  };


  pianoNotes
    .filter(note => note.includes("#"))
    .forEach(note => {

      const noteName = note.replace(/[0-9]/g, "");

      const octave =
        parseInt(note.replace(/\D/g, ""), 10);

      const previousWhiteCount =
        whiteNotes.filter(whiteNote => {

          const whiteOctave =
            parseInt(
              whiteNote.replace(/\D/g, ""),
              10
            );

          return whiteOctave < octave;

        }).length;

      const position =
        previousWhiteCount +
        blackPositions[noteName];


      const percentage =
        (position / whiteNotes.length) * 100;


      const key = document.createElement("div");

      key.className = "black-key";

      key.dataset.note = note;

      key.style.left = `${percentage}%`;

      key.style.transform = "translateX(-50%)";


      key.addEventListener("pointerdown", async (event) => {

        event.preventDefault();

        await playManualNote(note, key);

      });


      pianoElement.appendChild(key);

    });

}


/* =========================================================
   MANUAL PIANO
========================================================= */

async function playManualNote(note, keyElement) {

  try {

    await ensureAudioReady();

    sampler.triggerAttackRelease(
      note,
      "4n"
    );

    highlightKey(
      note,
      0.45,
      "right"
    );

  } catch (error) {

    console.error("Piano sound error:", error);

    updateStatus(
      "Audio error",
      "Tap the piano again to retry."
    );

  }

}


/* =========================================================
   FIND PIANO KEY
========================================================= */

function getKey(note) {

  return pianoElement.querySelector(
    `[data-note="${note}"]`
  );

}


/* =========================================================
   CLEAR HIGHLIGHTS
========================================================= */

function clearHighlights() {

  highlightTimers.forEach(timer => {

    clearTimeout(timer);

  });

  highlightTimers.clear();


  pianoElement
    .querySelectorAll(".active")
    .forEach(key => {

      key.classList.remove(
        "active",
        "right-hand",
        "left-hand"
      );

    });

}


/* =========================================================
   HIGHLIGHT KEY
========================================================= */

function highlightKey(
  note,
  duration,
  hand = "right"
) {

  const key = getKey(note);

  if (!key) return;


  key.classList.add("active");

  key.classList.add(
    hand === "left"
      ? "left-hand"
      : "right-hand"
  );


  const timer = setTimeout(() => {

    key.classList.remove("active");

    key.classList.remove(
      "right-hand",
      "left-hand"
    );

    highlightTimers.delete(timer);

  }, duration * 1000);


  highlightTimers.add(timer);

}


/* =========================================================
   PLAY CURRENT STEP
========================================================= */

async function playCurrentStep() {

  const song = songs[selectedSong];

  if (!song || song.steps.length === 0) {

    updateStatus(
      "Arrangement needed",
      "Add your All of Me arrangement first."
    );

    playing = false;

    updatePlayButton();

    return;

  }


  if (currentStep >= song.steps.length) {

    finishPlayback();

    return;

  }


  const step = song.steps[currentStep];

  const duration =
    step.duration / playbackSpeed;


  const notesToPlay = [];

  const rightNotes = [];
  const leftNotes = [];


  /* -----------------------------------------
     SELECT HAND
  ----------------------------------------- */

  if (
    practiceMode === "both" ||
    practiceMode === "right"
  ) {

    step.right.forEach(note => {

      rightNotes.push(note);

      notesToPlay.push(note);

    });

  }


  if (
    practiceMode === "both" ||
    practiceMode === "left"
  ) {

    step.left.forEach(note => {

      leftNotes.push(note);

      notesToPlay.push(note);

    });

  }


  /* -----------------------------------------
     PLAY NOTES
  ----------------------------------------- */

  if (notesToPlay.length > 0) {

    sampler.triggerAttackRelease(
      notesToPlay,
      duration
    );

  }


  /* -----------------------------------------
     HIGHLIGHT RIGHT HAND
  ----------------------------------------- */

  rightNotes.forEach(note => {

    highlightKey(
      note,
      duration,
      "right"
    );

  });


  /* -----------------------------------------
     HIGHLIGHT LEFT HAND
  ----------------------------------------- */

  leftNotes.forEach(note => {

    highlightKey(
      note,
      duration,
      "left"
    );

  });


  /* -----------------------------------------
     UPDATE UI
  ----------------------------------------- */

  updateStatus(
    `Step ${currentStep + 1}`,
    `${song.steps.length} steps`
  );


  /* -----------------------------------------
     MOVE TO NEXT STEP
  ----------------------------------------- */

  playbackTimer = setTimeout(() => {

    if (!playing) return;

    currentStep++;

    playCurrentStep();

  }, duration * 1000);

}


/* =========================================================
   START PLAYBACK
========================================================= */

async function startPlayback() {

  if (playing) return;


  const song = songs[selectedSong];


  if (!song || song.steps.length === 0) {

    updateStatus(
      "Arrangement needed",
      "Add your All of Me arrangement first."
    );

    return;

  }


  try {

    await ensureAudioReady();

    playing = true;

    updatePlayButton();

    updateLessonStatus("Playing");

    playCurrentStep();

  } catch (error) {

    console.error(error);

    playing = false;

    updatePlayButton();

    updateStatus(
      "Could not start",
      "Tap play again."
    );

  }

}


/* =========================================================
   PAUSE
========================================================= */

function pausePlayback() {

  if (!playing) return;


  playing = false;


  if (playbackTimer) {

    clearTimeout(playbackTimer);

    playbackTimer = null;

  }


  sampler.releaseAll();

  clearHighlights();

  updatePlayButton();


  updateStatus(
    "Paused",
    "Press play to continue."
  );


  updateLessonStatus("Paused");

}


/* =========================================================
   REPLAY
========================================================= */

function replayPlayback() {

  playing = false;


  if (playbackTimer) {

    clearTimeout(playbackTimer);

    playbackTimer = null;

  }


  currentStep = 0;


  sampler.releaseAll();

  clearHighlights();


  updatePlayButton();


  updateStatus(
    "Ready",
    "Press play to begin."
  );


  updateLessonStatus("Ready");

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

  updateStatus(
    "Complete",
    "Press play to listen again."
  );

  updateLessonStatus("Complete");

}


/* =========================================================
   PLAY BUTTON UI
========================================================= */

function updatePlayButton() {

  if (playing) {

    playIcon.className =
      "ri-pause-fill";

    playButton.setAttribute(
      "aria-label",
      "Pause"
    );

  } else {

    playIcon.className =
      "ri-play-fill";

    playButton.setAttribute(
      "aria-label",
      "Play"
    );

  }

}


/* =========================================================
   STATUS
========================================================= */

function updateStatus(
  mainText,
  subText
) {

  playbackStatus.textContent =
    mainText;

  playbackSubstatus.textContent =
    subText;

  lessonStatus.textContent =
    mainText;

}


/* =========================================================
   LESSON STATUS
========================================================= */

function updateLessonStatus(status) {

  lessonStatus.textContent =
    status;

}


/* =========================================================
   PIECE UI
========================================================= */

function updatePieceUI() {

  const song = songs[selectedSong];

  if (!song) return;


  mainPieceTitle.textContent =
    song.title;


  mainPieceDescription.textContent =
    song.description;


  pianoPieceName.textContent =
    song.title;


  updateNotePreview();


  replayPlayback();


  if (selectedSong === "allofme") {

    updateStatus(
      "Arrangement needed",
      "Your arrangement will appear here."
    );

  }

}


/* =========================================================
   NOTE PREVIEW
========================================================= */

function updateNotePreview() {

  const song = songs[selectedSong];

  notePreview.innerHTML = "";


  if (!song || song.steps.length === 0) {

    const empty = document.createElement("div");

    empty.className = "preview-note";

    empty.textContent =
      "Waiting for arrangement";

    notePreview.appendChild(empty);

    return;

  }


  const previewNotes = [];


  song.steps.slice(0, 4).forEach(step => {

    if (step.right[0]) {

      previewNotes.push(
        step.right[0]
      );

    }

  });


  previewNotes.forEach(note => {

    const item =
      document.createElement("div");

    item.className =
      "preview-note";

    item.textContent =
      note;

    notePreview.appendChild(item);

  });

}


/* =========================================================
   HAND UI
========================================================= */

function updateHandUI() {

  const names = {

    both: "Both Hands",

    right: "Right Hand",

    left: "Left Hand"

  };


  lessonModeTitle.textContent =
    names[practiceMode];


  replayPlayback();

}


/* =========================================================
   SPEED UI
========================================================= */

function updateSpeedUI() {

  speedDisplay.textContent =
    `${playbackSpeed}×`;

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

    updatePieceUI();

  }
);


/* HAND */

handSelect.addEventListener(
  "change",
  () => {

    practiceMode =
      handSelect.value;

    updateHandUI();

  }
);


/* SPEED */

speedSelect.addEventListener(
  "change",
  () => {

    playbackSpeed =
      Number(speedSelect.value);

    updateSpeedUI();

  }
);


/* PLAY / PAUSE */

playButton.addEventListener(
  "click",
  async () => {

    if (playing) {

      pausePlayback();

    } else {

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


/* SETTINGS */

document
  .getElementById("settingsButton")
  .addEventListener(
    "click",
    () => {

      updateStatus(
        "Settings",
        "Settings will be available soon."
      );

    }
  );


/* =========================================================
   INITIALIZE
========================================================= */

createPiano();

updatePieceUI();

updateHandUI();

updateSpeedUI();

updatePlayButton();
