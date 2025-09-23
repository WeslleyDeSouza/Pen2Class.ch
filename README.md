# Pen2Class

Demo: https://pen2class.ch/

---

![Status](https://img.shields.io/badge/status-MVP-orange)  
![Security](https://img.shields.io/badge/security-not%20production%20ready-red)

**Pen2Class** is an MVP browser-based coding platform designed for classrooms.  
It enables students to code in **HTML, CSS, and JavaScript** with a live preview and built-in error detection, while teachers can monitor each student’s editor in real time and provide instant feedback – no setup or registration required.

---

> ⚠️ **Important Note**  
> This project is an **MVP prototype** and **not a production-ready tool**.  
> It does **not implement full security standards** and should only be used for testing, experimentation, or educational demonstrations.

---


## ✨ Features

- **Multi-Language Code Editor**
  - Separate editors for HTML, CSS, and JavaScript
  - Syntax highlighting, line numbers, and tab navigation

- **Live Preview**
  - Instant updates on every code change
  - Secure iframe sandbox for execution
  - Full HTML/CSS/JS rendering

- **Error Detection**
  - HTML: unclosed tags and syntax errors
  - CSS: missing semicolons, incorrect braces
  - JavaScript: real-time syntax validation
  - Visual indicators + detailed error messages

- **Teacher View**
  - Monitor each student’s editor in real time
  - Provide direct feedback on their code
  - Creates a collaborative, interactive classroom experience

- **User-Friendly**
  - Dark theme for comfortable coding
  - Keyboard shortcuts supported
  - No registration, no installation, works in any modern browser

---

## 🚀 Use Cases

- **Students**: Learn web development with instant feedback
- **Teachers**: Run interactive, engaging coding sessions
- **Workshops**: Fast prototyping and real-time collaboration

---

## 🛠 Technology Stack

- **Frontend**: APP: Angular, Landing Page: React
- **Backend**: API: NestJS, DB: 
- **Editor**: Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Realtime**: WebRTC/PeerJS for peer-to-peer connections (teacher ↔ students)

---
