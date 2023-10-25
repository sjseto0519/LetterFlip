import { DualHubConnection, MessageType } from "dual-hub-connection";
import { MockHubConnectionBuilder } from "mock-hub-connection-builder";
import { DataType, RealHubConnectionBuilder } from "real-hub-connection-builder";

export interface GameResponse {
  gameId: string,
  playerName: string
}

export interface JoinGameResponse {
  playerName: string;
}

export interface CheckTileResponse {
  gameId: string;
  letter: string;
  occurrences: number;
}

export interface GuessLetterResponse {
  gameId: string;
  letter: string;
  isCorrect: boolean;
}

export interface GuessWordResponse {
  gameId: string;
  word: string;
  isCorrect: boolean;
}

export interface OpponentGuessedWordCorrectlyResponse {
  gameId: string;
  word: string;
  newWord: string;
  isGameOver: boolean;
}

export interface OpponentGuessedLetterCorrectlyResponse {
  gameId: string;
  letter: string;
  position: number;
  newWordView: string[];
  isGameOver: boolean;
}

export interface OpponentGuessedWordIncorrectlyResponse {
  gameId: string;
  word: string;
  newWord: string;
}

export interface OpponentGuessedLetterIncorrectlyResponse {
  gameId: string;
  letter: string;
  position: number;
}

export interface OpponentCheckedTileResponse {
  gameId: string;
  letter: string;
  isCorrect: string;
}

export interface NewGameStartedResponse {
  gameId: string;
}

export class SignalRService {
    private connection: DualHubConnection;
  
    constructor() {
      const mockConnectionBuilder = new MockHubConnectionBuilder();
      const connectionBuilder = new RealHubConnectionBuilder("https://localhost:7213/gamehub");
      this.connection = new DualHubConnection(mockConnectionBuilder);
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

    public async joinGame(userName: string, gameId: string) {
        await this.connection.invoke(MessageType.JoinOrCreateGame, userName, gameId);
      }

    public async checkTile(letter: string, playerIndex: number, gameId: string) {
      await this.connection.invoke(MessageType.CheckTile, letter, playerIndex, gameId);
    }

    public async guessLetter(letter: string, wordIndex: number, playerIndex: number, gameId: string) {
      await this.connection.invoke(MessageType.GuessLetter, letter, wordIndex, playerIndex, gameId);
    }

    public async guessWord(word: string, playerIndex: number, gameId: string) {
      await this.connection.invoke(MessageType.GuessWord, word, playerIndex, gameId);
    }

    public async requestNewGame(gameId: string) {
      await this.connection.invoke(MessageType.NewGame, gameId);
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
        this.connection.on(MessageType.CheckTileResponse, callback, DataType.GameResponse);
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
  }
  