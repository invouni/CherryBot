"use strict";

// ==========================================
// DOM ELEMENTS
// ==========================================

const input =
    document.querySelector(".input-text");

const sendButton =
    document.querySelector(".send-btn");

const chatContainer =
    document.querySelector(".container");

const startButton =
    document.querySelector("#startBtn");

const voiceStatus =
    document.querySelector("#voiceStatus");

const voiceStatusText =
    document.querySelector("#voiceStatusText");


// ==========================================
// STATE
// ==========================================

let recognition = null;

let isListening = false;
let isProcessing = false;
let isSpeaking = false;

let shouldKeepListening = false;


// ==========================================
// VOICE STATUS
// ==========================================

function setVoiceState(state, text) {

    if (!voiceStatus) return;

    voiceStatus.dataset.state = state;

    if (voiceStatusText) {
        voiceStatusText.textContent = text;
    }
}


// ==========================================
// APPEND MESSAGE
// ==========================================

function appendMessage(text, user) {

    if (!chatContainer) return;

    const box =
        document.createElement("div");

    box.className = `
        box
        w-[95%]
        mx-auto
        h-auto
        py-2
        px-3
        flex
        flex-col
        rounded-md
        my-[0.3rem]
        ${user === "ai"
            ? "bg-[#FFFAF5]"
            : "bg-[#DCF8C6]"
        }
    `.trim();


    // ======================================
    // ICON
    // ======================================

    const strong =
        document.createElement("strong");

    strong.className =
        "text-black";

    strong.textContent =
        user === "ai"
            ? "🤖"
            : "🧑‍💻";

    box.appendChild(strong);


    // ======================================
    // MESSAGE
    // ======================================

    const p =
        document.createElement("p");

    p.className =
        "text-black";


    if (
        user === "ai" &&
        typeof marked !== "undefined"
    ) {

        p.innerHTML =
            marked.parse(text);

    } else {

        p.textContent = text;

    }


    box.appendChild(p);

    chatContainer.appendChild(box);


    // ======================================
    // AUTO SCROLL
    // ======================================

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


// ==========================================
// SEND QUESTION
// ==========================================

async function sendQuestion(question) {

    if (!question || !question.trim()) {
        return;
    }

    question =
        question.trim();


    // ======================================
    // PROCESSING
    // ======================================

    isProcessing = true;

    setVoiceState(
        "processing",
        "Thinking..."
    );


    try {

        const response =
            await fetch("/ques", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question: question
                })

            });


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Cherry response:",
            result
        );


        /*
         * Keeping your existing backend key:
         *
         * result.responce
         */

        const answer =
            result.responce;


        if (!answer) {

            throw new Error(
                "Empty response from Cherry"
            );

        }


        // ==================================
        // DISPLAY AI RESPONSE
        // ==================================

        appendMessage(
            answer,
            "ai"
        );


        isProcessing = false;


        // ==================================
        // SPEAK RESPONSE
        // ==================================

        await speak(answer);


    } catch (error) {

        console.error(
            "Cherry error:",
            error
        );


        isProcessing = false;


        appendMessage(
            "Sorry, I couldn't process that request.",
            "ai"
        );


        setVoiceState(
            "idle",
            "Click Start Cherry to speak"
        );

    }

}


// ==========================================
// TEXT MESSAGE
// ==========================================

function sendTextMessage() {

    if (!input) return;

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    // Display immediately

    appendMessage(
        text,
        "human"
    );


    // Clear input

    input.value = "";


    // Send

    sendQuestion(text);
}


// ==========================================
// SEND BUTTON
// ==========================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendTextMessage
    );

}


// ==========================================
// ENTER KEY
// ==========================================

if (input) {

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendTextMessage();

            }

        }
    );

}


// ==========================================
// SPEECH RECOGNITION
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    console.warn(
        "Speech recognition is not supported."
    );


    setVoiceState(
        "idle",
        "Speech recognition is not supported."
    );


    if (startButton) {

        startButton.disabled = true;

        startButton.textContent =
            "Speech Not Supported";

    }

} else {

    recognition =
        new SpeechRecognition();


    // ======================================
    // RECOGNITION SETTINGS
    // ======================================

    recognition.continuous = true;

    recognition.interimResults = false;

    recognition.lang = "en-US";


    // ======================================
    // RECOGNITION START
    // ======================================

    recognition.onstart = () => {

        isListening = true;

        setVoiceState(
            "listening",
            "Listening..."
        );


        if (startButton) {

            startButton.textContent =
                "Stop Cherry";

        }


        console.log(
            "Cherry is listening..."
        );

    };


    // ======================================
    // SPEECH RESULT
    // ======================================

    recognition.onresult =
        (event) => {

            let finalTranscript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const result =
                    event.results[i];


                if (result.isFinal) {

                    finalTranscript +=
                        result[0].transcript + " ";

                }

            }


            finalTranscript =
                finalTranscript.trim();


            if (!finalTranscript) {
                return;
            }


            console.log(
                "User said:",
                finalTranscript
            );


            // ==================================
            // SHOW USER MESSAGE
            // ==================================

            appendMessage(
                finalTranscript,
                "human"
            );


            // ==================================
            // SEND TO AI
            // ==================================

            sendQuestion(
                finalTranscript
            );

        };


    // ======================================
    // RECOGNITION END
    // ======================================

    recognition.onend = () => {

        isListening = false;


        console.log(
            "Speech recognition ended."
        );


        /*
         * If Cherry is speaking or processing,
         * don't restart recognition here.
         */

        if (
            isSpeaking ||
            isProcessing
        ) {

            return;

        }


        /*
         * If user pressed Start Cherry,
         * continue listening.
         */

        if (shouldKeepListening) {

            setTimeout(
                startListening,
                300
            );

        } else {

            setVoiceState(
                "idle",
                "Click Start Cherry to speak"
            );


            if (startButton) {

                startButton.textContent =
                    "Start Cherry";

            }

        }

    };


    // ======================================
    // RECOGNITION ERROR
    // ======================================

    recognition.onerror =
        (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            isListening = false;


            if (
                event.error ===
                "not-allowed"
            ) {

                shouldKeepListening =
                    false;


                setVoiceState(
                    "idle",
                    "Microphone permission denied."
                );

            } else if (
                event.error ===
                "no-speech"
            ) {

                /*
                 * Don't treat no-speech as a
                 * fatal error.
                 */

                if (
                    shouldKeepListening &&
                    !isSpeaking &&
                    !isProcessing
                ) {

                    setTimeout(
                        startListening,
                        300
                    );

                }

            } else {

                setVoiceState(
                    "idle",
                    "Voice recognition error."
                );

            }

        };

}


// ==========================================
// START LISTENING
// ==========================================

function startListening() {

    if (!recognition) {
        return;
    }


    if (isListening) {
        return;
    }


    if (isSpeaking || isProcessing) {
        return;
    }


    try {

        recognition.start();

    } catch (error) {

        /*
         * Browser can throw InvalidStateError
         * if recognition is already starting.
         */

        console.log(
            "Recognition start skipped:",
            error.message
        );

    }

}


// ==========================================
// STOP LISTENING
// ==========================================

function stopListening() {

    if (!recognition) {
        return;
    }


    if (!isListening) {
        return;
    }


    try {

        recognition.stop();

    } catch (error) {

        console.log(
            "Recognition stop:",
            error.message
        );

    }

}


// ==========================================
// START / STOP BUTTON
// ==========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            /*
             * If currently listening:
             * completely stop Cherry.
             */

            if (isListening) {

                shouldKeepListening =
                    false;

                stopListening();

                setVoiceState(
                    "idle",
                    "Click Start Cherry to speak"
                );

                startButton.textContent =
                    "Start Cherry";

                return;
            }


            /*
             * Start continuous voice mode.
             */

            shouldKeepListening =
                true;


            startListening();

        }
    );

}


// ==========================================
// TEXT TO SPEECH
// ==========================================

function speak(text) {

    return new Promise(
        (resolve) => {

            if (
                !("speechSynthesis" in window)
            ) {

                resolve();

                return;

            }


            /*
             * Stop listening before Cherry speaks.
             */

            if (isListening) {
                stopListening();
            }


            isSpeaking = true;


            /*
             * Cancel anything currently speaking.
             */

            speechSynthesis.cancel();


            const utterance =
                new SpeechSynthesisUtterance(
                    text
                );


            utterance.lang =
                "en-US";

            utterance.rate =
                1;

            utterance.pitch =
                1;


            // ==================================
            // SPEECH START
            // ==================================

            utterance.onstart = () => {

                setVoiceState(
                    "speaking",
                    "Speaking..."
                );


                console.log(
                    "Cherry is speaking..."
                );

            };


            // ==================================
            // SPEECH END
            // ==================================

            utterance.onend = () => {

                isSpeaking = false;


                console.log(
                    "Cherry finished speaking."
                );


                /*
                 * If voice mode is still enabled,
                 * automatically listen again.
                 */

                if (
                    shouldKeepListening
                ) {

                    setVoiceState(
                        "listening",
                        "Listening..."
                    );


                    setTimeout(
                        startListening,
                        400
                    );

                } else {

                    setVoiceState(
                        "idle",
                        "Click Start Cherry to speak"
                    );

                }


                resolve();

            };


            // ==================================
            // SPEECH ERROR
            // ==================================

            utterance.onerror =
                (event) => {

                    console.error(
                        "Speech synthesis error:",
                        event.error
                    );


                    isSpeaking = false;


                    if (
                        shouldKeepListening
                    ) {

                        setVoiceState(
                            "listening",
                            "Listening..."
                        );


                        setTimeout(
                            startListening,
                            400
                        );

                    } else {

                        setVoiceState(
                            "idle",
                            "Click Start Cherry to speak"
                        );

                    }


                    resolve();

                };


            // ==================================
            // SPEAK
            // ==================================

            speechSynthesis.speak(
                utterance
            );

        }
    );
}


// ==========================================
// PAGE LOAD
// ==========================================

setVoiceState(
    "idle",
    "Click Start Cherry to speak"
);