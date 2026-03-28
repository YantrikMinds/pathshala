made by :- nishant pathak 
pathak.nishant2517@gmail.com


# 🎓 Student Group & Assignment Management System

## 📌 Overview
This project is a web-based academic management system designed to help students and teachers manage assignments, attendance, and communication in a centralized platform.

The system allows students to view assignments, track attendance, and receive notifications, while teachers can manage students, assignments, and academic data.

This project is inspired by real-world classroom workflows where students collaborate and teachers need a centralized dashboard.

---

## 🚀 Features

### 👨‍🎓 Student Features
- Dashboard access
- View attendance
- Access assignments
- Login using ID & password provided by teacher
- Receive notifications from teacher
- View fee status

### 👨‍🏫 Teacher Features
- Generate student ID & password
- Mark daily attendance
- Provide assignments
- Send messages/notifications to students
- Manage student data

---

## 🔄 Ongoing Development / Future Enhancements
- Group Creation & Member Management *(Planned)*
- Assignment Submission Confirmation System *(In development)*
- Admin Dashboard for tracking group progress *(Planned)*
- Notification system for deadlines *(Future scope)*
- Assignment link sharing feature *(Upcoming)*

---

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript  
- Backend / Database: Firebase  
- Real-time Updates: Firestore   
- Hosting: Netlify  

---

## 🏗️ Architecture Overview

The system follows a simple client-database architecture:

Frontend (JavaScript) → Firebase 

- The frontend directly interacts with Firebase  
- Firestore stores and syncs data in real-time  
- No separate backend server is used  

---

## 🗄️ Database Schema (Firestore)

### 📁 Collections:

#### 1. assignments
- title
- description
- class
- date
- id (auto-generated)

#### 2. users
- name
- email
- role (admin/student)
- password

#### 3. records (optional)
- attendance data
- fee status

---

## 🔗 API / Data Handling

This project does not use traditional REST APIs.

Instead, it uses Firebase Firestore methods:
- `onSnapshot()` → Real-time data updates  
- `addDoc()` → Add new data  
- `getDocs()` → Fetch data  
- `updateDoc()` → Update records  

---

## ⚙️ Setup & Run Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YantrikMinds/pathshala
