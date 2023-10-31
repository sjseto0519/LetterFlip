import { DI } from "aurelia";
import { Events } from "../utils/events";
import { EventCallback, IData, ISubscriberContainer } from "./event-data";

export interface ISortStrategy {
    sort(subscribers: ISubscriberContainer[], predefinedOrder: string[]): ISubscriberContainer[];
}

export interface IEventAggregator {
    initialize(sortStrategy: ISortStrategy): void;
    subscribe<TData extends IData>(eventName: string, id: string, callback: EventCallback<TData>): void;
    unsubscribe(eventName: string, id: string): void;
    publish<TData extends IData>(eventName: Events, data: TData): void;
}

export const MyEventAggregator = DI.createInterface<IEventAggregator>();