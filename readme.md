# CherryBot

> A voice-powered AI assistant built for students.

**CherryBot** is an AI-powered school assistant designed to make interacting with academic information faster and more natural. Instead of navigating through multiple pages, students can simply ask Cherry a question and receive an AI-generated response.

---

## Live Demo

> **Hosted URL:** `YOUR_HOSTED_URL_HERE`

<!-- Replace the URL above when the project is hosted. -->

---

## Features

### Voice Interaction

Talk naturally with Cherry using your microphone and receive spoken responses.

### AI-Powered Answers

Questions are processed through Google's Gemini AI to generate intelligent responses.

### Student-Focused

Designed around common student needs such as:

* Academic questions
* Timetable information
* Teacher information
* School arrangements
* Quick voice-based queries

### Real-Time Conversation

Cherry displays both the user's question and AI response directly on the conversation board.

### Text Input

Voice isn't required. Questions can also be entered manually through the text input.

### Text-to-Speech

Cherry can read AI responses aloud, making the assistant usable without constantly looking at the screen.

---

## Tech Stack

| Technology           | Purpose             |
| -------------------- | ------------------- |
| Node.js              | Runtime             |
| Express.js           | Backend server      |
| EJS                  | Frontend templating |
| Tailwind CSS         | UI styling          |
| JavaScript           | Client-side logic   |
| Google Gemini        | AI responses        |
| Web Speech API       | Speech recognition  |
| Speech Synthesis API | Voice responses     |

---

## How It Works

```text
                 ┌─────────────────┐
                 │      User       │
                 └────────┬────────┘
                          │
                    Voice / Text
                          │
                          ▼
                 ┌─────────────────┐
                 │    Cherry UI    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Express Server  │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   Gemini AI     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Cherry Response │
                 └───────┬─┬───────┘
                         │ │
                  Display │ │ Voice
                         │ │
                         ▼ ▼
                      User
```

---

## Project Structure

```text
CherryBot/
│
├── public/
│   ├── scripts/
│   ├── styles/
│   └── assets/
│
├── views/
│   ├── dashboard.ejs
│   ├── chooseClass.ejs
│   ├── classTimetable.ejs
│   ├── chooseTeacher.ejs
│   ├── teacherTimetable.ejs
│   ├── talk.ejs
│   └── arrangements.ejs
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/invouni/CherryBot.git
```

Enter the project:

```bash
cd CherryBot
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your `.env` file.

Make sure `.gitignore` contains:

```gitignore
node_modules/
.env
```

---

## Running Locally

Start the server:

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

If your project uses another port, use the port configured in `server.js`.

---

## Voice Input

Cherry can use the browser's microphone for voice interaction.

For the best experience:

1. Allow microphone access when prompted.
2. Select the desired microphone in your operating system.
3. Open Cherry in a supported browser.
4. Press **Start Cherry**.
5. Speak normally.
6. Cherry automatically waits for a short period of silence before submitting your question.

> Browser speech-recognition support can vary between browsers and devices.

---

## Current Status

### Completed

* [x] AI question answering
* [x] Text input
* [x] Voice input
* [x] Automatic silence detection
* [x] AI response display
* [x] Text-to-speech
* [x] Student timetable interface
* [x] Teacher timetable interface
* [x] Teacher arrangements
* [x] Responsive frontend

### Planned

* [ ] Improved speech-to-text reliability
* [ ] Better mobile support
* [ ] Persistent conversation history
* [ ] Wake-word activation
* [ ] More school-specific commands
* [ ] Production deployment

---

## Screenshots

Add screenshots of Cherry here.

```text
┌──────────────────────────────────────────────┐
│                                              │
│              ADD SCREENSHOT                  │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Contributing

Contributions, ideas, and improvements are welcome.

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git add .
git commit -m "Add your feature"
```

5. Push the branch.

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

## License

This project is currently intended for educational and experimental use.

---

## Author

**Vaibhav**

Built with Node.js, Express, JavaScript, and Gemini AI.

---

<p align="center">
  <b>CherryBot</b><br>
  Ask. Listen. Learn.
</p>
