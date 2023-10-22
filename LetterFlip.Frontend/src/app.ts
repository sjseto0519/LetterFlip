import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'Letter Flip';
    config.map([
      { route: ['', 'join-game'], name: 'join-game', moduleId: './join-game', nav: true, title: 'Join Game' },
      { route: 'game/:gameId/:playerName/:otherPlayerName', name: 'game', moduleId: './game', nav: false, title: 'Game' }
    ]);
  }
}