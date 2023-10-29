using LetterFlip.Backend.Models;

namespace LetterFlip.Backend.Services
{
    public interface IGameService
    {
        IAdaptiveWordProvider AdaptiveWordProvider { get; set; }

        Task<CheckTileResponse?> CheckTileAsync(string letter, string playerUrl, string gameId);
        Task<GuessLetterResponse?> GuessLetterAsync(string letter, int wordIndex, string playerUrl, string gameId);
        Task<GuessWordResponse?> GuessWordAsync(string word, string playerUrl, string gameId);
        Task<GameResponseBase> JoinOrCreateGameAsync(string playerName, string gameId);
        Task<LoadGameResponse?> LoadGameAsync(string playerName, string otherPlayerName, string playerUrl);
        Task<(NewGameStartedResponse YourGame, NewGameStartedResponse OpponentGame)?> NewGameAsync(string gameId, string playerName, string otherPlayerName, string playerUrl);
        Task<bool> SaveGameAsync(string gameId, string playerName, string otherPlayerName, string playerUrl, string savedGame);
    }
}
