'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type TextToSpeechProps = {
  content: string;
  title?: string;
  className?: string;
};

export function TextToSpeech({ content, title, className }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        const english = available.find((v) => v.lang.startsWith('en'));
        setSelectedVoice(english ?? available[0] ?? null);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const play = useCallback(() => {
    window.speechSynthesis.cancel();

    const text = `${title ? title + '. ' : ''}${content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [content, title, selectedVoice, rate]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const handleToggle = () => {
    if (!isPlaying) {
      play();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const estimatedMinutes = Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 150));

  return (
    <div className={cn('rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4', className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--bg-muted)">
          <Volume2 className="h-5 w-5 text-(--fg-muted)" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-(--fg-default)">Listen to this article</p>
          <p className="text-xs text-(--fg-muted)">~{estimatedMinutes} min · AI narration</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-(--bg-base) text-(--fg-default) transition-colors hover:bg-(--bg-muted)"
            aria-label={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
          >
            {isPlaying ? (isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />) : <Play className="h-4 w-4" />}
          </button>
          {isPlaying && (
            <button
              type="button"
              onClick={stop}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-(--bg-base) text-(--fg-default) transition-colors hover:bg-(--bg-muted)"
              aria-label="Stop"
            >
              <Square className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {isPlaying && voices.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <select
            value={selectedVoice?.name ?? ''}
            onChange={(e) => {
              const voice = voices.find((v) => v.name === e.target.value);
              if (voice) setSelectedVoice(voice);
            }}
            className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-2 py-1 text-xs text-(--fg-default)"
          >
            {voices
              .filter((v) => v.lang.startsWith('en'))
              .map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-(--fg-muted)">
            Speed
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-16"
            />
            {rate.toFixed(1)}×
          </label>
        </div>
      )}
    </div>
  );
}
