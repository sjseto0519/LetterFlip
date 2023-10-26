import { autoinject } from 'aurelia-framework';
import { BabylonService } from "babylon-service";
import { CheckTileResponse, GuessLetterResponse, GuessWordResponse, NewGameStartedResponse, OpponentCheckedTileResponse, OpponentGuessedLetterCorrectlyResponse, OpponentGuessedLetterIncorrectlyResponse, OpponentGuessedWordCorrectlyResponse, OpponentGuessedWordIncorrectlyResponse, SendMessageResponse, SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';
import { GameService } from 'game-service';
import { Events } from 'utils/events';
import { EventAggregator } from 'utils/event-aggregator';
import { GameOverEventData, GuessLetterCorrectEventData, GuessWordCorrectEventData, NewGameStartedEventData, OpponentGuessedWordCorrectlyEventData } from 'interfaces/event-data';

export interface HistoryItem {
  item: string;
  yours: boolean;
  type?: string;
}

@autoinject
export class Game {
  constructor(public gameService: GameService, private babylonService: BabylonService, private signalRService: SignalRService, private eventAggregator: EventAggregator, private router: Router) { 
    babylonService.currentGame = this;
  }

    playerName: string;
    otherPlayerName: string;
    showHistory = false;
    historyItems: HistoryItem[] = []; // Your history data
    isGameOver = false;
    winner = '';
    showGuessLetterModal = false;
    showGuessWordModal = false;
    guessedLetter = '';
    guessedWord = '';
    guessedPosition = 0;
    message = '';
  guessedPositions = [];
  isNewGameRequested = false;
  showLastActionToast = true;

  get reversedHistory() {
    return [...this.historyItems].reverse();
  }

  toggleGuessLetterModal() {
    this.showGuessLetterModal = !this.showGuessLetterModal;
  }

  toggleGameOverModal() {
    this.isGameOver = !this.isGameOver;
  }

  updateGuess(position, value: string) {
    // Create a new array with all empty strings
    const newGuessedPositions = new Array(this.guessedPositions.length).fill('');

    // Update the selected position
    newGuessedPositions[position] = value.toUpperCase();

    // Replace the old array with the new one
    this.guessedPositions = newGuessedPositions;

    this.guessedPosition = position;
  }

  submitLetterGuess() {
    const guessedLetter = this.guessedPositions.find(Boolean);
    if (guessedLetter) {
      this.historyItems.push({ item: `Guessed the letter ${guessedLetter} at position ${this.guessedPosition + 1}`, yours: true});
    }
    this.signalRService.guessLetter(guessedLetter, this.guessedPosition, this.gameService.gameState.yourPlayerIndex, this.gameService.gameState.gameId);
    this.toggleGuessLetterModal();
  }

    toggleGuessWordModal() {
      this.showGuessWordModal = !this.showGuessWordModal;
    }

    submitWordGuess() {
      if (this.guessedWord) {
        this.historyItems.push({ item: `Guessed the word ${this.guessedWord}`, yours: true});
      }
      this.signalRService.guessWord(this.guessedWord, this.gameService.gameState.yourPlayerIndex, this.gameService.gameState.gameId);
      this.toggleGuessWordModal();
    }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  playNewGame() {
    this.isNewGameRequested = true;
    this.signalRService.requestNewGame(this.gameService.gameState.gameId);
  }

  exitGame() {
    this.router.navigateToRoute('join-game');
  }

  activate(params) {
    // Do something with the router parameters
    const { gameId, playerName, otherPlayerName } = params;
    // Initialize any class properties based on these
    this.gameService.gameState.gameId = gameId;
    this.guessedPositions = Array.from({ length: this.gameService.gameState.getYourPlayerState().currentDifficulty }, () => '');
    this.playerName = playerName;
    this.otherPlayerName = otherPlayerName;
    this.signalRService.onGuessLetterResponse(this.handleGuessLetter.bind(this));
    this.signalRService.onGuessWordResponse(this.handleGuessWord.bind(this));
    this.signalRService.onOpponentGuessedLetterCorrectlyResponse(this.handleOpponentGuessLetterCorrectly.bind(this));
    this.signalRService.onOpponentGuessedWordCorrectlyResponse(this.handleOpponentGuessWordCorrectly.bind(this));
    this.signalRService.onOpponentCheckedTileResponse(this.handleOpponentCheckedTile.bind(this));
    this.signalRService.onOpponentGuessedLetterIncorrectlyResponse(this.handleOpponentGuessLetterIncorrectly.bind(this));
    this.signalRService.onOpponentGuessedWordIncorrectlyResponse(this.handleOpponentGuessWordIncorrectly.bind(this));
    this.signalRService.onNewGameStartedResponse(this.handleNewGameStarted.bind(this));
    this.signalRService.onCheckTileResponse(this.handleCheckTileResponse.bind(this));
    this.signalRService.onSendMessageResponse(this.handleSendMessageResponse.bind(this));
  }

  deactivate() {
    this.babylonService.dispose();
    // Refresh the root page
    window.location.href = '/';
  }

  attached() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
    this.babylonService.initialize(canvas, this.signalRService, this.eventAggregator);
  }

  sendMessage() {
    this.historyItems.push({ item: this.message, yours: true, type: 'Message' });
    this.signalRService.sendMessage(this.message, this.gameService.gameState.gameId);
  }

  private async handleSendMessageResponse(sendMessageResponse: SendMessageResponse) {
    if (sendMessageResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    this.historyItems.push({ item: sendMessageResponse.message, yours: false, type: 'Message' });
  }

  private async handleCheckTileResponse(checkTileResponse: CheckTileResponse) {
    if (checkTileResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (checkTileResponse.occurrences === 0) {
      this.gameService.nextTurn();
    }
    this.historyItems.push({ item: 'Guessed tile ' + checkTileResponse.letter + ' and found ' + checkTileResponse.occurrences + ' occurrences', yours: true});
    this.eventAggregator.publish(Events.CheckTile, { 'letter': checkTileResponse.letter, 'occurrences': checkTileResponse.occurrences });

  }

  private async handleNewGameStarted(newGameStarted: NewGameStartedResponse) {
    if (newGameStarted.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    this.historyItems = [];
    this.gameService.newGame(this.gameService.gameState.gameId, this.gameService.gameState.yourPlayerIndex === 0 ? 1 : 0, this.playerName, this.otherPlayerName, newGameStarted.opponentWord);
    const data: NewGameStartedEventData = {};
    this.eventAggregator.publish(Events.NewGameStarted, data);
    this.toggleGameOverModal();
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

  private async handleOpponentCheckedTile(opponentCheckedTileResponse: OpponentCheckedTileResponse) {
    if (opponentCheckedTileResponse.gameId !== this.gameService.gameState.gameId) 
    {
      return;
    }

    if (this.gameService.gameState.isYourTurn())
    {
      return;
    }
    
    if (!opponentCheckedTileResponse.isCorrect)
    {
      this.historyItems.push({ item: 'Opponent incorrectly guessed letter ' + opponentCheckedTileResponse.letter, yours: false});
      this.gameService.nextTurn();
    }
    else
    {
      this.historyItems.push({ item: 'Opponent correctly guessed letter ' + opponentCheckedTileResponse.letter, yours: false});
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

  private async handleOpponentGuessLetterIncorrectly(opponentGuessedLetterIncorrectlyResponse: OpponentGuessedLetterIncorrectlyResponse) {
    if (opponentGuessedLetterIncorrectlyResponse.gameId !== this.gameService.gameState.gameId) {
      return;
    }

    if (this.gameService.gameState.isYourTurn())
    {
      return;
    }

    this.historyItems.push({ item: 'Opponent incorrectly guessed letter ' + opponentGuessedLetterIncorrectlyResponse.letter + ' at position ' + (opponentGuessedLetterIncorrectlyResponse.position + 1), yours: false});
    this.gameService.nextTurn();
  }

  private async handleOpponentGuessLetterCorrectly(opponentGuessedLetterCorrectlyResponse: OpponentGuessedLetterCorrectlyResponse) {
    if (opponentGuessedLetterCorrectlyResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (this.gameService.gameState.isYourTurn())
    {
      return;
    }

    this.historyItems.push({ item: 'Opponent correctly guessed the letter ' + opponentGuessedLetterCorrectlyResponse.letter + ' at position ' + (opponentGuessedLetterCorrectlyResponse.position + 1), yours: false});

    if (opponentGuessedLetterCorrectlyResponse.isGameOver) {
      this.winner = this.gameService.gameState.yourPlayerIndex === 0 ? 'player2' : 'player1';
      this.toggleGameOverModal();
      const data: GameOverEventData = { winner: this.winner };
      this.eventAggregator.publish(Events.GameOver, data);
    }
    else if (opponentGuessedLetterCorrectlyResponse.letter) {
      const opponentGameState = this.gameService.gameState.getOpponentPlayerState();
      opponentGameState.wordView = opponentGuessedLetterCorrectlyResponse.newWordView;
    }
  }

  private async handleOpponentGuessWordIncorrectly(opponentGuessedWordIncorrectlyResponse: OpponentGuessedWordIncorrectlyResponse) {
    if (opponentGuessedWordIncorrectlyResponse.gameId !== this.gameService.gameState.gameId) {
      return;
    }

    if (this.gameService.gameState.isYourTurn())
    {
      return;
    }
    this.historyItems.push({ item: 'Opponent incorrectly guessed word ' + opponentGuessedWordIncorrectlyResponse.word, yours: false});
    this.gameService.nextTurn();
  }

  private async handleOpponentGuessWordCorrectly(opponentGuessedWordCorrectlyResponse: OpponentGuessedWordCorrectlyResponse) {
    if (opponentGuessedWordCorrectlyResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (this.gameService.gameState.isYourTurn())
    {
      return;
    }

    this.historyItems.push({ item: 'Opponent correctly guessed the word ' + opponentGuessedWordCorrectlyResponse.word, yours: false});

    if (opponentGuessedWordCorrectlyResponse.isGameOver) {
      this.winner = this.gameService.gameState.yourPlayerIndex === 0 ? 'player2' : 'player1';
      this.toggleGameOverModal();
      const data: GameOverEventData = { winner: this.winner };
      this.eventAggregator.publish(Events.GameOver, data);
    }
    else if (opponentGuessedWordCorrectlyResponse.newWord) {
      const opponentGameState = this.gameService.gameState.getOpponentPlayerState();
      opponentGameState.currentWord = opponentGuessedWordCorrectlyResponse.newWord;
      opponentGameState.currentDifficulty = opponentGuessedWordCorrectlyResponse.newWord.length;
      const data: OpponentGuessedWordCorrectlyEventData = { newWord: opponentGuessedWordCorrectlyResponse.newWord };
      this.eventAggregator.publish(Events.OpponentGuessedWordCorrectly, data);
    }
  }
}