using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LetterFlip.Backend.Models
{
    public class Game
    {
        [Key]
        public int Id { get; set; }
        public string Player1Name { get; set; }
        public string Player2Name { get; set; }
        public bool InProgress { get; set; }
        public int CurrentTurn { get; set; }
        public int CurrentDifficulty { get; set; }
        [Column(TypeName = "nvarchar(max)")]
        public string GameState { get; set; }
    }
}

