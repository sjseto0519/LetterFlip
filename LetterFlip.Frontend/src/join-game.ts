import { autoinject } from 'aurelia-framework';
import { SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';

@autoinject
export class JoinGame {
  
    playerName: string;
    otherPlayerName: string;
    gameId: string;
    waitingForOpponent = false; 
    isFlipped = false;
    hideInputs = false;
    inputUserName: HTMLInputElement;
    inputGameId: HTMLInputElement;

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

    setTimeout(() => {
      this.isFlipped = true;
    }, 100);
  }

  async joinGame() {
    this.isFlipped = false;
    this.hideInputs = true;
    // Trigger the animation by applying a class
    this.inputUserName.classList.add('hide');
    this.inputGameId.classList.add('hide');

    // Hide the elements after the transition
    setTimeout(() => {
      this.inputUserName.style.display = 'none';
      this.inputGameId.style.display = 'none';
    }, 500);

    // Ask server to join the game
    //if (this.playerName && this.gameId)
    //{
    //  await this.signalRService.joinGame(this.playerName, this.gameId);
    //}
  }
}
