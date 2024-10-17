import Game from '../game/game';
import render from '../render';
import createStates from './states';

let game;
let states;
let currentState = 'mode';

async function renderInstructions() {
  if (!currentState) {
    return;
  }

  render.showInstructions();
  await render.instructions(
    states[currentState].instruction,
    states[currentState].option1,
    states[currentState].option1event,
    states[currentState].option2,
    states[currentState].option2event
  );
}

async function requestPass() {
  render.resetBoards(); // Hide boards so opponent can't see your board
  const instruction = game.player1Turn
    ? 'Pass to player 2'
    : 'Pass to player 1';
  render.showInstructions();
  await render.instructions(instruction, 'Continue', () => {});
}

async function requestPassAttack(typeAttack) {
  render.resetBoards();
  let instruction = game.player1Turn ? 'Pass to player 2' : 'Pass to player 1';

  // Customize instruction based on if a hit or a miss
  if (typeAttack === 'hit') {
    instruction = `Ship hit! ${instruction}`;
  } else if (typeAttack === 'miss') {
    instruction = `Miss! ${instruction}`;
  } else if (typeAttack === 'sink') {
    instruction = `Ship sunk! ${instruction}`;
  }

  render.showInstructions();
  await render.instructions(instruction, 'Continue', () => {});
}

function performRequestPass(currentStateEvent, nextStateName) {
  // Meant to be used for when a user clicks on an instruction option
  // Returns a function that performs the following
  // 1. Hides the current instructions
  // 2. Executes the current event
  // 3. Requests user to pass turn to opponent
  // 4. Update to the next state
  // 5. Render next state instructions

  return async () => {
    render.hideInstructions();
    await currentStateEvent();
    await requestPass();
    game.nextTurn();
    currentState = nextStateName;
    await renderInstructions();
  };
}

function perform(currentStateEvent, nextStateName) {
  // Same as performRequestPass, but no pass requested
  return async () => {
    render.hideInstructions();
    await currentStateEvent();
    currentState = nextStateName;
    await renderInstructions();
  };
}

function performWinTask(win1State, win2State) {
  currentState = game.player1Turn ? win1State : win2State;
  renderInstructions();
}

function performRequestPassAttack(attackEvent, nextStateName) {
  // Customizes pass request based on attack result
  // Also check if sink ship results in a win
  return async () => {
    render.hideInstructions();
    const attackType = await attackEvent();
    await requestPassAttack(attackType);
    if (attackType === 'sink' && game.over()) {
      performWinTask('win1', 'win2');
    } else {
      game.nextTurn();
      currentState = nextStateName;
      await renderInstructions();
    }
  };
}

function performLoadNextEvent(currentStateEvent, nextStateName) {
  return async () => {
    render.hideInstructions();
    await currentStateEvent();
    game.nextTurn();
    currentState = nextStateName;
    states[currentState].option1event();
  };
}

function performRapidAttack(attackEvent, nextStateName) {
  return async () => {
    const attackType = await attackEvent();
    if (attackType === 'sink' && game.over()) {
      performWinTask('win1Rapid', 'win2Rapid');
    } else {
      game.nextTurn();
      currentState = nextStateName;
      states[currentState].option1event();
    }
  };
}

export default function startGame() {
  game = new Game();
  states = createStates(
    game,
    render,
    perform,
    performRequestPass,
    performRequestPassAttack,
    performLoadNextEvent,
    performRapidAttack
  );
  renderInstructions();
}
