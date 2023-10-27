using JWTAuthentication.NET6._0.Auth;
using LetterFlip.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;

namespace LetterFlip.Backend.Services
{
    public class GameService : IGameService
    {
        private readonly ApplicationDbContext _context;

        public IAdaptiveWordProvider AdaptiveWordProvider { get; set; }

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

        public async Task<CheckTileResponse?> CheckTileAsync(string letter, int playerIndex, string gameId)
        {
            var game = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.PlayerIndex != playerIndex);

            if (game != null)
            {
                var word = game.OpponentWord;
                return new CheckTileResponse
                {
                    GameId = gameId,
                    Letter = letter,
                    Occurrences = word.Count(c => c.ToString() == letter)
                };
            }

            return null;
        }

        public async Task<GuessLetterResponse?> GuessLetterAsync(string letter, int wordIndex, int playerIndex, string gameId)
        {
            var game = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.PlayerIndex == playerIndex);

            var opponentGame = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                           && g.PlayerIndex != playerIndex);

            if (game != null && opponentGame != null)
            {
                var newWordView = game.WordView.ToCharArray();
                newWordView[wordIndex * 2] = letter[0];
                return new GuessLetterResponse
                {
                    GameId = gameId,
                    Letter = letter,
                    Position = wordIndex,
                    IsCorrect = opponentGame.OpponentWord[wordIndex].ToString() == letter,
                    NewWordView = new string(newWordView)
                };
            }

            return null;
        }

        public async Task<GuessWordResponse?> GuessWordAsync(string word, int playerIndex, string gameId)
        {
            var opponentGame = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.PlayerIndex != playerIndex);

            if (opponentGame != null)
            {
                var wordToMatch = opponentGame.OpponentWord;
                bool isGameOver = wordToMatch.Length == 6;
                var newWord = isGameOver ? null : AdaptiveWordProvider.GetRandomWord((Enumerations.DifficultyType)(wordToMatch.Length + 1));
                
                if (newWord != null)
                {
                    opponentGame.OpponentWord = newWord;
                    await _context.SaveChangesAsync();
                }
                
                return new GuessWordResponse
                {
                    GameId = gameId,
                    Word = word,
                    NewWord = newWord,
                    IsCorrect = word == wordToMatch,
                    IsGameOver = isGameOver
                };
            }

            return null;
        }

        Task<Game> IGameService.JoinOrCreateGameAsync(string playerName, string gameId)
        {
            throw new NotImplementedException();
        }

        public async Task<LoadGameResponse?> LoadGameAsync(string playerName, string otherPlayerName, int playerIndex)
        {
            var game = await _context.Games.FirstOrDefaultAsync(g => g.PlayerIndex == playerIndex 
                && g.Player1Name == playerName 
                && g.Player2Name == otherPlayerName);
            if (game != null)
            {
                return new LoadGameResponse
                {
                    GameId = game.GameId,
                    PlayerIndex = game.PlayerIndex,
                    SavedGame = game.GameState
                };
            }
            return null;
        }

        public async Task<(NewGameStartedResponse YourGame, NewGameStartedResponse OpponentGame)?> NewGameAsync(string gameId, string playerName, string otherPlayerName, int playerIndex)
        {
            var otherPlayerIndex = playerIndex == 0 ? 1 : 0;

            var newWord = this.AdaptiveWordProvider.GetRandomWord(Enumerations.DifficultyType.Easy);
            var newWordOpponent = this.AdaptiveWordProvider.GetRandomWord(Enumerations.DifficultyType.Easy);

            var game = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.Player1Name == playerName
                && g.Player2Name == otherPlayerName
                && g.PlayerIndex == otherPlayerIndex);

            var opponentGame = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.Player1Name == playerName
                && g.Player2Name == otherPlayerName
                && g.PlayerIndex == playerIndex);

            if (game == null || opponentGame == null)
            {
                return null;
            }

            game.OpponentWord = newWord;
            opponentGame.OpponentWord = newWordOpponent;

            var a = new NewGameStartedResponse
            {
                GameId = gameId,
                OpponentWord = newWord
            };
            var b = new NewGameStartedResponse
            {
                GameId = gameId,
                OpponentWord = newWordOpponent
            };
            return (a, b);
        }

        public async Task<bool> SaveGameAsync(string gameId, string playerName, string otherPlayerName, int playerIndex, string savedGame)
        {
            try
            {
                var game = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                    && g.PlayerIndex == playerIndex
                    && g.Player1Name == playerName
                    && g.Player2Name == otherPlayerName);
                if (game == null)
                {
                    await _context.Games.AddAsync(new Game
                    {
                        GameId = gameId,
                        Player1Name = playerName,
                        Player2Name = otherPlayerName,
                        PlayerIndex = playerIndex,
                        GameState = savedGame
                    });
                }
                else
                {
                    game.GameState = savedGame;
                }
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
