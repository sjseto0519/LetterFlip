namespace LetterFlip.Backend.Models
{
    public class JoinGameResponse : GameResponseBase
    {
        public string PlayerName { get; set; }

        public string OpponentWord { get; set; }
    }
}
