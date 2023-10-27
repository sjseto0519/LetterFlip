﻿using LetterFlip.Backend.Services;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace LetterFlip.Backend.SignalR
{
    public class GameHub : Hub
    {
        // Sample word for demonstration
        private readonly string currentWord = "EXAMPLE";
        private readonly Dictionary<string, string> waitingPlayers = new Dictionary<string, string>();
        private readonly IAdaptiveWordProvider adaptiveWordProvider;
        private readonly IGameService gameService;

        public GameHub(IAdaptiveWordProvider adaptiveWordProvider, IGameService gameService)
        {
            this.adaptiveWordProvider = adaptiveWordProvider;
            this.gameService = gameService;
        }

        public async Task CheckTile(string letter)
        {
            int occurrences = currentWord.Count(c => c.ToString() == letter);

            var result = new { Letter = letter, Occurrences = occurrences };
            await Clients.Caller.SendAsync("CheckTileResponse", JsonConvert.SerializeObject(result));
        }

        public async Task JoinOrCreateGame(string gameId)
        {
            var playerName = Context.User.Identity.Name;
            var game = await _gameService.JoinOrCreateGameAsync(gameId, playerName);

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
