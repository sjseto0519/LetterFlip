namespace LetterFlip.Backend.Models
{
    public class GameState
    {
        public string CurrentTurn { get; set; }
        public PlayerState Player1State { get; set; }
        public PlayerState Player2State { get; set; }
    }
}
