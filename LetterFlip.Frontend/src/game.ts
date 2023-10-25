import { autoinject } from 'aurelia-framework';
import { BabylonService } from "babylon-service";
import { GuessLetterResponse, GuessWordResponse, OpponentGuessedWordCorrectlyResponse, SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';
import { GameService } from 'game-service';
import { Events } from 'utils/events';
import { EventAggregator } from 'utils/event-aggregator';
import { GameOverEventData, GuessLetterCorrectEventData, GuessWordCorrectEventData, OpponentGuessedWordCorrectlyEventData } from 'interfaces/event-data';

@autoinject
export class Game {
  constructor(private babylonService: BabylonService, private signalRService: SignalRService, private gameService: GameService, private eventAggregator: EventAggregator, private router: Router) { 
    babylonService.currentGame = this;
    this.guessedPositions = Array.from({ length: this.gameService.gameState.getYourPlayerState().currentWord.length }, () => '');
  }

    playerName: string;
    otherPlayerName: string;
    showHistory = false;
    historyItems = []; // Your history data
    isGameOver = false;
    winner = '';
    showGuessLetterModal = false;
    showGuessWordModal = false;
    guessedLetter = '';
    guessedWord = '';
    guessedPosition = 0;
  guessedPositions = [];

  toggleGuessLetterModal() {
    this.showGuessLetterModal = !this.showGuessLetterModal;
  }

  toggleGameOverModal() {
    this.isGameOver = !this.isGameOver;
  }

  updateGuess(position, value) {
    // Reset all positions
    this.guessedPositions.fill('');

    // Update the selected position
    this.guessedPositions[position] = value;

    this.guessedPosition = position;
    // Trigger a view update (Aurelia should handle this automatically, but just to be explicit)
  }

  submitLetterGuess() {
    const guessedLetter = this.guessedPositions.find(Boolean);
    if (guessedLetter) {
      this.historyItems.push(`Guessed the letter ${guessedLetter}`);
    }
    this.signalRService.guessLetter(guessedLetter, this.guessedPosition, this.gameService.gameState.yourPlayerIndex, this.gameService.gameState.gameId);
    this.toggleGuessLetterModal();
  }

    toggleGuessWordModal() {
      this.showGuessWordModal = !this.showGuessWordModal;
    }

    submitWordGuess() {
      if (this.guessedWord) {
        this.historyItems.push(`Guessed the word ${this.guessedWord}`);
      }
      this.signalRService.guessWord(this.guessedWord, this.gameService.gameState.yourPlayerIndex, this.gameService.gameState.gameId);
      this.toggleGuessWordModal();
    }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  playNewGame() {
    this.toggleGameOverModal();
  }

  exitGame() {
    this.router.navigateToRoute('join-game');
  }

  activate(params) {
    // Do something with the router parameters
    const { gameId, playerName, otherPlayerName } = params;
    // Initialize any class properties based on these
    this.gameService.gameState.gameId = gameId;
    this.playerName = playerName;
    this.otherPlayerName = otherPlayerName;
    this.signalRService.onGuessLetterResponse(this.handleGuessLetter);
    this.signalRService.onGuessWordResponse(this.handleGuessWord);
    this.signalRService.onOpponentGuessedWordCorrectlyResponse(this.handleOpponentGuessWordCorrectly);
  }

  attached() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
    this.babylonService.initialize(canvas, this.signalRService, this.playerName, this.otherPlayerName);
  }

  private async handleGuessLetter(guessLetterResponse: GuessLetterResponse) {
    if (guessLetterResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (!guessLetterResponse.isCorrect)
    {
      this.gameService.nextTurn();
    }
    else
    {
      const data: GuessLetterCorrectEventData = { letter: guessLetterResponse.letter };
      this.eventAggregator.publish(Events.GuessLetterCorrect, data);
    }

  }

  private async handleGuessWord(guessWordResponse: GuessWordResponse) {
    if (guessWordResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (!guessWordResponse.isCorrect)
    {
      this.gameService.nextTurn();
    }
    else
    {
      const data: GuessWordCorrectEventData = { word: guessWordResponse.word };
      this.eventAggregator.publish(Events.GuessWordCorrect, data);
    }
  }

  private async handleOpponentGuessWordCorrectly(opponentGuessedWordCorrectlyResponse: OpponentGuessedWordCorrectlyResponse) {
    if (opponentGuessedWordCorrectlyResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (opponentGuessedWordCorrectlyResponse.isGameOver) {
      this.winner = this.gameService.gameState.yourPlayerIndex === 0 ? 'player2' : 'player1';
      this.toggleGameOverModal();
      const data: GameOverEventData = { winner: this.winner };
      this.eventAggregator.publish(Events.GameOver, data);
    }
    else if (opponentGuessedWordCorrectlyResponse.newWord) {
      var opponentGameState = this.gameService.gameState.getOpponentPlayerState();
      opponentGameState.currentWord = opponentGuessedWordCorrectlyResponse.newWord;
      const data: OpponentGuessedWordCorrectlyEventData = { newWord: opponentGuessedWordCorrectlyResponse.newWord };
      this.eventAggregator.publish(Events.OpponentGuessedWordCorrectly, data);
    }
  }
}