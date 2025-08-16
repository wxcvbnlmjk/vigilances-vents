import { useState } from 'react'
import WindMap from '../src_vents/App'
import VigilanceMap from '../src_vigilance/App'
// import { ThemeToggle } from './components/ThemeToggle'
import './App.css'

type TabType = 'vents' | 'vigilance'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('vigilance')

  return (
    <div className="tab-container">
              <header className="navbar">

          <div className="flex-none">
            <div className="tabs">

              <button
                className={`tab tab-lg ${activeTab === 'vigilance' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('vigilance')}
              >
                ⚠️ Vigilances
              </button>
              <button
                className={`tab tab-lg ${activeTab === 'vents' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('vents')}
              >
                💨 Vents
              </button>
            </div>   
          </div>
        </header>

      <main className="tab-content">
      {activeTab === 'vigilance' && (
          <div className="vigilance-map-container">
            <VigilanceMap />
          </div>
        )}
        {activeTab === 'vents' && (
          <div className="wind-map-container">
            <WindMap />
          </div>
        )}

      </main>
    </div>
  )
}

export default App
