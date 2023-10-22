import { autoinject } from 'aurelia-framework';
import { SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';

@autoinject
export class JoinGame {
  
    playerName: string;
    otherPlayerName: string;
    gameId: string;
    waitingForOpponent: boolean = false; 

    constructor(private signalRService: SignalRService, private router: Router) {
        
      }
    
      private handleJoinedGame(gameId: string, otherPlayerName: string) {
        this.gameId = gameId;
        this.otherPlayerName = otherPlayerName;
    
        if (this.playerName === this.otherPlayerName) {
          // Handle case where you are the only player
          this.waitingForOpponent = true;
        } else {
          // Handle case where another player is already waiting
          this.waitingForOpponent = false;
          this.router.navigateToRoute('game', {
            gameId: this.gameId,
            playerName: this.playerName,
            otherPlayerName: this.otherPlayerName
          });
          
        }
      }

  async attached() {
    await this.signalRService.startConnection();
    this.signalRService.addJoinedGameListener(this.handleJoinedGame.bind(this));
  }

  async joinGame() {
    // Ask server to join the game
    await this.signalRService.joinGame(this.playerName, this.gameId);
  }
}
