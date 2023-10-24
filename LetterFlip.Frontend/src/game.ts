import { autoinject } from 'aurelia-framework';
import { BabylonService } from "babylon-service";
import { GuessLetterResponse, SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';
import { GameService } from 'game-service';
import { EventAggregatorFactory } from 'utils/event-aggregator-factory';
import { Events } from 'utils/events';
import { GuessLetterEventData } from 'interfaces/event-data';

@autoinject
export class Game {
  constructor(private babylonService: BabylonService, private signalRService: SignalRService, private gameService: GameService, private eventAggregatorFactory: EventAggregatorFactory, private router: Router) { 
    babylonService.currentGame = this;
    eventAggregatorFactory.get(Events.GuessLetter, GuessLetterEventData);
    this.guessedPositions = Array.from({ length: this.gameService.gameState.getYourPlayerState().currentWord.length }, () => '');
  }

    playerName: string;
    otherPlayerName: string;
    showHistory = false;
    historyItems = []; // Your history data
    showGuessLetterModal = false;
    showGuessWordModal = false;
    guessedLetter = '';
    guessedWord = '';
  guessedPositions = [];

  toggleGuessLetterModal() {
    this.showGuessLetterModal = !this.showGuessLetterModal;
  }

  updateGuess(position, value) {
    // Reset all positions
    this.guessedPositions.fill('');

    // Update the selected position
    this.guessedPositions[position] = value;

    // Trigger a view update (Aurelia should handle this automatically, but just to be explicit)
  }

  submitLetterGuess() {
    const guessedLetter = this.guessedPositions.find(Boolean);
    if (guessedLetter) {
      this.historyItems.push(`Guessed the letter ${guessedLetter}`);
    }
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

  }
}