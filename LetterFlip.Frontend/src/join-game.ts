import { autoinject } from 'aurelia-framework';
import { GameResponse, JoinGameResponse, SignalRService } from 'signalr-service';
import { Router } from 'aurelia-router';
import { GameService } from 'game-service';

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

    constructor(private signalRService: SignalRService, private router: Router, private gameService: GameService) {
        
      }
    
      private async handleCreatedGame(gameResponse: GameResponse) {
        this.gameId = gameResponse.gameId;
          this.waitingForOpponent = true;
      }

      private async handleJoinedGame(gameResponse: GameResponse) {
        this.gameId = gameResponse.gameId;
        this.otherPlayerName = gameResponse.playerName;
    
        // Handle case where another player is already waiting
        this.waitingForOpponent = false;

        await this.transitionUi();

        this.gameService.newGame(this.gameId, 1, this.playerName, this.otherPlayerName, gameResponse.opponentWord || '');

        this.router.navigateToRoute('game', {
          gameId: this.gameId,
          playerName: this.playerName,
          otherPlayerName: this.otherPlayerName
        });
      }

      private async handlePlayerJoined(joinGameResponse: JoinGameResponse) {
        // Handle case where another player is already waiting
        this.waitingForOpponent = false;

        await this.transitionUi();

        this.gameService.newGame(this.gameId, 0, this.playerName, joinGameResponse.playerName, joinGameResponse.opponentWord);

        this.router.navigateToRoute('game', {
          gameId: this.gameId,
          playerName: this.playerName,
          otherPlayerName: joinGameResponse.playerName
        });
      }

  async attached() {
    await this.signalRService.startConnection();
    this.signalRService.addCreatedGameListener(this.handleCreatedGame.bind(this));
    this.signalRService.addJoinedGameListener(this.handleJoinedGame.bind(this));
    this.signalRService.addPlayerJoinedListener(this.handlePlayerJoined.bind(this));

    setTimeout(() => {
      this.isFlipped = true;
    }, 100);
  }

  private async transitionUi() {
    this.isFlipped = false;
    // Trigger the animation by applying a class
    this.inputUserName.classList.add('hide');
    this.inputGameId.classList.add('hide');

    // Hide the elements after the transition
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.inputUserName.style.display = 'none';
        this.inputGameId.style.display = 'none';
        resolve();
      }, 500);
    });
  }

  async joinGame() {


    // Ask server to join the game
    if (this.playerName && this.gameId)
    {
      this.hideInputs = true;
      await this.signalRService.joinGame(this.playerName, this.gameId);
    }
  }
}
