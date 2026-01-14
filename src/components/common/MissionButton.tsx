import React from 'react';
import styled, { keyframes } from 'styled-components';
import { palette } from '@/assets/styles/palette';

const scanline = keyframes`
  0% { left: -100%; }
  100% { left: 150%; }
`;

interface StyledButtonProps {
    isSuccess?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  background: ${props => props.isSuccess ? palette.goldMain : 'rgba(212, 175, 55, 0.1)'};
  border: 1px solid ${palette.goldMain};
  color: ${props => props.isSuccess ? '#000' : palette.goldMain};
  padding: 15px 40px;
  font-family: ${palette.fontTech};
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  outline: none;

  &:hover {
    background: ${palette.goldMain};
    color: #000;
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);

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
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: skewX(-20deg);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

interface MissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isSuccess?: boolean;
}

const MissionButton: React.FC<MissionButtonProps> = ({ children, isSuccess, ...props }) => {
    return (
        <StyledButton isSuccess={isSuccess} {...props}>
            {children}
        </StyledButton>
    );
};

export default MissionButton;
