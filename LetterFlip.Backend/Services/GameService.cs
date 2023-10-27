using JWTAuthentication.NET6._0.Auth;
using LetterFlip.Backend.Models;
using Microsoft.EntityFrameworkCore;

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
                int newLength = wordToMatch.Length + 1;
                var newWord = isGameOver ? null : AdaptiveWordProvider.GetRandomWord((Enumerations.DifficultyType)newLength);
                var isCorrect = word == wordToMatch;

                if (isCorrect && !isGameOver)
                {
                    var game = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                        && g.PlayerIndex == playerIndex);

                    if (game != null)
                    {
                        game.CurrentDifficulty++;
                        game.WordView = new string('_', game.CurrentDifficulty);

                        await _context.SaveChangesAsync();
                    }
                }

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
                    IsCorrect = isCorrect,
                    IsGameOver = isGameOver
                };
            }

            return null;
        }

        public async Task<GameResponseBase?> JoinOrCreateGameAsync(string playerName, string gameId)
        {
            var finishedGames = await _context.Games.Where(g => g.GameId == gameId && g.InProgress == false).ToListAsync();
            _context.Games.RemoveRange(finishedGames);

            await _context.SaveChangesAsync();

            var game = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.PlayerIndex == 0);
            if (game == null)
            {
                Game game1 = new Game
                {
                     CurrentDifficulty = 4,
                     CurrentTurn = 0,
                     GameId = gameId,
                     WordView = "____",
                     InProgress = true,
                     Player1Name = playerName,
                     Player2Name = "",
                     PlayerIndex = 0,
                     GameState = "",
                     OpponentWord = AdaptiveWordProvider.GetRandomWord(Enumerations.DifficultyType.Easy),
                };

                Game game2 = new Game
                {
                    CurrentDifficulty = 4,
                    CurrentTurn = 0,
                    GameId = gameId,
                    WordView = "____",
                    InProgress = true,
                    Player1Name = "",
                    Player2Name = playerName,
                    PlayerIndex = 1,
                    GameState = "",
                    OpponentWord = AdaptiveWordProvider.GetRandomWord(Enumerations.DifficultyType.Easy),
                };

                _context.Games.Add(game1);
                _context.Games.Add(game2);

                await _context.SaveChangesAsync();

                return new GameResponse
                {
                    GameId = gameId,
                    PlayerName = playerName,
                    OpponentWord = game1.OpponentWord,
                };
            }


            var foundGame = await _context.Games.FirstOrDefaultAsync(g => g.GameId == gameId
                && g.Player1Name == ""
                && g.PlayerIndex == 1);

            if (foundGame != null)
            {
                if (game.Player2Name == "")
                {
                    game.Player2Name = playerName;
                }

                foundGame.Player1Name = playerName;
                await _context.SaveChangesAsync();

                return new JoinGameResponse
                {
                    PlayerName = foundGame.Player2Name,
                    OpponentWord = foundGame.OpponentWord,
                    YourWord = game.OpponentWord,
                };
            }

            return null;
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
                && g.Player1Name == otherPlayerName
                && g.Player2Name == playerName
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

            await _context.SaveChangesAsync();

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
