// ---------------------------------------------  
// Imports & Data  
// ---------------------------------------------  
const { GoogleGenAI } = require("@google/genai");  

// JSON datasets  
const timetable = require("../jsons/studTT.json");  
const teachersTt = require("../jsons/teachersTt.json");  
const pdInfo = require("../jsons/pdInfo.json");  
const rooms = require("../jsons/classes.json");  

// Gemini AI instance  
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});  

// Chat session (initialized later)  
let chat;  

// ---------------------------------------------  
// Initialize AI Chat Session  
// ---------------------------------------------  
async function init() {  
  // console.log("Initializing");  

  // Main instruction prompt for the AI  
  const prompt = `  
Your name is Cherry 

You are a helpful, intelligent, and interactive student-assistant AI.   
Your role is to assist students and teachers in a school environment with the following capabilities:  

1. Answer academic questions clearly with step-by-step reasoning also asnwer jokes ques and other ques related to any type of knowlage.  
2. Handle timetables: show, check, update for students or teachers.  
3. Adjust schedules when teachers are absent and suggest substitutes.  
4. Resolve timetable conflicts and propose alternatives.  
5. Keep tone friendly, polite, and professional.  
6. Use only the JSON data provided and ask when data is missing.  
7. Keep responses short and crisp.  
8. Do not use any special characters. Only plain text since responses are spoken.  
9. Try not to answer in more than 30 words at max 50 words in worst 100 words.
`;  

  // Load JSON data into the context  
  const dataPrompt = `  
timetable of students: ${JSON.stringify(timetable)}  
teachers timetable: ${JSON.stringify(teachersTt)}  
teachers and all info: ${JSON.stringify(pdInfo)}  
all classes: ${JSON.stringify(rooms)}  
`;  

  // Create a persistent chat session with initial history  
  chat = ai.chats.create({  
    model: "gemini-2.5-flash",  
    history: [  
      { role: "user", parts: [{ text: "Hello" }] },  
      { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }] },  

      { role: "user", parts: [{ text: prompt }] },  
      { role: "model", parts: [{ text: "I am ready to assist you" }] },  

      { role: "user", parts: [{ text: "I will provide you JSON and you will train according to the data which is simply a timetable" }] },  
      { role: "model", parts: [{ text: "I will understand all the parts and will assist you" }] },  

      { role: "user", parts: [{ text: dataPrompt }] }  
    ]  
  });  

  // console.log("Chat initialized");  
}  

// ---------------------------------------------  
// Handle AI Query  
// ---------------------------------------------  
async function cherry(ques) {  
  // Send the question as a message  
  const response = await chat.sendMessage({ message: ques.question });  

  // console.log(response);  
  return response;  
}  

// ---------------------------------------------  
// Exports  
// ---------------------------------------------  
module.exports = { init, cherry };
