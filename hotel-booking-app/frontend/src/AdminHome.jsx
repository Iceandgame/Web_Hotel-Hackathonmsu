function AdminHome({ user }) {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: '#4f46e5', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', margin: '0 auto 20px',
      }}>
        
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>
        ยินดีต้อนรับ, {user.name}
      </h1>
      <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 40px' }}>
        คุณเข้าสู่ระบบในฐานะ <strong style={{ color: '#4f46e5' }}>ADMIN</strong> — ใช้เมนู Admin Panel เพื่อจัดการระบบ
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
        {[
          {  title: 'จัดการ Bookings', desc: 'ดู เปลี่ยนสถานะ และติดตามการจองทั้งหมด' },
          { title: 'ผู้ใช้งาน', desc: 'ดูข้อมูล MEMBER และ VIP ในระบบ' },
          { title: 'โรงแรม', desc: 'รายชื่อโรงแรมและข้อมูลทั้งหมด 50 แห่ง' },
          { title: 'สถิติ', desc: 'สรุปยอดจองและสถานะภาพรวม' },
        ].map(item => (
          <div key={item.title} style={{
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px',
            background: '#fff',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
            <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#111', fontSize: '14px' }}>{item.title}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminHome;