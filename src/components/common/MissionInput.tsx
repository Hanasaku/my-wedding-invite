import React from 'react';
import styled from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

interface MissionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    subLabel?: string;
    containerStyle?: React.CSSProperties;
}

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

const StyledInput = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 2px;
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

const MissionInput: React.FC<MissionInputProps> = ({
    label,
    subLabel,
    containerStyle,
    onFocus,
    ...props
}) => {
    // 內建的 auto-scroll logic
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (onFocus) onFocus(e);
        // 延遲滾動以避免鍵盤遮擋
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    return (
        <FormGroup style={containerStyle}>
            <Label>
                {label}
                {subLabel && <span style={{ opacity: 0.5, fontSize: '0.7em' }}>{subLabel}</span>}
            </Label>
            <InputWrapper>
                <StyledInput
                    onFocus={handleFocus}
                    {...props}
                />
            </InputWrapper>
        </FormGroup>
    );
};

export default MissionInput;
