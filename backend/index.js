const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, './data');
const readData = (file) => JSON.parse(fs.readFileSync(path.join(DATA_PATH, file), 'utf8'));
const writeData = (file, data) => fs.writeFileSync(path.join(DATA_PATH, file), JSON.stringify(data, null, 2));

app.post('/api/login', (req, res) => {
    const { email } = req.body;
    const users = readData('users.json');
    const user = users.find(u => u.email === email);
    user ? res.json({ success: true, user }) : res.status(401).json({ message: 'Invalid email' });
});

app.get('/api/hotels', (req, res) => {
    try {
        let hotels = readData('hotels.json');
        const { search } = req.query;
        if (search) {
            hotels = hotels.filter(h =>
                h.name.toLowerCase().includes(search.toLowerCase()) ||
                h.location.toLowerCase().includes(search.toLowerCase())
            );
        }
        res.json(hotels);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post('/api/bookings', (req, res) => {
    const {
        user, hotel_id, booking_date, check_out, guests,
        original_price, vip_discount, points_used, points_discount, final_price
    } = req.body;

    if (!user || !hotel_id || !booking_date) {
        return res.status(400).json({ message: 'Missing data' });
    }

    // หักแต้มจาก user ถ้ามีการใช้ points
    if (points_used && points_used > 0) {
        const users = readData('users.json');
        const userIdx = users.findIndex(u => u.email === user);
        if (userIdx === -1) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentPoints = users[userIdx].loyalty_points || 0;
        if (points_used > currentPoints) {
            return res.status(400).json({ message: 'แต้มไม่เพียงพอ' });
        }
        users[userIdx].loyalty_points = currentPoints - points_used;
        writeData('users.json', users);
    }

    const bookings = readData('hotel_bookings.json');
    const newBooking = {
        id: Date.now(),
        user, hotel_id, booking_date, check_out, guests,
        original_price, vip_discount, points_used, points_discount, final_price,
        status: 'PENDING'
    };
    bookings.push(newBooking);
    writeData('hotel_bookings.json', bookings);
    res.json({ success: true, booking: newBooking });
});

// ดึงทุก booking (admin)
app.get('/api/admin/bookings', (req, res) => {
    const bookings = readData('hotel_bookings.json');
    const hotels = readData('hotels.json');
    const users = readData('users.json');
    const enriched = bookings.map(b => {
        const hotel = hotels.find(h => h.hotel_id === b.hotel_id);
        const user = users.find(u => u.user_id === b.user_id || u.email === b.user);
        return {
            ...b,
            hotel_name: hotel?.name || b.hotel_id,
            user_name: user?.name || b.user || b.user_id,
        };
    });
    res.json(enriched);
});

// เปลี่ยนสถานะ booking (admin)
app.patch('/api/admin/bookings/:id', (req, res) => {
    const { status } = req.body;
    const VALID = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
    if (!VALID.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const bookings = readData('hotel_bookings.json');
    const idx = bookings.findIndex(b =>
        String(b.id) === req.params.id || String(b.booking_id) === req.params.id
    );
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    bookings[idx].status = status;
    writeData('hotel_bookings.json', bookings);
    res.json({ success: true, booking: bookings[idx] });
});

// ดึงรายการจองตาม email/user_id
app.get('/api/bookings/:identifier', (req, res) => {
    const bookings = readData('hotel_bookings.json');
    const id = req.params.identifier;
    res.json(bookings.filter(b => b.user === id || b.user_id === id));
});

// ยกเลิกการจอง
app.delete('/api/bookings/:id', (req, res) => {
    const bookings = readData('hotel_bookings.json');
    const filtered = bookings.filter(b =>
        String(b.id) !== req.params.id && String(b.booking_id) !== req.params.id
    );
    writeData('hotel_bookings.json', filtered);
    res.json({ success: true });
});

// แก้ไขวันที่จอง
app.put('/api/bookings/:id', (req, res) => {
    const { booking_date, check_out } = req.body;
    const bookings = readData('hotel_bookings.json');
    const idx = bookings.findIndex(b =>
        String(b.id) === req.params.id || String(b.booking_id) === req.params.id
    );
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    const status = bookings[idx].status?.toUpperCase();
    if (status === 'CHECKED_IN' || status === 'CHECKED_OUT')
        return res.status(400).json({ message: 'ไม่สามารถแก้ไข booking ที่เช็คอินแล้วได้' });
    bookings[idx] = { ...bookings[idx], booking_date, check_out };
    writeData('hotel_bookings.json', bookings);
    res.json({ success: true, booking: bookings[idx] });
});

app.post('/api/ai-search', async (req, res) => {
    const { prompt } = req.body;
    try {
        res.json({ result: "ข้อมูลจาก Gemini" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));