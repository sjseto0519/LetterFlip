import { autoinject } from 'aurelia-framework';
import { BabylonService } from "babylon-service";
import { SignalRService } from 'signalr-service';

@autoinject
export class Game {
  constructor(private babylonService: BabylonService, private signalRService: SignalRService) { 
    babylonService.currentGame = this;
  }

    gameId: string;
    playerName: string;
    otherPlayerName: string;
    showHistory = false;
    historyItems = []; // Your history data
    showGuessLetterModal = false;
    showGuessWordModal = false;
    guessedLetter = '';
    guessedWord = '';
  currentWord = 'example'; // Replace with your actual current word
  guessedPositions = Array.from({ length: this.currentWord.length }, () => '');

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
      this.toggleGuessWordModal();
    }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  activate(params) {
    // Do something with the router parameters
    let { gameId, playerName, otherPlayerName } = params;
    // Initialize any class properties based on these
    this.gameId = gameId;
    this.playerName = playerName;
    this.otherPlayerName = otherPlayerName;
  }

  attached() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
    this.babylonService.initialize(canvas, this.signalRService, this.playerName, this.otherPlayerName);
  }
}