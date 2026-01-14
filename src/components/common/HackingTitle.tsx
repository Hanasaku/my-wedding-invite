import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { palette } from '@/assets/styles/palette';

const Title = styled.h1`
  font-family: ${palette.fontClassy};
  font-size: 2.2rem;
  color: ${palette.textPrimary};
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  min-height: 2.5rem;
  margin-bottom: 2.5rem;
  background: linear-gradient(to bottom, #fff 0%, ${palette.goldMain} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));

  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

interface HackingTitleProps {
    finalTitle: string;
}

const HackingTitle: React.FC<HackingTitleProps> = ({ finalTitle }) => {
    const [displayText, setDisplayText] = useState('');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(
                finalTitle
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return finalTitle[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= finalTitle.length) {
                clearInterval(interval);
            }
            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [finalTitle]);

    return <Title>{displayText}</Title>;
};

export default HackingTitle;
