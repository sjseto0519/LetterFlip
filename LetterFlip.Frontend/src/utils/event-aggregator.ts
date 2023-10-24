import { EventHandler } from "./event-handler";
import { Events } from "./events";
import { ISubscription } from "./i-subscription";
import { Subscription } from "./subscription";

export class EventAggregator<TEvent extends Events, TData> {

    private eventMap = new Map<string, ISubscription[]>();
    private subscriberMap = new WeakMap<any, ISubscription[]>();
  
    subscribe<TEvent extends Events>(event: TEvent, handler: EventHandler<TData>, subscriber: any): ISubscription {
      const subscription = new Subscription(event, handler, subscriber);
  
      this.eventMap.set(event, [...(this.eventMap.get(event) || []), subscription]);
  
      if (subscriber) {
        this.subscriberMap.set(subscriber, [...(this.subscriberMap.get(subscriber) || []), subscription]); 
      }
  
      return subscription;
    }
  
    publish<TEvent extends Events>(event: TEvent, data: TData, subscribers?: any[]) {
      const subscriptions = this.eventMap.get(event) || [];
      
      if (!subscribers) {
        subscriptions.forEach(sub => sub.handler(data));
      } else {
        subscribers.forEach(subscriber => {
          const subscriberSubs = this.subscriberMap.get(subscriber) || [];
          subscriberSubs.forEach(sub => {
            if (sub.event === event) {
              sub.handler(data);
            }
          });
        });
      }
    }
  
    unsubscribeSubscriber(subscriber: any) {
        const subscriptions = this.subscriberMap.get(subscriber);
        if (subscriptions) {
          subscriptions.forEach(sub => {
            const eventSubs = this.eventMap.get(sub.event);
            if (eventSubs) {
              eventSubs.splice(eventSubs.indexOf(sub), 1);
            }
            sub.subscriber = null;
            sub.event = null;
            sub.handler = null; 
          });
          this.subscriberMap.delete(subscriber);
        }
      }
      
      unsubscribeEvent(event: Events) {
        const subscriptions = this.eventMap.get(event);
        if (subscriptions) {
          subscriptions.forEach(sub => {
            const subscriberSubs = this.subscriberMap.get(sub.subscriber);
            if (subscriberSubs) {
              subscriberSubs.splice(subscriberSubs.indexOf(sub), 1);
            }
            sub.subscriber = null;
            sub.event = null;
          });
          this.eventMap.delete(event);
        }
      }  
      
      unsubscribeAll() {
        this.eventMap.clear();
        this.subscriberMap = new WeakMap<any, ISubscription[]>();
      }
  }