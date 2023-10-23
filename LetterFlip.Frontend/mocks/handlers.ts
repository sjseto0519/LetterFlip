import { http, HttpResponse } from 'msw'

export const handlers = [
    http.post('/hub/invoke/:postId', async ({ request, params, cookies }) => {
        const { postId } = params
        const requestBody = await request.json()

        if (postId === 'abc-123') {
            return HttpResponse.json({
              postId,
              name: 'John',
            })
          }
          else
          {
            return HttpResponse.json({
                postId,
                name: 'John',
              })
          }
      })
]