import { useEffect, useRef, useState } from "react";
import playlistData from "../playlist.json";

export default function VideoPlayer({ startGame }) {
  // ⭐ Easy testing: change this to 5, 10, 60, etc.
  const PLAYBACK_TIME = 5; // todo update to 30

  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  const timerRef = useRef(null);              
  const progressIntervalRef = useRef(null);   

  const playlistRef = useRef([]);
  const songIndexRef = useRef(0);

  const [currentSong, setCurrentSong] = useState(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!startGame) return;

    playlistRef.current = shuffleArray([...playlistData]);
    songIndexRef.current = 0;

    const loadPlayer = () => {
      if (playerInstance.current) return;

      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: "390",
        width: "640",
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            console.log("YouTube player ready — starting first song");
            playNextSong();
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

    return () => {
      console.log("Cleaning up player + timers");
      clearTimeout(timerRef.current);
      clearInterval(progressIntervalRef.current);
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [startGame]);

  // -----------------------------
  // Core Song Loading Logic
  // -----------------------------
  function loadSongAtIndex(index) {
    const playlist = playlistRef.current;

    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    songIndexRef.current = index;

    const song = playlist[index];
    setCurrentSong(song);

    console.log(`Started: ${song.title} — ${song.artist}`);

    const videoId = getVideoId(song.youtube);
    const startTime = song.start || 0;

    playerInstance.current.loadVideoById({
      videoId,
      startSeconds: startTime,
    });

    setProgress(0);

    clearTimeout(timerRef.current);
    clearInterval(progressIntervalRef.current);

    console.log("Reset timers for new song");

    // ⭐ Use PLAYBACK_TIME instead of 30
    timerRef.current = setTimeout(() => {
      console.log(`${PLAYBACK_TIME}s timer ended — auto-skipping`);
      playNextSong();
    }, PLAYBACK_TIME * 1000);

    // ⭐ Progress bar adapts automatically
    const updates = PLAYBACK_TIME * 10; // 10 updates per second
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / updates);
        return next >= 100 ? 100 : next;
      });
    }, 100);
  }

  function playNextSong() {
    console.log("Skipping to next song");
  
    // ⭐ Force playback mode
    setPaused(false);
    playerInstance.current.playVideo();
  
    loadSongAtIndex(songIndexRef.current + 1);
  }
  
  function playPreviousSong() {
    console.log("Going to previous song");
  
    // ⭐ Force playback mode
    setPaused(false);
    playerInstance.current.playVideo();
  
    loadSongAtIndex(songIndexRef.current - 1);
  }

  // -----------------------------
  // Pause / Resume
  // -----------------------------
  const togglePause = () => {
    if (!playerInstance.current) return;
  
    if (paused) {
      console.log("Resumed playback");
      setPaused(false);
      playerInstance.current.playVideo();
  
      // ⭐ Restart progress bar from 0
      setProgress(0);
  
      // ⭐ Restart 30s timer
      timerRef.current = setTimeout(() => {
        console.log(`${PLAYBACK_TIME}s timer ended — auto-skipping`);
        playNextSong();
      }, PLAYBACK_TIME * 1000);
  
      // ⭐ Restart progress interval
      const updates = PLAYBACK_TIME * 10;
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / updates);
          return next >= 100 ? 100 : next;
        });
      }, 100);
  
    } else {
      console.log("Paused playback");
      setPaused(true);
      playerInstance.current.pauseVideo();
  
      clearTimeout(timerRef.current);
      clearInterval(progressIntervalRef.current);
    }
  };
  
  

  return (
    <div className="video-wrapper">
      <h3 className="now-playing">Now Playing</h3>

      {currentSong ? (
        <p className="song-info">
          {currentSong.title} — {currentSong.artist}
        </p>
      ) : (
        <p>Loading song...</p>
      )}

      <div ref={playerRef} className="youtube-player" />

      <div className="timer-bar">
        <div
          className="timer-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="controls">
        <button onClick={playPreviousSong}>⏮ Previous</button>
        <button onClick={togglePause}>{paused ? "Resume" : "Pause"}</button>
        <button onClick={playNextSong}>⏭ Skip</button>
      </div>
    </div>
  );
}

// Helpers
function getVideoId(url) {
  const regex = /(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : url;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
