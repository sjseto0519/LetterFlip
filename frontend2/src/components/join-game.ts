
import { inject } from "aurelia";
import { type IGameService, type ISignalRService, MyGameService, MySignalRService } from "../interfaces/services";
import { GameResponse, JoinGameResponse } from "../interfaces/signal-r";
import { IRouteableComponent, IRouter } from "@aurelia/router";

@inject(MySignalRService, MyGameService)
export class JoinGame implements IRouteableComponent {
  
    playerName?: string;
    otherPlayerName?: string;
    gameId?: string;
    waitingForOpponent = false; 
    isFlipped = false;
    hideInputs = false;
    inputUserName?: HTMLInputElement;
    inputGameId?: HTMLInputElement;
    mainLogo?: HTMLDivElement;

    constructor(private signalRService: ISignalRService, private gameService: IGameService, @IRouter private router: IRouter) {
        
      }
    
      private async handleCreatedGame(gameResponse: GameResponse) {
          this.waitingForOpponent = true;
      }

      private async handleJoinedGame(gameResponse: GameResponse) {

        if (gameResponse.gameId !== this.gameId)
        {
          return;
        }

        this.otherPlayerName = gameResponse.playerName;
    
        // Handle case where another player is already waiting
        this.waitingForOpponent = false;

        await this.transitionUi();

        this.gameService.newGame(this.gameId, 1, this.playerName || '', this.otherPlayerName, gameResponse.opponentWord || '');

        this.router.load(`game/${this.gameId}/1/${this.playerName}/${this.otherPlayerName}`, {
            title: 'Game | LetterFlip',
            append: false
        });
      }

      private async handlePlayerJoined(joinGameResponse: JoinGameResponse) {

        if (joinGameResponse.gameId !== this.gameId)
        {
          return;
        }

        this.otherPlayerName = joinGameResponse.playerName;

        // Handle case where another player is already waiting
        this.waitingForOpponent = false;

        await this.transitionUi();

        this.gameService.newGame(this.gameId, 0, this.playerName || '', joinGameResponse.playerName, joinGameResponse.opponentWord);

        this.router.load(`game/${this.gameId}/0/${this.playerName}/${this.otherPlayerName}`, {
            title: 'Game | LetterFlip',
            append: false
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
    this.inputUserName?.classList.add('hide');
    this.inputGameId?.classList.add('hide');

    this.mainLogo?.classList.add('flip-out');

    // Hide the elements after the transition
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.inputUserName)
            this.inputUserName.style.display = 'none';
        if (this.inputGameId)
            this.inputGameId.style.display = 'none';
        resolve();
      }, 500);
    });
  }

  async joinGame() {


    // Ask server to join the game
    if (this.playerName && this.gameId)
    {
      localStorage.setItem("joining-game", `${this.playerName} ${this.gameId}`);
      this.hideInputs = true;
      await this.signalRService.joinGame(this.playerName, this.gameId);
    }
  }
}
