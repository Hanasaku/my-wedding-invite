import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { palette } from '@/assets/styles/palette';
import StarBackground from '@/components/common/StarBackground';
import HackingTitle from '@/components/common/HackingTitle';
import MissionButton from '@/components/common/MissionButton';

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
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.2) 100%);
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
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
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
  border-bottom: 1px solid ${props => props.error ? palette.accentError : (props.active ? palette.goldMain : 'rgba(255, 255, 255, 0.3)')};
  box-shadow: ${props => props.active ? `0 5px 15px -10px rgba(212, 175, 55, 0.5)` : 'none'};
  transition: 0.3s;
`;

const StyledInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: ${palette.goldMain};
  font-family: ${palette.fontTech};
  font-size: 1.5rem;
  text-align: center;
  padding: 10px;
  outline: none;
  letter-spacing: 3px;
  text-transform: uppercase;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
    font-size: 1rem;
    letter-spacing: 1px;
  }
`;

const StatusMsg = styled.div<{ visible: boolean }>`
  margin-top: 1rem;
  height: 20px;
  font-size: 0.9rem;
  color: ${palette.accentSuccess};
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s;
`;

const FooterId = styled.div`
  margin-top: 25px;
  font-size: 0.6rem;
  opacity: 0.4;
  letter-spacing: 2px;
`;

const Home: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ visible: false, text: '' });
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEngage = () => {
    if (!code.trim()) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    setLoading(true);
    if (navigator.vibrate) navigator.vibrate(50);

    // Simulate Decryption
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      setStatus({ visible: true, text: 'IDENTITY CONFIRMED. WELCOME AGENT.' });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 1500);
  };

  return (
    <Container>
      <StarBackground />
      <Scanlines />

      <Card>
        <TopLabel>Confidential Assignment</TopLabel>
        <HackingTitle finalTitle="Protocol: The Vow" />

        <InputWrapper active={isFocused} error={hasError}>
          <StyledInput
            placeholder="Agent Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={8}
          />
        </InputWrapper>

        <MissionButton
          onClick={handleEngage}
          disabled={loading || isSuccess}
          isSuccess={isSuccess}
        >
          {loading ? 'Decrypting...' : (isSuccess ? 'Access Granted' : 'Engage Protocol')}
        </MissionButton>

        <StatusMsg visible={status.visible}>{status.text}</StatusMsg>

        <FooterId>Encryption: AES-256 | SIG: 007-SF</FooterId>
      </Card>
    </Container>
  );
};

export default Home;
