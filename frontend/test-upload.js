const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function test() {
    try {
        const form = new FormData();
        form.append('title', 'test');
        form.append('link', 'test');
        form.append('isActive', 'true');
        form.append('order', '1');
        
        const base64Image = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
        fs.writeFileSync('test.jpg', Buffer.from(base64Image, 'base64'));
        form.append('image', fs.createReadStream('test.jpg'));

        const res = await axios.post('http://localhost:5000/api/promotions', form, {
            headers: form.getHeaders(),
            withCredentials: true
        });
        console.log("SUCCESS:", res.data);
    } catch (err) {
        console.error("ERROR STATUS:", err.response?.status);
        console.error("ERROR DATA:", err.response?.data);
        console.error("ERROR TEXT:", err.message);
    }
}
test();
