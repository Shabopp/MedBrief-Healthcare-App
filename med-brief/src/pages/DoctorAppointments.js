// DoctorAppointments.js

import React, { useState, useEffect, useRef } from "react";
import { firestore, storage } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { useAuth } from "../context/AuthContext";
import { transcribeAudio } from "../api/assemblyAI";
import { summarizeAndExtractPrescription } from "../api/gemini";
import { motion, AnimatePresence } from "framer-motion";
import {Mic, X, Calendar, Clock, User, FileText, Pill,Upload } from "lucide-react";

function DoctorAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const volumeThreshold = 0.05;

  useEffect(() => {
    const q = query(
      collection(firestore, "appointments"),
      where("doctor_id", "==", currentUser.uid),
      where("status", "in", ["pending", "approved", "completed"])
    );
  
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const updatedAppointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const appointment = doc.data();
          const patientData = await fetchPatientData(appointment.patient_id);
  
          // Use primaryReason directly from patientData (not preAppointmentAnswers)
          return {
            ...appointment,
            id: doc.id,
            patient_name: patientData.fullName || "Unknown Patient",
            profilePhotoUrl: patientData.profilePhotoUrl || "/placeholder.svg",
            appointment_time: format(
              fromZonedTime(
                new Date(appointment.appointment_time),
                Intl.DateTimeFormat().resolvedOptions().timeZone
              ),
              "MM/dd/yyyy, h:mm:ss a"
            ),
            recentChanges: patientData.recentChanges || "N/A",
            primaryReason: patientData.preAppointmentAnswers?.primaryReason || "N/A",  // Changed to use directly from patientData
          };
        })
      );
      setAppointments(updatedAppointments);
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, [currentUser]);
  
  

  const fetchPatientData = async (patientId) => {
    const patientRef = doc(firestore, "users", patientId);
    const patientDoc = await getDoc(patientRef);
    const patientData = patientDoc.data();
  

  
    return {
      ...patientData,
    
    };
  };
  
  
  
  const handleApprove = async (appointmentId) => {
    try {
      const appointmentRef = doc(firestore, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status: "approved" });
      alert("Appointment approved!");
    } catch (error) {
      console.error("Error approving appointment:", error);
    }
  };

  const handleDecline = async (appointmentId) => {
    try {
      const appointmentRef = doc(firestore, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status: "declined" });
      alert("Appointment declined!");
    } catch (error) {
      console.error("Error declining appointment:", error);
    }
  };


  const startRecording = async () => {
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      animateVolume();

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone!");
    }
  };

  const stopRecording = async (appointmentId) => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const audioFile = new File([audioBlob], `appointment_${appointmentId}.webm`, { type: "audio/webm" });
      audioChunksRef.current = [];
      await handleAudioUpload(audioFile, appointmentId);
    };
  };

  const handleAudioUpload = async (audioFile, appointmentId) => {
    try {
      setIsLoading(true);
      const storageRef = ref(storage, `appointments/${appointmentId}/audio`);
      await uploadBytes(storageRef, audioFile);
      const audioUrl = await getDownloadURL(storageRef);

      const { transcript } = await transcribeAudio(audioUrl);
      const { reviewedTranscription, summary, medicines } = await summarizeAndExtractPrescription(transcript);

      const appointmentRef = doc(firestore, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        transcription: transcript,
        reviewed_transcription: reviewedTranscription,
        summary,
        prescriptions: medicines,
        status: "completed",
      });
      alert("Audio uploaded and appointment details updated!");
    } catch (error) {
      console.error("Error during audio upload:", error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex justify-center">Your Appointments</h1>
      <div className="grid w-full grid-cols-3">
        {["pending", "approved", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`py-2 px-4 rounded ${
              activeTab === status ? "bg-black text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      <div className="h-[600px] overflow-y-auto">
        <AnimatePresence>
          {isLoading ? (
            <AppointmentSkeleton />
          ) : (
            appointments
              .filter((a) => a.status === activeTab)
              .map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border rounded-md border-b-gray-300 bg-white mb-4 mt-4 "
                >
                  <AppointmentCard
                    appointment={appointment}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    isRecording={isRecording}
                    onStartRecording={startRecording}
                    onStopRecording={() => stopRecording(appointment.id)}
                    onAudioUpload={handleAudioUpload}
                    volume={volume}
                  />
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}





function RecordingModal({ isOpen, volume, isRecording, onClose, startRecording, stopRecording }) {
  if (!isOpen) return null;

  const volumeThreshold = 0.05;
  const circles = [
    { scale: 1, opacity: 0.1 },
    { scale: 0.8, opacity: 0.2 },
    { scale: 0.6, opacity: 0.3 },
    { scale: 0.4, opacity: 0.4 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
          >
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Voice Recording</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <X className="h-6 w-6" />
              </button>
            </header>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 mb-8">
                <AnimatePresence>
                  {isRecording && circles.map((circle, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-full bg-red-500"
                      initial={{ scale: circle.scale, opacity: 0 }}
                      animate={
                        volume > volumeThreshold
                          ? {
                              scale: [circle.scale, circle.scale + volume * 0.7, circle.scale],
                              opacity: [circle.opacity, 0.4, circle.opacity],
                            }
                          : {
                              scale: circle.scale,
                              opacity: circle.opacity,
                            }
                      }
                      transition={{
                        duration: volume > volumeThreshold ? 1 - volume * 0.7 : 0,
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
                  <div className="bg-white rounded-full p-6 shadow-lg">
                    <Mic className="h-12 w-12 text-red-500" />
                  </div>
                </motion.div>
              </div>
              <p className="text-center mb-8 text-lg text-gray-600">
                {isRecording ? "Recording in progress..." : "Click the button to start recording"}
              </p>
              <button
                className={`w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors duration-200 ${
                  isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <X className="mr-2 h-5 w-5 inline" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5 inline" /> Start Recording
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}






function AppointmentCard({
  appointment,
  onApprove,
  onDecline,
  isRecording,
  onStartRecording,
  onStopRecording,
  onAudioUpload,
  volume,
}) {
  const [audioFile, setAudioFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartRecording = () => {
    setIsModalOpen(true);
    onStartRecording();
  };

  const handleStopRecording = () => {
    setIsModalOpen(false);
    onStopRecording();
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden transition-all duration-200  ">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 hover:scale-105 transition-all duration-200">
            <img
              src={appointment.profilePhotoUrl}
              alt={appointment.patient_name}
              className="w-16 h-16 rounded-full border-4 border-indigo-200"
            />
            <div className="">
              <h2 className="text-xl font-semibold text-gray-800">{appointment.patient_name}</h2>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {appointment.appointment_time}
              </p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <FileText className="w-4 h-4 mr-1" />
                {appointment.primaryReason}
              </p>
            </div>
          </div>
          {appointment.status === "pending" && (
            <div className="flex space-x-2">
              <button
                onClick={() => onDecline(appointment.id)}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                Decline
              </button>
              <button
                onClick={() => onApprove(appointment.id)}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Approve
              </button>
            </div>
          )}
        </div>

        {appointment.status === "approved" && (
  <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
    {/* Recording Controls */}
    <div className="flex items-center justify-start gap-5">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 flex items-center ${
          isRecording ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-black hover:text-white"
        }`}
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
      >
        <Mic className="w-5 h-5 mr-2" aria-hidden="true" />
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <span className="text-sm text-gray-500">
        {isRecording ? "Recording in progress..." : "Click to start recording"}
      </span>
    </div>

    {/* File Upload Controls */}
    <div className="flex justify-start items-center space-x-4">
    <div className="flex justify-start items-center space-x-4">
      <label className="inline-flex items-center">
        <input
          type="file"
          onChange={(e) => setAudioFile(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          aria-label="Choose audio file to upload"
        />
      </label>
      <button
        onClick={() => onAudioUpload(audioFile, appointment.id)}
        disabled={!audioFile}
        className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Upload selected audio file"
      >
        <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
        Upload Audio
      </button>
    </div>
  </div>
  </div>
)}


        {appointment.status === "completed" && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <h4 className="font-semibold text-gray-700 flex items-center">
                <FileText className="w-5 h-5 mr-2" /> Transcription:
              </h4>
              <p className="text-sm text-gray-600 mt-2">{appointment.reviewed_transcription || "No transcription available."}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 flex items-center">
                <FileText className="w-5 h-5 mr-2" /> Summary:
              </h4>
              <p className="text-sm text-gray-600 mt-2">{appointment.summary || "No summary available."}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 flex items-center">
                <Pill className="w-5 h-5 mr-2" /> Prescriptions:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                {appointment.prescriptions?.map((prescription, index) => (
                  <li key={index} className="mb-2">
                    <span className="font-medium">{prescription.name}</span> - {prescription.dosage}
                    <br />
                    <span className="text-xs text-gray-500">{prescription.instructions}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <RecordingModal 
        isOpen={isModalOpen} 
        volume={volume} 
        isRecording={isRecording} 
        onClose={handleStopRecording} 
        stopRecording={onStopRecording} 
        startRecording={onStartRecording} 
      />
    </div>
  );
}



function AppointmentSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg shadow-md bg-white ">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 h-4 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}


export default DoctorAppointments;
