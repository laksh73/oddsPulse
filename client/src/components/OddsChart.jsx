import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const API_URL = 'http://localhost:5000/api'

function OddsChart({marketHash,outcomeOneName,outcomeTwoName,}) {
  const [oddsHistory, setOddsHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchHistory() {
      try {
        // setLoading(true)
        setError(false)

        const response = await fetch(
          `${API_URL}/markets/${marketHash}/history`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch odds history')
        }

        const data = await response.json()

        if (isMounted) {
          setOddsHistory(data)
        }
      } catch (err) {
        console.error('Failed to load odds history:', err)

        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (marketHash) {
      fetchHistory()

      const intervalId = setInterval(fetchHistory, 1000)

      return () => {
        isMounted = false
        clearInterval(intervalId)
      }
    }
  }, [marketHash])


  if (loading) {
    return <p>Loading odds history...</p>
  }

  if (error) {
    return <p>Failed to load odds history.</p>
  }

  if (oddsHistory.length === 0) {
    return <p>No odds history available for this market yet.</p>
  }

  const chartData = oddsHistory.map((snapshot) => ({
    time: new Date(snapshot.timestamp).toLocaleString([], {
      // month: 'short',
      // day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    outcomeOne: snapshot.outcomeOne,
    outcomeTwo: snapshot.outcomeTwo,
  }))

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            interval={Math.max(1, Math.floor(chartData.length / 4))}
          />

          <YAxis
            domain={[0, 100]}
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            formatter={(value, name) => [
              value == null ? '-' : `${value}%`,
              name,
            ]}
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />

          <Legend
            wrapperStyle={{
              color: '#e2e8f0',
              fontSize: '13px',
              paddingTop: '10px',
            }}
          />

          <Line
            type="monotone"
            dataKey="outcomeOne"
            name={outcomeOneName}
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            connectNulls={true}
          />

          <Line
            type="monotone"
            dataKey="outcomeTwo"
            name={outcomeTwoName}
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OddsChart