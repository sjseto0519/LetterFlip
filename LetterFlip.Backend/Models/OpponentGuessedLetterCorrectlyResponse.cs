namespace LetterFlip.Backend.Models
{
    public class OpponentGuessedLetterCorrectlyResponse
    {
        public string GameId { get; set; }

        public string Letter { get; set; }

        public int Position { get; set; }

        public string[] NewWordView { get; set; }

        public bool IsGameOver { get; set; }
    }
}
