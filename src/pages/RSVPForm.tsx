import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

// --- 魔法科技動畫 (哈利波特捲軸展開感) ---
const scrollUnfold = keyframes`
  0% { 
    transform: scaleY(0); 
    opacity: 0; 
    filter: brightness(2) blur(10px);
  }
  60% { 
    transform: scaleY(1.02); 
    opacity: 1; 
    filter: brightness(1.5) blur(2px);
  }
  100% { 
    transform: scaleY(1); 
    opacity: 1; 
    filter: brightness(1) blur(0);
  }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px ${hexToRGBA(palette.goldMain, 0.2)}; }
  50% { box-shadow: 0 0 40px ${hexToRGBA(palette.goldMain, 0.4)}; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.9);
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
  max-width: 550px;
  max-height: 85vh;
  background: ${hexToRGBA(palette.bgPrimary, 0.95)};
  border: 1px solid ${palette.goldMain};
  position: relative;
  display: flex;
  flex-direction: column;
  transform-origin: center;
  animation: ${scrollUnfold} 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  box-shadow: 0 0 50px ${hexToRGBA(palette.black, 1)};
  overflow: hidden; /* Contains the scrollable area */

  /* Top/Bottom Gold Lines - Fixed to Frame */
  &::before, &::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 4px;
    background: ${palette.goldMain};
    box-shadow: 0 0 15px ${palette.goldMain};
    z-index: 20;
    pointer-events: none;
  }
  &::before { top: 0; }
  &::after { bottom: 0; }
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px 25px;
  -webkit-overflow-scrolling: touch;
  
  /* Scrollbar Styling */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${palette.goldMain}; border-radius: 2px; }

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hexToRGBA(palette.goldMain, 0.8)};
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 50;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  transition: 0.3s;

  &:hover { 
    color: ${palette.white}; 
    background: ${palette.goldMain};
    border-color: ${palette.goldMain};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 25px;
  border-bottom: 1px double ${hexToRGBA(palette.goldMain, 0.3)};
  padding-bottom: 15px;
  margin-top: 10px;
`;

const Title = styled.h2`
  font-family: ${palette.fontTech};
  color: ${palette.goldMain};
  font-size: clamp(1.4rem, 5vw, 1.8rem);
  letter-spacing: 4px;
  text-transform: uppercase;
  margin: 0;
`;

const SubTitle = styled.div`
  color: ${palette.accentError};
  font-size: 0.65rem;
  letter-spacing: 2px;
  margin-top: 5px;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: ${palette.fontTech};
  font-size: 0.8rem;
  color: ${palette.goldMain};
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
`;

const Input = styled.input`
  background: ${hexToRGBA(palette.white, 0.05)};
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  padding: 14px 12px;
  color: ${palette.white};
  font-family: ${palette.fontTech};
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
  width: 100%;

  &:focus {
    border-color: ${palette.goldMain};
    background: ${hexToRGBA(palette.goldMain, 0.1)};
  }

  &:disabled {
    opacity: 0.6;
    background: rgba(255, 255, 255, 0.02);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 5px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${palette.white};
  font-size: 0.9rem;
  padding: 8px 0;

  input {
    accent-color: ${palette.goldMain};
    width: 20px;
    height: 20px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
  background: ${palette.goldMain};
  color: ${palette.black};
  border: none;
  font-family: ${palette.fontTech};
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s;
  animation: ${glowPulse} 2s infinite ease-in-out;

  &:hover {
    background: ${palette.goldBright};
    transform: translateY(-2px);
    box-shadow: 0 0 30px ${palette.goldMain};
  }

  &:active {
    transform: translateY(0);
  }
`;

interface RSVPFormProps {
  guestName: string;
  onClose: () => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ guestName, onClose }) => {

  const [formData, setFormData] = useState({
    alias: '',
    status: '',
    relation: '',
    adults: '1',
    kids: '0',
    veg: '0',
    logistics: ''
  });

  // Security Protocol: Lock Environment (Disable Background Scroll)
  React.useEffect(() => {
    // Lock both body and html to ensure no background scroll on mobile/desktop
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
  const sanitizeInput = (str: string) => {
    return str.replace(/[<>]/g, '').trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize Payload
    const cleanData = {
      ...formData,
      alias: sanitizeInput(formData.alias),
      relation: sanitizeInput(formData.relation),
      veg: sanitizeInput(formData.veg)
    };

    console.log("[PROTOCOL] Secure Data Transmitting...", cleanData);
    alert("【傳輸成功】回報已加密送往總部。");
    onClose();
  };

  return (
    <Overlay>
      <FormFrame>
        <CloseIcon onClick={onClose}>✕</CloseIcon>

        <ScrollableContent>
          <Header>
            <Title>RSVP 回報協議</Title>
            <SubTitle>DECRYPTED SECURE CHANNEL: LEVEL 4</SubTitle>
          </Header>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>執行特工 (Agent)</Label>
              <Input value={guestName} readOnly disabled />
            </FormGroup>

            <FormGroup>
              <Label>行動代號 (Codename)</Label>
              <Input
                placeholder="例如：黃昏"
                maxLength={20}
                onChange={e => setFormData({ ...formData, alias: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>行動意願 (Commitment)</Label>
              <RadioGroup>
                <RadioLabel>
                  <input type="radio" name="status" value="deploy" required onChange={e => setFormData({ ...formData, status: e.target.value })} /> 參與登陸
                </RadioLabel>
                <RadioLabel>
                  <input type="radio" name="status" value="abort" onChange={e => setFormData({ ...formData, status: e.target.value })} /> 遠端祝賀
                </RadioLabel>
              </RadioGroup>
            </FormGroup>

            <FormGroup>
              <Label>隸屬單位 (Relations)</Label>
              <Input
                placeholder="例如：情報部 (大學同學)"
                maxLength={50}
                onChange={e => setFormData({ ...formData, relation: e.target.value })}
              />
            </FormGroup>

            <Grid>
              <FormGroup>
                <Label>登陸特工人數 (Adults)</Label>
                <Input
                  type="number" min="0" max="10"
                  defaultValue="1"
                  onChange={e => setFormData({ ...formData, adults: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>戰術後援人數 (Kids)</Label>
                <Input
                  type="number" min="0" max="10"
                  placeholder="無則免填"
                  onChange={e => setFormData({ ...formData, kids: e.target.value })}
                />
              </FormGroup>
            </Grid>

            <FormGroup>
              <Label>特殊補給需求 (Veg / Needs)</Label>
              <Input
                placeholder="例如：2位素食 / 海鮮過敏"
                maxLength={100}
                onChange={e => setFormData({ ...formData, veg: e.target.value })}
              />
            </FormGroup>

            <SubmitBtn type="submit">
              執行回報傳輸
            </SubmitBtn>
          </form>
        </ScrollableContent>
      </FormFrame>
    </Overlay>
  );
};

export default RSVPForm;
