import { Game } from './components/game';
import { JoinGame } from './components/join-game';

export class App {
    static routes = [
        {
            path: '',
            component: JoinGame,
            title: 'Join Game | LetterFlip'
        },
        {
            id: 'game',
            path: '/game/:gameId/:playerIndex/:playerName/:otherPlayerName',
            component: Game,
            title: 'Game | LetterFlip'
        },
    ];
}