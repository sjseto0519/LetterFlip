export interface GameResponse {
    gameId: string,
    playerName: string
    opponentWord?: string;
  }
  
  export interface JoinGameResponse {
    gameId: string;
    playerName: string;
    opponentWord: string;
  }
  
  export interface CheckTileResponse {
    gameId: string;
    letter: string;
    occurrences: number;
  }
  
  export interface GuessLetterResponse {
    gameId: string;
    letter: string;
    position: number;
    isCorrect: boolean;
  }
  
  export interface GuessWordResponse {
    gameId: string;
    word: string;
    isCorrect: boolean;
    isGameOver: boolean;
  }
  
  export interface OpponentGuessedWordCorrectlyResponse {
    gameId: string;
    word: string;
    newWord: string;
    isGameOver: boolean;
  }
  
  export interface OpponentGuessedLetterCorrectlyResponse {
    gameId: string;
    letter: string;
    position: number;
    newWordView: string[];
  }
  
  export interface OpponentGuessedWordIncorrectlyResponse {
    gameId: string;
    word: string;
  }
  
  export interface OpponentGuessedLetterIncorrectlyResponse {
    gameId: string;
    letter: string;
    position: number;
  }
  
  export interface OpponentCheckedTileResponse {
    gameId: string;
    letter: string;
    isCorrect: boolean;
  }
  
  export interface NewGameStartedResponse {
    gameId: string;
    opponentWord: string;
  }
  
  export interface SendMessageResponse {
    gameId: string;
    message: string;
  }
  
  export interface LoadGameResponse {
    gameId: string;
    playerUrl: string;
    savedGame: string;
  }
  
  export interface ErrorResponse {
    detail: string;
  }