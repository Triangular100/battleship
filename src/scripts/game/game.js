import Board from './board';

export default class Game {
  constructor() {
    this.new();
  }

  new() {
    this.player1Turn = true;
    this.player1Board = new Board();
    this.player2Board = new Board();
  }

  over() {
    return this.opponentPlayerBoard().areAllShipsSunk();
  }

  nextTurn() {
    this.player1Turn = !this.player1Turn;
  }

  currentPlayerBoard() {
    if (this.player1Turn) {
      return this.player1Board;
    }
    return this.player2Board;
  }

  opponentPlayerBoard() {
    if (this.player1Turn) {
      return this.player2Board;
    }
    return this.player1Board;
  }

  getShipNames() {
    return this.currentPlayerBoard().getShipNames();
  }

  getPlayerBoard() {
    return this.currentPlayerBoard().getBoard();
  }

  getPlayerPlacementBoard() {
    return this.currentPlayerBoard().getPlacementBoard();
  }

  getOpponentBoard() {
    return this.opponentPlayerBoard().getAttackerViewBoard();
  }

  prepareAttack() {
    this.attacked = false;
  }

  hasAttacked() {
    return this.attacked;
  }

  attemptAttack(row, col) {
    const { attacked, type } = this.opponentPlayerBoard().attemptAttack(
      row,
      col
    );

    this.attacked = attacked;
    if (attacked) {
      this.prevRow = row;
      this.prevCol = col;
      this.prevType = type;
    }

    return type;
  }

  preparePlacement(shipName) {
    this.currentPlayerBoard().preparePlacement(shipName, 3, 3, 'horizontal');
  }

  attemptPlacing(shipName, row, col) {
    this.currentPlayerBoard().attemptPlacing(shipName, row, col);
  }

  place(shipName, row, col, dir) {
    return this.currentPlayerBoard().place(shipName, row, col, dir);
  }

  isShipPlaced(shipName) {
    return this.currentPlayerBoard().isShipPlaced(shipName);
  }
}
