const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const readData = (filePath) => JSON.parse(fs.readFileSync(path.join(__dirname, filePath), 'utf8'));

// Login เช็ค Role
app.post('/api/login', (req, res) => {
    const { email } = req.body;
    const users = readData('./data/users.json');
    const user = users.find(u => u.email === email);
    if (user) {
        res.json({ success: true, user }); 
    } else {
        res.status(401).json({ message: 'Invalid email' });
    }
});


// Hotel List 
app.get('/api/hotels', (req, res) => {
try {
        let hotels = readData('./data/hotels.json');
        const { search } = req.query; // รับคำค้นหา

        if (search) {
            hotels = hotels.filter(h => 
                h.name.toLowerCase().includes(search.toLowerCase()) || 
                h.location.toLowerCase().includes(search.toLowerCase())
            );
        }
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: "Error loading hotels" });
    }
});


app.post('/api/bookings', (req, res) => {
    
    const { user, hotel_id, booking_date, date } = req.body; 

    
    if (!user || !hotel_id || !booking_date) {
        return res.status(400).json({ message: 'Missing booking data (Check date)' });
    }

    const filePath = path.join(__dirname, './data/hotel_bookings.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        
        const bookings = JSON.parse(data);
        
        // บันทึกข้อมูลที่มีวันจอง
        const newBooking = { user, hotel_id, booking_date, date };
        bookings.push(newBooking);
        
        fs.writeFile(filePath, JSON.stringify(bookings, null, 2), (err) => {
            if (err) return res.status(500).send("Error saving booking");
            res.json({ success: true, message: "Booking saved successfully!" });
        });
    });
});

//การจองของผู้ใช้
app.get('/api/bookings/:email', (req, res) => {
    const { email } = req.params;
    try {
        const bookings = readData('./data/hotel_bookings.json');
  
        const userBookings = bookings.filter(b => b.user === email);
        res.json(userBookings);
    } catch (err) {
        res.status(500).json({ message: "Error loading your bookings" });
    }
});


app.delete('/api/bookings/:date', (req, res) => {
    const { date } = req.params;
    const filePath = path.join(__dirname, './data/hotel_bookings.json');
    let bookings = readData('./data/hotel_bookings.json');
    const newBookings = bookings.filter(b => b.date !== date);
    fs.writeFileSync(filePath, JSON.stringify(newBookings, null, 2));
    res.json({ success: true });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));