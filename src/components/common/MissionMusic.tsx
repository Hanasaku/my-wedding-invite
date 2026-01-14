import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
`;

const MusicWrapper = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${hexToRGBA(palette.black, 0.6)};
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${palette.goldMain};
    background: ${hexToRGBA(palette.black, 0.8)};
  }
`;

const IconWrapper = styled.div<{ $isPlaying: boolean }>`
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${palette.goldMain};
    display: ${props => props.$isPlaying ? 'block' : 'none'};
    animation: ${pulse} 2s infinite ease-in-out;
  }
`;

const Label = styled.span`
  font-size: 0.7rem;
  color: ${palette.goldMain};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

interface MissionMusicProps {
    autoStart?: boolean;
}

const MissionMusic: React.FC<MissionMusicProps> = ({ autoStart = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cinematic Spy/Thriller Theme (Royalty Free)
    const musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"; // Known working MP3 for testing

    useEffect(() => {
        const playAudio = () => {
            if (audioRef.current) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setIsPlaying(true);
                        // Once played, we can remove the global listener
                        window.removeEventListener('click', playAudio);
                    }).catch(err => {
                        console.log("Audio play failed:", err);
                    });
                }
            }
        };

        if (autoStart) {
            // Priority 1: Try immediate play
            playAudio();
            // Priority 2: Listen for ANY click on the page to unlock audio (Browser requirement)
            window.addEventListener('click', playAudio);
        }

        return () => window.removeEventListener('click', playAudio);
    }, [autoStart]);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={musicUrl}
                loop
                preload="auto"
            />
            <MusicWrapper onClick={toggleMusic}>
                <IconWrapper $isPlaying={isPlaying}>
                    {isPlaying ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={palette.goldMain}>
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={palette.goldMain}>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </IconWrapper>
                <Label>{isPlaying ? "Mission Active" : "Mission Silent"}</Label>
            </MusicWrapper>
        </>
    );
};

export default MissionMusic;
