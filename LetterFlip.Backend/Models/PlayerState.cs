namespace LetterFlip.Backend.Models
{
    public class PlayerState
    {
        public string CurrentWord { get; set; }
        public List<string> FlippedTiles { get; set; }
        public List<string> WordView { get; set; }
        public int CurrentDifficulty { get; set; }

        public PlayerState()
        {
            FlippedTiles = new List<string>();
            WordView = new List<string>();
        }
    }
}
