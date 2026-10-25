import { useState } from 'react'
import './App.css'
import MarketTable from './components/MarketTable'
import MatchDetails from './components/MatchDetails'
import SearchBar from './components/SearchBar'

function App() {
  const [activeSection, setActiveSection] = useState('Live')
  const [activeSport, setActiveSport] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const sports = [
    '⚽ Football',
    '🏀 Basketball',
    '🎾 Tennis',
    '🏏 Cricket',
    '🏒 Hockey',
    '🏉 Rugby',
    '🥋 MMA',
    '🎮 Esports',
    '₿ Crypto'
]

    function handleSportClick(sport) {
        setActiveSport(sport)
        setActiveSection('Sport')
    }

    function handleMatchClick(market) {
        setSelectedMatch(market)
    }

    function handleBackClick() {
        setSelectedMatch(null)
    }

  return (
    <div className="app">
        {selectedMatch ? (
        <MatchDetails
            match={selectedMatch}
            onBack={handleBackClick}
        />
        ) : (
        <>
            <header className="navbar">
                <h1 className="logo">oddsPulse</h1>

                <div className="navbar-actions">
                    <nav className="nav-links">
                        <button
                        className={activeSection === 'Live' ? 'active' : ''}
                        onClick={() => {
                            setActiveSection('Live')
                            setActiveSport('')
                        }}
                        >
                        {activeSection !== 'Live' && (
                            <span className="live-dot" />
                        )}
                        Live
                        </button>

                        <button
                        className={activeSection === 'All' ? 'active' : ''}
                        onClick={() => {
                            setActiveSection('All')
                            setActiveSport('')
                        }}
                        >
                        All
                        </button>
                    </nav>

                    <div className="navbar-search">
                        <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        />
                    </div>
                </div>

            </header>

            <div className="main-layout">
            <aside className="sidebar">
                <h3 className="sports-heading">SPORTS</h3>

                <ul>
                {sports.map((sport) => (
                    <li
                    key={sport}
                    className={activeSport === sport ? 'active' : ''}
                    onClick={() => handleSportClick(sport)}
                    >
                    {sport}
                    </li>
                ))}
                </ul>
            </aside>

            <main className="content">
                {activeSection === 'Live' && (
                <>
                    <h2>Live Markets</h2>
                    <MarketTable onMatchClick={handleMatchClick}  searchTerm={searchTerm} section="Live" />
                </>
                )}

                {activeSection === 'All' && (
                <>
                    <h2>All Markets</h2>
                    <p>Browse all available sports markets.</p>
                    <MarketTable onMatchClick={handleMatchClick} searchTerm={searchTerm}  section="All" />
                </>
                )}

                {activeSection === 'Sport' && (
                <>
                    <h2>{activeSport}</h2>
                    <p>Browse available markets for this sport.</p>
                    <MarketTable
                    sport={activeSport}
                    onMatchClick={handleMatchClick}
                    searchTerm={searchTerm}
                    section="All"
                    />
                </>
                )}
            </main>
            </div>
        </>
        )}
    </div>
  )
}

export default App