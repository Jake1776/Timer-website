const timersContainer = document.getElementById("timersContainer");
const newTimerBtn = document.getElementById("newTimerBtn");

// Load existing timers from local storage on page load
window.addEventListener("load", loadTimers);

newTimerBtn.addEventListener("click", createTimer);

function createButton(text) {
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add("button");
    return button;
}

function createTimer(timerData) {
    const timerBox = document.createElement("div");
    timerBox.classList.add("timer-box");

    const centerX = (window.innerWidth - 300) / 2;
    const centerY = (window.innerHeight - 200) / 2;
    timerBox.style.left = `${centerX}px`;
    timerBox.style.top = `${centerY}px`;

    const timerName = document.createElement("div");
    timerName.classList.add("timer-name");
    timerName.textContent = "Case/CAD #";
    timerName.contentEditable = true;

    timerName.addEventListener("focus", function () {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this);
        selection.removeAllRanges();
        selection.addRange(range);
    });

    timerName.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            timerName.textContent = timerName.textContent.toUpperCase();
            timerName.blur();
        }
    });

    const timerDisplay = document.createElement("div");
    timerDisplay.classList.add("timer-time");
    timerDisplay.textContent = "00:00:00.00";      

    const startPauseBtn = createButton("Start");
    startPauseBtn.classList.add('start');
    const resetBtn = createButton("Reset");
    const deleteBtn = createButton("Delete");

    let isRunning = false;
    let interval;

    const worker = new Worker('timer-worker.js');

    startPauseBtn.addEventListener("click", () => {
      if (isRunning) {
          worker.postMessage('stop');
          isRunning = false;
          startPauseBtn.textContent = "Start";
          startPauseBtn.classList.remove('stop');
          startPauseBtn.classList.add('start');
      } else {
          worker.postMessage('start');
          isRunning = true;
          startPauseBtn.textContent = "Pause";
          startPauseBtn.classList.remove('start');
          startPauseBtn.classList.add('stop');
      }
  });

    worker.onmessage = function (event) {
        if (event.data === 'tick') {
            updateTimer(timerDisplay);
        }
    };

    resetBtn.addEventListener("click", () => {
        clearInterval(interval);
        timerDisplay.textContent = "00:00:00.00";
        isRunning = false;
        startPauseBtn.textContent = "Start";
        startPauseBtn.classList.remove('stop');
        startPauseBtn.classList.add('start');

        worker.postMessage('stop')
    });

    deleteBtn.addEventListener("click", () => {
        timerBox.remove();
        // Remove timer data from local storage when deleted
        removeTimerFromLocalStorage(timerBox);
    });

    timerBox.appendChild(timerName);
    timerBox.appendChild(timerDisplay);
    timerBox.appendChild(startPauseBtn);
    timerBox.appendChild(resetBtn);
    timerBox.appendChild(deleteBtn);

    timersContainer.appendChild(timerBox);

    makeDraggable(timerBox);

    setTimeout(() => {
        timerName.focus();
    }, 10);

    // Check if timerData is provided (for loading existing timers)
    if (timerData) {
        // Populate timerBox with data from timerData
        timerName.textContent = timerData.name || "Case/CAD #";
        timerDisplay.textContent = timerData.display || "00:00:00.00";
        // Additional setup based on your timerData
    }

    // Save the timer data to local storage
    saveTimerToLocalStorage(timerBox);
}

function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;
    element.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            element.style.left = e.clientX - offsetX + "px";
            element.style.top = e.clientY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

function saveTimerToLocalStorage(timerBox) {
    // Generate a unique key for each timer based on its position
    const timerKey = `timer_${timersContainer.children.length}`;

    // Save relevant timer data to local storage
    localStorage.setItem(timerKey, JSON.stringify({
        name: timerBox.querySelector(".timer-name").textContent,
        display: timerBox.querySelector(".timer-time").textContent,
        // Add other timer properties as needed
    }));
}

function removeTimerFromLocalStorage(timerBox) {
    // Loop through local storage keys and remove the matching timer data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("timer_")) {
            const storedTimerData = JSON.parse(localStorage.getItem(key));
            const currentTimerName = timerBox.querySelector(".timer-name").textContent;

            if (storedTimerData.name === currentTimerName) {
                localStorage.removeItem(key);
                break;
            }
        }
    }
}

function loadTimers() {
    // Loop through local storage keys and load existing timers
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("timer_")) {
            const timerData = JSON.parse(localStorage.getItem(key));
            createTimer(timerData);
        }
    }
}

let intervalId = null;

function startTimer(timerDisplay) {
    if (intervalId !== null) {
        return;
    }

    intervalId = setInterval(() => {
        updateTimer(timerDisplay);
    }, 10);
}

function updateTimer(timerDisplay) {
    const timeParts = timerDisplay.textContent.split(/[:.]/);
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);
    let seconds = parseInt(timeParts[2]);
    let milliseconds = parseInt(timeParts[3] || 0);

    milliseconds += 1;

    if (milliseconds >= 100) {
        milliseconds = 0;
        seconds += 1;
    }

    if (seconds >= 60) {
        seconds = 0;
        minutes += 1;
    }

    if (minutes >= 60) {
        minutes = 0;
        hours += 1;
    }

    const formattedMilliseconds = String(milliseconds).padStart(2, '0');
    
    timerDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${formattedMilliseconds}`;
}