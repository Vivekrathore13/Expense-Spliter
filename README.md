# 💸 Expense Splitter — Full Stack (Premium UI)

> Split bills, track balances & settle up instantly — with a clean **premium experience** ✨  
> Inspired by Splitwise ✅ Built with modern full-stack technologies.

<p align="center">
  <a href="https://expense-spliter-taupe.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Frontend-4f46e5?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <a href="https://expense-spliter-v56d.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/API-Backend-16a34a?style=for-the-badge&logo=render&logoColor=white" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer%20Motion-black?logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4DB33D?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-ff8a00?logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Brevo%20Email%20API-0092ff?logo=gmail&logoColor=white" />
</p>

---

## 🌐 Live Links

✅ **Frontend (Vercel):** https://expense-spliter-taupe.vercel.app/  
✅ **Backend API (Render):** https://expense-spliter-v56d.onrender.com  

---

## ✨ Overview

**Expense Splitter** is a Splitwise-like bill splitting application where users can:

✅ Create groups  
✅ Add expenses & split bills  
✅ Track balances (owe / owed)  
✅ Get settlement suggestions (min transactions)  
✅ Settle up & store logs  
✅ Invite members via email + join-group link  
✅ Notifications system (read/unread, delete, mark read)  
✅ UPI integration support for quick payments  

---

## 🚀 Key Features

### 🔐 Authentication
- Signup / Login  
- JWT protected routes  
- Secure Axios token interceptor  
- PrivateRoute + Layout routing

### 👥 Group Management
- Create groups  
- Group detail page (members + expenses)
- Admin-only controls (delete group/member)
- Invite members using email invitation

### 🧾 Expense Splitting
- Add expense modal  
- Split types:
  - Equal
  - Exact
  - Percentage

### 🤝 Settle Up (Premium Module 🔥)
- Per-group balances
- Settlement suggestions (min transactions)
- Settlement history logs stored in DB
- UPI pay redirect support

### 🔔 Notifications
- Notifications bell + notifications page
- All / Unread filter
- Mark read / mark all read
- Delete notification

### ⚙️ Settings
- Save UPI ID  
- Copy UPI button  
- Logout  

---

## 🧩 Tech Stack

### Frontend
- React 18
- Material UI (MUI)
- TailwindCSS (Auth / Landing pages)
- Framer Motion animations
- Axios + interceptors
- React Router DOM
- React Toastify

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Auth
- Brevo Email API (transactional emails)
- Render deployment

---

## 🏗️ Project Structure

```bash
Expense-Splitter/
├── Assets/
├── Backend/
│   └── src/
├── frontend/
│   └── src/
└── README.md
````

---

## 📸 Screenshots (Premium UI)

### 🌐 Public Pages
| Landing Page | Login | Signup |
|---|---|---|
| ![Landing](Assets/Screenshot%202026-01-20%20160346.png) | ![Login](Assets/Screenshot%202026-01-20%20162047.png) | ![Signup](Assets/Screenshot%202026-01-20%20162103.png) |

### 📊 App Pages
| Dashboard | Add Expense | Group Details |
|---|---|---|
| ![Dashboard](Assets/Screenshot%202026-01-20%20161428.png) | ![Add Expense](Assets/Screenshot%202026-01-20%20161227.png) | ![Group Details](Assets/Screenshot%202026-01-20%20161523.png) |

### 💳 Settle & Notifications
| Settle Up | Notifications | Settings |
|---|---|---|
| ![Settle Up](Assets/Screenshot%202026-01-20%20161626.png) | ![Notifications](Assets/Screenshot%202026-01-20%20161715.png) | ![Settings](Assets/Screenshot%202026-01-20%20161655.png) |

---

## ⚙️ Setup & Run Locally

### 1️⃣ Clone

```bash
git clone <your_repo_url>
cd Expense-Splitter
```

### 2️⃣ Backend setup

```bash
cd Backend
npm install
npm run dev
```

Backend runs on:
`http://localhost:5000`

### 3️⃣ Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
`http://localhost:5173`

---

## 🔐 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=YOUR_MONGO_URI

ACCESS_TOKEN_SECRET=YOUR_ACCESS_SECRET
REFRESH_TOKEN_SECRET=YOUR_REFRESH_SECRET
INVITE_TOKEN_SECRET=YOUR_INVITE_SECRET

FRONTEND_URL=http://localhost:5173

BREVO_API_KEY=YOUR_BREVO_KEY
SMTP_FROM=your_email@gmail.com
SMTP_FROM_NAME=Expense Splitter
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment Notes

### Backend (Render)

* Create Web Service
* Add env variables
* Deploy

### Frontend (Vercel)

* Import frontend repo
* Add `VITE_API_URL` env variable
* Add `vercel.json` rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 👨‍💻 Author

**Vivek Rathore**
Full Stack Developer — Premium UI Full Project ✨

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub ❤️

````

