let data;
let people = [];
let gridLayout = [];
let english;
let arabic;
let hoveredSquare = null;
let scaleFactor = 0.7;

function preload() {
  data = loadJSON(
    "https://data.techforpalestine.org/api/v2/killed-in-gaza.json"
  );
  english = loadFont("IBMPlexMono-Bold.ttf");
  arabic = loadFont("Lifta.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  textFont(english);
  if (data) {
    let entries = Object.values(data);
    people = entries.filter(
      (entry) => typeof entry === "object" && entry.en_name
    );
    createGridLayout();
    console.log("TOTAL KILLED:", people.length);
  }
}

function createGridLayout() {
  let totalPeople = people.length;
  let unitsPerRow = Math.ceil(Math.sqrt(totalPeople * (width / height)));
  let unitsPerCol = Math.ceil(totalPeople / unitsPerRow);
  let gapX = (width * scaleFactor) / unitsPerRow;
  let gapY = (height * scaleFactor) / unitsPerCol;
  gridLayout = [];
  let personIndex = 0;
  let offsetX = (width - width * scaleFactor) / 2;
  let offsetY = (height - height * scaleFactor) / 2;
  for (let x = 0; x < width * scaleFactor; x += gapX) {
    for (let y = 0; y < height * scaleFactor; y += gapY) {
      if (personIndex < people.length) {
        gridLayout.push({
          x: x + gapX / 2 + offsetX,
          y: y + gapY / 2 + offsetY,
          gapX: gapX,
          person: people[personIndex],
          hover: false,
        });
        personIndex++;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createGridLayout();
}

function draw() {
  background("#E4312b");

  let isMouseOutsideGrid = true;
  let gridLeft = (width - width * scaleFactor) / 2;
  let gridRight = width - gridLeft;
  let gridTop = (height - height * scaleFactor) / 2;
  let gridBottom = height - gridTop;

  gridLayout.forEach((square) => {
    let noiseValue = noise(square.x * 0.01, square.y * 0.01, frameCount * 0.1);
    let s = map(noiseValue, 0, 2, square.gapX * 0.6, square.gapX * 2);
    let isHovering = dist(mouseX, mouseY, square.x, square.y) < s / 2;
    if (isHovering) {
      hoveredSquare = square;
      isMouseOutsideGrid = false;
    } else if (hoveredSquare === square) {
      hoveredSquare = null;
    }
    if (square === hoveredSquare) {
      fill("#c4db88");
    } else {
      fill("#d9897d");
    }
    circle(square.x, square.y, s,);
  });

  if (hoveredSquare) {
    fill("#c4db88");
    textAlign(CENTER, CENTER);
    let arabicTextSize = width * 0.05;
    let ageTextSize = width * 0.025;
    textSize(arabicTextSize);
    textFont(arabic);
    text(`${hoveredSquare.person.name}`, width / 2, height / 2);
    textFont(english);
    textSize(ageTextSize);
    text(
      "AGE: " + `${hoveredSquare.person.age}`,
      width / 2,
      height / 2 + arabicTextSize
    );
  } else if (
    mouseX < gridLeft ||
    mouseX > gridRight ||
    mouseY < gridTop ||
    mouseY > gridBottom
  ) {
    fill(0);
    textSize(width * 0.015);
    textAlign(CENTER, CENTER);
    text(
      `EACH DOT REPRESENTS A PERSON KILLED IN GAZA SINCE OCTOBER 7, 2023:

BASED ON REPORTS FROM GAZA'S MINISTRY OF HEALTH & GOVERNMENT MEDIA OFFICE,
AGGREGATED BY TECH FOR PALESTINE.

MANY NAMES ARE MISSING DUE TO LACK OF IDENTIFICATION,
RECORDS, OR DIRECT LINKAGE TO ISRAELI AGGRESSION.`,
      width / 2,
      height / 2
    );
  }
}
