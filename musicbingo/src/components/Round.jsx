import { useState } from "react";
import BingoCard from "./BingoCard";
import VideoPlayer from "./VideoPlayer";

export default function Round({ round, playerName, gameStarted, onNextRound }) {
  // Define patterns for each round
  const roundPatterns = {
    1: ["N", "Blackout"],
    2: ["M", "Blackout"],
  };

  const patterns = roundPatterns[round] || [];
  const [patternIndex, setPatternIndex] = useState(0);
  const currentPattern = patterns[patternIndex];

  const handleNextPattern = () => {
    if (patternIndex < patterns.length - 1) {
      setPatternIndex((prev) => prev + 1);
    } else {
      // End of round or game
      if (round === 2) {
        alert("Game Over!");
        // Optional: reset to Round 1
        setPatternIndex(0);
      } else {
        onNextRound(); // move to Round 2
        setPatternIndex(0);
      }
    }
  };

  return (
    <div className="screen">
      <div className="round-layout">
        {/* Left: Video */}
        <div className="left">
          <div className="round-header">
            <h2 className="script">Round {round}</h2>
            <h1 className={`title player-name ${playerName.toLowerCase()}`}>
              {playerName}
            </h1>
          </div>

          <VideoPlayer
            round={round}
            startGame={gameStarted}
          />
        </div>

        {/* Right: Bingo card + button */}
        <div className="right">
          <BingoCard pattern={currentPattern} />

          <button className="start-btn" onClick={handleNextPattern}>
            Next Pattern
          </button>
        </div>
      </div>
    </div>
  );
}
