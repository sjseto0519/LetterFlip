namespace LetterFlip.Backend.Models
{
    public class GameResponse : GameResponseBase
    {
        public string GameId { get; set; }

        public string PlayerName { get; set; }

        public string OpponentWord { get; set; }
    }
}
