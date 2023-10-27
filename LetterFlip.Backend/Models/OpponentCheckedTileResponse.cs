namespace LetterFlip.Backend.Models
{
    public class OpponentCheckedTileResponse
    {
        public string GameId { get; set; }

        public string Letter { get; set; }

        public bool IsCorrect { get; set; }
    }
}
