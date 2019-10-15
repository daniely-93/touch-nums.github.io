var gNums = [];
var gNextNum = 1;
var gSize = 0;
var gGameCounter = 0;

function init() {
    chooseLevel();
    renderBoard(gSize);
}

function resetGame() {
    gNextNum = 1;
    var elCurrNumber = document.querySelector('.info .counter');
    elCurrNumber.innerText = 'Current Number : ' + gNextNum;

    var elPyro = document.querySelector('.game-container .pyro');
    if (elPyro) elPyro.remove();
    stopwatch.stop();
    stopwatch.reset();
    stopwatch.print();
    init();
}

function chooseLevel() {
    var elSize = document.querySelectorAll('.radio-btn [type=radio]');
    for (var x = 0; x < elSize.length; x++) {
        if (elSize[x].checked) gSize = +elSize[x].value;
    }
}

function renderBoard() {
    // Create gNums shuffled array
    for (var i = 1; i <= gSize ** 2; i++) gNums.push(i);
    gNums = shuffle(gNums);

    // Add HTML to the DOM
    var elTable = document.querySelector('.table');
    var strHTML = '<tbody>';
    for (var i = 0; i < gSize; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < gSize; j++) {
            var num = gNums.pop();
            strHTML += `<td onclick="cellClicked(this)">${num}</td>`;
        }
        strHTML += `</tr>`;
    }
    elTable.innerHTML = strHTML + '</tbody>';
}

function cellClicked(cell) {
    var elCurrNumber = document.querySelector('.info .counter');

    if (gNextNum === 1 && +cell.innerText === gNextNum) { // Game begins
        stopwatch.start();
    }

    if (+cell.innerText === gNextNum) { // Update the DOM if click is correct
        cell.style.background = 'green';
        elCurrNumber.innerText = 'Current Number : ' + ++gNextNum;
    } else return; // Return if click is wrong

    if (gNextNum === gSize ** 2 + 1) { // Game ends
        var elPyro = document.querySelector('.game-container');
        var strHTML = '<div class="pyro"><div class="before"></div><div class="after"></div></div>';
        elPyro.innerHTML += strHTML;
        elCurrNumber.innerText = 'Game Over!';
        stopwatch.addResult(++gGameCounter, gSize ** 2);
        stopwatch.stop();
        stopwatch.reset();
    }
}

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInteger(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function getRandomInteger(min, max) {
    var maxFloor = Math.floor(max);
    var result = parseInt(Math.random() * (maxFloor - min) + min);
    return result;
}


class Stopwatch {
    constructor(display, results) {
        this.running = false;
        this.display = display;
        this.results = results;
        this.laps = [];
        this.reset();
        this.print(this.times);
    }

    reset() {
        this.times = [0, 0, 0];
    }

    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    addResult(gameCounts, gameSize) {
        let times = this.times;
        let li = document.createElement('li');
        li.innerText = gameCounts + ' - ' + this.format(times) + ' (' + gameSize + ')';
        this.results.appendChild(li);
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[2] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    print() {
        this.display.innerText = this.format(this.times);
    }

    format(times) {
        var ms = times[2] === 0 ? pad0(Math.floor(times[2] * 10), 4) : pad0(Math.floor(times[2] * 10), 3);
        return `${pad0(times[0], 2)}:${pad0(times[1], 2)}:${ms}`;
    }
}

function pad0(value, count) {
    var result = value.toString();
    for (; result.length < count; --count)
        result = '0' + result;
    return result;
}

function clearChildren(node) {
    while (node.lastChild)
        node.removeChild(node.lastChild);
}

let stopwatch = new Stopwatch(
    document.querySelector('.stopwatch'),
    document.querySelector('.results-list'));