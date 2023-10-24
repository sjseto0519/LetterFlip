import { EventHandler } from "./event-handler";
import { Events } from "./events";
import { ISubscription } from "./i-subscription";
import { Subscription } from "./subscription";

/**
 * EventAggregator class for event-based subscriptions and publishing.
 * 
 * @template TEvent - Type of events that can be published or subscribed to.
 * @template TData - Type of the data that will be sent with the event.
 */
export class EventAggregator<TEvent extends Events, TData> {
  private eventMap = new Map<TEvent, ISubscription<TData>[]>();
  private subscriberMap = new WeakMap<object, ISubscription<TData>[]>();

  /**
   * Adds a subscription to the event map.
   */
  private addEventSubscription(event: TEvent, subscription: ISubscription<TData>) {
    const subscriptions = [...(this.eventMap.get(event) || [])];
    subscriptions.push(subscription);
    this.eventMap.set(event, subscriptions);
  }

  /**
   * Adds a subscription to the subscriber map.
   */
  private addSubscriberSubscription(subscriber: object, subscription: ISubscription<TData>) {
      const subscriptions = this.subscriberMap.get(subscriber) || [];
      subscriptions.push(subscription);
      this.subscriberMap.set(subscriber, subscriptions);
  }

  private removeEventSubscription(event: TEvent, subscription: ISubscription<TData>) {
      const subscriptions = this.eventMap.get(event);
      if (subscriptions) {
          const index = subscriptions.indexOf(subscription);
          if (index !== -1) {
              subscriptions.splice(index, 1);
          }
      }
  }

  private removeSubscriberSubscription(subscriber: object, subscription: ISubscription<TData>) {
      const subscriptions = this.subscriberMap.get(subscriber);
      if (subscriptions) {
          const index = subscriptions.indexOf(subscription);
          if (index !== -1) {
              subscriptions.splice(index, 1);
          }
      }
  }

  /**
   * Subscribes a handler to an event and returns the subscription object.
   */
  subscribe(event: TEvent, handler: EventHandler<TData>, subscriber: object): ISubscription<TData> {
      try {
        const subscription = new Subscription(event, handler, subscriber);
        this.addEventSubscription(event, subscription);
        if (subscriber) {
            this.addSubscriberSubscription(subscriber, subscription);
        }
        return subscription;
      } catch (error) {
        console.error('An error occurred while subscribing:', error);
        throw error;
      }
  }

   /**
   * Publishes an event with the provided data.
   */
  publish(event: TEvent, data: TData, subscribers?: object[]) {
    try {
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
    } catch (error) {
      console.error('An error occurred while publishing:', error);
      throw error;
    }
  }

  unsubscribeSubscriber(subscriber: object) {
      const subscriptions = this.subscriberMap.get(subscriber);
      if (subscriptions) {
          subscriptions.forEach(sub => {
              this.removeEventSubscription(sub.event as TEvent, sub);
              sub.clear();
          });
          this.subscriberMap.delete(subscriber);
      }
  }

  unsubscribeEvent(event: TEvent) {
      const subscriptions = this.eventMap.get(event);
      if (subscriptions) {
          subscriptions.forEach(sub => {
              this.removeSubscriberSubscription(sub.subscriber, sub);
              sub.clear();
          });
          this.eventMap.delete(event);
      }
  }

  unsubscribeAll() {
      this.eventMap.clear();
      this.subscriberMap = new WeakMap<object, ISubscription<TData>[]>();
  }
}