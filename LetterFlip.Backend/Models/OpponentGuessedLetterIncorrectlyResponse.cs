namespace LetterFlip.Backend.Models
{
    public class OpponentGuessedLetterIncorrectlyResponse
    {
        public string GameId { get; set; }

        public string Letter { get; set; }

        public int Position { get; set; }
    }
}
