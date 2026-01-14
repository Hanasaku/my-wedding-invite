import React from 'react';
import styled, { keyframes } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

const scanline = keyframes`
  0% { left: -100%; }
  100% { left: 150%; }
`;

interface StyledButtonProps {
  isSuccess?: boolean;
  isActive?: boolean;
  isError?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  background: ${props => {
    if (props.isSuccess) return palette.goldMain;
    if (props.isError) return hexToRGBA(palette.accentError, 0.15);
    if (props.isActive) return hexToRGBA(palette.goldMain, 0.25);
    return hexToRGBA(palette.goldMain, 0.1);
  }};
  border: 1px solid ${props => {
    if (props.isSuccess) return palette.goldMain;
    if (props.isError) return palette.accentError;
    if (props.isActive) return palette.goldMain;
    return hexToRGBA(palette.goldMain, 0.3);
  }};
  color: ${props => {
    if (props.isSuccess) return palette.black;
    if (props.isError) return palette.accentError;
    return palette.goldMain;
  }};
  box-shadow: ${props => {
    if (props.isSuccess) return `0 0 50px ${hexToRGBA(palette.goldMain, 0.7)}, 0 0 20px ${hexToRGBA(palette.goldBright, 0.4)}`;
    if (props.isError) return `0 0 15px ${hexToRGBA(palette.accentError, 0.1)}`;
    if (props.isActive) return `0 0 20px ${hexToRGBA(palette.goldMain, 0.2)}`;
    return 'none';
  }};
  padding: 15px 40px;
  font-family: ${palette.fontTech};
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  outline: none;

  &:hover {
    background: ${props => {
    if (props.isSuccess) return palette.goldMain;
    if (props.isError) return palette.accentError;
    return palette.goldMain;
  }};
    color: ${palette.black};
    box-shadow: 0 0 20px ${props => props.isError ? hexToRGBA(palette.accentError, 0.6) : hexToRGBA(palette.goldMain, 0.6)};

    &::before {
      animation: ${scanline} 0.7s forwards;
    }
  }

  &:active {
    transform: scale(0.98);
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
  }

  &:disabled {
    opacity: ${props => props.isSuccess ? 1 : 0.7};
    cursor: ${props => props.isSuccess ? 'default' : 'not-allowed'};
  }
`;

interface MissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isSuccess?: boolean;
  isActive?: boolean;
  isError?: boolean;
}

const MissionButton: React.FC<MissionButtonProps> = ({ children, isSuccess, isActive, isError, ...props }) => {
  return (
    <StyledButton isSuccess={isSuccess} isActive={isActive} isError={isError} {...props}>
      {children}
    </StyledButton>
  );
};

export default MissionButton;
