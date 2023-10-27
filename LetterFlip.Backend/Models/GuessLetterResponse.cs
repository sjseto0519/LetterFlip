namespace LetterFlip.Backend.Models
{
    public class GuessLetterResponse
    {
        public string GameId { get; set; }

        public string Letter { get; set; }

        public int Position { get; set; }

        public bool IsCorrect { get; set; }
    }
}
