/* eslint-disable @typescript-eslint/no-empty-interface */
export interface IData {

}

export type EventCallback<TData extends IData> = (data: TData) => void;

// Base interface for type-erased container
export interface ISubscriberContainer {
    id: string;
}

export interface GuessLetterCorrectEventData extends IData {
    letter: string;
}

export interface GuessWordCorrectEventData extends IData {
    word: string;
}

export interface GameOverEventData extends IData {
    winner: string;
}

export interface NewGameEventData extends IData {
    
}

export interface OpponentGuessedWordCorrectlyEventData extends IData {
    newWord: string;
}