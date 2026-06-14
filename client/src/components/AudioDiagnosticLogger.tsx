import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, PlusCircle, Activity } from 'lucide-react';
import Button from './Button';

interface AudioDiagnosticLoggerProps {
  onAudioRecorded: (file: File) => void;
}

const AudioDiagnosticLogger: React.FC<AudioDiagnosticLoggerProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      discardRecording(); // Clean slate

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingDuration(0);
  };

  const handleAttach = () => {
    if (audioBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([audioBlob], `diagnostic_audio_${timestamp}.webm`, { type: 'audio/webm' });
      onAudioRecorded(file);
      discardRecording();
    }
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-blue-500" />
          Diagnostic Audio Logger
        </h4>
      </div>

      {isRecording ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 font-mono">
              Recording... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            <Square className="w-3 h-3 mr-1 fill-current" />
            Stop
          </button>
        </div>
      ) : audioUrl ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <audio controls src={audioUrl} className="h-8 w-full max-w-[200px]" />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={discardRecording}
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Discard"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Button type="button" variant="primary" onClick={handleAttach} className="w-full flex items-center justify-center py-2 text-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Attach to Request
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer group"
        >
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">Record Machine Audio</span>
          <span className="text-xs opacity-75 mt-1 text-center">Capture unusual sounds for remote diagnosis (Max 30s recommended)</span>
        </button>
      )}
    </div>
  );
};

export default AudioDiagnosticLogger;
