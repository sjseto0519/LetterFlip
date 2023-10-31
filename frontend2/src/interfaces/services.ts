import { DI } from "aurelia";
import { GameData, IGame } from "./game-data";
import {
    CheckTileResponse,
    ErrorResponse,
    GameResponse,
    GuessLetterResponse,
    GuessWordResponse,
    JoinGameResponse,
    LoadGameResponse,
    NewGameStartedResponse,
    OpponentCheckedTileResponse,
    OpponentGuessedLetterCorrectlyResponse,
    OpponentGuessedLetterIncorrectlyResponse,
    OpponentGuessedWordCorrectlyResponse,
    OpponentGuessedWordIncorrectlyResponse,
    SendMessageResponse
  } from "../interfaces/signal-r";
import { GameState } from "../state/game-state";
import { IEventAggregator } from "./utils";
import { TextureConfig } from "./dynamic-texture";

export interface IBabylonService {
    initialize(canvas: HTMLCanvasElement, signalRService: ISignalRService, eventAggregator: IEventAggregator): unknown;
    currentGame?: IGame;
    dispose: () => void;
}

export interface IGameService {
    gameState: GameState;
    currentGame?: IGame;
  
    initialize(game: IGame): void;
    nextTurn(): void;
    flipLetter(letter: string): void;
    newGame(
      gameId: string,
      playerIndex: number,
      playerName: string,
      otherPlayerName: string,
      opponentWord: string
    ): void;
  }
  
export interface ISignalRService {
    startConnection(): Promise<void>;
    loadGame(gameData: GameData): Promise<void>;
    saveGame(gameData: GameData, savedGame: string): Promise<void>;
    joinGame(userName: string, gameId: string): Promise<void>;
    checkTile(letter: string, playerUrl: string, gameId: string): Promise<void>;
    guessLetter(letter: string, wordIndex: number, playerUrl: string, gameId: string): Promise<void>;
    guessWord(word: string, playerUrl: string, gameId: string): Promise<void>;
    requestNewGame(gameData: GameData): Promise<void>;
    sendMessage(message: string, gameId: string): Promise<void>;
  
    addCreatedGameListener(callback: (gameResponse: GameResponse) => void): void;
    addJoinedGameListener(callback: (gameResponse: GameResponse) => void): void;
    addPlayerJoinedListener(callback: (joinGameResponse: JoinGameResponse) => void): void;
    onCheckTileResponse(callback: (checkTileResponse: CheckTileResponse) => void): void;
    onGuessLetterResponse(callback: (guessLetterResponse: GuessLetterResponse) => void): void;
    onGuessWordResponse(callback: (guessWordResponse: GuessWordResponse) => void): void;
    onOpponentGuessedWordCorrectlyResponse(callback: (opponentGuessedWordCorrectlyResponse: OpponentGuessedWordCorrectlyResponse) => void): void;
    onOpponentGuessedLetterCorrectlyResponse(callback: (opponentGuessedLetterCorrectlyResponse: OpponentGuessedLetterCorrectlyResponse) => void): void;
    onOpponentGuessedWordIncorrectlyResponse(callback: (opponentGuessedWordIncorrectlyResponse: OpponentGuessedWordIncorrectlyResponse) => void): void;
    onOpponentGuessedLetterIncorrectlyResponse(callback: (opponentGuessedLetterIncorrectlyResponse: OpponentGuessedLetterIncorrectlyResponse) => void): void;
    onOpponentCheckedTileResponse(callback: (opponentCheckedTileResponse: OpponentCheckedTileResponse) => void): void;
    onNewGameStartedResponse(callback: (onNewGameStartedResponse: NewGameStartedResponse) => void): void;
    onSendMessageResponse(callback: (messageResponse: SendMessageResponse) => void): void;
    onLoadGameResponse(callback: (loadGameResponse: LoadGameResponse) => void): void;
    onErrorResponse(callback: (detail: ErrorResponse) => void): void;
  }

export interface IDynamicTextureService {
    toWallMaterial(textureConfig: TextureConfig): import("@babylonjs/core").StandardMaterial| undefined;
}

export const MyBabylonService = DI.createInterface<IBabylonService>();
export const MyGameService = DI.createInterface<IGameService>();
export const MySignalRService = DI.createInterface<ISignalRService>();
export const MyDynamicTextureService = DI.createInterface<IDynamicTextureService>();