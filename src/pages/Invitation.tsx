import React from 'react';
import styled, { keyframes } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';
import MissionButton from '@/components/common/MissionButton';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: ${palette.bgPrimary};
  color: ${palette.textPrimary};
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: ${palette.fontTech};
  position: relative;
  overflow-x: hidden;

  @media (max-width: 600px) {
    padding: 2rem 1rem;
  }
`;

const FileFolder = styled.div`
  max-width: 800px;
  width: 100%;
  background: ${hexToRGBA(palette.bgCard, 0.85)};
  backdrop-filter: blur(20px);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  padding: 3.5rem;
  position: relative;
  animation: ${fadeIn} 1s ease-out forwards;
  box-shadow: 0 0 60px ${hexToRGBA(palette.black, 0.7)};

  &::before {
    content: 'TOP SECRET';
    position: absolute;
    top: -15px;
    right: 30px;
    background: ${palette.accentError};
    color: ${palette.white};
    padding: 6px 16px;
    font-size: 0.8rem;
    font-weight: 900;
    letter-spacing: 3px;
    box-shadow: 0 0 15px ${hexToRGBA(palette.accentError, 0.4)};
  }

  @media (max-width: 600px) {
    padding: 2rem 1.5rem;
  }
`;

const Header = styled.div`
  border-bottom: 2px solid ${hexToRGBA(palette.goldMain, 0.3)};
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;
`;

const ClassifiedStamp = styled.div`
  color: ${palette.accentError};
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 0.8rem;
`;

const OperationTitle = styled.h1`
  font-size: clamp(1.4rem, 4vw, 2.2rem);
  color: ${palette.goldMain};
  margin: 0;
  letter-spacing: 2px;
  line-height: 1.3;
  text-transform: uppercase;
`;

const AgentGreeting = styled.div`
  font-size: 1.25rem;
  color: ${palette.goldBright};
  margin-bottom: 2.5rem;
  font-weight: 700;
`;

const BodyText = styled.p`
  line-height: 2;
  color: ${hexToRGBA(palette.white, 0.85)};
  font-size: 1.05rem;
  margin-bottom: 3.5rem;
  text-align: justify;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: ${palette.goldMain};
  padding: 8px 16px;
  border-left: 5px solid ${palette.goldMain};
  background: ${hexToRGBA(palette.goldMain, 0.1)};
  margin: 3rem 0 2rem 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  display: inline-block;
`;

const ParameterGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-bottom: 4rem;
`;

const ParameterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.span`
  font-size: 0.8rem;
  color: ${palette.goldMain};
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Value = styled.div`
  font-size: 1.1rem;
  color: ${palette.white};
  line-height: 1.8;
  padding-left: 20px;
`;

const RSVPSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding: 3.5rem 2rem;
  border: 2px dashed ${hexToRGBA(palette.goldMain, 0.3)};
  background: ${hexToRGBA(palette.goldMain, 0.03)};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: 'RSVP REQUIRED';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    font-size: 5rem;
    font-weight: 900;
    color: ${hexToRGBA(palette.goldMain, 0.04)};
    white-space: nowrap;
    pointer-events: none;
  }
`;

const Footer = styled.div`
  margin-top: 5rem;
  text-align: right;
  color: ${palette.goldMain};
  font-style: italic;
  font-size: 1.25rem;
  font-weight: 600;
`;

interface InvitationProps {
  guestName: string;
}

const Invitation: React.FC<InvitationProps> = ({ guestName }) => {
  const handleRSVPClick = () => {
    // Replace this URL with the actual form link later
    window.open('https://forms.google.com/your-form-url', '_blank');
  };

  return (
    <Container>
      <FileFolder>
        <Header>
          <ClassifiedStamp>機密等級：最高</ClassifiedStamp>
          <OperationTitle>
            行動代號：[新郎名字] & [新娘名字] 的終極結盟
          </OperationTitle>
        </Header>

        <AgentGreeting>致 優秀的特工 {guestName.toUpperCase()}：</AgentGreeting>

        <BodyText>
          總部在此發布一項緊急且甜蜜的任務。經過多年的秘密考察與情報確認，兩位頂尖探員 [新郎名字] 與 [新娘名字] 決定啟動「終身合作協議」。您的特殊身份對於見證此一歷史性時刻至關重要。
        </BodyText>

        <SectionTitle>任務參數:</SectionTitle>

        <ParameterGrid>
          <ParameterItem>
            <Label>▌ 行動目標</Label>
            <Value>見證愛的誓言，並加入隨後的慶功宴會。</Value>
          </ParameterItem>

          <ParameterItem>
            <Label>▌ 接觸時間</Label>
            <Value>
              202X 年 XX 月 XX 日 (週X)<br />
              [入場時間] 報到與情報交流<br />
              [儀式/開席時間] 行動正式開始
            </Value>
          </ParameterItem>

          <ParameterItem>
            <Label>▌ 匯合點座標</Label>
            <Value>
              [飯店/場地名稱] - [廳房名稱]<br />
              [詳細地址]
            </Value>
          </ParameterItem>

          <ParameterItem>
            <Label>▌ 偽裝要求</Label>
            <Value>
              正式服裝 / 晚宴裝<br />
              請準備好展現您最迷人的一面。
            </Value>
          </ParameterItem>
        </ParameterGrid>

        <SectionTitle>狀態確認</SectionTitle>

        <RSVPSection>
          <BodyText style={{ marginBottom: '2rem', textAlign: 'center' }}>
            請於 [截止日期] 前，點擊下方按鈕回報您的參與狀態。<br />
            這對於總部的後勤補給規劃至關重要。
          </BodyText>

          <MissionButton onClick={handleRSVPClick} isActive={true}>
            啟動 RSVP 傳修回報
          </MissionButton>

          <Value style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1.5rem', padding: 0 }}>
            SECURE LINK TO COMMAND CENTER
          </Value>
        </RSVPSection>

        <Footer>期待與您在現場匯合。<br />總部敬上 / FROM HQ WITH LOVE</Footer>
      </FileFolder>
    </Container>
  );
};

export default Invitation;
