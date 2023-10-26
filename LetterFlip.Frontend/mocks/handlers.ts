import { MessageType } from 'dual-hub-connection'
import { InvokeMessagesResponse } from 'mock-hub-connection-builder'
import { http, HttpResponse } from 'msw'
import { CheckTileResponse, GameResponse, GuessLetterResponse, GuessWordResponse, JoinGameResponse } from 'signalr-service'

export const handlers = [
    http.post('/hub/invoke/:postId', async ({ request, params, cookies }) => {

        const gameId = "abc123";
        const scenarioIndex = 0;
        const guessLetterScenarioIndex = 0;

        const { postId } = params
        const requestBody = await request.json()

        if (postId === MessageType.JoinOrCreateGame) {
          if (scenarioIndex === 0) {
            const joinOrCreateGameResponse: InvokeMessagesResponse = {
              messages: [
                {
                  messageName: MessageType.CreatedGame,
                  delay: 500
                },
                {
                  messageName: MessageType.PlayerJoined,
                  delay: 5000
                }
              ]
            };
            return HttpResponse.json(joinOrCreateGameResponse);
          } else if (scenarioIndex === 1) {
            const joinOrCreateGameResponse: InvokeMessagesResponse = {
              messages: [
                {
                  messageName: MessageType.JoinedGame,
                  delay: 500
                }
              ]
            };
            return HttpResponse.json(joinOrCreateGameResponse);
          }
        }
        else if (postId === MessageType.GuessLetter) {
          const guessLetterResponse: InvokeMessagesResponse = {
            messages: [
              {
                messageName: MessageType.GuessLetterResponse,
                delay: 500
              }
            ]
          };
          return HttpResponse.json(guessLetterResponse);
        }
        else if (postId === MessageType.GuessLetterResponse)
        {
          const requestArray = requestBody as string[];
          const guessLetterResponse: GuessLetterResponse = {
            gameId,
            letter: requestArray[0],
            isCorrect: guessLetterScenarioIndex === 0 ? true : false
          };
          return HttpResponse.json(guessLetterResponse);
        }
        else if (postId === MessageType.GuessWord) {
          const guessWordResponse: InvokeMessagesResponse = {
            messages: [
              {
                messageName: MessageType.GuessWordResponse,
                delay: 500
              },
              {
                messageName: MessageType.OpponentGuessedWordCorrect,
                delay: 5000
              }
            ]
          };
          return HttpResponse.json(guessWordResponse);
        }
        else if (postId === MessageType.GuessWordResponse)
        {
          const requestArray = requestBody as string[];
          const guessWordResponse: GuessWordResponse = {
            gameId,
            word: requestArray[0],
            isCorrect: guessLetterScenarioIndex === 0 ? true : false
          };
          return HttpResponse.json(guessWordResponse);
        }
        else if (postId === MessageType.CheckTile) {
          const checkTileResponse: InvokeMessagesResponse = {
            messages: [
              {
                messageName: MessageType.CheckTileResponse,
                delay: 500
              }
            ]
          };
          return HttpResponse.json(checkTileResponse);
        }
        else if (postId === MessageType.CheckTileResponse)
        {
          const requestArray = requestBody as string[];
          const checkTileResponse: CheckTileResponse = {
            gameId,
            letter: requestArray[0],
            occurrences: 1
          };
          return HttpResponse.json(checkTileResponse);
        }
        else if (postId === MessageType.CreatedGame)
        {
          const gameResponse: GameResponse = {
            gameId,
            playerName: 'MyPlayerOne'
          }
          return HttpResponse.json(gameResponse);
        }
        else if (postId === MessageType.JoinedGame)
        {
          const gameResponse: GameResponse = {
            gameId,
            playerName: 'MyPlayerTwo',
            opponentWord: 'ODES'
          }
          return HttpResponse.json(gameResponse);
        }
        else if (postId === MessageType.PlayerJoined)
        {
          const joinGameResponse: JoinGameResponse = {
            playerName: 'MyPlayerTwo',
            opponentWord: 'EXAM'
          };
          return HttpResponse.json(joinGameResponse);
        }
        else
        {
          return HttpResponse.error();
        }
    })
]