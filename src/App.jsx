import { useEffect, useState } from 'react';
import {
  FaCircle,
  FaGlobeAmericas,
  FaMoon,
  FaRocket,
  FaStar,
  FaTimesCircle,
} from 'react-icons/fa';

const MAX_TOSSES = 3;
const LEADERBOARD_KEY = 'comet-toss-leaderboard';

const scoringZones = [
  { label: 'Low Earth Orbit', icon: 'earth', points: 1 },
  { label: 'Lunar Zone', icon: 'moon', points: 3 },
  { label: 'Mars Shot', icon: 'mars', points: 5 },
  { label: 'Deep Space', icon: 'star', points: 10 },
];

const missZone = { label: 'Missed Orbit', icon: 'miss', points: 0 };

function ZoneIcon({ name }) {
  if (name === 'earth') return <FaGlobeAmericas />;
  if (name === 'moon') return <FaMoon />;
  if (name === 'mars') return <FaCircle />;
  if (name === 'star') return <FaStar />;
  return <FaTimesCircle />;
}

function App() {
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [tosses, setTosses] = useState([]);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState(() => {
    // Load saved scores once when the app first opens.
    const savedScores = localStorage.getItem(LEADERBOARD_KEY);
    return savedScores ? JSON.parse(savedScores) : [];
  });

  const tossesRemaining = MAX_TOSSES - tosses.length;
  const isGameComplete = tosses.length === MAX_TOSSES;
  const hasRecordedToss = tosses.length > 0;
  const canToss = playerName.trim() !== '' && !isGameComplete;
  const canSubmit = playerName.trim() !== '' && hasRecordedToss;

  // Keep the leaderboard saved after every submitted score or reset.
  useEffect(() => {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }, [leaderboard]);

  function recordToss(zone) {
    if (!canToss) return;

    setTosses([...tosses, zone]);
    setScore(score + zone.points);
  }

  function removeToss(indexToRemove) {
    const tossToRemove = tosses[indexToRemove];
    if (!tossToRemove) return;

    setTosses(tosses.filter((_, index) => index !== indexToRemove));
    setScore(score - tossToRemove.points);
  }

  function submitScore() {
    if (!canSubmit) return;

    const newEntry = {
      id: Date.now(),
      name: playerName.trim(),
      score,
      breakdown: tosses,
      attempts: tosses.length,
    };

    const sortedScores = [...leaderboard, newEntry].sort((a, b) => b.score - a.score);
    setLeaderboard(sortedScores);
    setJustSubmitted(true);
    window.setTimeout(() => setJustSubmitted(false), 850);
    // Clear the board for the next player after saving this result.
    startNewPlayer();
  }

  function startNewPlayer() {
    setPlayerName('');
    setScore(0);
    setTosses([]);
  }

  function resetLeaderboard() {
    setLeaderboard([]);
  }

  return (
    <main className="app-shell">
      <div className="space-art planet-one" />
      <div className="space-art planet-two" />
      <div className="space-art comet" />
      <div className="orbit-ring orbit-ring-one" />
      <div className="orbit-ring orbit-ring-two" />

      <section className="game-panel" aria-labelledby="game-title">
        <div className="brand-bar">
          <span>Hack at UCI</span>
          <span>Comet Toss Station</span>
        </div>

        <div className="title-block">
          <h1 id="game-title">
            <FaRocket className="title-icon" />
            Comet Toss
          </h1>
        </div>

        <div className="player-card">
          <label htmlFor="player-name">Pilot name</label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Enter player name"
            disabled={tosses.length > 0}
          />
        </div>

        <div className={`score-grid ${justSubmitted ? 'score-grid-submitted' : ''}`} aria-live="polite">
          <div>
            <span className="stat-label">Score</span>
            <strong key={score}>{score}</strong>
          </div>
          <div>
            <span className="stat-label">Tosses left</span>
            <strong>{tossesRemaining}</strong>
          </div>
        </div>

        <div className="zone-grid">
          {scoringZones.map((zone) => (
            <button
              className="zone-button"
              key={zone.label}
              onClick={() => recordToss(zone)}
              disabled={!canToss}
            >
              <span className={`zone-icon zone-icon-${zone.icon}`}>
                <ZoneIcon name={zone.icon} />
              </span>
              <span>{zone.label}</span>
              <strong>{zone.points} point{zone.points > 1 ? 's' : ''}</strong>
            </button>
          ))}
        </div>

        <button className="miss-button" onClick={() => recordToss(missZone)} disabled={!canToss}>
          <span className="miss-label">
            <FaTimesCircle />
            Missed the hole
          </span>
          <strong>0 points</strong>
        </button>

        <div className="toss-track">
          {Array.from({ length: MAX_TOSSES }).map((_, index) => (
            <div className="toss-slot" key={index}>
              {tosses[index] ? (
                <>
                  <span className="toss-result">
                    <ZoneIcon name={tosses[index].icon} />
                    {tosses[index].points}
                  </span>
                  <button
                    className="remove-toss"
                    onClick={() => removeToss(index)}
                    aria-label={`Remove toss ${index + 1}`}
                  >
                    <FaTimesCircle />
                  </button>
                </>
              ) : (
                `Toss ${index + 1}`
              )}
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="primary-action" onClick={submitScore} disabled={!canSubmit}>
            Submit Score
          </button>
          <button className="danger-action" onClick={resetLeaderboard}>
            Reset Leaderboard
          </button>
        </div>
      </section>

      <section className="leaderboard-panel" aria-labelledby="leaderboard-title">
        <div className="panel-heading">
          <p className="eyebrow">Mission results</p>
          <h2 id="leaderboard-title">Leaderboard</h2>
        </div>

        {leaderboard.length === 0 ? (
          <p className="empty-state">Awaiting first orbit entry.</p>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <article className="leaderboard-entry" key={entry.id}>
                <div className="rank">
                  {index + 1}
                </div>
                <div className="player-result">
                  <h3>{entry.name}</h3>
                </div>
                <strong className="leaderboard-score">{entry.score} pts</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
