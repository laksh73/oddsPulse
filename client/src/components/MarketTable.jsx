import './MarketTable.css'
import { getMarkets } from '../services/marketService'
import { useState, useEffect } from 'react'

function MarketTable({section, sport, onMatchClick, searchTerm }) {

  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)  // State to track if there was an error fetching markets

useEffect(() => {
    let isMounted = true

    async function loadMarkets() {
      try {
        const data = await getMarkets(section)

        if (isMounted) {
          setMarkets(data)
          setError(false)
        }
      } catch (error) {
        console.error('Failed to load markets:', error)

        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMarkets()

    const intervalId =
      section === 'Live'   //Live section will refresh every 5 second, while All and Sport sections won't refresh automatically.
      ? setInterval(loadMarkets, 5000)
      : null

    return () => {
      isMounted = false

      if (intervalId) {
        clearInterval(intervalId)
      }
    }

  }, [section])


  if (error) {
    return <p>Failed to load markets. Please try again.</p>
  }


  const filteredMarkets = markets.filter((market) => {

    const sportMapping = {
      '⚽ Football': ['Football', 'Soccer'],
      '🏀 Basketball': ['Basketball'],
      '🎾 Tennis': ['Tennis'],
      '🏏 Cricket': ['Cricket'],
      '🏒 Hockey' :['Hockey'],
      '🏉 Rugby' :["Rugby Union"],
      '🥋 MMA' :["Mixed Martial Arts","Boxing"],
      '🎮 Esports' : ["E Sports"],
      '₿ Crypto' : ["Crypto"]
    };

    const matchesSport = sport
      ? sportMapping[sport]?.includes(market.sport) ?? false
      : true; 

    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      market.teamOne.toLowerCase().includes(search) || market.teamTwo.toLowerCase().includes(search)
    return matchesSport && matchesSearch
  })



  if (loading) { // Show a loading message while markets are being fetched
    return <p>Loading markets...</p>
  }

  function formatGameTime(gameTime) {
  if (!gameTime) return 'started'

  return new Date(gameTime * 1000).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}


  return (
    <div className="market-table-container">

      {/* <div className="market-table-scroll"> */}
        <table className="market-table">
          <thead>
            <tr>
              <th>Start Time</th>
              <th>Sport</th>
              <th>Fixture</th>
              <th>Outcome One</th>
              <th>Outcome Two</th>
              <th>Edge</th>
            </tr>
          </thead>

          <tbody>
              {filteredMarkets.length > 0 ? (
                  filteredMarkets.map((market) => (
                  <tr key={market.id}>

                      <td>{formatGameTime(market.gameTime)}</td>

                      <td>{market.sport}</td>

                      <td className="market-fixture"
                      onClick={() => onMatchClick(market)}
                      >
                      {market.teamOne} vs {market.teamTwo}
                      </td>

                      <td>
                      {market.outcomeOne !== null
                          ? `${market.outcomeOne.toFixed(2)}%`
                          : 'bidding'}
                      </td>

                      <td>
                      {market.outcomeTwo !== null
                          ? `${market.outcomeTwo.toFixed(2)}%`
                          : 'bidding'}
                      </td>

                      <td
                      className={   /* Apply conditional classes based on edge value */
                          market.edge === null
                          ? ''
                          : market.edge > 0
                              ? 'negative-edge'
                              : market.edge < 0
                              ? 'positive-edge'
                              : ''
                      }
                      >
                      {market.edge !== null
                          ? `${market.edge.toFixed(2)}%`
                          : '-'}
                      </td>
                  </tr>
                  ))
              ) : ( // Show a message when there are no markets available for the selected sport or no markets at all
                  <tr>
                    <td colSpan="5">
                      {markets.length === 0
                        ? 'No markets available.'
                        : 'No fixtures available for this sport.'}
                    </td>
                  </tr>
              )}
          </tbody>

        </table>
      {/* </div> */}

    </div>
  )
}

export default MarketTable