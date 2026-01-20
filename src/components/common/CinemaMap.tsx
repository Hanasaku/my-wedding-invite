import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { palette, hexToRGBA } from '@/assets/styles/palette';

// 修正 Leaflet 預設圖示在 React 中失效的問題
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- 自定義戰術標記 (橘紅色) ---
const tacticalIcon = L.divIcon({
    className: 'tactical-marker-icon',
    html: `
    <div style="
        width: 30px; 
        height: 30px; 
        background: ${palette.orangeRed}; 
        border: 2px solid ${palette.white}; 
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px ${palette.orangeRed};
    ">
        <div style="
            width: 10px; 
            height: 10px; 
            background: ${palette.black}; 
            border-radius: 50%;
        "></div>
    </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});
L.Marker.prototype.options.icon = tacticalIcon;

const MapWrapper = styled.div`
  width: 100%;
  height: 300px;
  margin: 2rem 0;
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.4)};
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px ${hexToRGBA(palette.black, 0.6)};
  background: ${palette.black};

  /* 戰術座標裝飾 */
  &::before {
    content: 'RECON_UNIT_STATIONED // 25.0539, 121.5364';
    position: absolute;
    top: 10px;
    right: 15px;
    color: ${palette.goldMain};
    font-size: 0.6rem;
    letter-spacing: 1px;
    z-index: 1000;
    font-family: 'Courier New', monospace;
    opacity: 0.8;
  }

  /* 轉角裝飾 */
  .corner-deco {
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid ${palette.goldMain};
    z-index: 1000;
    pointer-events: none;
  }
  .tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
  .br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

  /* 僅將地圖底層（Tiles）調成黑白，保留 Marker 的顏色 */
  .leaflet-tile-pane {
    filter: 
        grayscale(100%) 
        invert(90%) 
        contrast(1.2) 
        brightness(0.85);
  }

  .leaflet-container {
    height: 100%;
    width: 100%;
    background: ${palette.black};
  }

  .leaflet-popup-content-wrapper {
    background: ${palette.bgCard};
    color: ${palette.goldMain};
    border-radius: 0;
    border: 1px solid ${palette.goldMain};
    filter: invert(90%);
  }

  .leaflet-popup-tip {
    background: ${palette.goldMain};
    filter: invert(90%);
  }

  /* 針對您圈選的區域進行配色修改 */
  /* 1. 地圖右下角的 Attribution 連結文字 */
  .leaflet-control-attribution, 
  .leaflet-control-attribution a {
    background: rgba(0, 0, 0, 0.5) !important;
    color: ${palette.orangeRed} !important;
    font-size: 0.65rem;
  }

  /* 2. Marker 如果是使用 divIcon 則由 HTML 控制，若為預設則需替換 */
`;

const GoogleMapsLink = styled.a`
  display: inline-block;
  color: ${palette.goldMain};
  font-size: 0.8rem;
  padding: 8px 16px;
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.3)};
  text-decoration: none;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  background: ${hexToRGBA(palette.goldMain, 0.05)};
  text-transform: uppercase;

  &:hover {
    background: ${hexToRGBA(palette.goldMain, 0.15)};
    color: ${palette.goldBright};
    border-color: ${palette.goldBright};
    box-shadow: 0 0 10px ${hexToRGBA(palette.goldMain, 0.3)};
  }
`;

interface CinemaMapProps {
    lat?: number;
    lng?: number;
    venueName?: string;
    address?: string;
}

const CinemaMap: React.FC<CinemaMapProps> = ({
    lat = 25.0539118,
    lng = 121.5363847,
    venueName = "香頌私宅洋樓",
    address = "台北市中山區建國北路二段64巷4號"
}) => {
    const position: [number, number] = [lat, lng];

    return (
        <div style={{ width: '100%', margin: '2rem 0' }}>
            <MapWrapper>
                <div className="corner-deco tl" />
                <div className="corner-deco br" />
                <MapContainer
                    center={position}
                    zoom={16}
                    scrollWheelZoom={false}
                    dragging={!('ontouchstart' in window)}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            <strong>{venueName}</strong><br />
                            {address}
                        </Popup>
                    </Marker>
                </MapContainer>
            </MapWrapper>
            <div style={{ textAlign: 'center' }}>
                <GoogleMapsLink
                    href={`https://maps.app.goo.gl/RWTbQVCbeANHPmHZ8`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    [ 請求 Google Map 軌道衛星覆蓋：解析本世界線之收束座標 ]
                </GoogleMapsLink>
            </div>
        </div>
    );
};

export default CinemaMap;
