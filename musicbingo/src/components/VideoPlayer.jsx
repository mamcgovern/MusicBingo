import { useEffect, useRef, useState } from "react";
import playlistData from "../playlist.json";

export default function VideoPlayer({ startGame }) {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  const playlistRef = useRef([]);
  const songIndexRef = useRef(0);

  const timerRef = useRef(null);
  const timerStartRef = useRef(null);
  const timePerSong = 30000; // TODO change to 30000
  const remainingTimeRef = useRef(timePerSong);

  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    if (!startGame) return;

    console.log("🎮 Game started");

    const availableSongs = playlistData.filter(
      (song) => song.youtube && song.youtube.trim() !== ""
    );

    playlistRef.current = shuffleArray([...availableSongs]);
    songIndexRef.current = 0;

    console.log("🔀 Playlist ready");

    const loadPlayer = () => {
      if (playerInstance.current) return;

      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: "315",
        width: "560",
        playerVars: {
          autoplay: 1,
          controls: 1, // ✅ BACK ON
          rel: 0,
        },
        events: {
          onReady: () => {
            console.log("✅ Player ready");
            playNextSong();
          },

          onStateChange: (event) => {
            console.log("📡 State:", event.data);

            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log("▶️ PLAYING → resume timer");
              resumeTimer();
            }

            if (event.data === window.YT.PlayerState.PAUSED) {
              console.log("⏸️ PAUSED → pause timer");
              pauseTimer();
            }
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }

    function playNextSong() {
      clearTimeout(timerRef.current);

      if (songIndexRef.current >= playlistRef.current.length) {
        console.log("🔁 reshuffling playlist");
        playlistRef.current = shuffleArray([...availableSongs]);
        songIndexRef.current = 0;
      }

      const song = playlistRef.current[songIndexRef.current];

      console.log("🎵 Now playing:", song.title, "-", song.artist);

      setCurrentSong(song);

      const videoId = getVideoId(song.youtube);

      playerInstance.current.loadVideoById({
        videoId,
        startSeconds: song.start || 0,
      });

      songIndexRef.current++;

      remainingTimeRef.current = timePerSong;
      timerStartRef.current = null;
    }

    function startTimer() {
      clearTimeout(timerRef.current);

      timerStartRef.current = Date.now();

      timerRef.current = setTimeout(() => {
        console.log("⏰ 30s up → next song");
        remainingTimeRef.current = timePerSong;
        playNextSong();
      }, remainingTimeRef.current);
    }

    function resumeTimer() {
      // only start timer if song is active
      if (!timerStartRef.current) {
        startTimer();
        return;
      }

      const elapsed = Date.now() - timerStartRef.current;

      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - elapsed
      );

      startTimer();
    }

    function pauseTimer() {
      if (!timerStartRef.current) return;

      clearTimeout(timerRef.current);

      const elapsed = Date.now() - timerStartRef.current;

      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - elapsed
      );

      console.log("⏸️ Timer paused, remaining:", remainingTimeRef.current);
    }

    return () => {
      clearTimeout(timerRef.current);

      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [startGame]);

  function getVideoId(url) {
    const match = url.match(
      /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : "";
  }

  function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function display(song) {
    if (song) {
      return (
        <div>
          <p>{currentSong.title} - {currentSong.artist}</p>
          <p className="subtitle">This song belongs to: {currentSong.name}</p>
        </div>
      )
    }
    return (
      <div>
        <p>Loading song...</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Now Playing:</h3>
      {display(currentSong)}

      <div ref={playerRef}></div>
    </div>
  );
}