let game;
let render;

function modePvP() {}

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

export default function createStates(
  gameContext,
  renderContext,
  perform,
  performRequestPass,
  performRequestPassAfterAttack
) {
  game = gameContext;
  render = renderContext;

  return {
    mode: {
      instruction: 'Mode',
      option1: 'Player vs Player',
      option1event: perform(modePvP, 'placeShips1'),
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
      instruction:
        'Player 1 attack. Tap coordinate twice to confirm placement.',
      option1: 'Continue',
      option1event: performRequestPassAfterAttack(attackOpponent, 'attack2'),
    },
    attack2: {
      instruction:
        'Player 2 attack. Tap coordinate twice to confirm placement.',
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
  };
}
