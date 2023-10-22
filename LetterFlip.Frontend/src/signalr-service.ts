import * as signalR from "@microsoft/signalr";

export class SignalRService {
    private connection: signalR.HubConnection;
  
    constructor() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("/gamehub") // replace with your hub endpoint
        .build();
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
        await this.connection.invoke('JoinOrCreateGame', userName, gameId);
      }

    public addJoinedGameListener(callback: (gameId: string, playerName: string) => void) {
        this.connection.on("JoinedGame", callback);
      }

    public addPlayerJoinedListener(callback: (playerName: string) => void) {
        this.connection.on("PlayerJoined", callback);
      }

    // Inside SignalRService
    public onCheckTileResponse(callback: (gameId: string, letter: string, occurrences: number) => void) {
        this.connection.on("CheckTileResponse", (result) => {
            const data = JSON.parse(result);
            callback(data.GameId, data.Letter, data.Occurrences);
        });
    }
  

    public sendMessage = (messageType: string, gameId: string, message: string) => {
        this.connection.invoke(messageType, gameId, message).catch((err) => {
          return console.error(err.toString());
        });
      };
  }
  