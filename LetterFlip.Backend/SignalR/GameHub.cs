﻿using LetterFlip.Backend.Models;
using LetterFlip.Backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace LetterFlip.Backend.SignalR
{
    public class GameHub : Hub
    {
        private readonly IGameService gameService;

        public GameHub(IAdaptiveWordProvider adaptiveWordProvider, IGameService gameService)
        {
            gameService.AdaptiveWordProvider = adaptiveWordProvider;
            this.gameService = gameService;
        }

        public async Task CheckTile(string letter, string playerUrl, string gameId)
        {
            CheckTileResponse? tileResponse = await gameService.CheckTileAsync(letter, playerUrl, gameId);

            if (tileResponse == null)
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.CheckTileFailed);
                return;
            }

            await Clients.Caller.SendAsync(ResponseType.CheckTileResponse, tileResponse.GameId, tileResponse.Letter, tileResponse.Occurrences);

            await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.OpponentCheckedTile, gameId, letter, tileResponse.Occurrences > 0);
        }

        public async Task JoinOrCreateGame(string playerName, string gameId)
        {
            //var playerName = Context.User.Identity.Name;
            var game = await gameService.JoinOrCreateGameAsync(playerName, gameId);

            if (game == null)
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.CreateGameFailed);
                return;
            }

            if (game is JoinGameResponse joinGameResponse)
            {
                await Clients.Caller.SendAsync(ResponseType.JoinedGame, gameId, joinGameResponse.PlayerName, joinGameResponse.OpponentWord);
            
                await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.PlayerJoined, gameId, playerName, joinGameResponse.YourWord);
            }
            else if (game is GameResponse gameResponse)
            {
                await Clients.Caller.SendAsync(ResponseType.CreatedGame, gameId, gameResponse.PlayerName, "");
            }
        }

        public async Task LoadGame(string playerName, string otherPlayerName, string playerUrl)
        {
            LoadGameResponse? game = await gameService.LoadGameAsync(playerName, otherPlayerName, playerUrl);

            if (game != null)
            {
                await Clients.Caller.SendAsync(ResponseType.LoadGameResponse, game.GameId, game.PlayerUrl, game.SavedGame);
            }
            else
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.GameNotFound);
            }
        }

        public async Task SaveGame(string gameId, string playerName, string otherPlayerName, string playerUrl, string savedGame)
        {
            var result = await gameService.SaveGameAsync(gameId, playerName, otherPlayerName, playerUrl, savedGame);
            if (!result)
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.GameNotSaved);
            }
        }

        public async Task GuessLetter(string letter, int wordIndex, string playerUrl, string gameId)
        {
            GuessLetterResponse? guessLetterResponse = await gameService.GuessLetterAsync(letter, wordIndex, playerUrl, gameId);

            if (guessLetterResponse == null)
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.GuessLetterFailed);
                return;
            }

            await Clients.Caller.SendAsync(ResponseType.GuessLetterResponse, guessLetterResponse.GameId, guessLetterResponse.Letter, guessLetterResponse.Position, guessLetterResponse.IsCorrect);

            if (guessLetterResponse.IsCorrect)
            {
                await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.OpponentGuessedLetterCorrect, gameId, letter, wordIndex, guessLetterResponse.NewWordView.ToCharArray().Select(c => c.ToString()).ToArray());
            }
            else
            {
                await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.OpponentGuessedLetterIncorrect, gameId, letter, wordIndex);
            }
        }

        public async Task GuessWord(string word, string playerUrl, string gameId)
        {
            GuessWordResponse? guessWordResponse = await gameService.GuessWordAsync(word, playerUrl, gameId);

            if (guessWordResponse == null)
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.GuessWordFailed);
                return;
            }

            await Clients.Caller.SendAsync(ResponseType.GuessWordResponse, guessWordResponse.GameId, guessWordResponse.Word, guessWordResponse.IsCorrect, guessWordResponse.IsGameOver);

            if (guessWordResponse.IsCorrect)
            {
                await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.OpponentGuessedWordCorrect, gameId, word, guessWordResponse.NewWord, guessWordResponse.IsGameOver);
            }
            else
            {
                await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.OpponentGuessedWordIncorrect, gameId, word);
            }
        }

        public async Task NewGame(string gameId, string playerName, string otherPlayerName, string playerUrl)
        {
            (NewGameStartedResponse YourGame, NewGameStartedResponse OpponentGame)? game = await gameService.NewGameAsync(gameId, playerName, otherPlayerName, playerUrl);

            if (game == null)
            {
                await Clients.Caller.SendAsync(ResponseType.ErrorResponse, ResponseDetailType.NewGameFailed);
                return;
            }

            await Clients.Caller.SendAsync(ResponseType.NewGameStarted, game.Value.YourGame.GameId, game.Value.YourGame.OpponentWord);

            await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.NewGameStarted, game.Value.OpponentGame.GameId, game.Value.OpponentGame.OpponentWord);
        }

        public async Task SendMessage(string message, string gameId)
        {
            await Clients.AllExcept(Context.ConnectionId).SendAsync(ResponseType.SendMessageResponse, gameId, message);
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
