import { useState } from "react";
import BingoCard from "./BingoCard";
import VideoPlayer from "./VideoPlayer";

export default function Round({ round, playerName, gameStarted }) {
  // Define patterns for the round
  const roundPatterns = {
    1: ["Heart", "Blackout"]
  };

  const patterns = roundPatterns[round] || [];
  const [patternIndex, setPatternIndex] = useState(0);
  const currentPattern = patterns[patternIndex];

  const handleNextPattern = () => {
    if (patternIndex < patterns.length - 1) {
      setPatternIndex((prev) => prev + 1);
    } else {
      alert("Game Over!");
      setPatternIndex(0); // optional: reset to first pattern
    }
  };

  return (
    <div className="screen">
      <div className="round-layout">
        {/* Left: Video */}
        <div className="left">
          <div className="round-header">
            <h2 className="script">Music Bingo</h2>
          </div>

          <VideoPlayer
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