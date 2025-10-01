class LZ77Animator {
    constructor() {
        this.inputText = '';
        this.position = 0;
        this.encoded = [];
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 800;
        this.searchWindowSize = 12;
        this.lookAheadBufferSize = 6;

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.inputEl = document.getElementById('inputText');
        this.textDisplayEl = document.getElementById('textDisplay');
        this.statusEl = document.getElementById('statusText');
        this.outputEl = document.getElementById('outputText');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.windowSize = document.getElementById('windowSize');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.stepBtn.addEventListener('click', () => this.step());
        this.speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            this.speedValue.textContent = this.animationSpeed + 'ms';
        });
        this.windowSize.addEventListener('input', (e) => {
            this.searchWindowSize = parseInt(e.target.value);
        });
    }

    start() {
        if (this.isPaused) {
            this.isPaused = false;
            this.continueAnimation();
        } else {
            this.inputText = this.inputEl.value;
            if (!this.inputText) return;

            this.reset();
            this.isRunning = true;
            this.continueAnimation();
        }

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stepBtn.disabled = true;
    }

    pause() {
        this.isPaused = true;
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stepBtn.disabled = false;
    }

    reset() {
        this.position = 0;
        this.encoded = [];
        this.isRunning = false;
        this.isPaused = false;
        this.inputText = this.inputEl.value;

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stepBtn.disabled = false;

        this.updateDisplay();
        this.updateStatus('Ready to start encoding...');
        this.updateOutput();
    }

    step() {
        if (this.position < this.inputText.length) {
            this.processStep();
        }
    }

    async continueAnimation() {
        while (this.isRunning && this.position < this.inputText.length) {
            await this.processStep();
            await this.sleep(this.animationSpeed);
        }

        if (this.position >= this.inputText.length && this.isRunning) {
            this.complete();
        }
    }

    async processStep() {
        const searchStart = Math.max(0, this.position - this.searchWindowSize);
        const lookAheadEnd = Math.min(this.inputText.length, this.position + this.lookAheadBufferSize);

        // Show current position
        this.updateDisplay();
        this.updateStatus(`Analyzing position ${this.position}: '${this.inputText[this.position]}'`);

        await this.sleep(this.animationSpeed / 2);

        // Find longest match in search window
        let bestMatch = { length: 0, distance: 0 };

        for (let i = searchStart; i < this.position; i++) {
            let matchLength = 0;
            while (matchLength <= lookAheadEnd - this.position &&
                   i + matchLength < this.position &&
                   this.inputText[i + matchLength] === this.inputText[this.position + matchLength]) {
                matchLength++;
            }

            if (matchLength > bestMatch.length) {
                bestMatch = { length: matchLength, distance: this.position - i };
            }
        }

        if (bestMatch.length > 2) { // DEFLATE mandates minimum 3 characters matches
            // Show match found
            this.updateStatus(`Match found! Length: ${bestMatch.length}, Distance: ${bestMatch.distance}`);
            this.highlightMatch(this.position - bestMatch.distance, bestMatch.length, this.position);

            await this.sleep(this.animationSpeed);

            // Encode the match
            this.encoded.push(`(${bestMatch.distance},${bestMatch.length})`);
            this.position += bestMatch.length;
        } else {
            // No match, encode literal
            this.updateStatus(`No match found, encoding literal: '${this.inputText[this.position]}'`);
            this.encoded.push(this.inputText[this.position]);
            this.position++;
        }

        this.updateOutput();
        await this.sleep(this.animationSpeed / 2);
    }

    updateDisplay() {
        let html = '';
        for (let i = 0; i < this.inputText.length; i++) {
            let char = this.inputText[i];
            let className = '';

            if (i === this.position) {
                className = 'current-char';
            } else if (i >= Math.max(0, this.position - this.searchWindowSize) && i < this.position) {
                className = 'search-window';
            }

            if (className) {
                html += `<span class="${className}">${char}</span>`;
            } else {
                html += char;
            }
        }

        this.textDisplayEl.innerHTML = html;
    }

    highlightMatch(matchStart, matchLength, currentPos) {
        let html = '';
        for (let i = 0; i < this.inputText.length; i++) {
            let char = this.inputText[i];
            let className = '';

            if (i >= matchStart && i < matchStart + matchLength) {
                className = 'match-found';
            } else if (i >= currentPos && i < currentPos + matchLength) {
                className = 'match-found';
            } else if (i >= Math.max(0, this.position - this.searchWindowSize) && i < this.position) {
                className = 'search-window';
            }

            if (className) {
                html += `<span class="${className}">${char}</span>`;
            } else {
                html += char;
            }
        }

        this.textDisplayEl.innerHTML = html;
    }

    updateStatus(message) {
        this.statusEl.textContent = message;
    }

    updateOutput() {
        const output = this.encoded.join(' ');
        const originalSize = this.inputText.length;
        const compressedSize = this.encoded.reduce((size, el) => {
            if(el.startsWith('(')) {
                size = size + 2; // 1 symbol length + 1 symbol distance
            }
            else {
                size++;
            }
            return size;
        }, 0);
        const ratio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

        this.outputEl.innerHTML = `
                 <span class="encoded-value"><strong>Encoded:</strong> ${output}</span><br>
                 <strong>Progress:</strong> ${this.position}/${this.inputText.length} characters processed<br>
                 <strong>Original size:</strong> ${originalSize} characters<br>
                 <strong>Current encoded size:</strong> ${compressedSize} characters<br>
                 <strong>Compression ratio:</strong> ${ratio}%
             `;
    }

    complete() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stepBtn.disabled = true;
        this.updateStatus('Encoding complete!');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the animator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new LZ77Animator();
});
