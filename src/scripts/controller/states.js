let game;
let render;

function doNothing() {}

async function placeShip(ship) {
  game.preparePlacement(ship);
  while (!game.isShipPlaced(ship)) {
    render.playerBoard(game.getPlayerPlacementBoard());
    // eslint-disable-next-line no-await-in-loop
    const { row, col } = await render.userClickedPlayerCoord(); // ship placement depends on previous
    game.attemptPlacing(ship, row, col);
  }
}

async function placeShips() {
  const ships = game.getShipNames();
  for (let i = 0; i < ships.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await placeShip(ships[i]);
  }
}

async function placeShipTop(ship) {
  game.preparePlacement(ship);
  while (!game.isShipPlaced(ship)) {
    render.opponentBoard(game.getPlayerPlacementBoard());
    // eslint-disable-next-line no-await-in-loop
    const { row, col } = await render.userClickedOpponentCoord();
    game.attemptPlacing(ship, row, col);
  }
}

async function placeShipsTop() {
  const ships = game.getShipNames();
  for (let i = 0; i < ships.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await placeShipTop(ships[i]);
  }
  render.resetBoards();
}

async function attackOpponent() {
  render.playerBoard(game.getPlayerBoard());
  game.prepareAttack();

  let row;
  let col;
  let type;
  let hit = false;

  row = game.prevRow;
  col = game.prevCol;
  type = game.prevType;

  if (type === 'hit' || type === 'sink') {
    hit = true;
  }
  render.animateCoord(row, col, game.getPlayerBoard(), hit, true);

  while (!game.hasAttacked()) {
    render.opponentBoard(game.getOpponentBoard()); // Board is 'attacker' view
    // eslint-disable-next-line no-await-in-loop
    ({ row, col } = await render.userClickedOpponentCoord());
    type = game.attemptAttack(row, col);
  }

  hit = false;
  if (type === 'hit' || type === 'sink') {
    hit = true;
  }

  await render.animateCoordWait(row, col, game.getOpponentBoard(), hit, false);
  return type;
}

async function attackRapid1() {
  let type;
  let hit;
  let row;
  let col;

  game.prepareAttack();
  while (!game.hasAttacked()) {
    render.opponentBoard(game.getOpponentBoard());
    // eslint-disable-next-line no-await-in-loop
    ({ row, col } = await render.userClickedOpponentCoord());
    type = game.attemptAttack(row, col);
  }

  if (type === 'hit' || type === 'sink') {
    hit = true;
  }
  render.animateCoord(row, col, game.getOpponentBoard(), hit, false);
  return type;
}

async function attackRapid2() {
  let type;
  let hit;
  let row;
  let col;

  game.prepareAttack();
  while (!game.hasAttacked()) {
    render.playerBoard(game.getOpponentBoard(), false);
    // eslint-disable-next-line no-await-in-loop
    ({ row, col } = await render.userClickedPlayerCoord());
    type = game.attemptAttack(row, col);
  }

  if (type === 'hit' || type === 'sink') {
    hit = true;
  }
  render.animateCoord(row, col, game.getOpponentBoard(), hit, true, false);
  return type;
}

function getBoards() {
  const p1Board = game.getPlayerBoard();
  const p1OpponentBoard = game.getOpponentBoard();
  game.nextTurn();
  const p2Board = game.getPlayerBoard();
  const p2OpponentBoard = game.getOpponentBoard();
  game.nextTurn();
  return { p1Board, p1OpponentBoard, p2Board, p2OpponentBoard };
}

function showBoards() {
  const { p1Board, p1OpponentBoard, p2Board, p2OpponentBoard } = getBoards();
  render.showBoards(
    p1Board,
    p1OpponentBoard,
    p2Board,
    p2OpponentBoard,
    game.player1Turn
  );
}

function showRapidBoards() {
  game.player1Turn = true;
  const { p1Board, p1OpponentBoard, p2Board, p2OpponentBoard } = getBoards();
  render.showBoards(p2OpponentBoard, p1OpponentBoard, p1Board, p2Board, true);
}

export default function createStates(
  gameContext,
  renderContext,
  perform,
  performRequestPass,
  performRequestPassAfterAttack,
  performLoadNextEvent,
  performRapidAttack
) {
  game = gameContext;
  render = renderContext;

  return {
    mode: {
      instruction: 'Mode',
      option1: 'Swap Turns PvP',
      option1event: perform(doNothing, 'placeShips1'),
      option2: 'Shared View PvP',
      option2event: perform(doNothing, 'placeShips1Rapid'),
    },
    placeShips1: {
      instruction:
        'Player 1 place your ships. Tap your ship to rotate. Tap coordinate twice to confirm placement.',
      option1: 'Continue',
      option1event: performRequestPass(placeShips, 'placeShips2'),
    },
    placeShips2: {
      instruction:
        'Player 2 place your ships. Tap your ship to rotate. Tap coordinate twice to confirm placement.',
      option1: 'Continue',
      option1event: performRequestPass(placeShips, 'attack1'),
    },
    attack1: {
      instruction: 'Player 1 attack. Tap coordinate twice to confirm attack.',
      option1: 'Continue',
      option1event: performRequestPassAfterAttack(attackOpponent, 'attack2'),
    },
    attack2: {
      instruction: 'Player 2 attack. Tap coordinate twice to confirm attack.',
      option1: 'Continue',
      option1event: performRequestPassAfterAttack(attackOpponent, 'attack1'),
    },
    win1: {
      instruction: 'Player 1 wins. Tap board to swap to opponent.',
      option1: 'Continue',
      option1event: perform(showBoards),
    },
    win2: {
      instruction: 'Player 2 wins. Tap board to swap to opponent.',
      option1: 'Continue',
      option1event: perform(showBoards),
    },
    placeShips1Rapid: {
      instruction:
        'Player 1 place your ships. Tap your ship to rotate. Tap coordinate twice to confirm placement.',
      option1: 'Continue',
      option1event: performRequestPass(placeShips, 'placeShips2Rapid'),
    },
    placeShips2Rapid: {
      instruction:
        'Player 2 place your ships. Tap your ship to rotate. Tap coordinate twice to confirm placement.',
      option1: 'Continue',
      option1event: perform(placeShipsTop, 'prepareRapid'),
    },
    prepareRapid: {
      instruction:
        'Place device where both players can attack. Tap coordinate twice to confirm attack.',
      option1: 'Continue',
      option1event: performLoadNextEvent(doNothing, 'attackRapid1'),
    },
    attackRapid1: {
      option1event: performRapidAttack(attackRapid1, 'attackRapid2'),
    },
    attackRapid2: {
      option1event: performRapidAttack(attackRapid2, 'attackRapid1'),
    },
    win1Rapid: {
      instruction: 'Player 1 wins. Tap board to reveal ships.',
      option1: 'Continue',
      option1event: perform(showRapidBoards),
    },
    win2Rapid: {
      instruction: 'Player 2 wins. Tap board to reveal ships.',
      option1: 'Continue',
      option1event: perform(showRapidBoards),
    },
  };
}
