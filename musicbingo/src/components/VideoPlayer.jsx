import { useEffect, useRef, useState } from "react";
import playlistData from "../playlist.json";

export default function VideoPlayer({ round, startGame }) {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const timerRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const playlistRef = useRef([]);
  const songIndexRef = useRef(0);

  useEffect(() => {
    if (!round || !startGame) return;

    const roundPlaylist = playlistData.rounds[round - 1].playlist;

    // Shuffle the playlist
    playlistRef.current = shuffleArray([...roundPlaylist]);
    songIndexRef.current = 0;

    // Load YouTube IFrame API if needed
    const loadPlayer = () => {
      if (playerInstance.current) return;

      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: "315",
        width: "560",
        playerVars: { autoplay: 1, controls: 0, rel: 0 },
        events: {
          onReady: () => {
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
    } else if (window.YT.Player) {
      loadPlayer();
    }

    function playNextSong() {
      if (songIndexRef.current >= playlistRef.current.length) {
        // End of playlist: reshuffle
        playlistRef.current = shuffleArray([...roundPlaylist]);
        songIndexRef.current = 0;
      }

      const song = playlistRef.current[songIndexRef.current];
      setCurrentSong(song);

      const videoId = getVideoId(song.youtube);
      const startTime = song.start || 0; // default to 0 if not provided

      playerInstance.current.loadVideoById({ videoId, startSeconds: startTime });

      songIndexRef.current += 1;

      timerRef.current = setTimeout(playNextSong, 30000);
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
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [round, startGame]);

  return (
    <div>
      <h3>Now Playing:</h3>
      {currentSong ? (
        <p>{currentSong.title} - {currentSong.artist}</p>
      ) : (
        <p>Loading song...</p>
      )}
      <div ref={playerRef}></div>
    </div>
  );
}
