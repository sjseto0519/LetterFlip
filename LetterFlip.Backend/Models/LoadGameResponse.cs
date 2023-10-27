namespace LetterFlip.Backend.Models
{
    public class LoadGameResponse
    {
        public string GameId { get; set; }

        public int PlayerIndex { get; set; }

        public string SavedGame { get; set; }
    }
}
