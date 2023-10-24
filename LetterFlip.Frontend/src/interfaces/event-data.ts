export interface GuessLetterEventData extends HasId {
    letter: string;
}

export interface GuessWordEventData extends HasId {
    word: string;
}