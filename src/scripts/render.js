function loadInstructions(text) {
  document.getElementById('game-instructions').innerHTML = text;
}

function configureOption1(text1) {
  const button1 = document.getElementById('game-button-1');
  if (!text1) {
    button1.classList.add('hide');
    return;
  }
  button1.classList.remove('hide');
  button1.innerHTML = text1;
}

function configureOption2(text2) {
  const button2 = document.getElementById('game-button-2');
  if (!text2) {
    button2.classList.add('hide');
    return;
  }
  button2.classList.remove('hide');
  button2.innerHTML = text2;
}

function configureOptions(text1, text2) {
  configureOption1(text1);
  configureOption2(text2);
}

function getOptionButtons() {
  return {
    button1: document.getElementById('game-button-1'),
    button2: document.getElementById('game-button-2'),
  };
}

function userClickOption(event1, event2) {
  const { button1, button2 } = getOptionButtons();
  return new Promise((resolve) => {
    const handler1 = () => {
      event1();
      button1.removeEventListener('click', handler1);
      // eslint-disable-next-line no-use-before-define
      button2.removeEventListener('click', handler2);
      resolve();
    };

    const handler2 = () => {
      event2();
      button1.removeEventListener('click', handler1);
      button2.removeEventListener('click', handler2);
      resolve();
    };

    button1.addEventListener('click', handler1);
    button2.addEventListener('click', handler2);
  });
}

async function loadOptions(
  option1Text,
  option1Event,
  option2Text,
  option2Event
) {
  configureOptions(option1Text, option2Text);
  await userClickOption(option1Event, option2Event);
}

async function instructions(
  instructionsText,
  option1Text,
  option1Event,
  option2Text,
  option2Event
) {
  loadInstructions(instructionsText);
  await loadOptions(option1Text, option1Event, option2Text, option2Event);
}

function showInstructions() {
  document.getElementById('game').classList.add('blur');
  document.getElementById('game-overlay-container').classList.remove('hide');
}

function hideInstructions() {
  document.getElementById('game').classList.remove('blur');
  document.getElementById('game-overlay-container').classList.add('hide');
}

function rowColFromIndex(index, n) {
  const row = index % n;
  const col = Math.floor(index / n);
  return { row, col };
}

function indexFromRowCol(row, col, n) {
  return col * n + row;
}

function classFromValue(value) {
  if (value === 0) {
    return 'empty';
  }
  if (value === 1) {
    return 'miss';
  }
  if (value === 2) {
    return 'hit';
  }
  if (value === 3) {
    return 'sunk';
  }
  if (value === 4) {
    // Valid coordinate to place ship (Click again to confirm placement)
    return 'valid';
  }
  if (value === 5) {
    // Invalid coordinate to place ship
    return 'invalid';
  }
  if (value === 6) {
    // Ship awaiting placement
    // 4 shows coordinate where user will place ship
    // 6 shows coordinates where ship will be placed if 4 is confirmed
    return 'pending-ship';
  }
  if (value === 7) {
    return 'pending-attack';
  }
  // At this point, value is shipName
  return 'ship';
}

function playerBoard(board, showSunkAsHit = true) {
  const coords = document.querySelectorAll('.player.coord');
  for (let i = 0; i < coords.length; i += 1) {
    const { row, col } = rowColFromIndex(i, board.length);
    coords[i].classList = 'player coord';
    let cls = classFromValue(board[row][col]);
    if (showSunkAsHit && cls === 'sunk') {
      cls = 'hit';
    }
    if (cls) {
      coords[i].classList.add(cls);
    }
  }
}

function opponentBoard(board) {
  const coords = document.querySelectorAll('.opponent.coord');
  for (let i = 0; i < coords.length; i += 1) {
    const { row, col } = rowColFromIndex(i, board.length);
    coords[i].classList = 'opponent coord';
    const cls = classFromValue(board[row][col]);
    if (cls) {
      coords[i].classList.add(cls);
    }
  }
}

function resetBoards() {
  const emptyBoard = Array.from({ length: 10 }, () => Array(10).fill(0));
  playerBoard(emptyBoard);
  opponentBoard(emptyBoard);
}

function userClickedPlayerCoord() {
  return new Promise((resolve) => {
    const coordsContainer = document.getElementById('player-board');

    const calcCoordClickIndex = (ev) => {
      // Ensure user clicked on a coordinate (and not parent container)
      if (!ev.target.classList.contains('coord')) {
        return;
      }
      const coords = Array.from(coordsContainer.children);
      const index = coords.indexOf(ev.target);
      resolve(rowColFromIndex(index, 10));
      coordsContainer.removeEventListener('click', calcCoordClickIndex);
    };

    coordsContainer.addEventListener('click', calcCoordClickIndex);
  });
}

function userClickedOpponentCoord() {
  return new Promise((resolve) => {
    const coordsContainer = document.getElementById('opponent-board');

    const calcCoordClickIndex = (ev) => {
      if (!ev.target.classList.contains('coord')) {
        return;
      }
      const coords = Array.from(coordsContainer.children);
      const index = coords.indexOf(ev.target);
      resolve(rowColFromIndex(index, 10));
      coordsContainer.removeEventListener('click', calcCoordClickIndex);
    };

    coordsContainer.addEventListener('click', calcCoordClickIndex);
  });
}

function animateCoord(row, col, board, hit, player, showSunkAsHit = true) {
  if (row === undefined || col === undefined) {
    return;
  }

  let coords;

  if (player) {
    coords = document.querySelectorAll('.player.coord');
    playerBoard(board, showSunkAsHit);
  } else {
    coords = document.querySelectorAll('.opponent.coord');
    opponentBoard(board);
  }

  const i = indexFromRowCol(row, col, 10);
  const cls = hit ? 'animate-hit' : 'animate-miss';
  coords[i].classList.add(cls);

  setTimeout(() => {
    coords[i].classList.remove(cls);
  }, 1000);
}

function animateCoordWait(row, col, board, hit, player) {
  return new Promise((resolve) => {
    if (row === undefined || col === undefined) {
      resolve();
      return;
    }

    let coords;

    if (player) {
      coords = document.querySelectorAll('.player.coord');
      playerBoard(board);
    } else {
      coords = document.querySelectorAll('.opponent.coord');
      opponentBoard(board);
    }

    const i = indexFromRowCol(row, col, 10);
    const cls = hit ? 'animate-hit' : 'animate-miss';
    coords[i].classList.add(cls);

    setTimeout(() => {
      coords[i].classList.remove(cls);
      resolve();
    }, 1000);
  });
}

function showBoards(
  p1Board,
  p1OpponentBoard,
  p2Board,
  p2OpponentBoard,
  p1Turn
) {
  const playerBoardEle = document.getElementById('player-board');
  const opponentBoardEle = document.getElementById('opponent-board');

  let showPlayer1 = p1Turn;

  const swapHandler = () => {
    if (showPlayer1) {
      playerBoard(p1Board);
      opponentBoard(p1OpponentBoard);
    } else {
      playerBoard(p2Board);
      opponentBoard(p2OpponentBoard);
    }

    showPlayer1 = !showPlayer1;
  };

  swapHandler();

  playerBoardEle.addEventListener('click', swapHandler);
  opponentBoardEle.addEventListener('click', swapHandler);
}

export default {
  showInstructions,
  hideInstructions,
  instructions,
  resetBoards,
  playerBoard,
  opponentBoard,
  userClickedPlayerCoord,
  userClickedOpponentCoord,
  animateCoord,
  animateCoordWait,
  showBoards,
};
