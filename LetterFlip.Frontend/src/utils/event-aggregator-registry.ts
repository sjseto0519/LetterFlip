import { GuessLetterCorrectEventData, GuessWordEventData } from "interfaces/event-data";
import { EventAggregator } from "./event-aggregator";
import { EventAggregatorFactory } from "./event-aggregator-factory";
import { Events } from "./events";

export class EventAggregatorRegistry {

guessLetterCorrectEventAggregator: EventAggregator<Events.GuessLetterCorrect, GuessLetterCorrectEventData>;
guessWordEventAggregator: EventAggregator<Events.GuessWord, GuessWordEventData>;

    constructor(eventAggregatorFactory: EventAggregatorFactory) {

        this.guessLetterCorrectEventAggregator = eventAggregatorFactory.getEventAggregator<Events.GuessLetterCorrect, GuessLetterCorrectEventData>(EventDataPairs.GuessLetterCorrectEvent);
        this.guessWordEventAggregator = eventAggregatorFactory.getEventAggregator<Events.GuessWord, GuessWordEventData>(EventDataPairs.GuessWordEvent);
    }

}