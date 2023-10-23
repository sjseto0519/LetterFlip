import { Router, RouterConfiguration } from 'aurelia-router';
import {PLATFORM} from 'aurelia-pal';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'Letter Flip';
    let joinGame = PLATFORM.moduleName('join-game');
    let game = PLATFORM.moduleName('game');
    config.map([
      { route: ['', 'join-game'], name: joinGame, moduleId: './join-game', nav: true, title: 'Join Game' },
      { route: 'game/:gameId/:playerName/:otherPlayerName', name: game, moduleId: './game', nav: false, title: 'Game' }
    ]);
  }
}