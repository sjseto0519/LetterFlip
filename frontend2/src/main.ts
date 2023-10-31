import { Aurelia, Registration, DI } from 'aurelia';
import { App } from './app';
import { RouterConfiguration } from '@aurelia/router'; 
import { BabylonService } from './services/babylon-service';
import { MyBabylonService, MyDynamicTextureService, MyGameService, MySignalRService } from './interfaces/services';
import { DynamicTextureService } from './services/dynamic-texture-service';
import { GameService } from './services/game-service';
import { SignalRService } from './services/signalr-service';
import { MyEventAggregator } from './interfaces/utils';
import { EventAggregator } from '@utils/event-aggregator';
import { PredefinedOrderSortStrategy } from '@utils/predefined-order-sort-strategy';
import { LifecycleService } from '@services/lifecycle-service';
import { MyLifecycleService } from '@interfaces/lifecycle';

const Module = {
    "locateFile": function(path: string, scriptDirectory: string) {
      // Your logic here to return the correct path
      return 'your_custom_path/' + path;
    }
  };
  
  // Attach it to the window object
  (window as any).Module = Module;

const au = new Aurelia();
au.register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
au.container.register(
    Registration.singleton(MyBabylonService, BabylonService),
    Registration.singleton(MyDynamicTextureService, DynamicTextureService),
    Registration.singleton(MyGameService, GameService),
    Registration.singleton(MySignalRService, SignalRService),
    Registration.singleton(MyLifecycleService, LifecycleService),
    Registration.cachedCallback(MyEventAggregator, () => {
        const ea = new EventAggregator();
        ea.initialize(new PredefinedOrderSortStrategy());
        return ea;
    })
)
au.app({ host: document.querySelector('#app'), component: new App() });
au.start();