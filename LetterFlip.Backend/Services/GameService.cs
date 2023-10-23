using JWTAuthentication.NET6._0.Auth;
using LetterFlip.Backend.Models;

namespace LetterFlip.Backend.Services
{
    public class GameService : IGameService
    {
        private readonly ApplicationDbContext _context;

        public GameService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Game> JoinOrCreateGameAsync(int gameId, string playerName)
        {
            var game = await _context.Games.FindAsync(gameId);

            if (game == null)
            {
                game = new Game
                {
                    Id = gameId,
                    Player1Name = playerName,
                    InProgress = true
                };
                _context.Games.Add(game);
            }
            else
            {
                game.Player2Name = playerName;
            }

            await _context.SaveChangesAsync();
            return game;
        }
    }
}
