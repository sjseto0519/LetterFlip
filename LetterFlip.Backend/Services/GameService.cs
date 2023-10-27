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

        public async Task<GameResponseBase> JoinOrCreateGameAsync(string playerName, string gameId)
        {
            //var game = await _context.Games.FindAsync(gameId);

            //if (game == null)
            //{
            //    game = new Game
            //    {
            //        Id = gameId,
            //        Player1Name = playerName,
            //        InProgress = true
            //    };
            //    _context.Games.Add(game);
            //}
            //else
            //{
            //    game.Player2Name = playerName;
            //}

            //await _context.SaveChangesAsync();
            return new JoinGameResponse() { 
                PlayerName = "",
                OpponentWord = "EXAMPLE"
            };
        }

        public async Task<OpponentCheckedTileResponse> CreateOpponentCheckedTileResponseAsync()
        {
            return new OpponentCheckedTileResponse()
            {
                GameId = "",
                Letter = "A",
                IsCorrect = true
            };
        }

        public async Task<OpponentGuessedLetterCorrectlyResponse> CreateOpponentGuessedLetterCorrectlyResponseAsync()
        {
            return new OpponentGuessedLetterCorrectlyResponse()
            {
                GameId = "",
                Letter = "A",
                Position = 0,
                NewWordView = new[] { "" },
                IsGameOver = false
            };
        }

        public async Task<OpponentGuessedWordCorrectlyResponse> CreateOpponentGuessedWordCorrectlyResponseAsync()
        {
            return new OpponentGuessedWordCorrectlyResponse()
            {
                GameId = "",
                Word = "EXAMPLE",
                NewWord = "EXAMPLE",
                IsGameOver = false
            };
        }

        public async Task<OpponentGuessedLetterIncorrectlyResponse> CreateOpponentGuessedLetterIncorrectlyResponseAsync()
        {
            return new OpponentGuessedLetterIncorrectlyResponse()
            {
                GameId = "",
                Letter = "A",
                Position = 0
            };
        }

        public async Task<OpponentGuessedWordIncorrectlyResponse> CreateOpponentGuessedWordIncorrectlyResponseAsync()
        {
            return new OpponentGuessedWordIncorrectlyResponse()
            {
                GameId = "",
                Word = "EXAMPLE"
            };
        }

        public Task<CheckTileResponse> CheckTileAsync(string letter, int playerIndex, string gameId)
        {
            throw new NotImplementedException();
        }

        public Task<GuessLetterResponse> GuessLetterAsync(string letter, int wordIndex, int playerIndex, string gameId)
        {
            throw new NotImplementedException();
        }

        public Task<GuessWordResponse> GuessWordAsync(string word, int playerIndex, string gameId)
        {
            throw new NotImplementedException();
        }

        Task<Game> IGameService.JoinOrCreateGameAsync(string playerName, string gameId)
        {
            throw new NotImplementedException();
        }

        public Task<LoadGameResponse> LoadGameAsync(string playerName, string otherPlayerName, int playerIndex)
        {
            throw new NotImplementedException();
        }

        public Task<NewGameStartedResponse> NewGameAsync(string gameId)
        {
            throw new NotImplementedException();
        }

        public Task SaveGameAsync(string gameId, string playerName, string otherPlayerName, int playerIndex, string savedGame)
        {
            throw new NotImplementedException();
        }
    }
}
