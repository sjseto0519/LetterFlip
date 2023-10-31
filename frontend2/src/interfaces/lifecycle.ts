import { Constructable, DI } from "aurelia";

export enum LifecycleHooks {
    Bound = 'bound',
    Attached = 'attached'
  }
  
  export interface ILifecycleEvent {
    lifecycleHook: LifecycleHooks;
  }

  export interface IDisposable {
    dispose: () => void;
  }

  export interface ILifecycleService extends IDisposable {
    registerComponent<T extends {}>(componentClass: Constructable<T>): void;
    unregisterComponent<T extends {}>(componentClass: Constructable<T>): void;
    notifyLifecycleEvent<T extends {}>(componentClass: Constructable<T>, lifecycleHook: LifecycleHooks): void;
    subscribe<T extends {}>(componentClass: Constructable<T>, lifecycleHook: LifecycleHooks, callback: (event: ILifecycleEvent) => void): void;
    unsubscribe<T extends {}>(componentClass: Constructable<T>, lifecycleHook: LifecycleHooks): void;
  }

  export const MyLifecycleService = DI.createInterface<ILifecycleService>();