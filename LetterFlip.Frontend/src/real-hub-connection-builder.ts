import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { IHubConnectionBuilder } from 'interfaces/hub-connection-builder';

export enum DataType {
    GameResponse,
    JoinGameResponse,
    CheckTileResponse,
    GuessLetterResponse,
    GuessWordResponse,
    OpponentGuessedWordCorrectlyResponse,
    OpponentGuessedLetterCorrectlyResponse,
    OpponentGuessedWordIncorrectlyResponse,
    OpponentGuessedLetterIncorrectlyResponse,
    OpponentCheckedTileResponse,
    NewGameStartedResponse,
    SendMessageResponse,
    LoadGameResponse
}

export class RealHubConnectionBuilder implements IHubConnectionBuilder {
    private hubConnection: HubConnection;
    private dataTypeMap: Map<DataType, string[]> = new Map([
        [DataType.GameResponse, ['gameId', 'playerName', 'opponentWord']],
        [DataType.JoinGameResponse, ['playerName', 'opponentWord']],
        [DataType.CheckTileResponse, ['gameId', 'letter', 'occurrences']],
        [DataType.GuessLetterResponse, ['gameId', 'letter', 'position', 'isCorrect']],
        [DataType.GuessWordResponse, ['gameId', 'word', 'isCorrect', 'isGameOver']],
        [DataType.OpponentGuessedWordCorrectlyResponse, ['gameId', 'word', 'newWord', 'isGameOver']],
        [DataType.OpponentGuessedLetterCorrectlyResponse, ['gameId', 'letter', 'position', 'newWordView', 'isGameOver']],
        [DataType.OpponentGuessedWordIncorrectlyResponse, ['gameId', 'word']],
        [DataType.OpponentGuessedLetterIncorrectlyResponse, ['gameId', 'letter', 'position']],
        [DataType.OpponentCheckedTileResponse, ['gameId', 'letter', 'isCorrect']],
        [DataType.NewGameStartedResponse, ['gameId', 'opponentWord']],
        [DataType.SendMessageResponse, ['gameId', 'message']],
        [DataType.LoadGameResponse, ['gameId', 'playerIndex', 'savedGame']]
      ]);

    constructor(url: string) {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .build();
    }

    async start() {
        await this.hubConnection.start();
    }

    async invoke(methodName: string, ...params: any[]) {
        return await this.hubConnection.invoke(methodName, ...params);
    }

    on<T>(methodName: string, callback: (data: T) => void, dataType: DataType) {
        const propertyNames = this.dataTypeMap.get(dataType) || [];
        this.hubConnection.on(methodName, (...args) => {
          if (args.length !== propertyNames.length) {
            throw new Error(`Property name length must match the number of arguments: ${args.length}`);
          }
          const data = propertyNames.reduce((acc, propName, index) => {
            acc[propName] = args[index];
            return acc;
          }, {} as T);
          callback(data);
        });
      }

    onReconnecting(callback: () => void): void {
        this.hubConnection.onreconnecting(callback);
    }

    onReconnected(callback: () => void): void {
        this.hubConnection.onreconnected(callback);
    }

    onClose(callback: () => void): void {
        this.hubConnection.onclose(callback);
    }
}