import Board from './board';

// Ship used in test is a 'cruiser', which has length 3
// Board is represented with coordinates board[row][col], or board[y][x]

function placeAndSinkShips(board) {
  board.place('carrier', 0, 0, 'vertical');
  board.place('battleship', 0, 1, 'vertical');
  board.place('cruiser', 0, 2, 'vertical');
  board.place('submarine', 0, 3, 'vertical');
  board.place('destroyer', 0, 4, 'vertical');

  board.receiveAttack(0, 0);
  board.receiveAttack(1, 0);
  board.receiveAttack(2, 0);
  board.receiveAttack(3, 0);
  board.receiveAttack(4, 0);

  board.receiveAttack(0, 1);
  board.receiveAttack(1, 1);
  board.receiveAttack(2, 1);
  board.receiveAttack(3, 1);

  board.receiveAttack(0, 2);
  board.receiveAttack(1, 2);
  board.receiveAttack(2, 2);

  board.receiveAttack(0, 3);
  board.receiveAttack(1, 3);
  board.receiveAttack(2, 3);

  board.receiveAttack(0, 4);
  board.receiveAttack(1, 4);
}

test('Placing horizontal ship', () => {
  const board = new Board();
  board.place('cruiser', 0, 0, 'horizontal');
  const b = board.getBoard();
  expect(b[0][0]).toBe('cruiser');
  expect(b[0][1]).toBe('cruiser');
  expect(b[0][2]).toBe('cruiser');
  expect(b[0][3]).not.toBe('cruiser');
});

test('Placing vertical ship', () => {
  const board = new Board();
  board.place('cruiser', 0, 0, 'vertical');
  const b = board.getBoard();
  expect(b[0][0]).toBe('cruiser');
  expect(b[1][0]).toBe('cruiser');
  expect(b[2][0]).toBe('cruiser');
  expect(b[3][0]).not.toBe('cruiser');
});

test('Hitting ship', () => {
  const board = new Board();
  board.place('cruiser', 0, 0, 'vertical');
  expect(board.receiveAttack(0, 0)).toBe('hit');
  const b = board.getBoard();
  expect(b[0][0]).toBe(2);
});

test('Sinking ship', () => {
  const board = new Board();
  board.place('cruiser', 0, 0, 'vertical');
  board.receiveAttack(2, 0);
  board.receiveAttack(1, 0);
  expect(board.receiveAttack(0, 0)).toBe('sink');
  const b = board.getBoard();
  expect(b[0][0]).toBe(3);
});

test('Missing ship', () => {
  const board = new Board();
  board.place('cruiser', 0, 0, 'vertical');
  expect(board.receiveAttack(0, 1)).toBe('miss');
  const b = board.getBoard();
  expect(b[0][1]).toBe(1);
});

test('No hit (coordinate untouched)', () => {
  const board = new Board();
  board.place('cruiser', 0, 0, 'vertical');
  expect(board.receiveAttack(0, 1)).toBe('miss');
  const b = board.getBoard();
  expect(b[1][1]).toBe(0);
});

test('All ships sunk', () => {
  const board = new Board();
  expect(board.areAllShipsSunk()).toBe(false);
  placeAndSinkShips(board);
  expect(board.areAllShipsSunk()).toBe(true);
});

test('Opponent board view', () => {
  const board = new Board();
  board.place('cruiser', 0, 0);
  const b = board.getAttackerViewBoard();
  expect(b[0][0]).toBe(0);
});
