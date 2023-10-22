using JWTAuthentication.NET6._0.Auth;
using LetterFlip.Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace LetterFlip.Backend.Controllers
{
    [ApiController]
    [Route("api/games")]
    public class GameController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GameController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGameState(int id, [FromBody] Game updatedGame)
        {
            var game = await _context.Games.FindAsync(id);
            if (game == null)
            {
                return NotFound();
            }

            game.GameState = updatedGame.GameState;
            game.CurrentDifficulty = updatedGame.CurrentDifficulty;
            game.InProgress = updatedGame.InProgress;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

}
