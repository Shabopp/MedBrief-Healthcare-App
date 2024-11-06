"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";

export function VoiceRecordingModal({ isOpen, onClose, onStopRecording }) {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const volumeThreshold = 0.05 // Define a threshold for pausing animation

  useEffect(() => {
    if (isOpen && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

        setIsRecording(true);
        animateVolume();
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    onStopRecording();
  };

  const animateVolume = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
      const normalizedVolume = average / 256;

      setVolume(normalizedVolume);
    }

    animationFrameRef.current = requestAnimationFrame(animateVolume);
  };

  const circles = [
    { scale: 1, opacity: 0.1 },
    { scale: 0.8, opacity: 0.2 },
    { scale: 0.6, opacity: 0.3 },
    { scale: 0.4, opacity: 0.4 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Voice Recording</h2>
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                <X className="h-6 w-6" />
              </button>
            </header>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 mb-8">
                <AnimatePresence>
                  {isRecording && circles.map((circle, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-full bg-red-500"
                      initial={{ scale: circle.scale, opacity: 0 }}
                      animate={
                        volume > volumeThreshold
                          ? { // Animate if volume is above threshold
                              scale: [circle.scale, circle.scale + (volume * 0.7), circle.scale],
                              opacity: [circle.opacity, circle.opacity * (1 + volume), circle.opacity],
                            }
                          : { // Keep static if volume is below threshold
                              scale: circle.scale,
                              opacity: circle.opacity,
                            }
                      }
                      transition={{
                        duration: volume > volumeThreshold ? 1 - volume * 0.7 : 0, // Faster with higher volume
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.15,
                      }}
                    />
                  ))}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: isRecording && volume > volumeThreshold ? 1 + volume * 0.3 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <div className="bg-white rounded-full p-4">
                    <Mic className="h-8 w-8 text-red-500" />
                  </div>
                </motion.div>
              </div>
              <p className="text-center mb-6 text-sm text-gray-600">
                {isRecording ? "Recording in progress..." : "Click the button to start recording"}
              </p>
              <button
                className={`w-full py-2 rounded-lg text-white ${
                  isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <X className="mr-2 h-4 w-4 inline" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4 inline" /> Start Recording
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
