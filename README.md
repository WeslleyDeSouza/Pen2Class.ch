# Pen2Class

Demo: https://pen2class.ch/

---

**Pen2Class** is an MVP browser-based coding platform designed for classrooms.  
It enables students to code in **HTML, CSS, and JavaScript** with a live preview and built-in error detection, while teachers can monitor each student’s editor in real time and provide instant feedback – no setup or registration required.

---

> ⚠️ **Important Note**  
> This project is an **MVP prototype** and **not a production-ready tool**.  
> It does **not implement full security standards** and should only be used for testing, experimentation, or educational demonstrations.

---

![Status](https://img.shields.io/badge/status-MVP-orange) 
![Security](https://img.shields.io/badge/security-not%20production%20ready-red)

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

## 🛤️ StoryLine

### Teacher Story Admin
```mermaid
journey
  title (Teacher)
  section ClassRooms
    Create new classroom: 5: Teacher
    Manage classroom settings: 4: Teacher
    Generate access link & code: 5: Teacher
  section Lessons
    Create new lesson: 5: Teacher
    Attach HTML/CSS/JS starter code: 4: Teacher
    Publish lesson to classroom: 5: Teacher
  section Monitoring
    View signed-in students: 5: Teacher
    Open individual student editors: 5: Teacher
    Give real-time feedback: 5: Teacher

````

### Teacher Story Admin
```mermaid
journey
  title (Student)
  section Join & Setup
    Join classroom via link/code: 5: Student
    Choose display name: 4: Student
  section Lessons
    Access published lessons: 5: Student
    Open own editor (HTML/CSS/JS): 5: Student
  section Coding
    Start coding with live preview: 5: Student
    View error messages: 4: Student
    Receive feedback from teacher: 5: Student
````
----

## 🛠 Technology Stack

- **Frontend**: APP: Angular, Landing Page: React
- **Backend**: API: NestJS, DB: 
- **Editor**: Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Realtime**: WebRTC/PeerJS for peer-to-peer connections (teacher ↔ students)

---
