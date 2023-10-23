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

    public async checkTile(letter: string, gameId: string) {
      await this.connection.invoke(MessageType.CheckTile, letter, gameId);
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
  }
  