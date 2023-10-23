import {Aurelia} from 'aurelia-framework';
import environment from '../config/environment.json';
import {PLATFORM} from 'aurelia-pal';
import { BabylonService } from 'babylon-service';
import { SignalRService } from 'signalr-service';
import { startWorker } from '../mocks/browser';

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  startWorker();

  // Register BabylonService
  aurelia.container.registerSingleton(BabylonService);
  aurelia.container.registerSingleton(SignalRService);

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}