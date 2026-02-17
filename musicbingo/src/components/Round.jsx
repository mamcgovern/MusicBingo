import VideoPlayer from "./VideoPlayer";

export default function Round({gameStarted}) {
  return (
    <div className="screen">
      <div className="round-layout single">
        <div className="left full">
          <h2 className="script">Music Bingo</h2>

          <VideoPlayer startGame={gameStarted} />
        </div>
      </div>
    </div>
  );
}
