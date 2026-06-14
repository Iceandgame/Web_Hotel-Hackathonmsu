import { useState } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// กรอง hotels คร่าวๆ ด้วย JS เพื่อลด token
function preFilter(hotels, query) {
  const q = query.toLowerCase();

  // ดึง keywords จาก query
  const locationKeywords = ['กรุงเทพ','bangkok','ภูเก็ต','phuket','กระบี่','krabi','เชียงใหม่','chiangmai',
    'พัทยา','pattaya','สมุย','samui','หัวหิน','huahin','อยุธยา','ayutthaya','เกาะ','koh'];
  const amenityKeywords = ['pool','สระ','spa','สปา','gym','ฟิตเนส','beach','ทะเล','wifi','breakfast','อาหารเช้า','parking','จอดรถ'];

  // หา location ที่พูดถึง
  const mentionedLocations = locationKeywords.filter(k => q.includes(k));
  // หา amenities ที่พูดถึง
  const mentionedAmenities = amenityKeywords.filter(k => q.includes(k));

  // หาราคาสูงสุดจาก query
  const priceMatch = q.match(/(\d[\d,]+)\s*(บาท|baht)?/g);
  const maxPrice = priceMatch
    ? Math.max(...priceMatch.map(p => parseInt(p.replace(/,/g, ''))))
    : Infinity;

  let filtered = hotels;

  // กรอง location ถ้าพูดถึง
  if (mentionedLocations.length > 0) {
    filtered = filtered.filter(h =>
      mentionedLocations.some(loc =>
        h.location.toLowerCase().includes(loc) || h.name.toLowerCase().includes(loc)
      )
    );
  }

  // กรอง amenities ถ้าพูดถึง
  if (mentionedAmenities.length > 0) {
    filtered = filtered.filter(h =>
      mentionedAmenities.some(term =>
        h.amenities?.some(a => a.toLowerCase().includes(term))
      )
    );
  }

  // กรอง price ถ้าพูดถึง
  if (maxPrice < Infinity) {
    filtered = filtered.filter(h => h.price_per_night <= maxPrice);
  }

  // ถ้า filter แล้วได้น้อยเกิน ให้ดึง top rated มาแทน
  if (filtered.length < 3) {
    filtered = [...hotels].sort((a, b) => b.rating - a.rating).slice(0, 15);
  }

  // จำกัด max 20 hotels ส่งไป Gemini
  return filtered.slice(0, 20);
}

function HotelSearchAI({ hotels, onSelectHotel }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { recommendations: [{hotel_id, reason}], summary }
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const filtered = preFilter(hotels, query);

      const hotelList = filtered.map(h =>
        `- ID: ${h.hotel_id} | ${h.name} | ${h.location} | ราคา ${h.price_per_night} บาท/คืน | Rating: ${h.rating} | สิ่งอำนวยความสะดวก: ${h.amenities?.join(', ')}`
      ).join('\n');

      const prompt = `คุณเป็น AI ผู้เชี่ยวชาญด้านการแนะนำโรงแรมในประเทศไทย

ผู้ใช้ต้องการ: "${query}"

รายการโรงแรมที่มี:
${hotelList}

วิเคราะห์และแนะนำโรงแรมที่เหมาะสมที่สุด 1-3 แห่ง

ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "summary": "สรุปสั้นๆ ว่าค้นหาอะไร",
  "recommendations": [
    {
      "hotel_id": "h-xxx",
      "hotel_name": "ชื่อโรงแรม",
      "reason": "เหตุผลที่แนะนำ 1-2 ประโยค"
    }
  ]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
          }),
        }
      );

      const data = await res.json();

      // เช็ค response error ก่อน parse (429, 400, 403 ฯลฯ)
      if (!res.ok) {
        console.error('Gemini API error:', data);
        if (res.status === 429) {
          setError('คำขอเยอะเกินไป กรุณารอสักครู่แล้วลองใหม่');
        } else {
          setError('เกิดข้อผิดพลาดจาก AI กรุณาลองใหม่');
        }
        return;
      }

      console.log('finishReason:', data.candidates?.[0]?.finishReason);
      console.log('full data:', JSON.stringify(data, null, 2));

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        console.error('Gemini ไม่ส่ง text กลับมา:', data);
        setError('AI ไม่สามารถตอบกลับได้ กรุณาลองใหม่');
        return;
      }

      const clean = text.replace(/```json|```/g, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(clean);

      } catch (parseErr) {
        console.error('JSON parse error, raw text:', text, parseErr);
        setError('AI ตอบกลับมาในรูปแบบที่อ่านไม่ได้ กรุณาลองใหม่');
        return;
      }

      setResults(parsed);
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  // หาข้อมูลโรงแรมจาก hotel_id
  const getHotel = (id) => hotels.find(h => h.hotel_id === id);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto 32px', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '28px' }}></span>
        <h3 style={{ margin: '4px 0 4px', fontSize: '18px', fontWeight: '700', color: '#111' }}>
          AI Hotel Search
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
          บอกความต้องการเป็นภาษาธรรมดา AI จะแนะนำโรงแรมให้
        </p>
      </div>

      {/* Search box */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='เช่น "อยากพักริมทะเลแถวกระบี่ ราคาไม่เกิน 3000 มีสปา"'
          style={{
            flex: 1, padding: '11px 14px', borderRadius: '10px',
            border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#4f46e5'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: '11px 20px', borderRadius: '10px', border: 'none',
            background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff',
            fontWeight: '700', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}
        >
          {loading ? ' กำลังวิเคราะห์...' : ' ค้นหา'}
        </button>
      </div>

      {/* Example prompts */}
      {!results && !loading && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {[
            'โรงแรมราคาถูกในกรุงเทพ มี WiFi',
            'รีสอร์ทริมทะเลภูเก็ต มีสระว่ายน้ำ',
            'ที่พักเชียงใหม่ บรรยากาศดี ราคาไม่เกิน 2000',
          ].map(ex => (
            <button key={ex} onClick={() => setQuery(ex)}
              style={{ padding: '6px 12px', borderRadius: '99px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

      {/* Results */}
      {results && (
        <div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', fontStyle: 'italic' }}>
             {results.summary}
          </p>
          {results.recommendations?.map((rec, i) => {
            const hotel = getHotel(rec.hotel_id);
            if (!hotel) return null;
            return (
              <div key={rec.hotel_id} style={{
                border: '1.5px solid #e0e7ff', borderRadius: '12px', padding: '16px',
                marginBottom: '12px', background: '#fafafe',
                display: 'flex', gap: '14px', alignItems: 'flex-start',
              }}>
                {/* Rank */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? '#4f46e5' : '#e0e7ff',
                  color: i === 0 ? '#fff' : '#4f46e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '14px',
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#111', fontSize: '15px' }}>{hotel.name}</p>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6b7280' }}>
                        {hotel.location} · {hotel.rating} · {hotel.price_per_night.toLocaleString()} บาท/คืน
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectHotel(hotel)}
                      style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      จองเลย
                    </button>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                     {rec.reason}
                  </p>
                  <div>
                    {hotel.amenities?.map(a => (
                      <span key={a} style={{ display: 'inline-block', background: '#ede9fe', color: '#5b21b6', borderRadius: '99px', padding: '2px 8px', fontSize: '11px', marginRight: '4px', marginBottom: '2px' }}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={() => { setResults(null); setQuery(''); }}
            style={{ fontSize: '13px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
            ← ค้นหาใหม่
          </button>
        </div>
      )}
    </div>
  );
}

export default HotelSearchAI;
