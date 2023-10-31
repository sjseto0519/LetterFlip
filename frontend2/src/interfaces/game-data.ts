import { GameState } from "../state/game-state";
import { ActionMessage } from "../components/game-components/action-message";
import { ChatMessage } from "../components/game-components/chat-message";
import { Drawer } from "../components/game-components/drawer";
import { GameOverModal } from "../components/game-components/game-over-modal";
import { GuessLetterModal } from "../components/game-components/guess-letter-modal";
import { GuessWordModal } from "../components/game-components/guess-word-modal";
import { Header } from "../components/game-components/header";

export interface HistoryItem {
    item: string;
    yours: boolean;
    type?: string;
  }
  
  export interface GameData {
    gameId: string;
    playerName: string;
    otherPlayerName: string;
    playerUrl: string;
  }
  
  export interface SavedGame {
    gameData: GameData;
    history: HistoryItem[];
    gameState: GameState; 
  }

  export interface IGame {
    saveGame: () => void;
    toGameData: () => GameData;
  }