import { ImageResponse } from 'next/og';

export const alt = 'Firstform — discover creatures, join their communities, shape what they become';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Same cub as the header logo (LogoMark) and the favicon (icon.svg).
const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g stroke="#2E2118" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><circle cx="8.5" cy="15" r="5" fill="#8C5E3C"/><circle cx="31.5" cy="15" r="5" fill="#8C5E3C"/><circle cx="20" cy="23" r="14.2" fill="#A06F46"/><path d="M20 9.5V4.5" fill="none"/><path d="M20 5.2Q15.4 1 12.6 4.2Q15.8 8.2 20 5.2Z" fill="#86A856"/><path d="M20 6.6Q24.6 3.2 27.2 6.2Q24 9.6 20 6.6Z" fill="#6E8F45"/><path d="M6.6 19.6Q8 9.4 20 9.2Q32 9.4 33.4 19.6Q29.6 15.6 26 17.4Q23 14.6 20 17Q17 14.6 14 17.4Q10.4 15.6 6.6 19.6Z" fill="#6E8F45"/></g><ellipse cx="20" cy="28.4" rx="9.4" ry="7.2" fill="#F6EAD3"/><ellipse cx="20" cy="26.4" rx="1.9" ry="1.4" fill="#2E2118"/><path d="M17.4 29.6Q20 31.8 22.6 29.6" fill="none" stroke="#2E2118" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="13.8" cy="23" rx="2" ry="2.5" fill="#2E2118"/><ellipse cx="26.2" cy="23" rx="2" ry="2.5" fill="#2E2118"/></svg>`;
const LOGO_SRC = `data:image/svg+xml;base64,${Buffer.from(LOGO).toString('base64')}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px 0 90px', background: '#F3E8D5', color: '#2E2118' }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#47633B' }}>Firstform</div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 18 }}>Every species has a story.</div>
          <div style={{ fontSize: 32, marginTop: 24, color: '#655340' }}>Discover creatures. Evolve them together.</div>
        </div>
        <div style={{ width: 360, height: 360, borderRadius: 180, background: '#E8D9BD', border: '6px solid #2E2118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={LOGO_SRC} width={270} height={270} />
        </div>
      </div>
    ),
    size
  );
}
