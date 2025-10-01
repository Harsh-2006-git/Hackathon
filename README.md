<h1 align="center">🌍 Ujjain Yatra – Smart Pilgrimage Assistance System</h1>

<p align="center">
  🚀 Digital Solutions for <b>Simhastha 2028</b> – Safer, Smarter, Seamless  
</p>

---

## ✨ Overview  
This project is built for **Simhastha 2028** under the theme **Smart Mobility & Access Management**.  

💡 It provides:  
- ✅ Smart Ticketing & QR Code Access  
- ✅ AI-Powered Crowd Monitoring (Heatmaps, CCTV Integration)  
- ✅ Lost & Found using Face Recognition  
- ✅ Dynamic Navigation & Alternative Routes  
- ✅ Live Darshan Streaming & Real-Time Notices  
- ✅ Universal Access for Elderly & Divyangjan  

🔗 **Hosted Link** :
https://ujjain-yatra-harsh09.vercel.app/)  

![Dashboard Screenshot](https://github.com/user-attachments/assets/b05370ab-00fc-4f7a-9b06-03bf9f6517b9)

---

## 🗂️ Project Structure  

```bash
Backend/
 ┣ 📂 config/        # DB & Server configs
 ┣ 📂 controllers/   # Business logic
 ┣ 📂 middlewares/   # JWT, validations
 ┣ 📂 models/        # Sequelize models
 ┣ 📂 routes/        # API endpoints
 ┣ 📂 uploads/       # File uploads
 ┣ 📂 utils/         # Helper functions
 ┣ 📜 index.js       # Express entrypoint

Frontend/
 ┣ 📂 public/        # Static assets
 ┣ 📂 src/           # React + Vite app
 ┣ 📜 vite.config.js # Vite config

⚙️ Tech Stack

🌐 Frontend
⚛️ React.js + Vite
🎨 TailwindCSS
🗺️ Leaflet.js (Smart Maps)
🔄 Socket.IO (Realtime Updates)

⚡ Backend
🟢 Node.js + Express.js
🛢️ MySQL (Aiven Cloud) + Sequelize ORM
🔑 JWT Auth (Access + Refresh Tokens)
📧 SMTP (Hostinger) – Emails & OTPs

🤖 AI/ML (Future Scope)
👤 Face Recognition (OpenCV, Python)
👥 Crowd Detection (YOLOv5, CCTV Heatmaps)

🗄️ Database
env
Copy code
# Database
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true
DB_CA_CERT_PATH=./ca.pem

# JWT
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
TO_EMAIL=your_admin_email

🚀 Getting Started
Backend
bash
Copy code
cd Backend
npm install
node index.js

Frontend
bash
Copy code
cd Frontend
npm install
npm run dev


🔄 System Flow
mermaid
Copy code
flowchart TD
    A[👤 Pilgrim / Admin / Volunteer] -->|Web/Mobile| B[🌐 React Frontend]
    B -->|REST API / WebSocket| C[⚡ Express Backend]
    C -->|Sequelize ORM| D[(🛢️ MySQL DB)]
    C -->|SMTP| E[📧 Email OTP / Notifications]
    C -->|Future AI| F[🤖 Crowd Detection / Lost & Found]


📨 Contact
📧 Email: harshmanmode79@gmail.com
🔗 LinkedIn: Harsh Manmode

📸 Screenshots
![Dashboard Screenshot](https://github.com/user-attachments/assets/c4b553b9-129b-4f21-8a1d-17050f5a5fd0)
![Dashboard Screenshot](https://github.com/user-attachments/assets/c4b553b9-129b-4f21-8a1d-17050f5a5fd0)
![Dashboard Screenshot](https://github.com/user-attachments/assets/2183c63d-bc9f-4d69-a35f-3c6c6bbe44d1)

