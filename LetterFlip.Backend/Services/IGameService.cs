using LetterFlip.Backend.Models;

namespace LetterFlip.Backend.Services
{
    public interface IGameService
    {
        Task<Game> JoinOrCreateGameAsync(int gameId, string playerName);
    }
}
