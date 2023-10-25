import { EventCallback, IData } from "interfaces/event-data";
import { ISortStrategy } from "./i-sort-strategy";
import { Events } from "./events";

// Define an interface for the event aggregator
export interface IEventAggregator {
    initialize(sortStrategy: ISortStrategy): void;
    subscribe<TData extends IData>(eventName: string, id: string, callback: EventCallback<TData>): void;
    unsubscribe(eventName: string, id: string): void;
    publish<TData extends IData>(eventName: Events, data: TData): void;
}