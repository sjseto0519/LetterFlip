import { autoinject } from 'aurelia-framework';
import { BabylonService } from "babylon-service";
import { CheckTileResponse, ErrorResponse, GuessLetterResponse, GuessWordResponse, LoadGameResponse, NewGameStartedResponse, OpponentCheckedTileResponse, OpponentGuessedLetterCorrectlyResponse, OpponentGuessedLetterIncorrectlyResponse, OpponentGuessedWordCorrectlyResponse, OpponentGuessedWordIncorrectlyResponse, SendMessageResponse, SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';
import { GameService } from 'game-service';
import { Events } from 'utils/events';
import { EventAggregator } from 'utils/event-aggregator';
import { GameOverEventData, GuessLetterCorrectEventData, GuessWordCorrectEventData, NewGameStartedEventData, OpponentGuessedWordCorrectlyEventData } from 'interfaces/event-data';
import { GameState } from 'game-state';
import { HeaderCustomElement } from 'components/header';
import { GuessWordModalCustomElement } from 'components/guess-word-modal';
import { GuessLetterModalCustomElement } from 'components/guess-letter-modal';
import { GameOverModalCustomElement } from 'components/game-over-modal';
import { DrawerCustomElement } from 'components/drawer';
import { ChatMessageCustomElement } from 'components/chat-message';
import { ActionMessageCustomElement } from 'components/action-message';

export interface HistoryItem {
  item: string;
  yours: boolean;
  type?: string;
}

export interface GameData {
  gameId: string;
  playerName: string;
  otherPlayerName: string;
  playerUrl: string;
}

export interface SavedGame {
  gameData: GameData;
  history: HistoryItem[];
  gameState: GameState; 
}

@autoinject
export class Game {
  constructor(public gameService: GameService, private babylonService: BabylonService, private signalRService: SignalRService, private eventAggregator: EventAggregator, private router: Router) { 
    babylonService.currentGame = this;
    gameService.currentGame = this;
  }

    gameId: string;
    playerName: string;
    otherPlayerName: string;
    playerIndex: number;

  headerRef: HeaderCustomElement;
  actionMessageRef: ActionMessageCustomElement;
  chatMessageRef: ChatMessageCustomElement;
  drawerRef: DrawerCustomElement;
  gameOverRef: GameOverModalCustomElement;
  guessLetterRef: GuessLetterModalCustomElement;
  guessWordRef: GuessWordModalCustomElement;

  getTrimmedHash() {
    const hash = window.location.hash;
    return hash.endsWith('/') ? hash.slice(0, -1) : hash;
  }

  toGameData(): GameData {
    return {
      gameId: this.gameId,
      playerName: this.playerName,
      otherPlayerName: this.otherPlayerName,
      playerUrl: decodeURIComponent(this.getTrimmedHash())
    };
  }

  saveGame() {
    const savedGame: SavedGame = {
      gameData: this.toGameData(),
      history: this.drawerRef.historyItems,
      gameState: this.gameService.gameState
    };
    const str = JSON.stringify(savedGame);
    this.signalRService.saveGame(savedGame.gameData, str);
    localStorage.setItem('savedGame', str);
  }

  activate(params) {
    // Do something with the router parameters
    const { gameId, playerIndex, playerName, otherPlayerName } = params;
    // Initialize any class properties based on these
    this.gameService.gameState.gameId = gameId;
    this.gameId = gameId;
    this.playerName = playerName;
    this.otherPlayerName = otherPlayerName;
    this.playerIndex = parseInt(playerIndex);
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
    this.signalRService.onLoadGameResponse(this.handleLoadGameResponse.bind(this));
    this.signalRService.onErrorResponse(this.HandleErrorResponse.bind(this));
  }

  deactivate() {
    this.babylonService.dispose();
    // Refresh the root page
    window.location.href = '/';
  }

  async attached() {
  const playerState = this.gameService.gameState.getYourPlayerState();
  if (!playerState) {
    await this.signalRService.startConnection();
    this.signalRService.loadGame(this.toGameData());
  }
  else
  {
    this.guessLetterRef.setGuessedPositions(playerState.currentDifficulty);
    this.saveGame();
  }
}

  private async HandleErrorResponse(errorResponse: ErrorResponse) {
    console.error(errorResponse.detail);
  }

  private async handleLoadGameResponse(loadGameResponse: LoadGameResponse) {
    if (loadGameResponse.gameId !== this.gameService.gameState.gameId) {
      return;
    }

    if (loadGameResponse.playerUrl !== this.toGameData().playerUrl) {
      return;
    }

    const savedGame: SavedGame = JSON.parse(loadGameResponse.savedGame) as SavedGame;
    this.updateObjectProperties(this.gameService.gameState, savedGame.gameState);
    this.drawerRef.historyItems = savedGame.history;

    this.guessLetterRef.setGuessedPositions(this.gameService.gameState.getYourPlayerState().currentDifficulty);
  }

  // Utility function to update object properties recursively
  private updateObjectProperties(target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // If the value is an object, go one level deeper
        if (!target[key]) target[key] = {};
          this.updateObjectProperties(target[key], value);
      } else if (typeof value !== 'function') {
        // If the value is a primitive and not a function, update the property
        target[key] = value;
      }
      // If the value is a function, do nothing
    }
  }

  private async handleSendMessageResponse(sendMessageResponse: SendMessageResponse) {
    if (sendMessageResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    this.drawerRef.historyItems.push({ item: sendMessageResponse.message, yours: false, type: 'Message' });
  }

  private async handleCheckTileResponse(checkTileResponse: CheckTileResponse) {
    if (checkTileResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (checkTileResponse.occurrences === 0) {
      this.gameService.nextTurn();
    }
    this.drawerRef.historyItems.push({ item: 'Guessed tile ' + checkTileResponse.letter + ' and found ' + checkTileResponse.occurrences + ' occurrences', yours: true});
    this.eventAggregator.publish(Events.CheckTile, { 'letter': checkTileResponse.letter, 'occurrences': checkTileResponse.occurrences });

  }

  private async handleNewGameStarted(newGameStarted: NewGameStartedResponse) {
    if (newGameStarted.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    this.drawerRef.historyItems = [];
    this.gameService.newGame(this.gameService.gameState.gameId, this.gameService.gameState.yourPlayerIndex === 0 ? 1 : 0, this.playerName, this.otherPlayerName, newGameStarted.opponentWord);
    this.guessLetterRef.setGuessedPositions(this.gameService.gameState.getYourPlayerState().currentDifficulty);
    const data: NewGameStartedEventData = {};
    this.eventAggregator.publish(Events.NewGameStarted, data);
    this.gameOverRef.isNewGameRequested = false;
    this.saveGame();
    this.gameOverRef.toggleGameOverModal();
  }

  private async handleGuessLetter(guessLetterResponse: GuessLetterResponse) {
    if (guessLetterResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (!guessLetterResponse.isCorrect)
    {
      this.drawerRef.historyItems.push({ item: `Guessed the letter ${guessLetterResponse.letter} incorrectly at position ${guessLetterResponse.position + 1}`, yours: true});
      this.gameService.nextTurn();
    }
    else
    {
      this.drawerRef.historyItems.push({ item: `Guessed the letter ${guessLetterResponse.letter} correctly at position ${guessLetterResponse.position + 1}`, yours: true});
      const state = this.gameService.gameState.getYourPlayerState();
      state.wordView[guessLetterResponse.position] = guessLetterResponse.letter;
      const data: GuessLetterCorrectEventData = { letter: guessLetterResponse.letter, position: guessLetterResponse.position };
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
      this.drawerRef.historyItems.push({ item: 'Opponent incorrectly guessed letter ' + opponentCheckedTileResponse.letter, yours: false});
      this.gameService.nextTurn();
    }
    else
    {
      this.drawerRef.historyItems.push({ item: 'Opponent correctly guessed letter ' + opponentCheckedTileResponse.letter, yours: false});
    }
  }

  private async handleGuessWord(guessWordResponse: GuessWordResponse) {
    if (guessWordResponse.gameId !== this.gameService.gameState.gameId)
    {
      return;
    }

    if (!guessWordResponse.isCorrect)
    {
      this.drawerRef.historyItems.push({ item: `Incorrectly guessed the word ${guessWordResponse.word}`, yours: true});
      this.gameService.nextTurn();
    }
    else
    {
      if (guessWordResponse.isGameOver) {
        this.drawerRef.historyItems.push({ item: `Correct! The word was ${guessWordResponse.word}`, yours: true});
        this.gameOverRef.winner = 'player1';
        this.gameOverRef.toggleGameOverModal();
        const data: GameOverEventData = { winner: this.gameOverRef.winner };
        this.eventAggregator.publish(Events.GameOver, data);
      }
      else {
        const playerState = this.gameService.gameState.getYourPlayerState();
        playerState.currentDifficulty++;
        playerState.wordView = new Array(playerState.currentDifficulty).fill('_');
        this.guessLetterRef.setGuessedPositions(this.gameService.gameState.getYourPlayerState().currentDifficulty);
        this.drawerRef.historyItems.push({ item: `Correct! The word was ${guessWordResponse.word}`, yours: true});
        const data: GuessWordCorrectEventData = { word: guessWordResponse.word };
        this.eventAggregator.publish(Events.GuessWordCorrect, data);
      }
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

    this.drawerRef.historyItems.push({ item: 'Opponent incorrectly guessed letter ' + opponentGuessedLetterIncorrectlyResponse.letter + ' at position ' + (opponentGuessedLetterIncorrectlyResponse.position + 1), yours: false});
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

    this.gameService.gameState.getOpponentPlayerState().wordView[opponentGuessedLetterCorrectlyResponse.position] = opponentGuessedLetterCorrectlyResponse.letter;

    this.drawerRef.historyItems.push({ item: 'Opponent correctly guessed the letter ' + opponentGuessedLetterCorrectlyResponse.letter + ' at position ' + (opponentGuessedLetterCorrectlyResponse.position + 1), yours: false});

    if (opponentGuessedLetterCorrectlyResponse.letter) {
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
    this.drawerRef.historyItems.push({ item: 'Opponent incorrectly guessed word ' + opponentGuessedWordIncorrectlyResponse.word, yours: false});
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

    this.drawerRef.historyItems.push({ item: 'Opponent correctly guessed the word ' + opponentGuessedWordCorrectlyResponse.word, yours: false});

    if (opponentGuessedWordCorrectlyResponse.isGameOver) {
      this.gameOverRef.winner = 'player2';
      this.gameOverRef.toggleGameOverModal();
      const data: GameOverEventData = { winner: this.gameOverRef.winner };
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