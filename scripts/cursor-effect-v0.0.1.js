class Typer {
  constructor(element) {
    this.element = element;

    // Sanitize and validate dataset properties
    const delim = element.dataset.delim || ",";
    const words = element.dataset.words || "override these,sample typing";
    this.words = words.split(delim).filter((v) => v.trim()); // Remove empty words

    this.delay = Math.max(50, parseInt(element.dataset.delay) || 200); // Minimum delay 50ms
    this.loop = element.dataset.loop === "false" ? 1 : parseInt(element.dataset.loop) || Infinity; // Default: infinite loop
    this.deleteDelay = Math.max(50, parseInt(element.dataset.deletedelay || element.dataset.deleteDelay) || 800);

    const colors = element.dataset.colors || "black";
    this.colors = colors.split(",").map((color) => color.trim()).filter((color) => color); // Ensure valid colors

    this.element.style.color = this.colors[0];
    this.colorIndex = 0;

    this.progress = { word: 0, char: 0, building: true, looped: 0 };
    this.typing = false;

    this.timeout = null; // Track the active timeout

    this.start();
  }

  start() {
    if (!this.typing) {
      this.typing = true;
      this.doTyping();
    }
  }

  stop() {
    this.typing = false;
    clearTimeout(this.timeout);
  }

  doTyping() {
    const { word, char, building } = this.progress;
    const currentWord = this.words[word];
    let displayText = currentWord.slice(0, char);

    // Update the displayed text
    this.element.innerText = displayText;

    if (building) {
      if (char < currentWord.length) {
        this.progress.char++;
      } else {
        this.progress.building = false;
      }
    } else {
      if (char > 0) {
        this.progress.char--;
      } else {
        this.progress.building = true;
        this.progress.word = (word + 1) % this.words.length;
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
        this.element.style.color = this.colors[this.colorIndex];

        if (this.progress.word === 0) {
          this.progress.looped++;
        }
      }
    }

    if (this.progress.looped >= this.loop) {
      this.typing = false;
      return;
    }

    // Set the next timeout
    const nextDelay = building && char === currentWord.length ? this.deleteDelay : this.delay;
    this.timeout = setTimeout(() => this.typing && this.doTyping(), nextDelay);
  }
}

class Cursor {
  constructor(element) {
    this.element = element;
    this.cursorDisplay = element.dataset.cursordisplay || element.dataset.cursorDisplay || "_";
    this.element.innerText = this.cursorDisplay;
    this.on = true;

    // Blink interval setup
    this.interval = setInterval(() => this.updateBlinkState(), 400);
  }

  updateBlinkState() {
    this.element.style.opacity = this.on ? "0" : "1";
    this.on = !this.on;
  }
}

function TyperSetup() {
  const typers = {};

  // Initialize Typer instances
  for (const e of document.getElementsByClassName("typer")) {
    typers[e.id] = new Typer(e);
  }

  // Setup control buttons
  for (const e of document.getElementsByClassName("typer-stop")) {
    const owner = typers[e.dataset.owner];
    if (owner) {
      e.onclick = () => owner.stop();
    }
  }

  for (const e of document.getElementsByClassName("typer-start")) {
    const owner = typers[e.dataset.owner];
    if (owner) {
      e.onclick = () => owner.start();
    }
  }

  // Initialize Cursor instances
  for (const e of document.getElementsByClassName("cursor")) {
    const t = new Cursor(e);
    t.owner = typers[e.dataset.owner];
    if (t.owner) {
      t.owner.cursor = t;
    }
  }
}

// Initialize the setup
TyperSetup();