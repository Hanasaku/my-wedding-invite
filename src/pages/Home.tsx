import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';
import StarBackground from '@/components/common/StarBackground';
import HackingTitle from '@/components/common/HackingTitle';
import MissionButton from '@/components/common/MissionButton';

// Animations
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const flicker = keyframes`
  0%, 100% { 
    text-shadow: 0 0 8px ${palette.goldMain}, 0 0 12px ${hexToRGBA(palette.goldMain, 0.4)};
  }
  50% { 
    text-shadow: 0 0 2px ${palette.goldMain}, 0 0 4px ${hexToRGBA(palette.goldMain, 0.2)};
  }
`;

const particleFly = keyframes`
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(360deg); opacity: 0; }
`;

// Styled Components
const Container = styled.div`
  background-color: ${palette.bgPrimary};
  color: ${palette.textPrimary};
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  font-family: ${palette.fontTech};
  position: relative;
`;

const Scanlines = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom, 
    ${palette.transparent} 0%, 
    ${palette.transparent} 50%, 
    ${hexToRGBA(palette.black, 0.2)} 50%, 
    ${hexToRGBA(palette.black, 0.2)} 100%
  );
  background-size: 100% 4px;
  z-index: 5;
  pointer-events: none;
`;

const Card = styled.div`
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 440px;
  padding: 3rem 2rem;
  background: ${palette.bgCard};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.2)};
  box-shadow: 0 0 40px ${hexToRGBA(palette.black, 0.8)};
  text-align: center;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid ${palette.goldMain};
    transition: all 0.5s ease;
  }

  &::before {
    top: -5px;
    left: -5px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: -5px;
    right: -5px;
    border-left: none;
    border-top: none;
  }

  @media (max-width: 600px) {
    padding: 2rem 1.5rem;
  }
`;

const TopLabel = styled.div`
  color: ${palette.goldMain};
  font-size: 0.8rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 10px;
`;

const InputWrapper = styled.div<{ active: boolean; error: boolean }>`
  position: relative;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props =>
    props.error ? palette.accentError :
      (props.active ? palette.goldMain : hexToRGBA(palette.white, 0.3))
  };
  box-shadow: ${props => props.active ? `0 5px 15px -10px ${hexToRGBA(palette.goldMain, 0.5)}` : 'none'};
  transition: 0.3s;
  animation: ${props => props.error ? shake : 'none'} 0.3s ease-in-out;
`;

const StyledInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: ${palette.goldBright}; 
  font-family: ${palette.fontTech};
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  padding: 12px;
  outline: none;
  letter-spacing: 4px;
  text-transform: uppercase;
  animation: ${flicker} 3s infinite ease-in-out;

  &::placeholder {
    color: ${hexToRGBA(palette.white, 0.2)};
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: none;
    text-shadow: none;
    animation: none;
    font-weight: 400;
  }
`;

const StatusMsg = styled.div<{ visible: boolean; isError?: boolean }>`
  margin-top: 1.5rem;
  height: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: ${props => props.isError ? palette.accentError : palette.goldBright};
  text-shadow: ${props => props.isError ? 'none' : `0 0 10px ${palette.goldMain}`};
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateY(${props => props.visible ? '0' : '10px'});
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  text-transform: uppercase;
  animation: ${props => props.visible && !props.isError ? flicker : 'none'} 2s infinite ease-in-out;
`;

const FooterId = styled.div`
  margin-top: 25px;
  font-size: 0.6rem;
  opacity: 0.4;
  letter-spacing: 2px;
`;

const Particle = styled.div<{ x: number; y: number; tx: string; ty: string; size: number; color: string }>`
  position: absolute;
  left: calc(50% + ${props => props.x}px);
  top: calc(50% + ${props => props.y}px);
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 0 10px ${props => props.color};
  --tx: ${props => props.tx};
  --ty: ${props => props.ty};
  animation: ${particleFly} 1s ease-out forwards;
`;

// Logic Component
const Home: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ visible: false, text: '' });
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: string; ty: string; size: number; color: string }[]>([]);

  const createParticles = (xOffset: number) => {
    const newParticles = Array.from({ length: 8 }).map(() => ({
      id: Math.random(),
      x: xOffset,
      y: 0,
      tx: `${(Math.random() - 0.5) * 100}px`,
      ty: `${(Math.random() - 0.5) * 80 - 10}px`,
      size: Math.random() * 3 + 2,
      color: Math.random() > 0.4 ? palette.goldBright : palette.white
    }));
    setParticles(prev => [...prev.slice(-16), ...newParticles]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length < code.length) {
      const charWidth = 14;
      const totalWidth = code.length * charWidth;
      const xOffset = (totalWidth / 2) - charWidth;
      createParticles(xOffset);
    }
    if (hasError) {
      setHasError(false);
      setStatus(prev => ({ ...prev, visible: false }));
    }
    setCode(val);
  };

  const handleEngage = async () => {
    if (!code.trim()) {
      setHasError(true);
      return;
    }

    setLoading(true);
    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const guests = (await import('@/assets/guests.json')).default;
      const guest = guests.find((g: any) => g.code.toUpperCase() === code.toUpperCase());

      setTimeout(() => {
        setLoading(false);
        if (guest) {
          setIsSuccess(true);
          setHasError(false);
          setStatus({
            visible: true,
            text: `IDENTITY CONFIRMED. WELCOME, ${guest.name.toUpperCase()}.`
          });
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
          setHasError(true);
          setStatus({ visible: true, text: 'INVALID ACCESS CODE. TRY AGAIN.' });
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to load guest list", error);
      setLoading(false);
    }
  };

  return (
    <Container>
      <StarBackground />
      <Scanlines />

      <Card>
        <TopLabel>Private Access Only</TopLabel>
        <HackingTitle finalTitle={"Mission:\nMemories with Us"} />

        <InputWrapper active={isFocused} error={hasError}>
          {particles.map(p => (
            <Particle key={p.id} x={p.x} y={p.y} tx={p.tx} ty={p.ty} size={p.size} color={p.color} />
          ))}
          <StyledInput
            placeholder="Enter Access Code"
            value={code}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleEngage()}
            maxLength={12}
            autoFocus
          />
        </InputWrapper>

        <MissionButton
          onClick={handleEngage}
          disabled={loading || isSuccess}
          isSuccess={isSuccess}
        >
          {loading ? 'Decrypting...' : (isSuccess ? 'Access Granted' : 'ACCESS')}
        </MissionButton>

        <StatusMsg visible={status.visible} isError={hasError}>{status.text}</StatusMsg>

        <FooterId>Encryption: AES-256 | STATUS: COMMITTED</FooterId>
      </Card>
    </Container>
  );
};

export default Home;
