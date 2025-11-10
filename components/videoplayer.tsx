'use client'

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

export interface CustomVideoPlayerProps {
    src: string;
    poster?: string;
    className?: string; // applied to the <video>
    wrapperClassName?: string; // applied to the outer wrapper
    size?: number | string; // optional size for inline usage (applies to width/height if provided)
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: "auto" | "metadata" | "none";
    showNativeControls?: boolean; // if true, we will not hide native controls
    title?: string;
    ariaLabel?: string;
    onPlay?: () => void;
    onPause?: () => void;
}

export default function CustomVideoPlayer({
    src,
    poster,
    className = "w-full h-full object-cover rounded-lg",
    wrapperClassName = "relative w-full h-full",
    size,
    autoPlay = false,
    loop = false,
    muted = false,
    preload = "metadata",
    showNativeControls = false,
    title = "Video player",
    ariaLabel = "Video player",
    onPlay,
    onPause,
}: CustomVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);

    // Keep isPlaying in sync with actual video events (in case user uses native controls)
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const handlePlay = () => {
            setIsPlaying(true);
            onPlay?.();
        };
        const handlePause = () => {
            setIsPlaying(false);
            onPause?.();
        };

        v.addEventListener("play", handlePlay);
        v.addEventListener("pause", handlePause);

        return () => {
            v.removeEventListener("play", handlePlay);
            v.removeEventListener("pause", handlePause);
        };
    }, [onPlay, onPause]);

    // Toggle play/pause
    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            v.play().catch(() => {
                /* ignore play promise rejection (autoplay blocked, etc) */
            });
        } else {
            v.pause();
        }
    };

    // Keyboard support for Space / Enter on the overlay button
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
            e.preventDefault();
            togglePlay();
        }
    };

    // Optional style for explicit size prop
    const wrapperStyle: React.CSSProperties | undefined =
        size !== undefined
            ? {
                width: typeof size === "number" ? `${size}px` : size,
                height: typeof size === "number" ? `${size}px` : size,
            }
            : undefined;

    return (
        <div
            className={wrapperClassName}
            style={wrapperStyle}
            // helpful for keyboard focusing the wrapper (not strictly necessary)
            aria-label={ariaLabel}
        >
            <video
                ref={videoRef}
                className={className}
                src={src}
                poster={poster}
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                preload={preload}
                controls={showNativeControls}
                onClick={togglePlay}
                title={title}
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Play button (center) — shown only when paused */}
            {!isPlaying && !showNativeControls && (
                <button
                    type="button"
                    onClick={togglePlay}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-pressed="false"
                    aria-label="Play video"
                >
                    <div className="bg-yellow-500/80 backdrop-blur-sm rounded-full p-4 md:p-6 hover:bg-black/60 transition">
                        <Play className="size-6 md:size-12" aria-hidden />
                    </div>
                </button>
            )}

            {/* Small Pause button (top-right) — shown only when playing */}
            {isPlaying && !showNativeControls && (
                <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute top-3 right-3 bg-black/40 p-2 rounded-full hover:bg-black/60 transition"
                    aria-pressed="true"
                    aria-label="Pause video"
                >
                    <Pause size={20} aria-hidden />
                </button>
            )}
        </div>
    );
}
