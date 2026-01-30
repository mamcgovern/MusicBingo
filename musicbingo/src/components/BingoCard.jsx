import React from "react";

const patterns = {
  N: [0, 5, 10, 15, 20, 4, 9, 14, 19, 6, 12, 18, 24],
  M: [0, 5, 10, 15, 20, 4, 9, 14, 8, 19, 6, 12, 24],
  Blackout: Array.from({ length: 25 }, (_, i) => i),
};

export default function BingoCard({ pattern = "N" }) {
  const highlightedCells = patterns[pattern];

  return (
    <div className="bingo-card">
      <div className="header">
        {["B", "I", "N", "G", "O"].map((l) => (
          <div key={l} className="cell header-cell">{l}</div>
        ))}
      </div>

      <div className="grid">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className={`cell ${highlightedCells.includes(i) ? "highlight" : ""} ${i === 12 ? "free-space" : ""}`}
          >
            {i === 12 ? <span className="free-space-text">Free Space</span> : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
