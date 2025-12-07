import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceInput = ({ onTaskDetected, isProcessing }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'en-US';

            rec.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                onTaskDetected(text);
            };

            rec.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        } else {
            console.warn('Speech API not supported in this browser');
        }
    }, [onTaskDetected]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
            setTranscript('');
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
                <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
            ${isListening
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-600/30'
                        }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {isListening ? (
                        <MicOff className="w-8 h-8 text-white" />
                    ) : (
                        <Mic className="w-8 h-8 text-white" />
                    )}
                </button>
            </div>

            <p className="text-slate-400 text-lg font-medium min-h-[1.5rem]">
                {isListening ? 'Listening...' : isProcessing ? 'Processing Task...' : 'Tap to Speak'}
            </p>

            {transcript && (
                <div className="text-center max-w-md text-slate-300 italic bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    "{transcript}"
                </div>
            )}
        </div>
    );
};

export default VoiceInput;
