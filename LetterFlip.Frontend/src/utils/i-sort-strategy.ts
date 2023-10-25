import { IData, ISubscriberContainer } from "interfaces/event-data";

// Strategy for sorting
export interface ISortStrategy {
    sort(subscribers: ISubscriberContainer[], predefinedOrder: string[]): ISubscriberContainer[];
}