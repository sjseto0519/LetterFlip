import { PlayerState } from "player-state";

export class GameState {
    public gameId: string;
    public currentTurn: string = 'player1';
    public yourPlayerIndex: number;
    public player1Name: string;
    public player2Name: string;
    private player1State: PlayerState;
    private player2State: PlayerState;

  constructor() {
    this.player1State = new PlayerState();
    this.player2State = new PlayerState();
  }

  currentPlayerName() {
    return this.currentTurn === 'player1' ? this.player1Name : this.player2Name;
  }

  isYourTurn() {
    return this.yourPlayerIndex === 0 ? this.currentTurn === 'player1' : this.currentTurn === 'player2';
  }

  getYourPlayerState(): PlayerState {
    if (this.yourPlayerIndex === 0) {
        return this.player1State;
    }
    else if (this.yourPlayerIndex === 1)
    {
        return this.player2State;
    }
  }

  getOpponentPlayerState(): PlayerState {
    if (this.yourPlayerIndex === 0) {
        return this.player2State;
    }
    else if (this.yourPlayerIndex === 1)
    {
        return this.player1State;
    }
  }
}