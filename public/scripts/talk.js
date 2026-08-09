// ============================================================
// CHERRY VOICE CONTROLLER
// ============================================================

.log("%c[CHERRY] talk.js loaded", "color:#22c55e;font-weight:bold;");


// ============================================================
// DOM
// ============================================================

const textInp =
    document.getElementsByClassName("input-text")[0];

const sendBtn =
    document.getElementsByClassName("send-btn")[0];

const startBtn =
    document.getElementById("startBtn");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceStatusText =
    document.getElementById("voiceStatusText");

const voicePulse =
    document.getElementById("voicePulse");


// ============================================================
// STATE
// ============================================================

let rec = null;

let isListening = false;

let isProcessing = false;

let shouldListen = false;

let silenceTimer = null;

let finalTranscript = "";


// ============================================================
// SETTINGS
// ============================================================

const SILENCE_TIMEOUT = 1500;


// ============================================================
// DEBUG LOGGER
// ============================================================

function log(...args) {

    console.log(
        "%c[CHERRY]",
        "color:#9333ea;font-weight:bold;",
        ...args
    );
}


function warn(...args) {

    console.warn(
        "%c[CHERRY]",
        "color:#eab308;font-weight:bold;",
        ...args
    );
}


function error(...args) {

    console.error(
        "%c[CHERRY]",
        "color:#ef4444;font-weight:bold;",
        ...args
    );
}


// ============================================================
// VOICE STATE
// ============================================================

function setVoiceState(state, message) {

    log(
        `STATE → ${state.toUpperCase()}`,
        "|",
        message
    );


    if (voiceStatus) {

        voiceStatus.dataset.state =
            state;
    }


    if (voiceStatusText) {

        voiceStatusText.textContent =
            message;
    }


    if (!startBtn) return;


    startBtn.classList.remove(
        "bg-blue-600",
        "bg-red-600",
        "bg-yellow-500",
        "bg-purple-600"
    );


    if (state === "listening") {

        startBtn.textContent =
            "Stop Cherry";

        startBtn.classList.add(
            "bg-red-600"
        );
    }


    else if (state === "processing") {

        startBtn.textContent =
            "Thinking...";

        startBtn.classList.add(
            "bg-yellow-500"
        );
    }


    else if (state === "speaking") {

        startBtn.textContent =
            "Speaking...";

        startBtn.classList.add(
            "bg-purple-600"
        );
    }


    else {

        startBtn.textContent =
            "Start Cherry";

        startBtn.classList.add(
            "bg-blue-600"
        );
    }
}


// ============================================================
// CHAT MESSAGE
// ============================================================

function appendMessage(text, user) {

    log(
        `Adding ${user} message:`,
        text
    );


    const container =
        document.querySelector(".container");


    if (!container) {

        error(
            "Chat container (.container) not found!"
        );

        return;
    }


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
    `;


    const strong =
        document.createElement("strong");


    strong.className =
        "text-black";


    strong.textContent =
        user === "ai"
            ? "Cherry"
            : "You";


    box.appendChild(strong);


    const p =
        document.createElement("p");


    p.className =
        "text-black";


    if (user === "ai") {

        p.innerHTML =
            marked.parse(text);

    } else {

        p.textContent =
            text;
    }


    box.appendChild(p);


    container.appendChild(box);


    container.scrollTop =
        container.scrollHeight;
}


// ============================================================
// SILENCE TIMER
// ============================================================

function clearSilenceTimer() {

    if (silenceTimer) {

        clearTimeout(
            silenceTimer
        );

        silenceTimer = null;

        log(
            "Silence timer cleared"
        );
    }
}


function startSilenceTimer() {

    clearSilenceTimer();


    log(
        `Silence timer started (${SILENCE_TIMEOUT}ms)`
    );


    silenceTimer =
        setTimeout(() => {

            log(
                "SILENCE DETECTED"
            );


            if (
                finalTranscript.trim() &&
                !isProcessing
            ) {

                submitSpeech();

            } else {

                log(
                    "Silence detected but there is no final transcript"
                );
            }

        }, SILENCE_TIMEOUT);
}


// ============================================================
// SUBMIT SPEECH
// ============================================================

function submitSpeech() {

    clearSilenceTimer();


    const question =
        finalTranscript.trim();


    finalTranscript =
        "";


    if (!question) {

        warn(
            "submitSpeech() called with empty transcript"
        );

        return;
    }


    log(
        "FINAL QUESTION:",
        question
    );


    appendMessage(
        question,
        "human"
    );


    sendQuestion(
        question
    );
}


// ============================================================
// CREATE RECOGNITION
// ============================================================

function createRecognition() {

    log(
        "Creating SpeechRecognition instance..."
    );


    if (
        !("webkitSpeechRecognition" in window)
    ) {

        error(
            "webkitSpeechRecognition is NOT available"
        );

        return null;
    }


    const recognition =
        new webkitSpeechRecognition();


    recognition.continuous =
        true;


    recognition.interimResults =
        true;


    recognition.lang =
        "en-US";


    recognition.maxAlternatives =
        1;


    log(
        "Recognition configuration:",
        {
            continuous:
                recognition.continuous,

            interimResults:
                recognition.interimResults,

            lang:
                recognition.lang,

            maxAlternatives:
                recognition.maxAlternatives
        }
    );


    // ========================================================
    // START
    // ========================================================

    recognition.onstart = () => {

        log(
            "🎤 MICROPHONE RECOGNITION STARTED"
        );


        isListening =
            true;


        setVoiceState(
            "listening",
            "Listening..."
        );
    };


    // ========================================================
    // AUDIO START
    // ========================================================

    recognition.onaudiostart = () => {

        log(
            "🎙 Audio capture started"
        );
    };


    // ========================================================
    // SOUND START
    // ========================================================

    recognition.onsoundstart = () => {

        log(
            "🔊 Sound detected"
        );
    };


    // ========================================================
    // SPEECH START
    // ========================================================

    recognition.onspeechstart = () => {

        log(
            "🗣 Speech detected"
        );

        clearSilenceTimer();
    };


    // ========================================================
    // SPEECH END
    // ========================================================

    recognition.onspeechend = () => {

        log(
            "🛑 Speech ended"
        );

        startSilenceTimer();
    };


    // ========================================================
    // RESULT
    // ========================================================

    recognition.onresult =
        (event) => {

        log(
            "Recognition result event:",
            event
        );


        let interimTranscript =
            "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const result =
                event.results[i];


            const transcript =
                result[0]
                    .transcript
                    .trim();


            log(
                result.isFinal
                    ? "FINAL:"
                    : "INTERIM:",
                transcript
            );


            if (
                result.isFinal
            ) {

                finalTranscript +=
                    transcript + " ";

            } else {

                interimTranscript +=
                    transcript + " ";
            }
        }


        // ----------------------------------------
        // SHOW LIVE TRANSCRIPT
        // ----------------------------------------

        if (
            interimTranscript &&
            voiceStatusText
        ) {

            voiceStatusText.textContent =
                `Listening: ${interimTranscript.trim()}`;
        }


        // ----------------------------------------
        // RESET SILENCE TIMER
        // ----------------------------------------

        if (
            interimTranscript.trim()
        ) {

            clearSilenceTimer();
        }


        if (
            finalTranscript.trim()
        ) {

            startSilenceTimer();
        }
    };


    // ========================================================
    // AUDIO END
    // ========================================================

    recognition.onaudioend = () => {

        log(
            "🎙 Audio capture ended"
        );
    };


    // ========================================================
    // SOUND END
    // ========================================================

    recognition.onsoundend = () => {

        log(
            "🔇 Sound ended"
        );
    };


    // ========================================================
    // ERROR
    // ========================================================

    recognition.onerror =
        (event) => {

        error(
            "❌ SPEECH RECOGNITION ERROR:",
            event.error
        );


        error(
            "Full recognition error:",
            event
        );


        switch (
            event.error
        ) {

            case "network":

                error(
                    "Chrome speech recognition network service failed."
                );


                shouldListen =
                    false;


                isListening =
                    false;


                clearSilenceTimer();


                setVoiceState(
                    "idle",
                    "Speech service unavailable"
                );


                break;


            case "not-allowed":

                error(
                    "Microphone permission denied."
                );


                shouldListen =
                    false;


                isListening =
                    false;


                setVoiceState(
                    "idle",
                    "Microphone permission denied"
                );


                break;


            case "audio-capture":

                error(
                    "No microphone/audio capture device."
                );


                shouldListen =
                    false;


                isListening =
                    false;


                setVoiceState(
                    "idle",
                    "Microphone unavailable"
                );


                break;


            case "no-speech":

                warn(
                    "No speech detected."
                );


                setVoiceState(
                    "listening",
                    "Listening..."
                );


                break;


            default:

                warn(
                    "Unhandled recognition error:",
                    event.error
                );
        }
    };


    // ========================================================
    // END
    // ========================================================

    recognition.onend =
        () => {

        log(
            "Recognition ended"
        );


        isListening =
            false;


        /*
         * If there is already a complete sentence,
         * submit it.
         */

        if (
            finalTranscript.trim() &&
            !isProcessing
        ) {

            log(
                "Recognition ended with transcript → submitting"
            );


            submitSpeech();

            return;
        }


        /*
         * Restart only if Cherry should still
         * be listening.
         */

        if (
            shouldListen &&
            !isProcessing &&
            !speechSynthesis.speaking
        ) {

            log(
                "Restarting recognition..."
            );


            setTimeout(() => {

                if (
                    !shouldListen ||
                    isListening
                ) {

                    return;
                }


                try {

                    recognition.start();

                }

                catch (err) {

                    warn(
                        "Recognition restart failed:",
                        err
                    );
                }

            }, 300);


            return;
        }


        if (
            !isProcessing &&
            !speechSynthesis.speaking
        ) {

            setVoiceState(
                "idle",
                "Click Start Cherry to speak"
            );
        }
    };


    return recognition;
}


// ============================================================
// START / STOP CHERRY
// ============================================================

if (
    !("webkitSpeechRecognition" in window)
) {

    error(
        "Speech recognition is not supported by this browser."
    );


    setVoiceState(
        "idle",
        "Speech recognition unsupported"
    );


    if (startBtn) {

        startBtn.disabled =
            true;
    }

}

else {

    log(
        "SpeechRecognition API detected"
    );


    startBtn.onclick =
        async () => {

        // ====================================================
        // STOP
        // ====================================================

        if (
            shouldListen ||
            isListening
        ) {

            log(
                "Stopping Cherry..."
            );


            shouldListen =
                false;


            isListening =
                false;


            clearSilenceTimer();


            if (rec) {

                try {

                    rec.stop();

                }

                catch (err) {

                    warn(
                        "Error stopping recognition:",
                        err
                    );
                }
            }


            speechSynthesis.cancel();


            finalTranscript =
                "";


            setVoiceState(
                "idle",
                "Click Start Cherry to speak"
            );


            return;
        }


        // ====================================================
        // START
        // ====================================================

        log(
            "================================="
        );

        log(
            "STARTING CHERRY"
        );

        log(
            "================================="
        );


        try {

            log(
                "Requesting microphone permission..."
            );


            const stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({
                        audio: true
                    });


            log(
                "Microphone permission granted"
            );


            // Show which audio devices are available.

            try {

                const devices =
                    await navigator
                        .mediaDevices
                        .enumerateDevices();


                const microphones =
                    devices.filter(
                        device =>
                            device.kind ===
                            "audioinput"
                    );


                log(
                    "Available microphones:",
                    microphones
                );

            }

            catch (deviceError) {

                warn(
                    "Could not enumerate devices:",
                    deviceError
                );
            }


            /*
             * We only needed getUserMedia to verify
             * microphone access.
             *
             * Stop this temporary stream.
             */

            stream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );


            rec =
                createRecognition();


            if (!rec) {

                throw new Error(
                    "Could not create SpeechRecognition"
                );
            }


            shouldListen =
                true;


            finalTranscript =
                "";


            log(
                "Starting recognition..."
            );


            rec.start();

        }

        catch (err) {

            error(
                "FAILED TO START CHERRY:",
                err
            );


            shouldListen =
                false;


            isListening =
                false;


            setVoiceState(
                "idle",
                "Could not start microphone"
            );
        }
    };
}


// ============================================================
// SEND QUESTION
// ============================================================

async function sendQuestion(question) {

    if (
        !question ||
        isProcessing
    ) {

        warn(
            "sendQuestion ignored:",
            {
                question,
                isProcessing
            }
        );

        return;
    }


    isProcessing =
        true;


    setVoiceState(
        "processing",
        "Thinking..."
    );


    log(
        "================================="
    );


    log(
        "SENDING QUESTION TO /ques"
    );


    log(
        "Question:",
        question
    );


    try {

        const response =
            await fetch(
                "/ques",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question
                        })
                }
            );


        log(
            "HTTP status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();


            error(
                "Server returned error:",
                errorText
            );


            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const result =
            await response.json();


        log(
            "SERVER RESPONSE:",
            result
        );


        /*
         * Your current server uses:
         *
         * res.json({
         *     responce: response.text
         * })
         */

        const answer =
            result.responce;


        if (!answer) {

            error(
                "Server response does not contain 'responce':",
                result
            );


            throw new Error(
                "Empty AI response"
            );
        }


        log(
            "CHERRY ANSWER:",
            answer
        );


        // ==============================================
        // PUT RESPONSE ON BOARD
        // ==============================================

        appendMessage(
            answer,
            "ai"
        );


        // ==============================================
        // SPEAK
        // ==============================================

        speak(
            answer
        );

    }

    catch (err) {

        error(
            "REQUEST FAILED:",
            err
        );


        appendMessage(
            "Sorry, I couldn't get a response.",
            "ai"
        );


        setVoiceState(
            "idle",
            "Something went wrong"
        );
    }


    finally {

        isProcessing =
            false;


        log(
            "Request finished"
        );
    }
}


// ============================================================
// TEXT SEND
// ============================================================

sendBtn.addEventListener(
    "click",
    () => {

        const text =
            textInp.value.trim();


        if (
            !text ||
            isProcessing
        ) {

            return;
        }


        log(
            "Text message:",
            text
        );


        appendMessage(
            text,
            "human"
        );


        textInp.value =
            "";


        sendQuestion(
            text
        );
    }
);


// ============================================================
// ENTER KEY
// ============================================================

textInp.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendBtn.click();
        }
    }
);


// ============================================================
// TEXT TO SPEECH
// ============================================================

function speak(text) {

    log(
        "Starting speech synthesis..."
    );


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


    utterance.onstart =
        () => {

        log(
            "🔊 CHERRY STARTED SPEAKING"
        );


        setVoiceState(
            "speaking",
            "Speaking..."
        );
    };


    utterance.onend =
        () => {

        log(
            "🔊 CHERRY FINISHED SPEAKING"
        );


        if (
            shouldListen
        ) {

            setVoiceState(
                "listening",
                "Listening..."
            );

        }

        else {

            setVoiceState(
                "idle",
                "Click Start Cherry to speak"
            );
        }
    };


    utterance.onerror =
        event => {

        error(
            "Speech synthesis error:",
            event
        );


        if (
            shouldListen
        ) {

            setVoiceState(
                "listening",
                "Listening..."
            );

        }

        else {

            setVoiceState(
                "idle",
                "Click Start Cherry to speak"
            );
        }
    };


    speechSynthesis.speak(
        utterance
    );
}