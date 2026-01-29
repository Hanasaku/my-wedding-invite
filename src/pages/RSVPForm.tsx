import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';
import { generateGoogleCalendarUrl, downloadIcsFile, CalendarEvent } from '@/utils/calendar';
import { useMissionNetwork } from '@/hooks/useMissionNetwork';

// --- Cinematic Animations ---
const entryReveal = keyframes`
  0% { transform: scale(0.95) translateY(20px); opacity: 0; filter: blur(10px); }
  100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
`;

// --- Styled Components ---

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at center, rgba(10, 10, 15, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: env(safe-area-inset-top) 20px env(safe-area-inset-bottom);
  overscroll-behavior: contain;
`;

const FormFrame = styled.div`
  width: 100%;
  max-width: 500px;
  max-height: 85vh; // Dynamic height
  background: ${palette.bgPrimary}; // Solid background for reading clarity
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  box-shadow: 
    0 20px 50px -10px rgba(0, 0, 0, 0.8),
    0 0 0 1px ${hexToRGBA(palette.goldMain, 0.1)} inset; // Inner glowing border
  position: relative;
  display: flex;
  flex-direction: column;
  animation: ${entryReveal} 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  overflow: hidden;
  border-radius: 4px;

  @media (max-width: 480px) {
    max-height: 85dvh;
    width: 92%;
    padding: 20px 15px; /* Create safe zone for decorations */
  }

  padding: 35px; /* Desktop safe zone */

  /* Film Grain Texture Effect */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 1px,
      rgba(255, 255, 255, 0.03) 1px,
      rgba(255, 255, 255, 0.03) 2px
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.5;
  }
`;

const FrameDecor = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 2;

  /* Corner Accents - Art Deco / Tech Hybrid */
  &::before, &::after {
    content: '';
    position: absolute;
    width: 12px; height: 12px;
    border: 1px solid ${palette.goldMain};
    transition: all 0.5s ease;
  }
  &::before { top: 10px; left: 10px; border-right: none; border-bottom: none; }
  &::after { bottom: 10px; right: 10px; border-left: none; border-top: none; }
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px 35px;
  position: relative;
  z-index: 5;
  -webkit-overflow-scrolling: touch;

  /* Scrollbar Styling */
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${hexToRGBA(palette.goldMain, 0.4)}; }
  
  padding: 10px 10px 30px 10px;
  
  @media (max-width: 480px) {
    padding: 5px 5px 20px 5px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 35px;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 2px;
    background: ${palette.goldMain};
    margin: 15px auto 0;
    box-shadow: 0 0 10px ${palette.goldMain};
  }
`;

const Title = styled.h2`
  font-family: ${palette.fontClassy};
  color: ${palette.goldMain};
  font-size: 2rem;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  background: linear-gradient(to bottom, ${palette.goldBright}, ${palette.goldMain});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubTitle = styled.div`
  font-family: ${palette.fontTech};
  color: ${hexToRGBA(palette.white, 0.6)};
  font-size: 0.75rem;
  letter-spacing: 4px;
  margin-top: 8px;
  text-transform: uppercase;
`;

const CloseIcon = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: ${hexToRGBA(palette.goldMain, 0.5)};
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-family: sans-serif;
  font-size: 1.2rem;
  padding: 0;

  &:hover {
    color: ${palette.bgPrimary};
    background: ${palette.goldMain};
    box-shadow: 0 0 15px ${palette.goldMain};
  }
`;

// --- Form Elements ---

import MissionInput from '@/components/common/MissionInput';

// ... (Overlay, FormFrame, etc. remain unchanged)

// --- Form Elements ---

// Helper styled component for the radio section label
const SectionLabel = styled.div`
  font-family: ${palette.fontTech};
  font-size: 0.75rem;
  color: ${hexToRGBA(palette.goldMain, 0.8)};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
`;

const RadioSection = styled.div`
  margin-bottom: 24px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;



// --- Animations ---
const lockIn = keyframes`
  0% { transform: scale(3); opacity: 0; filter: blur(20px); }
  10% { transform: scale(1); opacity: 1; filter: blur(0); }
  20% { transform: scale(1.1); filter: brightness(2); }
  100% { transform: scale(1); filter: brightness(1); }
`;

const sadEntry = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shiny = keyframes`
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
`;

// --- Styled Components for Success View ---

const SuccessView = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  min-height: 0; /* Fix for Safari flex parent clipping */

  /* Hide scrollbar but keep functional */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SuccessInner = styled.div<{ $center?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${props => props.$center ? 'center' : 'flex-start'};
  min-height: 100%; /* Ensure content can be centered if short */
  width: 100%;
  padding: 10px 10px 20px 10px;
  text-align: center;

  @media (max-width: 480px) {
    padding: 10px 5px 15px 5px;
  }
`;

const SuccessIcon = styled.div<{ $sentiment: 'positive' | 'negative' }>`
  font-size: ${props => props.$sentiment === 'positive' ? '6rem' : '4rem'};
  color: ${props => props.$sentiment === 'positive' ? palette.goldMain : palette.sentiment.distant};
  margin-bottom: 20px;
  
  /* Heroic Sentiment: Intense Glow and Animation */
  text-shadow: ${props => props.$sentiment === 'positive'
    ? `0 0 30px ${palette.goldMain}, 0 0 60px ${palette.goldBright}`
    : 'none'};
    
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* LoL Lock-in Effect vs Sad Shuffle */
  animation: ${props => props.$sentiment === 'positive'
    ? css`${lockIn} 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards`
    : css`${sadEntry} 1s ease-out`};

  @media (max-width: 480px) {
    font-size: ${props => props.$sentiment === 'positive' ? '4rem' : '3rem'};
    margin-bottom: 10px;
  }
`;

const SuccessTitle = styled.h3<{ $sentiment: 'positive' | 'negative' }>`
  font-family: ${palette.fontClassy};
  color: ${props => props.$sentiment === 'positive' ? palette.goldMain : palette.sentiment.distant};
  font-size: ${props => props.$sentiment === 'positive' ? '1.8rem' : '1.5rem'};
  margin-bottom: 25px;
  letter-spacing: ${props => props.$sentiment === 'positive' ? '3px' : '2px'};
  text-transform: uppercase;
  border-bottom: 1px solid ${props => props.$sentiment === 'positive' ? hexToRGBA(palette.goldMain, 0.3) : hexToRGBA(palette.sentiment.distant, 0.3)};
  padding-bottom: 15px;
  display: inline-block;
  width: 100%;
  max-width: 280px;
  
  animation: ${props => props.$sentiment === 'positive'
    ? css`${fadeIn} 0.5s ease-out 0.2s both`
    : css`${sadEntry} 1s ease-out 0.2s both`};

  @media (max-width: 480px) {
    font-size: ${props => props.$sentiment === 'positive' ? '1.5rem' : '1.2rem'};
    margin-bottom: 15px;
  }
`;

const SuccessMsg = styled.p<{ $sentiment?: 'positive' | 'negative' }>`
  font-family: ${palette.fontTech};
  color: ${props => props.$sentiment === 'negative' ? palette.sentiment.distant : hexToRGBA(palette.white, 0.9)};
  line-height: 2;
  margin-bottom: 50px;
  font-size: 0.95rem;
  max-width: 90%;
  animation: ${fadeIn} 0.8s ease-out 0.4s both;

  @media (max-width: 480px) {
    margin-bottom: 30px;
    line-height: 1.6;
  }
`;

const HeroicBtn = styled.button`
  width: 100%;
  background: ${palette.goldMain};
  color: ${palette.bgPrimary};
  border: none;
  padding: 16px;
  font-family: ${palette.fontTech};
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  animation: ${fadeIn} 0.5s ease-out 0.6s both;
  margin-bottom: 20px;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${hexToRGBA(palette.goldMain, 0.4)};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
`;

const RedemptionBtn = styled.button`
  width: 100%;
  background: transparent;
  border: 1px solid ${palette.goldMain};
  color: ${palette.goldMain};
  padding: 14px;
  font-family: ${palette.fontTech};
  font-size: 1rem;
  letter-spacing: 2px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.3s;
  animation: ${fadeIn} 0.8s ease-out 0.6s both;

  &:hover {
    background: ${hexToRGBA(palette.goldMain, 0.1)};
    box-shadow: 0 0 15px ${hexToRGBA(palette.goldMain, 0.2)};
  }
`;

const SadBtn = styled.button`
  width: 100%;
  background: transparent;
  border: 1px solid ${hexToRGBA(palette.sentiment.distant, 0.3)};
  color: ${palette.sentiment.distant};
  padding: 14px;
  font-family: ${palette.fontTech};
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.5s;
  opacity: 0.7;
  animation: ${sadEntry} 1s ease-out 0.8s both;

  &:hover {
    opacity: 1;
    background: ${hexToRGBA(palette.sentiment.distant, 0.1)};
    /* Intentionally boring interactions */
  }
`;

// New Button for Modal matching SadBtn style
const ModalSadBtn = styled.button`
  width: 100%;
  background: transparent;
  border: 1px solid ${hexToRGBA(palette.sentiment.distant, 0.3)};
  color: ${palette.sentiment.distant};
  padding: 12px;
  font-family: ${palette.fontTech};
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0.8;
  margin-top: 10px;

  &:hover {
    opacity: 1;
    background: ${hexToRGBA(palette.sentiment.distant, 0.1)};
    border-color: ${palette.sentiment.distant};
    box-shadow: 0 0 10px ${hexToRGBA(palette.sentiment.distant, 0.2)};
  }
`;

// --- Refined Tech Components ---

const MailContainer = styled.div`
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid ${hexToRGBA(palette.goldMain, 0.15)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const MailCommandBar = styled.div`
  display: flex;
  width: 100%;
  max-width: 320px; /* Constrain width for better aesthetic */
  height: 44px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden; // Keep content inside

  &:focus-within {
    border-color: ${palette.goldMain};
    box-shadow: 0 0 15px ${hexToRGBA(palette.goldMain, 0.15)};
  }
`;

const MailInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${palette.white};
  font-family: ${palette.fontTech};
  font-size: 0.9rem;
  padding: 0 15px;
  outline: none;
  min-width: 0; // Fix flex child overflow
  letter-spacing: 0.5px;
  
  &::placeholder {
    color: ${hexToRGBA(palette.white, 0.3)};
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
`;

const MailActionBtn = styled.button<{ $status: 'idle' | 'sending' | 'sent' | 'error' }>`
  background: ${props => props.$status === 'sent' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: none;
  border-left: 1px solid ${props => props.$status === 'sent' ? hexToRGBA(palette.white, 0.2) : hexToRGBA(palette.goldMain, 0.3)};
  color: ${props => props.$status === 'sent' ? hexToRGBA(palette.white, 0.5) : palette.goldMain};
  font-family: ${palette.fontTech};
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0 20px;
  cursor: ${props => (props.$status === 'idle' || props.$status === 'error') ? 'pointer' : 'not-allowed'};
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;

  &:hover {
    background: ${props => props.$status === 'idle' ? hexToRGBA(palette.goldMain, 0.1) : 'auto'};
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  border-top: none;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
`;

const SuggestionItem = styled.div`
  padding: 10px 15px;
  color: ${palette.white};
  font-family: ${palette.fontTech};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid ${hexToRGBA(palette.goldMain, 0.1)};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${hexToRGBA(palette.goldMain, 0.2)};
    color: ${palette.goldMain};
  }
`;

const TechLoader = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <style>
      {`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}
    </style>
    {/* Background Track */}
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
    {/* Spinning Indicator (Half Circle) */}
    <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CalendarWrapper = styled.div`
  margin: 20px 0 60px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  padding: 0 10px;
  animation: ${fadeIn} 0.5s ease-out 0.8s both;

  @media (max-width: 480px) {
    margin: 10px 0 30px;
    gap: 10px;
  }
`;

const CalendarLabel = styled.div`
  font-family: ${palette.fontTech};
  color: ${hexToRGBA(palette.goldMain, 0.6)};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &::before, &::after {
    content: '';
    height: 1px;
    width: 30px;
    background: ${hexToRGBA(palette.goldMain, 0.2)};
  }
`;

const CalendarBtnGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const CalendarBtn = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  color: ${palette.white};
  padding: 10px 16px;
  border-radius: 2px;
  cursor: pointer;
  font-family: ${palette.fontTech};
  font-size: 0.8rem;
  letter-spacing: 1px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${hexToRGBA(palette.goldMain, 0.1)};
    border-color: ${palette.goldMain};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${hexToRGBA(palette.goldMain, 0.2)};
  }

  &:active {
    transform: translateY(0);
  }
`;

// --- Reconsideration Modal Component ---
const ModalOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  animation: ${entryReveal} 0.3s ease-out;
`;

const ModalCard = styled.div`
  background: ${palette.bgCard};
  border: 1px solid ${palette.accentError};
  padding: 30px 25px;
  width: 85%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 0 30px ${hexToRGBA(palette.accentError, 0.3)};
  position: relative;

  &::before {
    content: '⚠️ WARNING';
    position: absolute;
    top: -12px; left: 50%;
    transform: translateX(-50%);
    background: ${palette.bgPrimary};
    color: ${palette.accentError};
    font-family: ${palette.fontTech};
    font-size: 0.8rem;
    padding: 0 10px;
    letter-spacing: 2px;
  }
`;

const ModalText = styled.p`
  color: ${palette.white};
  font-family: ${palette.fontTech};
  margin-bottom: 25px;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const ModalActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioLabel = styled.label<{ $checked: boolean; $sentiment?: 'positive' | 'negative' }>`
  flex: 1;
  min-width: 140px;
  width: auto; /* Allow auto width on desktop */
  cursor: pointer;
  position: relative;
  
  @media (max-width: 480px) {
    width: 100%; /* Full width on mobile */
  }
  
  /* Dynamic Color Logic */
  border: 1px solid ${props => props.$checked
    ? (props.$sentiment === 'negative' ? hexToRGBA(palette.sentiment.distant, 0.3) : palette.goldMain)
    : 'rgba(255,255,255,0.1)'
  };
  
  background: ${props => props.$checked
    ? (props.$sentiment === 'negative' ? hexToRGBA(palette.sentiment.distant, 0.1) : hexToRGBA(palette.goldMain, 0.1))
    : 'rgba(255,255,255,0.02)'
  };
  
  padding: 12px 16px;
  border-radius: 2px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  /* The "Disappointment" Effect: desaturate and dim on hover if negative */
  &:hover {
    border-color: ${props => props.$sentiment === 'negative' ? palette.sentiment.distant : hexToRGBA(palette.goldMain, 0.5)};
    background: ${props => props.$sentiment === 'negative' ? hexToRGBA(palette.sentiment.distant, 0.1) : hexToRGBA(palette.goldMain, 0.05)};
  }

  input {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid ${props => props.$checked
    ? (props.$sentiment === 'negative' ? palette.sentiment.distant : palette.goldBright)
    : 'rgba(255,255,255,0.3)'
  };
    border-radius: 50%;
    margin: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      content: '';
      width: 8px;
      height: 8px;
      background: ${props => props.$sentiment === 'negative' ? palette.sentiment.distant : palette.goldBright};
      border-radius: 50%;
      opacity: ${props => props.$checked ? 1 : 0};
      transform: scale(${props => props.$checked ? 1 : 0});
      transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
      box-shadow: 0 0 8px ${props => props.$sentiment === 'negative' ? 'transparent' : palette.goldMain}; /* No glow for sadness */
    }
  }

  span {
    font-family: ${palette.fontTech};
    color: ${props => props.$checked
    ? (props.$sentiment === 'negative' ? palette.sentiment.distant : palette.white)
    : hexToRGBA(palette.white, 0.7)
  };
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 1px;
    transition: color 0.3s;
  }
`;

const Toast = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: ${palette.goldMain};
  color: ${palette.bgPrimary};
  padding: 10px 20px;
  border-radius: 4px;
  font-family: ${palette.fontTech};
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  z-index: 100;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 20px;
  background: ${palette.goldMain};
  color: ${palette.bgPrimary};
  border: none;
  padding: 16px;
  font-family: ${palette.fontTech};
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${hexToRGBA(palette.goldMain, 0.4)};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    cursor: not-allowed;
    filter: grayscale(0.5);
  }
`;

const getClientUUID = (): string => {
  const STORAGE_KEY = 'client_device_uuid';
  let uuid = localStorage.getItem(STORAGE_KEY);
  if (!uuid) {
    uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, uuid);
  }
  return uuid;
};

interface RSVPFormProps {
  guestName: string;
  guestHash: string;
  onClose: () => void;
}

const WEDDING_EVENT: CalendarEvent = {
  title: 'Mission: Wedding Ceremony', // 建議修改：新人名字
  description: '感謝您參與這場時空收束任務。請準時抵達戰術座標。\n\nDress Code: Formal / Evening Wear',
  location: '香頌私宅洋樓 (Chanson Bistro), 台北市中山區建國北路二段64巷4號',
  startTime: '2025-05-20T12:00:00', // TODO: 請替換為正確的 ISO 8601 時間
  endTime: '2025-05-20T15:00:00',   // TODO: 請替換為正確的 ISO 8601 時間
};

const RSVPForm: React.FC<RSVPFormProps> = ({ guestName, guestHash, onClose }) => {
  const initialFormState = {
    alias: '',
    status: '',
    relation: '',
    adults: '1',
    kids: '0',
    veg: '0'
  };

  // Retrieve hook values
  const {
    submissionStatus,
    mailStatus,
    submitRSVP,
    sendInviteMail,
    resetNetworkState,
    resetMailStatus
  } = useMissionNetwork();

  // Local UI State
  const [formData, setFormData] = useState(initialFormState);
  // (submissionStatus and mailStatus are now from hook)
  const [showReconsiderModal, setShowReconsiderModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Mail Feature State - Local Input Only
  // Mail Feature State - Local Input Only
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const DOMAINS = ['gmail.com', 'yahoo.com.tw', 'hotmail.com', 'outlook.com', 'icloud.com'];

  // Countdown Logic
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    } else if (cooldown === 0 && (mailStatus === 'sent' || mailStatus === 'error')) {
      resetMailStatus();
    }
    return () => clearTimeout(timer);
  }, [cooldown, mailStatus, resetMailStatus]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Auto-complete logic
    if (value.includes('@')) {
      const [prefix, domainPart] = value.split('@');
      if (domainPart !== undefined) {
        const matches = DOMAINS.filter(d => d.startsWith(domainPart));
        setSuggestions(matches.map(d => `${prefix}@${d}`));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (val: string) => {
    setEmail(val);
    setSuggestions([]);
  };

  const handleSendMail = async () => {
    // Strict Email Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setToastMsg('無效的通訊頻率 (Invalid Email Format)');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    // Call Hook
    const success = await sendInviteMail({
      email,
      guestName,
      status: formData.status
    });

    if (success) {
      setToastMsg('邀請令已加密傳送至指定信箱');
      setCooldown(15); // Start 15s cooldown
    } else {
      setToastMsg('傳輸失敗，重置系統中...');
      setCooldown(5); // Error cooldown (shorter)
    }
    setTimeout(() => setToastMsg(''), 4000);
  };


  const handleDownloadIcs = () => {
    downloadIcsFile(WEDDING_EVENT);
    setToastMsg('檔案已下載，請點開啟動以加入行事曆');
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Security Protocol: Lock Environment
  React.useEffect(() => {
    const originalBodyStyle = window.getComputedStyle(document.body).overflow;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
    };
  }, []);

  // Security Protocol: Input Sanitization
  const sanitizeInput = (str: string) => str.replace(/[<>]/g, '').trim();

  const resetAndClose = () => {
    setFormData(initialFormState);
    resetNetworkState();
    onClose();
  };

  const proceedToSubmit = async () => {
    // MISSION: Transmission to Google Sheets via Hook
    const success = await submitRSVP({
      action: 'rsvp',
      hash: guestHash,
      client_uuid: getClientUUID(),
      agentName: guestName,
      alias: sanitizeInput(formData.alias),
      status: formData.status,
      relation: sanitizeInput(formData.relation),
      adults: formData.adults,
      kids: formData.kids,
      veg: sanitizeInput(formData.veg)
    });

    if (!success) {
      alert("傳輸失敗，請檢查網路連線或稍後再試。");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionStatus !== 'idle') return;

    // PUA Logic: If aborting, trigger guilt trip modal
    if (formData.status === 'abort' && !showReconsiderModal) {
      setShowReconsiderModal(true);
      return;
    }

    proceedToSubmit();
  };

  const handleRetractAbort = () => {
    setFormData({ ...formData, status: 'join' });
    setShowReconsiderModal(false);
    // Optional: Auto submit after changing mind? Or let them click submit again to feel the change?
    // Let's let them click submit again to reaffirm their new commitment.
  };

  const handleConfirmAbort = () => {
    setShowReconsiderModal(false);
    proceedToSubmit();
  };

  // UX: Auto-scroll on focus to prevent keyboard occlusion
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <Overlay>
      <FormFrame>
        <FrameDecor />
        <CloseIcon onClick={resetAndClose} aria-label="Close">✕</CloseIcon>

        {showReconsiderModal && (
          <ModalOverlay>
            <ModalCard>
              <ModalText>
                偵測到放棄任務訊號。
                <br /><br />
                特工 <strong>{guestName}</strong>，您的缺席將大幅降低任務成功率。
                <br />
                總部請求您重新評估。
              </ModalText>
              <ModalActionGroup>
                <SubmitBtn onClick={handleRetractAbort}>
                  ⚠️ 參與登陸
                </SubmitBtn>
                <ModalSadBtn onClick={handleConfirmAbort}>
                  確認維持遠端
                </ModalSadBtn>
              </ModalActionGroup>
            </ModalCard>
          </ModalOverlay>
        )}

        {submissionStatus === 'success' ? (
          <SuccessView>
            <SuccessInner $center={formData.status !== 'join'}>
              {formData.status === 'join' ? (
                <>
                  <SuccessIcon $sentiment="positive">✦</SuccessIcon>
                  <SuccessTitle $sentiment="positive">MISSION CONFIRMED</SuccessTitle>
                  <SuccessMsg>
                    【傳輸成功】<br />
                    回報數據已加密並送達總部。<br />
                    我們期待與您在現場會合。
                  </SuccessMsg>

                  <CalendarWrapper>
                    <CalendarLabel>📅 SYNC OPERATIONS (加入行事曆)</CalendarLabel>
                    <CalendarBtnGroup>
                      <CalendarBtn onClick={() => window.open(generateGoogleCalendarUrl(WEDDING_EVENT), '_blank')}>
                        Google
                      </CalendarBtn>
                      <CalendarBtn onClick={handleDownloadIcs}>
                        Apple
                      </CalendarBtn>
                      <CalendarBtn onClick={handleDownloadIcs}>
                        Outlook
                      </CalendarBtn>
                    </CalendarBtnGroup>

                    {/* Mail Invitation Feature */}
                    <MailContainer>
                      <CalendarLabel>✉️ SECURE MAIL // 備份傳輸</CalendarLabel>
                      <MailCommandBar>
                        <MailInput
                          type="email"
                          placeholder="輸入 Email 接收正式邀請函"
                          value={email}
                          onChange={handleEmailChange}
                        />
                        {suggestions.length > 0 && (
                          <SuggestionsDropdown>
                            {suggestions.map(s => (
                              <SuggestionItem key={s} onClick={() => selectSuggestion(s)}>
                                {s}
                              </SuggestionItem>
                            ))}
                          </SuggestionsDropdown>
                        )}
                        <MailActionBtn
                          onClick={handleSendMail}
                          disabled={mailStatus !== 'idle'}
                          $status={mailStatus}
                        >
                          {mailStatus === 'sending' ? (
                            <TechLoader />
                          ) : (
                            (mailStatus === 'sent' || mailStatus === 'error') ? `Wait ${cooldown}s` : 'SEND'
                          )}
                        </MailActionBtn>
                      </MailCommandBar>
                    </MailContainer>
                  </CalendarWrapper>

                  <HeroicBtn onClick={resetAndClose}>確認完成</HeroicBtn>
                </>
              ) : (
                <>
                  <SuccessIcon $sentiment="negative">✖</SuccessIcon>
                  <SuccessTitle $sentiment="negative">SIGNAL LOST</SuccessTitle>
                  <SuccessMsg $sentiment="negative">
                    【通訊終止】<br />
                    系統已記錄您的缺席。<br />
                    雖然遺憾，但仍感謝您的遠端祝福。
                  </SuccessMsg>

                  <RedemptionBtn onClick={() => window.open('https://forms.gle/YOUR_GIFT_FORM_URL', '_blank')}>
                    🎁 啟動遠端補給協議 (物資投遞)
                  </RedemptionBtn>

                  <SadBtn onClick={resetAndClose}>關閉終端</SadBtn>
                </>
              )}
            </SuccessInner>
          </SuccessView>
        ) : (
          <ScrollableContent>
            <Header>
              <Title>RSVP 回報協議</Title>
              <SubTitle>DECRYPTED SECURE CHANNEL: LEVEL 4</SubTitle>
            </Header>

            <form onSubmit={handleSubmit}>
              {/* Agent Info Section */}
              <MissionInput
                label="執行特工 (Agent)"
                value={guestName}
                readOnly
                disabled
              />

              <MissionInput
                label="行動代號 (Codename)"
                placeholder="例如：黃昏"
                maxLength={20}
                required
                value={formData.alias}
                onChange={e => setFormData({ ...formData, alias: e.target.value })}
              />

              {/* Status Section */}
              <RadioSection>
                <SectionLabel>行動意願 (Commitment)</SectionLabel>
                <RadioGroup>
                  <RadioLabel $checked={formData.status === 'join'} $sentiment="positive">
                    <input
                      type="radio"
                      name="status"
                      value="join"
                      required
                      checked={formData.status === 'join'}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span>參與登陸</span>
                  </RadioLabel>
                  <RadioLabel $checked={formData.status === 'abort'} $sentiment="negative">
                    <input
                      type="radio"
                      name="status"
                      value="abort"
                      checked={formData.status === 'abort'}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span>遠端祝賀</span>
                  </RadioLabel>
                </RadioGroup>
              </RadioSection>

              {/* Attendance Details */}
              <MissionInput
                label="隸屬單位 (Affiliation / 與新人關係)"
                placeholder="例如：情報部 (大學同學)"
                maxLength={50}
                required
                value={formData.relation}
                onChange={e => setFormData({ ...formData, relation: e.target.value })}
              />

              <Grid>
                <MissionInput
                  label="登陸特工人數 (Adults)"
                  type="number"
                  min={1} max={10}
                  defaultValue="1"
                  required
                  value={formData.adults}
                  onChange={e => setFormData({ ...formData, adults: e.target.value })}
                />
                <MissionInput
                  label="戰術後援人數 (Kids)"
                  type="number"
                  min={0} max={10}
                  placeholder="無則免填"
                  value={formData.kids}
                  onChange={e => setFormData({ ...formData, kids: e.target.value })}
                />
              </Grid>

              <MissionInput
                label="物資特別需求 (Veg Needs / 特殊飲食限制)"
                placeholder="例如：2素/不吃牛/海鮮過敏"
                maxLength={100}
                value={formData.veg}
                onChange={e => setFormData({ ...formData, veg: e.target.value })}
              />

              <SubmitBtn type="submit" disabled={submissionStatus === 'submitting'} style={{ opacity: submissionStatus === 'submitting' ? 0.7 : 1 }}>
                {submissionStatus === 'submitting' ? '加密傳輸中...' : '啟動傳輸'}
              </SubmitBtn>
            </form>
          </ScrollableContent>
        )}
        {submissionStatus !== 'success' && (
          <></> /* Placeholder for non-success views if needed, currently controlled by submissionStatus toggle above */
        )}

        <Toast $visible={!!toastMsg}>{toastMsg}</Toast>
      </FormFrame>
    </Overlay >
  );
};

export default RSVPForm;
