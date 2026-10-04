import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen" aria-label="Indlæser side..." role="status">
      <div className="loading-logo">
        <span className="logo-main">Autohus</span>
        <span className="logo-accent">Kvik</span>
      </div>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
}
