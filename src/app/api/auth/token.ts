// pages/api/auth/token.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import querystring from 'querystring'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.body

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    res.status(500).json({ error: 'Failed to get access token' })
  }
}
