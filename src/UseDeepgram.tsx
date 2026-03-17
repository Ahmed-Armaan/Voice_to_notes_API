import { useState, useRef, useCallback, useEffect } from "react";

const API_KEY = "5d7f7d92abd34321780f711cddad3b4e764711f7";
const WS_URL = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true";
const SERVER = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8080";

interface Note {
	id: number;
	text: string;
	time: string;
}

export function useDeepgram() {
	const [recording, setRecording] = useState(false);
	const [liveText, setLiveText] = useState("");
	const [notes, setNotes] = useState<Note[]>([]);
	const [balance, setBalance] = useState<number | null>(null);

	const socketRef = useRef<WebSocket | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const liveRef = useRef("");

	const fetchBalance = useCallback(() => {
		fetch(`${SERVER}/balance`)
			.then((r) => r.json())
			.then(({ amount }) => setBalance(amount))
			.catch(() => setBalance(null));
	}, []);

	useEffect(() => { fetchBalance(); }, [fetchBalance]);

	async function start() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		streamRef.current = stream;

		const ws = new WebSocket(WS_URL, ["token", API_KEY]);
		socketRef.current = ws;

		ws.onopen = () => {
			const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
			recorderRef.current = recorder;
			recorder.ondataavailable = (e) => {
				if (ws.readyState === WebSocket.OPEN && e.data.size > 0) ws.send(e.data);
			};
			recorder.start(200);
			setRecording(true);
			setLiveText("");
			liveRef.current = "";
		};

		ws.onmessage = (e) => {
			const text = JSON.parse(e.data).channel?.alternatives?.[0]?.transcript ?? "";
			if (text) { liveRef.current = text; setLiveText(text); }
		};

		ws.onerror = () => stop();
	}

	const stop = useCallback(() => {
		recorderRef.current?.stop();
		streamRef.current?.getTracks().forEach((t) => t.stop());
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify({ type: "CloseStream" }));
			setTimeout(() => socketRef.current?.close(), 400);
		}
		const text = liveRef.current;
		if (text) {
			setNotes((prev) => [{
				id: Date.now(),
				text,
				time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			}, ...prev]);
		}
		setRecording(false);
		setLiveText("");
		fetchBalance();
	}, [fetchBalance]);

	function toggle() { recording ? stop() : start(); }

	return { recording, liveText, notes, toggle, balance };
}
