import { DualHubConnection, MessageType } from "../connections/dual-hub-connection";
import { GameData } from "../interfaces/game-data";
import { MockHubConnectionBuilder } from "../builders/mock-hub-connection-builder";
import { DataType, RealHubConnectionBuilder } from "../builders/real-hub-connection-builder";
import { CheckTileResponse, ErrorResponse, GameResponse, GuessLetterResponse, GuessWordResponse, JoinGameResponse, LoadGameResponse, 
    NewGameStartedResponse, OpponentCheckedTileResponse, OpponentGuessedLetterCorrectlyResponse, OpponentGuessedLetterIncorrectlyResponse, 
    OpponentGuessedWordCorrectlyResponse, OpponentGuessedWordIncorrectlyResponse, SendMessageResponse } from "../interfaces/signal-r";

export class SignalRService {
    private connection: DualHubConnection;
  
    constructor() {
      const mockConnectionBuilder = new MockHubConnectionBuilder();
      const connectionBuilder = new RealHubConnectionBuilder("https://localhost:7213/gamehub");
      this.connection = new DualHubConnection(connectionBuilder);
    }
  
    public startConnection = async () => {
      try {
        await this.connection.start();
      }
      catch (e)
      {
        console.log("Error while starting connection: " + e);
      }
    };

    public async loadGame(gameData: GameData) {
      await this.connection.invoke(MessageType.LoadGame, gameData.playerName, gameData.otherPlayerName, gameData.playerUrl);
    }

    public async saveGame(gameData: GameData, savedGame: string) {
      await this.connection.invoke(MessageType.SaveGame, gameData.gameId, gameData.playerName, gameData.otherPlayerName, gameData.playerUrl, savedGame);
    }

    public async joinGame(userName: string, gameId: string) {
        await this.connection.invoke(MessageType.JoinOrCreateGame, userName, gameId);
      }

    public async checkTile(letter: string, playerUrl: string, gameId: string) {
      await this.connection.invoke(MessageType.CheckTile, letter, playerUrl, gameId);
    }

    public async guessLetter(letter: string, wordIndex: number, playerUrl: string, gameId: string) {
      await this.connection.invoke(MessageType.GuessLetter, letter, wordIndex, playerUrl, gameId);
    }

    public async guessWord(word: string, playerUrl: string, gameId: string) {
      await this.connection.invoke(MessageType.GuessWord, word, playerUrl, gameId);
    }

    public async requestNewGame(gameData: GameData) {
      await this.connection.invoke(MessageType.NewGame, gameData.gameId, gameData.playerName, gameData.otherPlayerName, gameData.playerUrl);
    }

    public async sendMessage(message: string, gameId: string) {
      await this.connection.invoke(MessageType.SendMessage, message, gameId);
    }

    public addCreatedGameListener(callback: (gameResponse: GameResponse) => void) {
      this.connection.on(MessageType.CreatedGame, callback, DataType.GameResponse);
    }

    public addJoinedGameListener(callback: (gameResponse: GameResponse) => void) {
        this.connection.on(MessageType.JoinedGame, callback, DataType.GameResponse);
      }

    public addPlayerJoinedListener(callback: (joinGameResponse: JoinGameResponse) => void) {
        this.connection.on(MessageType.PlayerJoined, callback, DataType.JoinGameResponse);
      }

    // Inside SignalRService
    public onCheckTileResponse(callback: (checkTileResponse: CheckTileResponse) => void) {
        this.connection.on(MessageType.CheckTileResponse, callback, DataType.CheckTileResponse);
    }

    public onGuessLetterResponse(callback: (guessLetterResponse: GuessLetterResponse) => void) {
      this.connection.on(MessageType.GuessLetterResponse, callback, DataType.GuessLetterResponse);
    }

    public onGuessWordResponse(callback: (guessWordResponse: GuessWordResponse) => void) {
      this.connection.on(MessageType.GuessWordResponse, callback, DataType.GuessWordResponse);
    }

    public onOpponentGuessedWordCorrectlyResponse(callback: (opponentGuessedWordCorrectlyResponse: OpponentGuessedWordCorrectlyResponse) => void) {
      this.connection.on(MessageType.OpponentGuessedWordCorrect, callback, DataType.OpponentGuessedWordCorrectlyResponse);
    }

    public onOpponentGuessedLetterCorrectlyResponse(callback: (opponentGuessedLetterCorrectlyResponse: OpponentGuessedLetterCorrectlyResponse) => void) {
      this.connection.on(MessageType.OpponentGuessedLetterCorrect, callback, DataType.OpponentGuessedLetterCorrectlyResponse);
    }

    public onOpponentGuessedWordIncorrectlyResponse(callback: (opponentGuessedWordIncorrectlyResponse: OpponentGuessedWordIncorrectlyResponse) => void) {
      this.connection.on(MessageType.OpponentGuessedWordIncorrect, callback, DataType.OpponentGuessedWordIncorrectlyResponse);
    }

    public onOpponentGuessedLetterIncorrectlyResponse(callback: (opponentGuessedLetterIncorrectlyResponse: OpponentGuessedLetterIncorrectlyResponse) => void) {
      this.connection.on(MessageType.OpponentGuessedLetterIncorrect, callback, DataType.OpponentGuessedLetterIncorrectlyResponse);
    }

    public onOpponentCheckedTileResponse(callback: (opponentCheckedTileResponse: OpponentCheckedTileResponse) => void) {
      this.connection.on(MessageType.OpponentCheckedTile, callback, DataType.OpponentCheckedTileResponse);
    }

    public onNewGameStartedResponse(callback: (onNewGameStartedResponse: NewGameStartedResponse) => void) {
      this.connection.on(MessageType.NewGameStarted, callback, DataType.NewGameStartedResponse);
    }

    public onSendMessageResponse(callback: (messageResponse: SendMessageResponse) => void) {
      this.connection.on(MessageType.SendMessageResponse, callback, DataType.SendMessageResponse);
    }

    public onLoadGameResponse(callback: (loadGameResponse: LoadGameResponse) => void) {
      this.connection.on(MessageType.LoadGameResponse, callback, DataType.LoadGameResponse);
    }

    public onErrorResponse(callback: (detail: ErrorResponse) => void) {
      this.connection.on(MessageType.ErrorResponse, callback, DataType.ErrorResponse);
    }
  }
  