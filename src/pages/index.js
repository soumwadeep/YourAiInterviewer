import Head from "next/head";
import styles from "@/styles/Home.module.css";
import React, { useState, useEffect, useRef } from "react";
import { FaVideo } from "react-icons/fa";
import Console from "@/components/Console";

const MediaStreamWrapper = ({ children }) => {
  const [userMediaStream, setUserMediaStream] = useState(null);

  useEffect(() => {
    // Initialize getUserMedia on component mount
    const initMediaStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setUserMediaStream(stream);
    };

    initMediaStream();
  }, []);

  return children({ userMediaStream, setUserMediaStream });
};

export default function Home() {
  function introduction() {
    return {
      role: "assistant",
      content: "Please wait while the system initializes...",
    };
  }

  const [showCamera, setShowCamera] = useState(false); // State to toggle camera view
  const [textInput, setTextInput] = useState("");
  const audioRefs = useRef(Array(512).fill(null));
  const sessionMessages = useRef([introduction()]);
  const detectionSettings = useRef({
    activityDetection: true,
    activityDetectionThreshold: 10,
  });
  const [promptOpen, setPromptOpen] = useState(false);
  const [activityDetection, setActivityDetection] = useState(0);
  const [playQueue, setPlayQueue] = useState([]);
  const [currentAIAudio, setCurrentAIAudio] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const currentSession = useRef(null);
  const micQuiet = useRef(3000);
  const [rerender, setRerender] = useState(0);
  const selectedPrompt = useRef("");
  const [preprocessedJobDescription, setPreprocessedJobDescription] =
    useState("");
  const interviewSettings = useRef({
    personalityOptions: [
      { label: "Friendly", value: "friendly and warm", enabled: true },
      { label: "Formal", value: "formal and professional", enabled: false },
      {
        label: "Challenging",
        value: "challenging and engaging",
        enabled: false,
      },
      {
        label: "Encouraging",
        value: "encouraging and supportive",
        enabled: false,
      },
      {
        label: "Enthusiastic",
        value: "enthusiastic and energetic",
        enabled: false,
      },
    ],
    questionTypes: [
      { label: "Behavioral", value: "behavioral", enabled: true },
      { label: "Technical", value: "technical", enabled: true },
      { label: "Culture Fit", value: "culture", enabled: true },
      { label: "Situational", value: "situational", enabled: true },
    ],
    feedback: true,
  });

  const toggleCamera = () => {
    setShowCamera((prev) => !prev); // Toggle the camera view
  };

  function resetPlaceholderPrompt() {
    sessionMessages.current = [
      {
        role: "welcome",
        content: "",
      },
    ];
    setRerender(rerender + 1);
  }

  useEffect(() => {
    fetch("/api/credentials").then((response) => {
      response.json().then((data) => {
        if (data.messages.length > 0) {
          sessionMessages.current = [introduction, ...data.messages];
          setRerender(rerender + 1);
        } else {
          resetPlaceholderPrompt();
        }
      });
    });
  }, []);

  return (
    <>
      <Head>
        <title>Your AI Interviewer</title>
        <meta
          name="description"
          content="Have A Mock Interview With AI To Get Suggestions."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="./logo.png"></link>
      </Head>
      <main className={styles.main}>
        <h1 style={{ textAlign: "center" }}>Welcome To AI Interviewer</h1>
        <br />
        <div className={styles.description}>
          {/* Render the video icon */}
          <div onClick={toggleCamera} style={{ cursor: "pointer" }}>
            <FaVideo size={30} />
          </div>
          {/* Conditional rendering of camera view */}
          {showCamera && (
            <MediaStreamWrapper>
              {({ userMediaStream, setUserMediaStream }) => (
                <video
                  ref={(video) => {
                    if (video && userMediaStream) {
                      video.srcObject = userMediaStream;
                      video.onloadedmetadata = () => {
                        video.play();
                      };
                    }
                  }}
                  autoPlay
                  style={{ width: "100%", height: "auto" }}
                />
              )}
            </MediaStreamWrapper>
          )}
          {/* Chat window */}
          <MediaStreamWrapper>
            {({ userMediaStream, setUserMediaStream }) => (
              <div className={styles.chatWindow}>
                <Console
                  selectedPrompt={selectedPrompt}
                  rerender={rerender}
                  setRerender={setRerender}
                  sessionMessages={sessionMessages}
                  textInput={textInput}
                  setTextInput={setTextInput}
                  detectionSettings={detectionSettings}
                  currentAudio={currentAudio}
                  setCurrentAudio={setCurrentAudio}
                  activityDetection={activityDetection}
                  setActivityDetection={setActivityDetection}
                  currentAIAudio={currentAIAudio}
                  setCurrentAIAudio={setCurrentAIAudio}
                  playQueue={playQueue}
                  setPlayQueue={setPlayQueue}
                  audioRefs={audioRefs}
                  userMediaStream={userMediaStream} // Now userMediaStream is accessible here
                  currentSession={currentSession}
                  promptOpen={promptOpen}
                  setPromptOpen={setPromptOpen}
                  micQuiet={micQuiet}
                  resetPlaceholderPrompt={resetPlaceholderPrompt}
                  preprocessedJobDescription={preprocessedJobDescription}
                  setPreprocessedJobDescription={setPreprocessedJobDescription}
                  interviewSettings={interviewSettings}
                />
              </div>
            )}
          </MediaStreamWrapper>
        </div>
      </main>
    </>
  );
}
