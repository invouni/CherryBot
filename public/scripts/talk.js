let textInp = document.getElementsByClassName("input-text")[0];
let sendBtn = document.getElementsByClassName("send-btn")[0];

function appendMessage(text, user) {
  const container = document.querySelector(".container");

  // Create main box div
  const box = document.createElement("div");
  box.className = `
    box w-[95%] mx-auto h-auto py-2 px-3 flex flex-col rounded-md my-[0.3rem]
    ${user === "ai" ? "bg-[#FFFAF5]" : "bg-[#DCF8C6]"}
  `.trim();

  // Strong element for user icon
  const strong = document.createElement("strong");
  strong.className = "text-black";
  strong.textContent = user === "ai" ? "🤖" : "🧑‍💻";
  box.appendChild(strong);

  // Paragraph for message text
  const p = document.createElement("p");
  p.className = "text-light";
  p.innerHTML = text;
  box.appendChild(p);

  // Append to container
  container.appendChild(box);

  // Auto scroll
  container.scrollTop = container.scrollHeight;
}

// Check if speech recognition is supported
if (!("webkitSpeechRecognition" in window)) {
  alert("Speech recognition not supported in this browser.");
} else {
  let rec;

  document.getElementById("startBtn").onclick = () => {
    rec = new webkitSpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      let finalTrans = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTrans += transcript + " ";
        }
      }

      if (finalTrans.trim() !== "") {
        sendQuestion(finalTrans.trim());
        appendMessage(finalTrans.trim(), "human");
      }
    };

    rec.onerror = (e) => console.log("Speech recognition error:", e.error);
    rec.onend = () => console.log("Speech recognition ended");

    rec.start();
    console.log("Speech recognition started...");
  };

  // Function to send question to backend
  async function sendQuestion(question) {
    const data = { question };
    console.log(data);

    try {
      console.log("Sending question...");
      const response = await fetch("/ques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json(); // parse JSON response
      speak(result.responce);
      appendMessage(marked.parse(result.responce), "ai");
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error sending question:", err);
    }
  }
  sendBtn.addEventListener("click", () => {
    let text = textInp.value.trim();

    if (!text) {
      return;
    }

    appendMessage(text, "human");
    sendQuestion(text);
    textInp.value = "";
  });
  // Simple TTS
  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }
}
