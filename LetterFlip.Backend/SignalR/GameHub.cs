using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace LetterFlip.Backend.SignalR
{
    public class GameHub : Hub
    {
        // Sample word for demonstration
        private readonly string currentWord = "EXAMPLE";
        private readonly Dictionary<string, string> waitingPlayers = new Dictionary<string, string>();

        public async Task CheckTile(string letter)
        {
            int occurrences = currentWord.Count(c => c.ToString() == letter);

            var result = new { Letter = letter, Occurrences = occurrences };
            await Clients.Caller.SendAsync("CheckTileResponse", JsonConvert.SerializeObject(result));
        }

        public async Task JoinOrCreateGame(string playerName, string gameId)
        {
            if (waitingPlayers.ContainsKey(gameId))
            {
                string otherPlayerName = waitingPlayers[gameId];
                waitingPlayers.Remove(gameId);

                // Send a message back to the client who just joined
                await Clients.Caller.SendAsync("JoinedGame", gameId, otherPlayerName);

                // Send a message to the player who was waiting
                await Clients.Client(gameId).SendAsync("PlayerJoined", playerName);
            }
            else
            {
                waitingPlayers[gameId] = playerName;
                await Clients.Caller.SendAsync("JoinedGame", gameId, playerName);
            }
        }
    }

}
