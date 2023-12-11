let isRunning = false;
let interval;

self.onmessage = function (event) {
    if (event.data === 'start') {
        isRunning = true;
        interval = setInterval(() => {
            self.postMessage('tick');
        }, 10);
    } else if (event.data === 'stop') {
        clearInterval(interval);
        isRunning = false;
    }
};
