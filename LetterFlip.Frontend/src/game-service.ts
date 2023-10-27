import { Game } from "game";
import { GameState } from "game-state";

export class GameService {

    public gameState: GameState;
    public currentGame: Game;

  constructor() {
    // Initialize or fetch initial game state
    this.gameState = new GameState();
  }

  initialize(game: Game) {
    this.currentGame = game;
  }

  nextTurn() {
    this.gameState.currentTurn = this.gameState.currentTurn === 'player1' ? 'player2' : 'player1';
    this.currentGame.saveGame();
  }

  flipLetter(letter: string) {
    const playerState = this.gameState.getYourPlayerState();
    playerState.flippedTiles.push(letter);
  }

  newGame(gameId: string, playerIndex: number, playerName: string, otherPlayerName: string, opponentWord: string) {
    this.gameState = new GameState();
    this.gameState.gameId = gameId;
    if (playerIndex === 0)
    {
        this.gameState.currentTurn = 'player1';
        this.gameState.yourPlayerIndex = 0;
        this.gameState.player1Name = playerName;
        this.gameState.player2Name = otherPlayerName;
    }
    else
    {
        this.gameState.currentTurn = 'player1';
        this.gameState.yourPlayerIndex = 1;
        this.gameState.player1Name = otherPlayerName;
        this.gameState.player2Name = playerName;
    }
    this.gameState.getOpponentPlayerState().currentWord = opponentWord;
  }
  
}