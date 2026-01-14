import React from 'react';
import styled, { keyframes } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';

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
`;

const FileFolder = styled.div`
  max-width: 800px;
  width: 100%;
  background: ${hexToRGBA(palette.bgCard, 0.8)};
  backdrop-filter: blur(20px);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  padding: 3rem;
  position: relative;
  animation: ${fadeIn} 1s ease-out forwards;
  box-shadow: 0 0 50px ${hexToRGBA(palette.black, 0.5)};

  &::before {
    content: 'TOP SECRET';
    position: absolute;
    top: -15px;
    right: 20px;
    background: ${palette.accentError};
    color: ${palette.white};
    padding: 4px 12px;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 2px;
  }
`;

const Header = styled.div`
  border-bottom: 1px solid ${hexToRGBA(palette.goldMain, 0.2)};
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
`;

const ClassifiedStamp = styled.div`
  color: ${palette.accentError};
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
`;

const OperationTitle = styled.h1`
  font-size: 1.8rem;
  color: ${palette.goldMain};
  margin: 0;
  letter-spacing: 2px;
  line-height: 1.4;
  text-transform: uppercase;
`;

const AgentGreeting = styled.div`
  font-size: 1.2rem;
  color: ${palette.goldBright};
  margin-bottom: 2rem;
  font-weight: 600;
`;

const BodyText = styled.p`
  line-height: 1.8;
  color: ${hexToRGBA(palette.white, 0.8)};
  font-size: 1rem;
  margin-bottom: 3rem;
  text-align: justify;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: ${palette.goldMain};
  border-left: 4px solid ${palette.goldMain};
  padding-left: 15px;
  margin: 2rem 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ParameterGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const ParameterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.75rem;
  color: ${palette.goldMain};
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Value = styled.div`
  font-size: 1.05rem;
  color: ${palette.white};
  line-height: 1.6;
`;

const RSVPSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 2rem;
  border: 1px dashed ${hexToRGBA(palette.goldMain, 0.4)};
  background: ${hexToRGBA(palette.goldMain, 0.05)};
`;

const QRCodePlaceholder = styled.div`
  width: 150px;
  height: 150px;
  background: ${palette.white};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${palette.black};
  font-size: 0.8rem;
  font-weight: bold;
`;

const Footer = styled.div`
  margin-top: 4rem;
  text-align: right;
  color: ${palette.goldMain};
  font-style: italic;
  font-size: 1.1rem;
`;

interface InvitationProps {
  guestName: string;
}

const Invitation: React.FC<InvitationProps> = ({ guestName }) => {
  return (
    <Container>
      <FileFolder>
        <Header>
          <ClassifiedStamp>機密等級：最高 / CLASSIFIED: TOP SECRET</ClassifiedStamp>
          <OperationTitle>
            行動代號：[新郎名字] & [新娘名字] 的終極結盟<br />
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
        <BodyText style={{ marginBottom: '1rem' }}>
          請於 [截止日期] 前，掃描下方 QR Code 向指揮中心確認您的參與狀態。這對於後勤補給至關重要。
        </BodyText>

        <RSVPSection>
          <QRCodePlaceholder>[ QR CODE ]</QRCodePlaceholder>
          <Value style={{ fontSize: '0.8rem', opacity: 0.6 }}>CONFIRM STATUS VIA SCAN</Value>
        </RSVPSection>

        <Footer>期待與您在現場匯合。<br />總部敬上 / FROM HQ WITH LOVE</Footer>
      </FileFolder>
    </Container>
  );
};

export default Invitation;
