/* ==========================================
   PIANO LAB
   VERSION 2
   Piano Engine
========================================== */


/* ==========================================
   ELEMENTS
========================================== */

const piano =
  document.getElementById("piano");

const statusText =
  document.getElementById("status");

const currentNotes =
  document.getElementById("currentNotes");

const playButton =
  document.getElementById("playButton");

const playIcon =
  document.getElementById("playIcon");

const restartButton =
  document.getElementById("restartButton");

const pieceTitle =
  document.getElementById("pieceTitle");

const pieceSubtitle =
  document.getElementById("pieceSubtitle");

const handControl =
  document.getElementById("handControl");

const speedLabel =
  document.getElementById("speedLabel");


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
   CREATE C2 → C5
========================================== */

const pianoNotes = [];


for (
  let octave = 2;
  octave <= 4;
  octave++
) {

  noteNames.forEach(note => {

    pianoNotes.push(
      `${note}${octave}`
    );

  });

}


pianoNotes.push("C5");


/* ==========================================
   WHITE NOTES
========================================== */

const whiteKeyNotes =
  pianoNotes.filter(note => {

    const name =
      note.replace(/[0-9]/g, "");

    return whiteNotes.includes(name);

  });


/* ==========================================
   CREATE WHITE KEYS
========================================== */

whiteKeyNotes.forEach(note => {

  const key =
    document.createElement("div");

  key.className =
    "key white";

  key.dataset.note =
    note;

  key.textContent =
    note;

  piano.appendChild(key);

});


/* ==========================================
   BLACK KEY POSITIONS
========================================== */

const blackPositions = {

  "C#": 1,
  "D#": 2,
  "F#": 4,
  "G#": 5,
  "A#": 6

};


/* ==========================================
   CREATE BLACK KEYS
========================================== */

pianoNotes.forEach(note => {

  const name =
    note.replace(/[0-9]/g, "");

  if (
    !blackNotes.includes(name)
  ) {

    return;

  }


  const octave =
    Number(
      note.match(/[0-9]/)[0]
    );


  const octaveOffset =
    (octave - 2) * 7;


  const whitePosition =
    octaveOffset +
    blackPositions[name];


  const percentage =
    whitePosition /
    whiteKeyNotes.length *
    100;


  const key =
    document.createElement("div");


  key.className =
    "key black";

  key.dataset.note =
    note;

  key.textContent =
    note;


  key.style.left =
    `${percentage}%`;


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
   AUDIO START
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
   DISPLAY NOTES
========================================== */

function showNotes(notes) {

  currentNotes.innerHTML = "";


  if (
    !notes ||
    !notes.length
  ) {

    currentNotes.innerHTML = `
      <span class="empty-note">
        Ready when you are
      </span>
    `;

    return;

  }


  notes.forEach(note => {

    const element =
      document.createElement("span");

    element.className =
      "note";

    element.textContent =
      note;

    currentNotes.appendChild(
      element
    );

  });

}


/* ==========================================
   HIGHLIGHT
========================================== */

function highlightKey(
  note,
  duration,
  hand
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
  duration,
  hand
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

}


/* ==========================================
   SONG DATA
========================================== */

/*
   IMPORTANT:

   "Gentle Beginning" is an original
   beginner practice piece.

   The All of Me slot is included so the
   system can later receive a user-provided
   legal MIDI / note arrangement.

   We are not reproducing the copyrighted
   song transcription here.
*/


const songs = {

  gentle: {

    title:
      "Gentle Beginning",

    subtitle:
      "Beginner Piano Study",

    steps: [

      {
        left: ["C2"],
        right: ["C4", "E4", "G4"],
        duration: 1
      },

      {
        left: ["A2"],
        right: ["A3", "C4", "E4"],
        duration: 1
      },

      {
        left: ["F2"],
        right: ["A3", "C4", "F4"],
        duration: 1
      },

      {
        left: ["G2"],
        right: ["B3", "D4", "G4"],
        duration: 1
      },

      {
        left: ["C2"],
        right: ["E4", "G4", "C5"],
        duration: 1.4
      }

    ]

  },


  allofme: {

    title:
      "All of Me",

    subtitle:
      "Practice Piece",

    steps: [

      /*
        Placeholder.

        Replace these steps with your own
        legally obtained notes/MIDI arrangement
        when available.
      */

      {
        left: ["C2"],
        right: ["C4", "E4", "G4"],
        duration: 1
      },

      {
        left: ["A2"],
        right: ["A3", "C4", "E4"],
        duration: 1
      },

      {
        left: ["F2"],
        right: ["A3", "C4", "F4"],
        duration: 1
      },

      {
        left: ["G2"],
        right: ["B3", "D4", "G4"],
        duration: 1
      }

    ]

  }

};


/* ==========================================
   PLAYBACK STATE
========================================== */

let selectedSong =
  "gentle";

let practiceMode =
  "both";

let speed =
  1;

let currentStep =
  0;

let playing =
  false;

let paused =
  false;

let timer =
  null;


/* ==========================================
   CURRENT SONG
========================================== */

function getSong() {

  return songs[selectedSong];

}


/* ==========================================
   UPDATE PIECE UI
========================================== */

function updatePieceUI() {

  const song =
    getSong();

  pieceTitle.textContent =
    song.title;

  pieceSubtitle.textContent =
    song.subtitle;

}


/* ==========================================
   UPDATE PLAY ICON
========================================== */

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


/* ==========================================
   PLAY CURRENT STEP
========================================== */

function playCurrentStep() {

  if (!playing) {

    return;

  }


  const song =
    getSong();


  if (
    currentStep >=
    song.steps.length
  ) {

    finishSong();

    return;

  }


  const step =
    song.steps[currentStep];


  const duration =
    step.duration /
    speed;


  const notesToShow = [];


  if (
    practiceMode === "left"
  ) {

    playNotes(
      step.left,
      duration,
      "left"
    );

    notesToShow.push(
      ...step.left
    );

  }


  else if (
    practiceMode === "right"
  ) {

    playNotes(
      step.right,
      duration,
      "right"
    );

    notesToShow.push(
      ...step.right
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

    notesToShow.push(
      ...step.left,
      ...step.right
    );

  }


  showNotes(
    [...new Set(notesToShow)]
  );


  currentStep++;


  timer =
    setTimeout(
      playCurrentStep,
      duration * 1000
    );

}


/* ==========================================
   START / RESUME
========================================== */

async function startPlayback() {

  await startAudio();


  if (playing) {

    return;

  }


  const song =
    getSong();


  if (
    currentStep >=
    song.steps.length
  ) {

    currentStep = 0;

  }


  playing = true;

  paused = false;


  statusText.textContent =
    "Playing";


  updatePlayButton();


  playCurrentStep();

}


/* ==========================================
   PAUSE
========================================== */

function pausePlayback() {

  if (!playing) {

    return;

  }


  playing = false;

  paused = true;


  clearTimeout(timer);

  timer = null;


  pianoSampler.releaseAll();


  statusText.textContent =
    "Paused";


  updatePlayButton();

}


/* ==========================================
   REPLAY
========================================== */

function replayPlayback() {

  clearTimeout(timer);

  timer = null;


  playing = false;

  paused = false;


  pianoSampler.releaseAll();


  currentStep = 0;


  showNotes([]);


  statusText.textContent =
    "Ready";


  updatePlayButton();

}


/* ==========================================
   FINISH
========================================== */

function finishSong() {

  clearTimeout(timer);

  timer = null;


  playing = false;

  paused = false;


  pianoSampler.releaseAll();


  currentStep = 0;


  statusText.textContent =
    "Finished";


  updatePlayButton();

}


/* ==========================================
   MAIN PLAY / PAUSE BUTTON
========================================== */

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


/* ==========================================
   REPLAY BUTTON
========================================== */

restartButton.addEventListener(
  "click",
  () => {

    replayPlayback();

  }
);


/* ==========================================
   PIANO MANUAL PLAY
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


    pianoSampler.triggerAttackRelease(
      note,
      0.9
    );


    key.classList.add(
      "active",
      "right-hand"
    );


    setTimeout(() => {

      key.classList.remove(
        "active",
        "right-hand"
      );

    }, 900);


    showNotes([note]);

  }
);


/* ==========================================
   DROPDOWN SYSTEM
========================================== */

const controlWrappers =
  document.querySelectorAll(
    ".control-wrapper"
  );


controlWrappers.forEach(wrapper => {

  const button =
    wrapper.querySelector(
      ".quick-control"
    );


  button.addEventListener(
    "click",
    event => {

      event.stopPropagation();


      controlWrappers.forEach(
        other => {

          if (
            other !== wrapper
          ) {

            other.classList.remove(
              "open"
            );

          }

        }
      );


      wrapper.classList.toggle(
        "open"
      );

    }
  );

});


document.addEventListener(
  "click",
  () => {

    controlWrappers.forEach(
      wrapper => {

        wrapper.classList.remove(
          "open"
        );

      }
    );

  }
);


/* ==========================================
   PIECE SELECTION
========================================== */

document
  .querySelectorAll(
    "[data-piece]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectedSong =
          button.dataset.piece;


        replayPlayback();


        updatePieceUI();


        document
          .getElementById(
            "pieceControl"
          )
          .querySelector(
            "span"
          )
          .textContent =
            songs[selectedSong].title;

      }
    );

  });


/* ==========================================
   HAND SELECTION
========================================== */

document
  .querySelectorAll(
    "[data-hand]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        practiceMode =
          button.dataset.hand;


        const names = {

          both:
            "Both",

          right:
            "Right",

          left:
            "Left"

        };


        handControl
          .querySelector(
            "span"
          )
          .textContent =
            names[practiceMode];


        replayPlayback();

      }
    );

  });


/* ==========================================
   SPEED SELECTION
========================================== */

document
  .querySelectorAll(
    "[data-speed]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        speed =
          Number(
            button.dataset.speed
          );


        speedLabel.textContent =
          `${speed * 100}%`;


        replayPlayback();

      }
    );

  });


/* ==========================================
   INITIAL UI
========================================== */

updatePieceUI();

updatePlayButton();

console.log(
  "Piano Lab Version 2 loaded."
);
 
