// import markets from '../data/markets'


const API_URL = 'http://localhost:5000/api'

export async function getMarkets(section) {
  const endpoint =
    section === 'Live' ? '/markets/live' : '/markets'

  const response = await fetch(`${API_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error('Failed to fetch markets')
  }

  return response.json()
}

   