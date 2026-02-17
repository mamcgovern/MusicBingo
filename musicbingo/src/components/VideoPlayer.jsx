import { useEffect, useRef, useState } from "react";
import playlistData from "../playlist.json";

export default function VideoPlayer({ startGame }) {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const playlistRef = useRef([]);
  const songIndexRef = useRef(0);

  const [currentSong, setCurrentSong] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!startGame) return;

    // Shuffle full playlist (your data is just an array)
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
            playNextSong();
          },
        },
      });
    };

    // Load YouTube API if needed
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else if (window.YT.Player) {
      loadPlayer();
    }

    function playNextSong() {
      if (songIndexRef.current >= playlistRef.current.length) {
        playlistRef.current = shuffleArray([...playlistData]);
        songIndexRef.current = 0;
      }

      const song = playlistRef.current[songIndexRef.current];
      setCurrentSong(song);

      const videoId = getVideoId(song.youtube);
      const startTime = song.start || 0;

      playerInstance.current.loadVideoById({
        videoId,
        startSeconds: startTime,
      });

      songIndexRef.current += 1;

      // Reset progress
      setProgress(0);

      clearTimeout(timerRef.current);
      clearInterval(progressIntervalRef.current);

      // 30 second song timer
      timerRef.current = setTimeout(playNextSong, 30000);

      // Animate progress bar (updates every 100ms)
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / 300); // 300 updates over 30s
          return next >= 100 ? 100 : next;
        });
      }, 100);
    }

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

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressIntervalRef.current);

      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [startGame]);

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

      {/* Progress Bar */}
      <div className="timer-bar">
        <div
          className="timer-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
