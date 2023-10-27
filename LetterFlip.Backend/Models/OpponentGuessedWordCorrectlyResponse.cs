namespace LetterFlip.Backend.Models
{
    public class OpponentGuessedWordCorrectlyResponse
    {
        public string GameId { get; set; }

        public string Word { get; set; }

        public string NewWord { get; set; }

        public bool IsGameOver { get; set; }
    }
}
