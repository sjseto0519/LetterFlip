using LetterFlip.Backend.Models;

namespace LetterFlip.Backend.Services
{
    public interface IGameService
    {
        Task<CheckTileResponse> CheckTileAsync(string letter, int playerIndex, string gameId);
        Task<GuessLetterResponse> GuessLetterAsync(string letter, int wordIndex, int playerIndex, string gameId);
        Task<GuessWordResponse> GuessWordAsync(string word, int playerIndex, string gameId);
        Task<Game> JoinOrCreateGameAsync(string playerName, string gameId);
        Task<LoadGameResponse> LoadGameAsync(string playerName, string otherPlayerName, int playerIndex);
        Task<NewGameStartedResponse> NewGameAsync(string gameId);
        Task SaveGameAsync(string gameId, string playerName, string otherPlayerName, int playerIndex, string savedGame);
    }
}
