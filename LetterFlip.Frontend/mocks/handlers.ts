import { MessageType } from 'dual-hub-connection'
import { InvokeMessagesResponse } from 'mock-hub-connection-builder'
import { http, HttpResponse } from 'msw'
import { CheckTileResponse, GameResponse, GuessLetterResponse, GuessWordResponse, JoinGameResponse, OpponentCheckedTileResponse, OpponentGuessedLetterCorrectlyResponse, OpponentGuessedLetterIncorrectlyResponse, OpponentGuessedWordCorrectlyResponse, OpponentGuessedWordIncorrectlyResponse } from 'signalr-service'

export interface HandlerRequestBody {
  params: any[];
}

export const handlers = [
    http.post('/hub/invoke/:postId', async ({ request, params, cookies }) => {

        const gameId = "abc123";
        const scenarioIndex = 0;
        const guessLetterScenarioIndex = 0;
        const yourWord = "MILE";
        const opponentWord = "EXAM";

        const { postId } = params
        const requestBody: HandlerRequestBody = await request.json() as HandlerRequestBody;

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
          const requestArray = requestBody.params as string[];
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
              },
              {
                messageName: MessageType.OpponentGuessedLetterIncorrect,
                delay: 8000
              }
            ]
          };
          return HttpResponse.json(guessWordResponse);
        }
        else if (postId === MessageType.GuessWordResponse)
        {
          const requestArray = requestBody.params as string[];
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
              },
              {
                messageName: MessageType.OpponentGuessedWordIncorrect,
                delay: 5000
              }
            ]
          };
          return HttpResponse.json(checkTileResponse);
        }
        else if (postId === MessageType.CheckTileResponse)
        {
          const requestArray = requestBody.params as string[];
          const checkTileResponse: CheckTileResponse = {
            gameId,
            letter: requestArray[0],
            occurrences: yourWord.indexOf(requestArray[0]) > -1 ? 1 : 0
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
            opponentWord
          }
          return HttpResponse.json(gameResponse);
        }
        else if (postId === MessageType.PlayerJoined)
        {
          const joinGameResponse: JoinGameResponse = {
            playerName: 'MyPlayerTwo',
            opponentWord
          };
          return HttpResponse.json(joinGameResponse);
        }
        else if (postId === MessageType.OpponentGuessedWordCorrect)
        {
          const opponentGuessedWordCorrectlyResponse: OpponentGuessedWordCorrectlyResponse = {
            gameId,
            word: 'EXAM',
            newWord: 'HELLO',
            isGameOver: false
          };
          return HttpResponse.json(opponentGuessedWordCorrectlyResponse);
        }
        else if (postId === MessageType.OpponentGuessedWordIncorrect)
        {
          const opponentGuessedWordIncorrectlyResponse: OpponentGuessedWordIncorrectlyResponse = {
            gameId,
            word: 'HELLO'
          };
          return HttpResponse.json(opponentGuessedWordIncorrectlyResponse);
        }
        else if (postId === MessageType.OpponentGuessedLetterCorrect)
        {
          const opponentGuessedLetterCorrectlyResponse: OpponentGuessedLetterCorrectlyResponse = {
            gameId,
            letter: 'E',
            position: 0,
            newWordView: [ 'E', '', '', '' ],
            isGameOver: false
          };
          return HttpResponse.json(opponentGuessedLetterCorrectlyResponse);
        }
        else if (postId === MessageType.OpponentGuessedLetterIncorrect) {
          const opponentGuessedLetterIncorrectlyResponse: OpponentGuessedLetterIncorrectlyResponse = {
            gameId,
            letter: 'Z',
            position: 0
          };
          return HttpResponse.json(opponentGuessedLetterIncorrectlyResponse);
        }
        else if (postId === MessageType.OpponentCheckedTile) {
          const opponentCheckedTileResponse: OpponentCheckedTileResponse = {
            gameId,
            letter: 'Z',
            isCorrect: false
          };
          return HttpResponse.json(opponentCheckedTileResponse);
        }
        else
        {
          return HttpResponse.error();
        }
    })
]