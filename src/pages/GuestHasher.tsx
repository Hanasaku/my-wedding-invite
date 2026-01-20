import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { palette } from '@/assets/styles/palette';
import { useCrypto } from '@/hooks/useCrypto';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const PageWrapper = styled.div<{ $isLight: boolean }>`
  --t-bg: ${props => props.$isLight ? palette.tool.light.bg : palette.tool.dark.bg};
  --t-card: ${props => props.$isLight ? palette.tool.light.card : palette.tool.dark.card};
  --t-primary: ${props => props.$isLight ? palette.tool.light.primary : palette.tool.dark.primary};
  --t-accent: ${props => props.$isLight ? palette.tool.light.accent : palette.tool.dark.accent};
  --t-text: ${props => props.$isLight ? palette.tool.light.text : palette.tool.dark.text};
  --t-muted: ${props => props.$isLight ? palette.tool.light.muted : palette.tool.dark.muted};
  --t-border: ${props => props.$isLight ? palette.tool.light.border : palette.tool.dark.border};
  --t-shadow: ${props => props.$isLight ? 'rgba(107, 142, 107, 0.08)' : 'rgba(0, 0, 0, 0.4)'};
  --t-input-bg: ${props => props.$isLight ? '#fafbfb' : '#141814'};
  --t-row-bg: ${props => props.$isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'};
  --t-row-hover: ${props => props.$isLight ? '#f9fbf9' : 'rgba(255, 255, 255, 0.05)'};
  --t-btn-text: ${props => props.$isLight ? '#ffffff' : '#121612'};

  background-color: var(--t-bg);
  color: var(--t-text);
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Noto Sans TC', sans-serif;
  transition: background-color 0.4s, color 0.4s;
`;

const Container = styled.div`
  max-width: 900px;
  width: 100%;
  background: var(--t-card);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px var(--t-shadow);
  border: 1px solid var(--t-border);
  position: relative;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--t-input-bg);
  border: 1px solid var(--t-border);
  color: var(--t-primary);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
  
  &:hover {
    transform: rotate(15deg) scale(1.1);
    border-color: var(--t-primary);
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  color: var(--t-primary);
  margin: 0;
  letter-spacing: 1px;
  font-size: 2.2rem;
  text-shadow: 0 0 15px ${props => props.theme === 'dark' ? 'rgba(136, 176, 145, 0.2)' : 'none'};
`;

const Tagline = styled.div`
  color: var(--t-muted);
  font-size: 0.95rem;
  margin-top: 8px;
`;

const InputSection = styled.div`
  background: var(--t-input-bg);
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--t-border);
  margin-bottom: 30px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--t-primary);
  font-size: 0.9rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 180px;
  background: var(--t-card);
  border: 1.5px solid var(--t-border);
  border-radius: 12px;
  color: var(--t-text);
  padding: 18px;
  font-size: 1rem;
  resize: none;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: var(--t-primary);
    box-shadow: 0 0 0 4px ${props => props.theme === 'dark' ? 'rgba(136, 176, 145, 0.2)' : 'rgba(107, 142, 107, 0.15)'};
  }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ActionBtn = styled.button<{ $primary?: boolean }>`
  padding: 14px 30px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  ${props => props.$primary ? css`
    background-color: var(--t-primary);
    color: var(--t-btn-text);
    box-shadow: 0 4px 15px var(--t-shadow);
    &:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }
  ` : css`
    background-color: var(--t-accent);
    color: #121612;
    border: 1.5px solid var(--t-accent);
    box-shadow: 0 4px 15px rgba(212, 163, 115, 0.2);
    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 163, 115, 0.3);
    }
  `}
`;

const ResultArea = styled.div`
  margin-top: 40px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-top: 10px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 20px;
  color: var(--t-muted);
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 16px 20px;
  background: var(--t-row-bg);
  border-top: 1px solid var(--t-border);
  border-bottom: 1px solid var(--t-border);

  &:first-child { border-left: 1px solid var(--border); border-radius: 12px 0 0 12px; }
  &:last-child { border-right: 1px solid var(--border); border-radius: 0 12px 12px 0; }
`;

const Tr = styled.tr`
  &:hover td {
    background: var(--t-row-hover);
  }
`;

const HashCell = styled.td`
  font-family: 'Courier New', monospace;
  color: var(--t-primary);
  font-size: 0.8rem;
  opacity: 0.8;
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--t-muted);
`;

const Toast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--t-primary);
  color: var(--t-bg);
  padding: 12px 24px;
  border-radius: 40px;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: ${props => props.$visible ? 'block' : 'none'};
  z-index: 1000;
`;

interface GuestData {
    code: string;
    hash: string;
    name: string;
    relation: string;
}

const GuestHasher: React.FC = () => {
    const { sha256 } = useCrypto();
    const [isLight, setIsLight] = useState(() => {
        const saved = localStorage.getItem('guest-hasher-theme');
        if (saved) return saved === 'light';
        return !window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState<GuestData[]>([]);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        localStorage.setItem('guest-hasher-theme', isLight ? 'light' : 'dark');
    }, [isLight]);

    const handleGenerate = async () => {
        const lines = inputValue.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newResults: GuestData[] = [];

        for (const line of lines) {
            const parts = line.split(/[\t]+| {2,}/).map(p => p.trim());
            const finalParts = parts.length >= 2 ? parts : line.split(' ').map(p => p.trim());

            const code = finalParts[0] || "";
            const name = finalParts[1] || "";
            const relation = finalParts[2] || "";
            const hash = code ? await sha256(code) : "";

            newResults.push({ code, hash, name, relation });
        }
        setResults(newResults);
    };

    const handleCopy = () => {
        if (results.length === 0) {
            alert('請先生成名單喔！');
            return;
        }

        const content = results.map(r => `${r.code}\t${r.hash}\t${r.name}\t${r.relation}`).join('\n');

        navigator.clipboard.writeText(content).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        });
    };

    return (
        <PageWrapper $isLight={isLight}>
            <Container>
                <ThemeToggle onClick={() => setIsLight(!isLight)} title="切換護眼模式">
                    {isLight ? '☀️' : '🌙'}
                </ThemeToggle>

                <Header>
                    <Title>Guest List Harmonizer</Title>
                    <Tagline>🌿 讓繁瑣的格式化過程，像呼吸一樣流暢</Tagline>
                </Header>

                <InputSection>
                    <Label htmlFor="dataInput">請從 Excel 複製「代碼、姓名、關係」三欄貼至下方：</Label>
                    <TextArea
                        id="dataInput"
                        placeholder="S001 張小明 伴郎&#10;S002 李大華 伴娘..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </InputSection>

                <BtnGroup>
                    <ActionBtn $primary onClick={handleGenerate}>
                        ✨ 生成名單 (Hash)
                    </ActionBtn>
                    <ActionBtn onClick={handleCopy}>
                        📋 複製 Excel 內容
                    </ActionBtn>
                </BtnGroup>

                {results.length > 0 && (
                    <ResultArea>
                        <Label>預覽結果：</Label>
                        <Table>
                            <thead>
                                <tr>
                                    <Th style={{ width: '15%' }}>Code</Th>
                                    <Th style={{ width: '35%' }}>Hash (ID)</Th>
                                    <Th style={{ width: '25%' }}>Name</Th>
                                    <Th>Relation</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((item, idx) => (
                                    <Tr key={idx}>
                                        <Td>{item.code}</Td>
                                        <HashCell>{item.hash}</HashCell>
                                        <Td style={{ fontWeight: 500 }}>{item.name}</Td>
                                        <Td style={{ opacity: 0.7 }}>{item.relation}</Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </ResultArea>
                )}

                <Footer>
                    Designed for busy helpers. Secure client-side processing.
                </Footer>
            </Container>

            <Toast $visible={showToast}>已為您複製好內容，可以直接貼上 Excel 囉！</Toast>
        </PageWrapper>
    );
};

export default GuestHasher;
