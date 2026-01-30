import { useState } from "react";
import Home from "./components/Home";
import Round from "./components/Round";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  if (screen === "home") {
    return (
      <Home
        onStart={() => {
          setScreen("round");
          setGameStarted(true); // this counts as the user interaction
        }}
      />
    );
  }

  return (
    <Round
      round={round}
      playerName={round === 1 ? "Nick" : "Maddie"}
      gameStarted={gameStarted}
      onNextRound={() => setRound((r) => r + 1)}
    />
  );
}
