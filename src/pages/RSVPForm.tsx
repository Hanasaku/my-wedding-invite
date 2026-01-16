import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

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
  &::before { top: 12px; left: 12px; border-right: none; border-bottom: none; }
  &::after { bottom: 12px; right: 12px; border-left: none; border-top: none; }
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
  
  @media (max-width: 480px) {
    padding: 30px 20px;
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
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: ${hexToRGBA(palette.goldMain, 0.5)};
  cursor: pointer;
  z-index: 20;
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

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Label = styled.label`
  display: block;
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

const InputWrapper = styled.div`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0%;
    height: 1px;
    background: ${palette.goldBright};
    transition: width 0.4s ease;
    box-shadow: 0 0 10px ${palette.goldMain};
  }

  &:focus-within::after {
    width: 100%;
  }
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 2px; // Classic tech look
  padding: 12px 14px;
  font-family: ${palette.fontTech};
  font-size: 1.05rem;
  color: ${palette.white};
  outline: none;
  transition: all 0.3s ease;
  letter-spacing: 1px;

  &::placeholder {
    color: rgba(255,255,255,0.2);
    font-style: italic;
    font-size: 0.9rem;
  }

  &:focus {
    background: rgba(255,255,255,0.06);
    border-color: ${hexToRGBA(palette.goldMain, 0.4)};
  }

  &:disabled {
    opacity: 0.5;
    background: transparent;
    border-style: dotted;
    color: ${palette.goldMuted};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

// --- Additional Colors for Emotional Feedback ---
const emotionalColors = {
  active: palette.goldMain,
  distant: '#607d8b', // Steel Blue Grey - Cold, detached, disappointed
  distantDim: 'rgba(96, 125, 139, 0.1)',
  distantBorder: 'rgba(96, 125, 139, 0.3)'
};

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  padding: 40px;
  animation: ${entryReveal} 0.5s ease-out;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const SuccessIcon = styled.div<{ $sentiment: 'positive' | 'negative' }>`
  font-size: ${props => props.$sentiment === 'positive' ? '6rem' : '4rem'};
  color: ${props => props.$sentiment === 'positive' ? palette.goldMain : emotionalColors.distant};
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
`;

const SuccessTitle = styled.h3<{ $sentiment: 'positive' | 'negative' }>`
  font-family: ${palette.fontClassy};
  color: ${props => props.$sentiment === 'positive' ? palette.goldMain : emotionalColors.distant};
  font-size: ${props => props.$sentiment === 'positive' ? '2.2rem' : '1.5rem'};
  margin-bottom: 15px;
  letter-spacing: ${props => props.$sentiment === 'positive' ? '5px' : '2px'};
  text-transform: uppercase;
  border-bottom: 2px solid ${props => props.$sentiment === 'positive' ? hexToRGBA(palette.goldMain, 0.5) : emotionalColors.distantBorder};
  padding-bottom: 10px;
  display: inline-block;
  
  animation: ${props => props.$sentiment === 'positive'
    ? css`${fadeIn} 0.5s ease-out 0.2s both`
    : css`${sadEntry} 1s ease-out 0.2s both`};
`;

const SuccessMsg = styled.p<{ $sentiment?: 'positive' | 'negative' }>`
  font-family: ${palette.fontTech};
  color: ${props => props.$sentiment === 'negative' ? emotionalColors.distant : hexToRGBA(palette.white, 0.9)};
  line-height: 1.8;
  margin-bottom: 40px;
  font-size: 1rem;
  max-width: 80%;
  animation: ${fadeIn} 0.8s ease-out 0.4s both;
`;

const HeroicBtn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, ${palette.goldMain} 0%, ${palette.goldBright} 100%);
  color: ${palette.bgPrimary};
  border: none;
  padding: 18px;
  font-family: ${palette.fontTech};
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px ${hexToRGBA(palette.goldMain, 0.4)};
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  animation: ${fadeIn} 0.5s ease-out 0.6s both;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 50px ${hexToRGBA(palette.goldMain, 0.6)};
    filter: brightness(1.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.8), transparent);
    transform: rotate(45deg) translateY(-100%);
    animation: ${shiny} 3s infinite;
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
  border: 1px solid ${emotionalColors.distantBorder};
  color: ${emotionalColors.distant};
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
    background: ${emotionalColors.distantDim};
    /* Intentionally boring interactions */
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
  cursor: pointer;
  position: relative;
  
  /* Dynamic Color Logic */
  border: 1px solid ${props => props.$checked
    ? (props.$sentiment === 'negative' ? emotionalColors.distantBorder : palette.goldMain)
    : 'rgba(255,255,255,0.1)'
  };
  
  background: ${props => props.$checked
    ? (props.$sentiment === 'negative' ? emotionalColors.distantDim : hexToRGBA(palette.goldMain, 0.1))
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
    border-color: ${props => props.$sentiment === 'negative' ? emotionalColors.distant : hexToRGBA(palette.goldMain, 0.5)};
    background: ${props => props.$sentiment === 'negative' ? emotionalColors.distantDim : hexToRGBA(palette.goldMain, 0.05)};
  }

  input {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid ${props => props.$checked
    ? (props.$sentiment === 'negative' ? emotionalColors.distant : palette.goldBright)
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
      background: ${props => props.$sentiment === 'negative' ? emotionalColors.distant : palette.goldBright};
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
    ? (props.$sentiment === 'negative' ? emotionalColors.distant : palette.white)
    : hexToRGBA(palette.white, 0.7)
  };
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 1px;
    transition: color 0.3s;
  }
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

interface RSVPFormProps {
  guestName: string;
  onClose: () => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ guestName, onClose }) => {
  const initialFormState = {
    alias: '',
    status: '',
    relation: '',
    adults: '1',
    kids: '0',
    veg: '0'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [showReconsiderModal, setShowReconsiderModal] = useState(false);

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
    setSubmissionStatus('idle');
    onClose();
  };

  const proceedToSubmit = () => {
    setSubmissionStatus('submitting');
    const cleanData = {
      ...formData,
      alias: sanitizeInput(formData.alias),
      relation: sanitizeInput(formData.relation),
      veg: sanitizeInput(formData.veg)
    };

    // Simulate encrypted transmission delay
    setTimeout(() => {
      console.log("[PROTOCOL] Secure Data Transmitting...", cleanData);
      setSubmissionStatus('success');
      // Auto close after showing success message for a few seconds? 
      // User might want to read it, so providing a close button in success view is better.
    }, 1500);
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
    setFormData({ ...formData, status: 'deploy' });
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
                <button
                  type="button"
                  onClick={handleConfirmAbort}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${emotionalColors.distant}`,
                    color: emotionalColors.distant,
                    padding: '12px',
                    fontFamily: palette.fontTech,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '5px'
                  }}
                >
                  確認維持遠端
                </button>
              </ModalActionGroup>
            </ModalCard>
          </ModalOverlay>
        )}

        {submissionStatus === 'success' ? (
          <SuccessView>
            {formData.status === 'deploy' ? (
              <>
                <SuccessIcon $sentiment="positive">✦</SuccessIcon>
                <SuccessTitle $sentiment="positive">MISSION CONFIRMED</SuccessTitle>
                <SuccessMsg>
                  【傳輸成功】<br />
                  回報數據已加密並送達總部。<br />
                  我們期待與您在現場會合。
                </SuccessMsg>
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
                  🎁 開啟補給 (禮到人不到)
                </RedemptionBtn>

                <SadBtn onClick={resetAndClose}>關閉終端</SadBtn>
              </>
            )}
          </SuccessView>
        ) : (
          <ScrollableContent>
            <Header>
              <Title>RSVP 回報協議</Title>
              <SubTitle>DECRYPTED SECURE CHANNEL: LEVEL 4</SubTitle>
            </Header>

            <form onSubmit={handleSubmit}>
              {/* Agent Info Section */}
              <FormGroup>
                <Label>執行特工 (Agent)</Label>
                <Input value={guestName} readOnly disabled />
              </FormGroup>

              <FormGroup>
                <Label>行動代號 (Codename)</Label>
                <InputWrapper>
                  <Input
                    placeholder="例如：黃昏"
                    maxLength={20}
                    required
                    onFocus={handleInputFocus}
                    onChange={e => setFormData({ ...formData, alias: e.target.value })}
                  />
                </InputWrapper>
              </FormGroup>

              {/* Status Section */}
              <FormGroup>
                <Label>行動意願 (Commitment)</Label>
                <RadioGroup>
                  <RadioLabel $checked={formData.status === 'deploy'} $sentiment="positive">
                    <input
                      type="radio"
                      name="status"
                      value="deploy"
                      required
                      checked={formData.status === 'deploy'}
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
              </FormGroup>

              {/* Attendance Details */}
              <FormGroup>
                <Label>隸屬單位 (Affiliation / 與新人關係)</Label>
                <InputWrapper>
                  <Input
                    placeholder="例如：情報部 (大學同學)"
                    maxLength={50}
                    required
                    onFocus={handleInputFocus}
                    onChange={e => setFormData({ ...formData, relation: e.target.value })}
                  />
                </InputWrapper>
              </FormGroup>

              <Grid>
                <FormGroup>
                  <Label>登陸特工人數 (Adults)</Label>
                  <InputWrapper>
                    <Input
                      type="number" min="1" max="10"
                      defaultValue="1"
                      required
                      onFocus={handleInputFocus}
                      onChange={e => setFormData({ ...formData, adults: e.target.value })}
                    />
                  </InputWrapper>
                </FormGroup>
                <FormGroup>
                  <Label>戰術後援人數 (Kids)</Label>
                  <InputWrapper>
                    <Input
                      type="number" min="0" max="10"
                      placeholder="無則免填"
                      onFocus={handleInputFocus}
                      onChange={e => setFormData({ ...formData, kids: e.target.value })}
                    />
                  </InputWrapper>
                </FormGroup>
              </Grid>

              <FormGroup>
                <Label>物資特別需求 (Veg Needs / 特殊飲食限制)</Label>
                <InputWrapper>
                  <Input
                    placeholder="例如：2素/不吃牛/海鮮過敏"
                    maxLength={100}
                    onFocus={handleInputFocus}
                    onChange={e => setFormData({ ...formData, veg: e.target.value })}
                  />
                </InputWrapper>
              </FormGroup>

              <SubmitBtn type="submit" disabled={submissionStatus === 'submitting'} style={{ opacity: submissionStatus === 'submitting' ? 0.7 : 1 }}>
                {submissionStatus === 'submitting' ? '加密傳輸中...' : '啟動傳輸'}
              </SubmitBtn>
            </form>
          </ScrollableContent>
        )}
      </FormFrame>
    </Overlay>
  );
};

export default RSVPForm;
