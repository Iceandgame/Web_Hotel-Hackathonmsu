function Profile({ user }) {
  const role = user.role?.toUpperCase() || 'MEMBER';

  const ROLE_CONFIG = {
    VIP:    { label: 'VIP',    bg: '#fefce8', color: '#92400e', border: '#fde68a',  },
    MEMBER: { label: 'MEMBER', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe',  },
    ADMIN:  { label: 'ADMIN',  bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff',  },
  };
  const roleStyle = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER;

  // loyalty tier
  const points = user.loyalty_points || 0;
  const tier =
    points >= 3000 ? { label: 'VVIP', color: '#7c3aed', } :
    points >= 1000 ? { label: 'VIP',     color: '#d97706', } :
    points >= 300  ? { label: 'Member',   color: '#6b7280', } :
                     { label: 'user',   color: '#92400e', };

  const maxPoints = points >= 3000 ? 5000 : points >= 1000 ? 3000 : points >= 300 ? 1000 : 300;
  const progress = Math.min((points / maxPoints) * 100, 100);

  const avatar = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <style>{`
        .profile-wrap { max-width: 560px; margin: 40px auto; padding: 0 20px; }
        .profile-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; margin-bottom: 16px; }
        .profile-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .profile-row:last-child { border-bottom: none; }
        .profile-label { font-size: 13px; color: #9ca3af; }
        .profile-value { font-size: 14px; font-weight: 600; color: #111; }
        .progress-bar-bg { background: #f3f4f6; border-radius: 99px; height: 8px; margin-top: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
      `}</style>

      <div className="profile-wrap">
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>โปรไฟล์ของฉัน</h2>

        {/* Avatar + ชื่อ */}
        <div className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#4f46e5', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '700', flexShrink: 0,
          }}>
            {avatar}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111' }}>{user.name}</p>
            <p style={{ margin: '4px 0 8px', fontSize: '13px', color: '#6b7280' }}>{user.email}</p>
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: '99px',
              fontSize: '12px', fontWeight: '700',
              background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
            }}>
              {roleStyle.icon} {roleStyle.label}
            </span>
          </div>
        </div>

        {/* ข้อมูลทั่วไป */}
        <div className="profile-card">
          <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#374151' }}>ข้อมูลส่วนตัว</p>
          {[
            ['ชื่อ-นามสกุล', user.name],
            ['อีเมล', user.email],
            ['เบอร์โทร', user.phone || '-'],
            ['User ID', user.user_id],
          ].map(([label, value]) => (
            <div className="profile-row" key={label}>
              <span className="profile-label">{label}</span>
              <span className="profile-value">{value}</span>
            </div>
          ))}
        </div>

        {/* Loyalty Points */}
        <div className="profile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#374151' }}>Loyalty Points</p>
            <span style={{ fontSize: '13px', fontWeight: '700', color: tier.color }}>{tier.icon} {tier.label}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#111' }}>
              {points.toLocaleString()}
            </span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>/ {maxPoints.toLocaleString()} คะแนน</span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%`, background: tier.color }} />
          </div>

          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9ca3af' }}>
            อีก {(maxPoints - points).toLocaleString()} คะแนน เพื่อขึ้น tier ถัดไป
          </p>
        </div>
      </div>
    </>
  );
}

export default Profile;