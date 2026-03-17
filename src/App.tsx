import "./App.css";
import { useDeepgram } from "./UseDeepgram";

export default function App() {
	const { recording, liveText, notes, toggle, balance } = useDeepgram();

	return (
		<div className="app">

			<div className="balance">
				Balance: <span>{balance !== null ? `$${Number(balance).toFixed(4)}` : "—"}</span>
			</div>

			<div className="recorder">
				<button className={`mic ${recording ? "on" : ""}`} onClick={toggle}>
					{recording ? <StopIcon /> : <MicIcon />}
				</button>
				<div className="rec-info">
					<div className={`rec-status ${recording ? "on" : ""}`}>
						{recording ? "Recording — click to stop" : "Click to record"}
					</div>
					{liveText && <div className="rec-live">{liveText}</div>}
				</div>
			</div>

			<div>
				<div className="notes-header">
					<h2>Notes</h2>
					{notes.length > 0 && (
						<button className="ghost" onClick={() => {
							const all = notes.map((n) => `[${n.time}] ${n.text}`).join("\n\n");
							navigator.clipboard.writeText(all);
						}}>Copy all</button>
					)}
				</div>
				{notes.length === 0
					? <div className="empty">No notes yet.</div>
					: notes.map((n) => (
						<div key={n.id} className="note">
							<div className="note-meta">{n.time}</div>
							<div className="note-text">{n.text}</div>
						</div>
					))
				}
			</div>

		</div>
	);
}

function MicIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
			<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="#0f0f0f" />
			<path d="M19 11a7 7 0 0 1-14 0" stroke="#0f0f0f" strokeWidth="2" strokeLinecap="round" />
			<line x1="12" y1="18" x2="12" y2="22" stroke="#0f0f0f" strokeWidth="2" strokeLinecap="round" />
			<line x1="8" y1="22" x2="16" y2="22" stroke="#0f0f0f" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function StopIcon() {
	return (
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
			<rect x="5" y="5" width="14" height="14" rx="2" fill="#fff" />
		</svg>
	);
}
