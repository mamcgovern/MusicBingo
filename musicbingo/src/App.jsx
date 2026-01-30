import { useState } from "react";
import Home from "./components/Home";
import Round from "./components/Round";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [round, setRound] = useState(1);

  if (screen === "home") {
    return <Home onStart={() => setScreen("round")} />;
  }

  return (
    <Round
      round={round}
      playerName={round === 1 ? "Nick" : "Maddie"}
      gameStarted={true}
      onNextRound={() => setRound((r) => r + 1)}
    />
  );
}
