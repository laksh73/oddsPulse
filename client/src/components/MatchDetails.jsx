import './MatchDetails.css'
import OddsChart from './OddsChart'

import { useEffect, useState } from 'react'


function MatchDetails({ match, onBack }) {

  const [latestOdds, setLatestOdds] = useState(match)

  
  useEffect(() => {
    let isMounted = true

    async function fetchLatestOdds() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/markets/${match.marketHash}/latest`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch latest odds')
        }

        const data = await response.json()
        console.log('Latest odds received:', data)
        console.log('Current market:', match.marketHash)

        if (isMounted) {
          setLatestOdds((previous) => ({
            ...previous,
            outcomeOne: data.outcomeOne,
            outcomeTwo: data.outcomeTwo,
            edge: data.edge,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch latest odds:', error)
      }
    }

    fetchLatestOdds()

    const intervalId = setInterval(fetchLatestOdds, 1000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [match.marketHash])



  return (
    <main className="content match-details">
      <div className="match-details-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="match-details-title">
          <h2>
            {match.teamOne} vs {match.teamTwo}
          </h2>
          <p>{match.sport}</p>
        </div>
      </div>

      <div className="odds-grid">
        
        <div className="odds-card">
          <h3>{match.outcomeOneName || match.teamOne}</h3>
          <p className="odds-value">
            {latestOdds.outcomeOne !== null
            ? `${latestOdds.outcomeOne.toFixed(2)}%`
            : '-'
            }
          </p>
        </div>

        <div className="odds-card">
          <h3>{match.outcomeTwoName || match.teamTwo}</h3>
          <p className="odds-value">
            {latestOdds.outcomeTwo !== null
            ? `${latestOdds.outcomeTwo.toFixed(2)}%`
            : '-'
            }
          </p>
        </div>

        <div className="odds-card">
          <h3>Edge</h3>
          <p
            className={`odds-value ${
              match.edge === null
                ? ''
                : match.edge > 0
                  ? 'negative-edge'
                  : match.edge < 0
                    ? 'positive-edge'
                    : ''
            }`}
          >
            {latestOdds.edge !== null
            ? `${latestOdds.edge.toFixed(2)}%`
            : '-'
            }
          </p>
        </div>
      </div>

      <div className="odds-chart-placeholder">
        <h3>Odds History</h3>
        <OddsChart
          marketHash={match.marketHash}
          outcomeOneName={match.outcomeOneName || match.teamOne}
          outcomeTwoName={match.outcomeTwoName || match.teamTwo}
        />
      </div>
    </main>
  )
}

export default MatchDetails