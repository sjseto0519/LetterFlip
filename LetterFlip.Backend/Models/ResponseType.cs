namespace LetterFlip.Backend.Models
{
    public static class ResponseType
    {
        public const string LoadGameResponse = "LoadGameResponse";

        public const string SendMessageResponse = "SendMessageResponse";

        public const string OpponentCheckedTile = "OpponentCheckedTile";

        public const string OpponentGuessedLetterIncorrect = "OpponentGuessedLetterIncorrect";

        public const string OpponentGuessedLetterCorrect = "OpponentGuessedLetterCorrect";

        public const string OpponentGuessedWordCorrect = "OpponentGuessedWordCorrect";

        public const string OpponentGuessedWordIncorrect = "OpponentGuessedWordIncorrect";

        public const string PlayerJoined = "PlayerJoined";

        public const string JoinedGame = "JoinedGame";

        public const string CreatedGame = "CreatedGame";

        public const string CheckTileResponse = "CheckTileResponse";

        public const string NewGameStarted = "NewGameStarted";
    }
}
