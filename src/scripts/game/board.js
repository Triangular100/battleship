/* eslint-disable class-methods-use-this */

import Ship from './ship';

/*
  A battle ship board is a 10x10 grid
  Coordinates are identified through the row letter and column #. Ex: C4
  The 5 ships that can be placed on the grid
    5 spaces - Carrier
    4 spaces - Battleship
    3 spaces - Cruiser
    3 spaces - Submarine
    2 spaces - Destroyer

  Board here will be a 10x10 array representing the battle ship board
  Each 'coordinate' on the array will hold a state
    'name' - ship name (coordinate not hit)
    0 - no ship
    1 - miss, hit a coordinate where there's no ship
    2 - ship hit
    3 - ship sunk
    4 - valid coord (when placing ship)
    5 - invalid coord (when placing ship)
    6 - ship pending placement
    7 - pending attack
*/

export default class Board {
  constructor() {
    this.side = 10;
    this.EMPTY_VAL = 0;
    this.MISS_VAL = 1;
    this.HIT_VAL = 2;
    this.SUNK_VAL = 3;
    this.VALID_VAL = 4;
    this.INVALID_VAL = 5;
    this.PENDING_SHIP_VAL = 6;
    this.PENDING_ATTACK_VAL = 7;
    this.ships = this.createShips();
    this.board = this.createBoard();
  }

  createBoard() {
    return Array.from({ length: this.side }, () =>
      Array(this.side).fill(this.EMPTY_VAL)
    );
  }

  createShips() {
    return {
      carrier: new Ship(5),
      battleship: new Ship(4),
      cruiser: new Ship(3),
      submarine: new Ship(3),
      destroyer: new Ship(2),
    };
  }

  getShipNames() {
    return Object.keys(this.ships);
  }

  getBoard() {
    return this.copyBoard();
  }

  getPlacementBoard() {
    return this.placementBoard;
  }

  getAttackerViewBoard() {
    // This is opponent's view of player's board
    // Ships are hidden
    return this.hideShips();
  }

  hideShips() {
    return this.board.map((row) =>
      row.map((coord) => {
        if (this.isCoordShip(coord)) {
          return this.EMPTY_VAL;
        }
        return coord;
      })
    );
  }

  copyBoard() {
    const copy = [];
    for (let i = 0; i < this.board.length; i += 1) {
      copy.push([...this.board[i]]);
    }
    return copy;
  }

  preparePlacement(shipName, row, col, dir) {
    const ship = this.ships[shipName];
    ship.preparePlacement(row, col, dir);
    this.placeLineValidate(row, col, dir, ship.length);
  }

  attemptPlacing(shipName, row, col) {
    // This function will check the following:
    // 1. (row, col) is body of the ship then change position and swap direction
    //    Clicking on head of the ship is case #2.
    // 2. (row, col) is the head of the ship then mark ship as pending placement (this.PENDING_VAL)
    // 3. (row, col) is the head of the ship and pending placement then place the ship
    // 3. (row, col) is not on the ship then change position

    const ship = this.ships[shipName];

    // 1. selected body
    if (ship.isOnBody(row, col)) {
      ship.attemptedPlacement = false;
      ship.toggleDirection();
      ship.updatePosition(row, col);
      const { dir, length } = ship.getInfo();
      this.placeLineValidate(row, col, dir, length);
    }

    // 3. selected head and pending placement
    else if (ship.attemptedPlacement && ship.isOnHead(row, col)) {
      const { dir } = ship.getInfo();
      this.place(shipName, row, col, dir);
    }

    // 2. selected head
    else if (ship.isOnHead(row, col)) {
      const { dir, length } = ship.getInfo();
      const valid = this.placeLineValidate(
        row,
        col,
        dir,
        length,
        this.PENDING_SHIP_VAL
      );

      // Ensure placement is valid before placing (case 3)
      if (valid) {
        ship.attemptedPlacement = true;
        this.placementBoard[row][col] = this.PENDING_SHIP_VAL;
      }
    }

    // 4. selected coordinate not on ship
    else {
      ship.updatePosition(row, col);
      ship.attemptedPlacement = false;
      const { dir, length } = ship.getInfo();
      this.placeLineValidate(row, col, dir, length);
    }
  }

  place(shipName, row, col, dir) {
    const ship = this.ships[shipName];
    ship.place(row, col, dir);
    this.placeLine(shipName, row, col, dir, ship.length);
  }

  placeLine(val, row, col, dir, length) {
    const { x, y } = this.calculateOffset(dir);
    for (let i = 0; i < length; i += 1) {
      this.board[row + y * i][col + x * i] = val;
    }
  }

  placeLineValidate(row, col, dir, length, shipValue = this.VALID_VAL) {
    this.placementBoard = this.copyBoard();
    const { x, y } = this.calculateOffset(dir);

    let valid = true;
    let value = shipValue;

    // Valid if space taken is empty
    for (let i = 0; i < length; i += 1) {
      // Check coordinates are in the grid
      if (!this.inBounds(row + y * i, col + x * i)) {
        value = this.INVALID_VAL;
        valid = false;
        break;
      }

      if (this.placementBoard[row + y * i][col + x * i] !== this.EMPTY_VAL) {
        value = this.INVALID_VAL;
        valid = false;
        break;
      }
    }

    for (let i = 0; i < length; i += 1) {
      if (this.inBounds(row + y * i, col + x * i)) {
        this.placementBoard[row + y * i][col + x * i] = value;
      }
    }

    return valid;
  }

  inBounds(row, col) {
    return row >= 0 && row < this.side && col >= 0 && col < this.side;
  }

  calculateOffset(dir) {
    if (dir === 'horizontal') {
      return { x: 1, y: 0 };
    }

    // Otherwise vertical
    return { x: 0, y: 1 };
  }

  attacked(row, col) {
    const val = this.board[row][col];
    return (
      val === this.HIT_VAL || val === this.MISS_VAL || val === this.SUNK_VAL
    );
  }

  pendingAttack(row, col) {
    return this.board[row][col] === this.PENDING_ATTACK_VAL;
  }

  pendAttack(row, col) {
    let done = false;
    for (let i = 0; i < this.board.length; i += 1) {
      if (done) {
        break;
      }
      for (let j = 0; j < this.board[i].length; j += 1) {
        if (this.board[i][j] === this.PENDING_ATTACK_VAL) {
          this.board[i][j] = this.pendPreviousValue;
          done = true;
          break;
        }
      }
    }

    this.pendPreviousValue = this.board[row][col];
    this.board[row][col] = this.PENDING_ATTACK_VAL;
  }

  unpendAttack(row, col) {
    this.board[row][col] = this.pendPreviousValue;
  }

  attemptAttack(row, col) {
    if (this.attacked(row, col)) {
      return { attacked: false, type: '' };
    }

    // Select coordinate
    if (!this.pendingAttack(row, col)) {
      this.pendAttack(row, col);
      return { attacked: false, type: '' };
    }

    this.unpendAttack(row, col);
    const type = this.receiveAttack(row, col);
    return { attacked: true, type };
  }

  receiveAttack(row, col) {
    if (this.isEmpty(row, col)) {
      return this.missShip(row, col);
    }
    if (this.isShip(row, col)) {
      return this.hitShip(row, col);
    }

    return 'miss';
  }

  isEmpty(row, col) {
    return this.board[row][col] === this.EMPTY_VAL;
  }

  missShip(row, col) {
    this.board[row][col] = this.MISS_VAL;
    return 'miss';
  }

  isShip(row, col) {
    const coord = this.board[row][col];
    return this.isCoordShip(coord);
  }

  isShipPlaced(shipName) {
    return this.ships[shipName].isPlaced();
  }

  isCoordShip(coord) {
    return this.getShipNames().includes(coord);
  }

  hitShip(row, col) {
    const shipName = this.board[row][col];
    const ship = this.ships[shipName];
    ship.hit();

    if (!ship.isSunk()) {
      this.board[row][col] = this.HIT_VAL;
      return 'hit';
    }

    this.sink(ship);
    return 'sink';
  }

  sink(ship) {
    const { row, col, dir, length } = ship.getInfo();
    this.placeLine(this.SUNK_VAL, row, col, dir, length);
  }

  areAllShipsSunk() {
    return Object.values(this.ships).every((ship) => ship.isSunk());
  }
}
