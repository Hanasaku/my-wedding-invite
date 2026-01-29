import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';
import MissionButton from '@/components/common/MissionButton';
import CinemaMap from '@/components/common/CinemaMap';
import RSVPForm from '@/pages/RSVPForm';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px ${hexToRGBA(palette.goldMain, 0.1)}; }
  50% { box-shadow: 0 0 40px ${hexToRGBA(palette.goldMain, 0.25)}; }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: transparent;
  color: ${palette.textPrimary};
  padding: 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: ${palette.fontTech};
  position: relative;
  overflow-x: hidden;

  @media (max-width: 600px) {
    padding: 1.5rem 1rem;
  }
`;

const FileFolder = styled.div`
  max-width: 800px;
  width: 100%;
  background: ${hexToRGBA(palette.bgCard, 0.7)};
  backdrop-filter: blur(1px);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  padding: 2.5rem 3.5rem;
  position: relative;
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
    z-index: 10;
  }

  @media (max-width: 600px) {
    padding: 2.5rem 1.5rem;
  }
`;

const Header = styled.div`
  border-bottom: 2px solid ${hexToRGBA(palette.goldMain, 0.3)};
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.8s ease-out both;
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

const AgentGreeting = styled.div<{ $visible: boolean }>`
  font-size: 1.25rem;
  color: ${palette.goldBright};
  margin-bottom: 2.5rem;
  font-weight: 700;
  opacity: 0;
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.8s ease-out forwards;
    animation-delay: 0.4s;
  `}
`;

const BodyText = styled.p<{ $visible: boolean; $delay?: string }>`
  line-height: 2;
  color: ${hexToRGBA(palette.white, 0.85)};
  font-size: 1.05rem;
  margin-bottom: 2rem;
  text-align: justify;
  opacity: 0;
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.8s ease-out forwards;
    animation-delay: ${props.$delay || '0.8s'};
  `}
`;

const SectionTitle = styled.h2<{ $visible: boolean; $delay: string }>`
  font-size: 1.2rem;
  color: ${palette.goldMain};
  padding: 8px 16px;
  border-left: 5px solid ${palette.goldMain};
  background: ${hexToRGBA(palette.goldMain, 0.1)};
  margin: 2rem 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  display: inline-block;
  opacity: 0;
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.8s ease-out forwards;
    animation-delay: ${props.$delay};
  `}
`;

const ParameterGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const ParameterItem = styled.div<{ $visible: boolean; $delay: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.8s ease-out forwards;
    animation-delay: ${props.$delay};
  `}
`;

const Label = styled.span`
  font-size: 0.8rem;
  color: ${hexToRGBA(palette.goldMain, 0.7)};
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 5px ${hexToRGBA(palette.goldMain, 0.2)};
`;

const Value = styled.div`
  font-size: 1.1rem;
  color: ${palette.white};
  line-height: 1.8;
  padding-left: 20px;
  border-left: 1px solid ${hexToRGBA(palette.goldMain, 0.5)};
  margin-left: 5px;
  background: linear-gradient(90deg, ${hexToRGBA(palette.goldMain, 0.05)}, transparent);
`;

const RSVPSection = styled.div<{ $visible: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding: 2rem 1.5rem;
  border: 2px dashed ${hexToRGBA(palette.goldMain, 0.3)};
  background: ${hexToRGBA(palette.goldMain, 0.03)};
  text-align: center;
  position: relative;
  overflow: hidden;
  opacity: 0;
  
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.8s ease-out forwards, ${pulseGlow} 4s infinite ease-in-out;
    animation-delay: 2.8s, 3.6s;
  `}

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

const Footer = styled.div<{ $visible: boolean }>`
  margin-top: 2rem;
  text-align: right;
  color: ${palette.goldMain};
  font-style: italic;
  font-size: 1.25rem;
  font-weight: 600;
  opacity: 0;
  ${props => props.$visible && css`
    animation: ${fadeIn} 0.8s ease-out forwards;
    animation-delay: 3.2s;
  `}
`;

const MapAttachment = styled.div<{ $visible: boolean; $delay: string }>`
  opacity: 0;
  ${props => props.$visible && css`
    animation: ${fadeIn} 1s ease-out forwards;
    animation-delay: ${props.$delay};
  `}
`;

interface InvitationProps {
  guestName: string;
  guestHash: string;
}

const Invitation: React.FC<InvitationProps> = ({ guestName, guestHash }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRSVPClick = () => {
    setShowRSVP(true);
  };

  return (
    <Container>
      {showRSVP && <RSVPForm guestName={guestName} guestHash={guestHash} onClose={() => setShowRSVP(false)} />}
      <FileFolder>

        <Header>
          <ClassifiedStamp>機密等級：絕對機密</ClassifiedStamp>
          <OperationTitle>
            行動代號：[新郎名字] & [新娘名字] 終極收束
          </OperationTitle>
        </Header>

        <AgentGreeting $visible={isLoaded}>
          致 優秀的特工 {guestName.toUpperCase()}：
        </AgentGreeting>

        <BodyText $visible={isLoaded} $delay="0.8s">
          為了確保該世界線的穩定性，避免產生悖論，總部在此發布一項緊急任務。經過多年的秘密考察與情報確認，兩位頂尖探員 [新郎名字] 與 [新娘名字] 決定啟動「終身合作協議」。在跨越無數收束失敗的分歧點，抵達了變動率 1.048596% 的理想世界線，兩位探員成為了對方的專屬觀測者，您的特殊身份對於見證此一歷史性時刻至關重要。
        </BodyText>

        <SectionTitle $visible={isLoaded} $delay="1.2s">任務參數:</SectionTitle>

        <ParameterGrid>
          <ParameterItem $visible={isLoaded} $delay="1.4s">
            <Label>▌ 行動目標</Label>
            <Value>作為時空的見證人，確保「幸福收束」順利完成。</Value>
          </ParameterItem>

          <ParameterItem $visible={isLoaded} $delay="1.6s">
            <Label>▌ 關鍵觀測點</Label>
            <Value>
              202X 年 XX 月 XX 日 (週X)<br />
              [ 入場時間 ] 18:00<br />
              情報交換與報到<br />
              <br />
              [ 儀式 / 開席時間 ] 18:30<br />
              命運收束行動正式開始
            </Value>
          </ParameterItem>

          <ParameterItem $visible={isLoaded} $delay="1.8s">
            <Label>▌ 偽裝密令 (Dress Code)</Label>
            <Value>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '10px 0 15px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #4A4A4A, #757575)', border: `1px solid ${palette.goldMain}`, boxShadow: `0 0 15px ${hexToRGBA(palette.goldMain, 0.3)}` }} />
                  <span style={{ fontSize: '0.7rem', color: palette.goldMain }}>GREY</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #1A237E, #3949AB)', border: `1px solid ${palette.goldMain}`, boxShadow: `0 0 15px ${hexToRGBA(palette.goldMain, 0.3)}` }} />
                  <span style={{ fontSize: '0.7rem', color: palette.goldMain }}>BLUE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #4A148C, #7B1FA2)', border: `1px solid ${palette.goldMain}`, boxShadow: `0 0 15px ${hexToRGBA(palette.goldMain, 0.3)}` }} />
                  <span style={{ fontSize: '0.7rem', color: palette.goldMain }}>PURPLE</span>
                </div>
                <div style={{ marginLeft: '10px', fontSize: '1.2rem', color: palette.goldBright, fontWeight: 'bold', letterSpacing: '2px' }}>
                  灰 ‧ 藍 ‧ 紫色系
                </div>
              </div>
              為了與香頌洋樓的法式氛圍相稱，邀請您以此深色調打造您的 Dress Code。<br />
              <strong style={{ color: palette.accentError, borderBottom: `1px solid ${palette.accentError}`, paddingBottom: '2px' }}>
                ※ 請避開全黑、全白色系
              </strong>，讓我們共同完成這幅法式深色調的視覺畫卷。
            </Value>
          </ParameterItem>
        </ParameterGrid>

        <SectionTitle $visible={isLoaded} $delay="2.0s">現場情報 (Field Intel):</SectionTitle>

        <ParameterGrid>
          <ParameterItem $visible={isLoaded} $delay="2.2s">
            <Label>▌ 收束座標 (Coordinates)</Label>
            <Value>
              香頌私宅洋樓 (Chanson Bistro)<br />
              台北市中山區建國北路二段64巷4號
            </Value>
          </ParameterItem>

          <ParameterItem $visible={isLoaded} $delay="2.4s">
            <Label>▌ 交通手段 (Infiltration Route)</Label>
            <Value>
              <strong>[ 捷運 MRT ]</strong><br />
              松江南京站 7 號出口，沿南京東路直走至建國北路右轉，步行約 7-10 分鐘即可抵達。<br />
              <br />
              <strong>[ 公車 BUS ]</strong><br />
              ● 南京建國路口：248, 266, 279, 282, 288, 292, 306, 307<br />
              ● 捷運松江南京站：5, 12, 41, 72, 109, 203, 214, 222, 226<br />
              ● 長樂里 (建國北路)：298, 紅57<br />
              <br />
              <strong>[ 停車 PARKING ]</strong><br />
              可利用「建國高架停車場」，停至「南京東路－長春路」區段，步行約 3-5 分鐘即可抵達基地。
            </Value>
          </ParameterItem>
        </ParameterGrid>

        <MapAttachment $visible={isLoaded} $delay="2.5s">
          <CinemaMap
            lat={25.0539118}
            lng={121.5363847}
            venueName="香頌私宅洋樓"
            address="台北市中山區建國北路二段64巷4號"
          />
        </MapAttachment>

        <SectionTitle $visible={isLoaded} $delay="2.8s">狀態確認</SectionTitle>

        <RSVPSection $visible={isLoaded}>
          <BodyText $visible={isLoaded} $delay="3s" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            請於 [截止日期] 前，點擊下方按鈕回報您的參與狀態。<br />
            這對於總部的後勤補給規劃至關重要。
          </BodyText>

          <MissionButton onClick={handleRSVPClick} isActive={true}>
            啟動傳輸
          </MissionButton>

          <Value style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1.5rem', padding: 0 }}>
            SECURE LINK TO COMMAND CENTER
          </Value>
        </RSVPSection>

        <Footer $visible={isLoaded}>期待與您在現場相聚。<br />來自總部</Footer>
      </FileFolder>
    </Container>
  );
};

export default Invitation;
