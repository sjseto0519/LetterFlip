import { MessageType } from 'dual-hub-connection'
import { InvokeMessagesResponse } from 'mock-hub-connection-builder'
import { http, HttpResponse } from 'msw'
import { GameResponse, JoinGameResponse } from 'signalr-service'

export const handlers = [
    http.post('/hub/invoke/:postId', async ({ request, params, cookies }) => {
        const { postId } = params
        const requestBody = await request.json()

        if (postId === MessageType.JoinOrCreateGame) {
          const joinOrCreateGameResponse: InvokeMessagesResponse = {
            messages: [
              {
                messageName: MessageType.JoinedGame,
                delay: 500
              },
              {
                messageName: MessageType.PlayerJoined,
                delay: 5000
              }
            ]
          };
          return HttpResponse.json(joinOrCreateGameResponse);
        }
        else if (postId === MessageType.JoinedGame)
        {
          const gameResponse: GameResponse = {
            gameId: 'abc123',
            playerName: 'MyPlayerOne'
          }
          return HttpResponse.json(gameResponse);
        }
        else if (postId === MessageType.PlayerJoined)
        {
          const joinGameResponse: JoinGameResponse = {
            playerName: 'MyPlayerTwo'
          };
          return HttpResponse.json(joinGameResponse);
        }
        else
        {
          return HttpResponse.error();
        }
    })
]