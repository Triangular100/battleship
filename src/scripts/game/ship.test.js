import Ship from './ship';

test('Hitting ship', () => {
  const ship = new Ship(3);
  ship.hit();
  expect(ship.hits).toBe(1);
});

test('Hitting ship more times than its length', () => {
  const ship = new Ship(3);
  ship.hit();
  ship.hit();
  ship.hit();
  ship.hit();
  expect(ship.hits).toBe(4);
});

test('Hitting ship not sunk', () => {
  const ship = new Ship(3);
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(false);
});

test('Sinking ship', () => {
  const ship = new Ship(3);
  ship.hit();
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});

test('Sinking ship', () => {
  const ship = new Ship(3);
  ship.hit();
  ship.hit();
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});
