export default function Home({ onStart }) {
    return (
      <div className="screen center">
        <h2 className="script">Welcome to</h2>
        <h1 className="title">Music Bingo</h1>
  
        <button className="start-btn" onClick={onStart}>
          START
        </button>
      </div>
    );
  }
  