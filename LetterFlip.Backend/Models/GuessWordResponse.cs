namespace LetterFlip.Backend.Models
{
    public class GuessWordResponse
    {
        public string GameId { get; set; }

        public string Word { get; set; }

        public bool IsCorrect { get; set; }

        public bool IsGameOver { get; set; }
    }
}
