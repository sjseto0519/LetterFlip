using LetterFlip.Backend.Models;
using LetterFlip.Backend.Services;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace LetterFlip.Backend.SignalR
{
    public class GameHub : Hub
    {
        private readonly IAdaptiveWordProvider adaptiveWordProvider;
        private readonly IGameService gameService;

        public GameHub(IAdaptiveWordProvider adaptiveWordProvider, IGameService gameService)
        {
            this.adaptiveWordProvider = adaptiveWordProvider;
            this.gameService = gameService;
        }

        public async Task CheckTile(string letter, int playerIndex, string gameId)
        {
            CheckTileResponse tileResponse = await gameService.CheckTileAsync(letter, playerIndex, gameId);
            //int occurrences = currentWord.Count(c => c.ToString() == letter);

            //var result = new { Letter = letter, Occurrences = occurrences };
            //await Clients.Caller.SendAsync(ResponseType.CheckTileResponse, JsonConvert.SerializeObject(result));
        }

        public async Task JoinOrCreateGame(string playerName, string gameId)
        {
            //var playerName = Context.User.Identity.Name;
            var game = await gameService.JoinOrCreateGameAsync(playerName, gameId);

            if (string.IsNullOrEmpty(game.Player2Name))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                await Clients.Caller.SendAsync("WaitingForOpponent");
            }
            else
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                await Clients.Group(gameId).SendAsync("GameStarted", game);
            }
        }

        public async Task LoadGame(string playerName, string otherPlayerName, int playerIndex)
        {
            LoadGameResponse game = await gameService.LoadGameAsync(playerName, otherPlayerName, playerIndex);

            //await Groups.AddToGroupAsync(Context.ConnectionId, game.Id);
            //await Clients.Group(game.Id).SendAsync("GameStarted", game);
        }

        public async Task SaveGame(string gameId, string playerName, string otherPlayerName, int playerIndex, string savedGame)
        {
            await gameService.SaveGameAsync(gameId, playerName, otherPlayerName, playerIndex, savedGame);
        }

        public async Task GuessLetter(string letter, int wordIndex, int playerIndex, string gameId)
        {
            GuessLetterResponse guessResponse = await gameService.GuessLetterAsync(letter, wordIndex, playerIndex, gameId);

            if (guessResponse.IsCorrect)
            {
                await Clients.Group(gameId).SendAsync("OpponentGuessedLetterCorrectly", guessResponse);
            }
            else
            {
                await Clients.Group(gameId).SendAsync("OpponentGuessedLetterIncorrectly", guessResponse);
            }
        }

        public async Task GuessWord(string word, int playerIndex, string gameId)
        {
            GuessWordResponse guessResponse = await gameService.GuessWordAsync(word, playerIndex, gameId);

            if (guessResponse.IsCorrect)
            {
                await Clients.Group(gameId).SendAsync("OpponentGuessedWordCorrectly", guessResponse);
            }
            else
            {
                await Clients.Group(gameId).SendAsync("OpponentGuessedWordIncorrectly", guessResponse);
            }
        }

        public async Task NewGame(string gameId)
        {
            NewGameStartedResponse game = await gameService.NewGameAsync(gameId);

            //await Groups.AddToGroupAsync(Context.ConnectionId, game.Id);
            //await Clients.Group(game.Id).SendAsync("GameStarted", game);
        }

        public async Task SendMessage(string message, string gameId)
        {
            await Clients.Group(gameId).SendAsync("ReceiveMessage", message);
        }

        public override Task OnConnectedAsync()
        {
            // Log or debug
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            // Log or debug
            return base.OnDisconnectedAsync(exception);
        }

    }

}
