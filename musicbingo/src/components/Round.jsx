import BingoCard from "./BingoCard";
import VideoPlayer from "./VideoPlayer";

export default function Round({ round, playerName, gameStarted, onNextRound }) {
  return (
    <div className="screen">
      {/* round-layout now only contains left + right */}
      <div className="round-layout">
        <div className="left">
          <h2 className="script">Round {round}</h2>
          <h1 className="title">{playerName}</h1>

          <VideoPlayer round={round} startGame={gameStarted} />

        </div>

        <div className="right">
          <BingoCard />
        </div>
      </div>
    </div>
  );
}
