import { IHubConnectionBuilder } from "interfaces/hub-connection-builder";
import { DataType } from "real-hub-connection-builder";

export enum MessageType {
    JoinOrCreateGame = "JoinOrCreateGame",
    CreatedGame = "CreatedGame",
    JoinedGame = "JoinedGame",
    PlayerJoined = "PlayerJoined",
    CheckTile = "CheckTile",
    CheckTileResponse = "CheckTileResponse",
    GuessLetter = "GuessLetter",
    GuessLetterResponse = "GuessLetterResponse",
    GuessWord = "GuessWord",
    NewGame = "NewGame",
    GuessWordResponse = "GuessWordResponse",
    OpponentGuessedWordCorrect = "OpponentGuessedWordCorrect",
    OpponentGuessedLetterCorrect = "OpponentGuessedLetterCorrect",
    OpponentGuessedWordIncorrect = "OpponentGuessedWordIncorrect",
    OpponentGuessedLetterIncorrect = "OpponentGuessedLetterIncorrect",
    OpponentCheckedTile = "OpponentCheckedTile",
    NewGameStarted = "NewGameStarted",
    SendMessage = "SendMessage",
    SendMessageResponse = "SendMessageResponse",
    SaveGame = "SaveGame",
    LoadGame = "LoadGame",
    LoadGameResponse = "LoadGameResponse",
    ErrorResponse = "ErrorResponse"
  }

export class DualHubConnection {
    constructor(private hubConnectionBuilder: IHubConnectionBuilder) {}

    async start() {
        await this.hubConnectionBuilder.start();
    }

    async invoke(methodName: MessageType, ...params: any[]) {
        return await this.hubConnectionBuilder.invoke('' + methodName, ...params);
    }

    on<T>(methodName: MessageType, callback: (data: T) => void, dataType: DataType) {
        this.hubConnectionBuilder.on<T>(methodName, callback, dataType);
    }

    onReconnecting(callback: () => void) {
        this.hubConnectionBuilder.onReconnecting(callback);
    }

    onReconnected(callback: () => void) {
        this.hubConnectionBuilder.onReconnected(callback);
    }

    onClose(callback: () => void) {
        this.hubConnectionBuilder.onClose(callback);
    }

}