import { Constructable, inject } from 'aurelia';
import { IDisposable, ILifecycleEvent, ILifecycleService, LifecycleHooks } from '../interfaces/lifecycle';
import { type IEventAggregator, MyEventAggregator } from '../interfaces/utils';
import { LifecycleSubscription } from '../models/lifecycle-subscription';
import { Events } from '../utils/events';

@inject(MyEventAggregator)
export class LifecycleService implements ILifecycleService {
    private components: Set<Constructable> = new Set();
    private subscriptions: Map<LifecycleHooks, Map<Constructable, IDisposable>> = new Map();
    private lifecycleEventCounter: Map<LifecycleHooks, Set<Constructable>> = new Map();
  
    constructor(private ea: IEventAggregator) {}
  
    public registerComponent<T extends {}>(componentName: Constructable<T>) {
      this.components.add(componentName);
    }
  
    public unregisterComponent<T extends {}>(componentName: Constructable<T>) {
      this.components.delete(componentName);
    }
  
    public notifyLifecycleEvent<T extends {}>(componentName: Constructable<T>, lifecycleHook: LifecycleHooks) {
      if (this.components.has(componentName)) {
        if (!this.lifecycleEventCounter.has(lifecycleHook)) {
          this.lifecycleEventCounter.set(lifecycleHook, new Set());
        }
        const counterSet = this.lifecycleEventCounter.get(lifecycleHook);
        if (counterSet) {
            counterSet.add(componentName);
    
            if (counterSet.size === this.components.size) {
            const event: ILifecycleEvent = {
                lifecycleHook,
            };
            this.ea.publish(Events.LifecycleHookCalled, event);
            counterSet.clear();
            }
        }
      }
    }
  
    public subscribe<T extends {}>(componentName: Constructable<T>, lifecycleHook: LifecycleHooks, callback: (event: ILifecycleEvent) => void) {
      const subscriptionCallback = this.createSubscriptionCallback(lifecycleHook, callback);
      this.ea.subscribe(Events.LifecycleHookCalled, 'lifecycle-service', subscriptionCallback);
      
      if (!this.subscriptions.has(lifecycleHook)) {
        this.subscriptions.set(lifecycleHook, new Map());
      }
      const c = this.subscriptions.get(lifecycleHook);
      if (c) {
        c.set(componentName, new LifecycleSubscription(componentName));
      }
    }
  
    private createSubscriptionCallback<T extends {}>(lifecycleHook: LifecycleHooks, callback: (event: ILifecycleEvent) => void) {
      return (event: ILifecycleEvent) => {
        if (event.lifecycleHook === lifecycleHook) {
          callback(event);
        }
      };
    }
  
    public unsubscribe<T extends {}>(componentName: Constructable<T>, lifecycleHook: LifecycleHooks) {
      const hookSubscriptions = this.subscriptions.get(lifecycleHook);
      if (hookSubscriptions) {
        const subscription = hookSubscriptions.get(componentName);
        if (subscription) {
          subscription.dispose();
          hookSubscriptions.delete(componentName);
        }
      }
    }
  
    public dispose() {
      this.subscriptions.forEach(hookSubscriptions => {
        hookSubscriptions.forEach(sub => sub.dispose());
      });
      this.subscriptions.clear();
      this.components.clear();
      this.lifecycleEventCounter.clear();
    }
}
