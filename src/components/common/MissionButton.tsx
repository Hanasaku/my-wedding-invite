import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

const scanline = keyframes`
  0% { left: -100%; }
  100% { left: 150%; }
`;

const buttonShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
`;

// Subtle pulsing energy for processing state
const energyPulse = keyframes`
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.1); }
`;

interface StyledButtonProps {
  $isSuccess?: boolean;
  $isActive?: boolean;
  $isError?: boolean;
  $isClicked?: boolean;
  $isProcessing?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  background: ${props => {
    if (props.$isSuccess) return palette.goldMain;
    if (props.$isProcessing) return palette.goldMuted;
    if (props.$isClicked) return palette.goldMain;
    if (props.$isError) return hexToRGBA(palette.accentError, 0.15);
    if (props.$isActive) return hexToRGBA(palette.goldMain, 0.35);
    return hexToRGBA(palette.goldMain, 0.05);
  }};
  border: 1px solid ${props => {
    if (props.$isSuccess) return palette.goldMain;
    if (props.$isProcessing) return palette.goldMutedLight;
    if (props.$isClicked) return palette.goldMain;
    if (props.$isError) return palette.accentError;
    if (props.$isActive) return palette.goldMain;
    return hexToRGBA(palette.goldMain, 0.2);
  }};
  color: ${props => {
    if (props.$isSuccess || props.$isClicked || props.$isProcessing) return palette.black;
    if (props.$isError) return palette.accentError;
    return palette.goldMain;
  }};
  box-shadow: ${props => {
    if (props.$isSuccess) return `0 0 50px ${hexToRGBA(palette.goldMain, 0.7)}, 0 0 20px ${hexToRGBA(palette.goldBright, 0.4)}`;
    if (props.$isProcessing) return `0 0 20px ${hexToRGBA(palette.goldMuted, 0.4)}`;
    if (props.$isClicked) return `0 0 30px ${hexToRGBA(palette.goldMain, 0.4)}`;
    return 'none';
  }};
  padding: 15px 40px;
  font-family: ${palette.fontTech};
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: ${props => (props.$isSuccess || props.$isError) ? 'default' : (props.$isActive ? 'pointer' : 'not-allowed')};
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  outline: none;

  ${props => props.$isError && css`
    animation: ${buttonShake} 0.4s ease-in-out;
  `}

  ${props => props.$isProcessing && css`
    animation: ${energyPulse} 2s infinite ease-in-out;
  `}

  &:hover {
    ${props => props.$isActive && !props.$isSuccess && !props.$isError && !props.disabled && css`
      background: ${palette.goldMain};
      color: ${palette.black};
      box-shadow: 0 0 20px ${hexToRGBA(palette.goldMain, 0.3)};

      &::before {
        animation: ${scanline} 0.7s forwards;
      }
    `}
  }

  &:active {
    ${props => props.$isActive && !props.$isSuccess && !props.$isError && !props.disabled && css`
      transform: scale(0.98);
    `}
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, ${palette.transparent}, ${hexToRGBA(palette.white, 0.4)}, ${palette.transparent});
    transform: skewX(-20deg);
    display: ${props => props.$isProcessing ? 'block' : (props.$isActive ? 'block' : 'none')};
    opacity: ${props => props.$isProcessing ? 0.2 : 1};
  }

  &:disabled {
    opacity: ${props => (props.$isSuccess || props.$isError || props.$isActive || props.$isClicked || props.$isProcessing) ? 1 : 0.6};
  }
`;

interface MissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isSuccess?: boolean;
  isActive?: boolean;
  isError?: boolean;
  isClicked?: boolean;
  isProcessing?: boolean;
}

const MissionButton: React.FC<MissionButtonProps> = ({ children, isSuccess, isActive, isError, isClicked, isProcessing, ...props }) => {
  return (
    <StyledButton
      $isSuccess={isSuccess}
      $isActive={isActive}
      $isError={isError}
      $isClicked={isClicked}
      $isProcessing={isProcessing}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default MissionButton;
