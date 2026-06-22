import { useEffect, useRef, useState } from "react";
import playlistData from "../playlist.json";

export default function VideoPlayer({ startGame }) {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const timerRef = useRef(null);

  const playlistRef = useRef([]);
  const songIndexRef = useRef(0);

  const timePerRound = 5000; //TODO change to 30000

  const remainingTimeRef = useRef(timePerRound);
  const timerStartRef = useRef(null);

  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    if (!startGame) return;

    const availableSongs = playlistData.filter(
      (song) => song.youtube && song.youtube.trim() !== ""
    );

    playlistRef.current = shuffleArray([...availableSongs]);
    songIndexRef.current = 0;

    const loadPlayer = () => {
      if (playerInstance.current) return;

      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: "315",
        width: "560",
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            playNextSong();
          },

          onStateChange: (event) => {
            // Pause timer when video pauses
            if (event.data === window.YT.PlayerState.PAUSED) {
              pauseSongTimer();
            }

            // Resume timer when video resumes
            if (event.data === window.YT.PlayerState.PLAYING) {
              resumeSongTimer();
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
    } else if (window.YT.Player) {
      loadPlayer();
    }

    function playNextSong() {
      clearTimeout(timerRef.current);

      if (songIndexRef.current >= playlistRef.current.length) {
        playlistRef.current = shuffleArray([...availableSongs]);
        songIndexRef.current = 0;
      }

      const song = playlistRef.current[songIndexRef.current];
      setCurrentSong(song);

      const videoId = getVideoId(song.youtube);

      playerInstance.current.loadVideoById({
        videoId,
        startSeconds: song.start || 0,
      });

      songIndexRef.current++;

      remainingTimeRef.current = timePerRound;
    }

    function startSongTimer() {
      clearTimeout(timerRef.current);

      timerStartRef.current = Date.now();

      timerRef.current = setTimeout(() => {
        remainingTimeRef.current = timePerRound;
        playNextSong();
      }, remainingTimeRef.current);
    }

    function pauseSongTimer() {
      if (!timerStartRef.current) return;

      clearTimeout(timerRef.current);

      const elapsed = Date.now() - timerStartRef.current;
      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - elapsed
      );
    }

    function resumeSongTimer() {
      clearTimeout(timerRef.current);

      timerStartRef.current = Date.now();

      timerRef.current = setTimeout(() => {
        remainingTimeRef.current = timePerRound;
        playNextSong();
      }, remainingTimeRef.current);
    }

    function getVideoId(url) {
      const match = url.match(
        /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );

      return match ? match[1] : "";
    }

    function shuffleArray(array) {
      const shuffled = [...array];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    }

    // Make timer functions available to onStateChange
    window.startSongTimer = startSongTimer;
    window.resumeSongTimer = resumeSongTimer;
    window.pauseSongTimer = pauseSongTimer;

    // Start timer once first song loads
    const timerStarter = setInterval(() => {
      if (
        playerInstance.current &&
        playerInstance.current.getPlayerState &&
        playerInstance.current.getPlayerState() ===
          window.YT.PlayerState.PLAYING
      ) {
        startSongTimer();
        clearInterval(timerStarter);
      }
    }, 250);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(timerStarter);

      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [startGame]);

  return (
    <div>
      <h3>Now Playing:</h3>

      {currentSong ? (
        <p>
          {currentSong.title} - {currentSong.artist}
        </p>
      ) : (
        <p>Loading song...</p>
      )}

      <div ref={playerRef}></div>
    </div>
  );
}