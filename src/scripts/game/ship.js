export default class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
    this.placed = false;
  }

  hit() {
    this.hits += 1;
  }

  place(row, col, dir) {
    this.col = col;
    this.row = row;
    this.dir = dir;
    this.placed = true;
  }

  getInfo() {
    return { row: this.row, col: this.col, dir: this.dir, length: this.length };
  }

  preparePlacement(row, col, dir) {
    this.attemptedPlacement = false;
    this.row = row;
    this.col = col;
    this.dir = dir;
  }

  isPlaced() {
    return this.placed;
  }

  isOnBody(row, col) {
    const { x, y } = this.calculateOffset();
    // i (index) will start at 1 because head will not count towards part of the body
    for (let i = 1; i < this.length; i += 1) {
      if (this.row + y * i === row && this.col + x * i === col) {
        return true;
      }
    }
    return false;
  }

  isOnHead(row, col) {
    return this.row === row && this.col === col;
  }

  toggleDirection() {
    if (this.dir === 'horizontal') {
      this.dir = 'vertical';
    } else {
      this.dir = 'horizontal';
    }
  }

  updatePosition(row, col) {
    this.row = row;
    this.col = col;
  }

  calculateOffset() {
    if (this.dir === 'horizontal') {
      return { x: 1, y: 0 };
    }
    return { x: 0, y: 1 };
  }

  isSunk() {
    return this.hits >= this.length;
  }
}
