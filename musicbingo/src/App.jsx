import { useState } from "react";
import Home from "./components/Home";
import Round from "./components/Round";

export default function App() {
  const [screen, setScreen] = useState("home");

  if (screen === "home") {
    return <Home onStart={() => setScreen("game")} />;
  }

  return <Round gameStarted={true} />;
}
