// src/components/DoctorList.js
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, onSnapshot, updateDoc, doc, addDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import addDays from 'date-fns/addDays';
import Modal from './Modal';
import DoctorCard from './DoctorCard';
import FlipFormModal from './FlipFormModal';

const preAppointmentQuestions = [
  {
    key: 'primaryReason',
    label: 'What is your primary reason for scheduling this appointment?',
    type: 'mcq',
    options: ['Routine check-up', 'New symptoms', 'Chronic condition management', 'Other'],
  },
  {
    key: 'recentChanges',
    label: 'Have you had any recent changes in your health or new symptoms?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'familyHistory',
    label: 'Is there a family history of medical conditions such as diabetes, heart disease, or cancer?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'medications',
    label: 'Are you currently taking any medications?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'allergies',
    label: 'Do you have any allergies?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'allergyDetails',
    label: 'If yes, please list your allergies.',
    type: 'text',
  },
  {
    key: 'medicalConditions',
    label: 'Do you have any pre-existing medical conditions?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'recentSurgeries',
    label: 'Have you undergone any surgeries in the past year?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'familyHistory',
    label: 'Is there a family history of medical conditions such as diabetes, heart disease, or cancer?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'smoking',
    label: 'Do you currently smoke or have a history of smoking?',
    type: 'mcq',
    options: ['Yes', 'No', 'Former smoker'],
  },
  {
    key: 'alcohol',
    label: 'How often do you consume alcohol?',
    type: 'mcq',
    options: ['Never', 'Occasionally', 'Regularly'],
  },
  {
    key: 'exercise',
    label: 'How often do you exercise?',
    type: 'mcq',
    options: ['Never', '1-2 times a week', '3-4 times a week', '5+ times a week'],
  },
  {
    key: 'diet',
    label: 'How would you describe your diet?',
    type: 'mcq',
    options: ['Healthy', 'Moderate', 'Unhealthy'],
  },
  {
    key: 'sleep',
    label: 'How many hours of sleep do you get on average per night?',
    type: 'mcq',
    options: ['Less than 4 hours', '4-6 hours', '6-8 hours', 'More than 8 hours'],
  },
  {
    key: 'mentalHealth',
    label: 'How would you rate your current mental health?',
    type: 'mcq',
    options: ['Poor', 'Fair', 'Good', 'Excellent'],
  },
  {
    key: 'physicalHealth',
    label: 'How would you rate your current physical health?',
    type: 'mcq',
    options: ['Poor', 'Fair', 'Good', 'Excellent'],
  },
  {
    key: 'workStatus',
    label: 'What is your current work status?',
    type: 'mcq',
    options: ['Employed', 'Unemployed', 'Retired', 'Student'],
  },
  {
    key: 'insurance',
    label: 'Do you have health insurance?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'specialistVisit',
    label: 'Have you visited any specialists in the past 6 months?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'vaccinations',
    label: 'Are you up to date with your vaccinations?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'bloodPressure',
    label: 'Have you had your blood pressure checked in the last year?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'cholesterolCheck',
    label: 'Have you had your cholesterol checked in the last year?',
    type: 'mcq',
    options: ['Yes', 'No'],
  },
  {
    key: 'sleepQuality',
    label: 'How would you rate the quality of your sleep?',
    type: 'mcq',
    options: ['Poor', 'Fair', 'Good', 'Excellent'],
  },
  {
    key: 'hydration',
    label: 'How much water do you drink daily?',
    type: 'mcq',
    options: ['Less than 2 glasses', '2-4 glasses', '5-7 glasses', '8+ glasses'],
  },
  {
    key: 'additionalComments',
    label: 'Do you have any additional comments or concerns you would like to discuss during your appointment?',
    type: 'text',
  },
];

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const { currentUser } = useAuth();
  const [isPreAppointmentCompleted, setIsPreAppointmentCompleted] = useState(false);
  const [showFlipFormModal, setShowFlipFormModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Initial selected date

  useEffect(() => {
    const fetchDoctors = () => {
      const doctorList = [];
      const unsubscribeDoctors = onSnapshot(collection(firestore, 'users'), (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === 'doctor') {
            const doctorRef = doc.ref;
            onSnapshot(doctorRef, (doctorDoc) => {
              const doctorData = doctorDoc.data();
              doctorList.push({ id: doctorDoc.id, ...doctorData });
              setDoctors([...doctorList]);
            });
          }
        });
      });

      return () => unsubscribeDoctors();
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const checkPreAppointmentStatus = async () => {
      const patientRef = doc(firestore, 'users', currentUser.uid);
      const patientDoc = await getDoc(patientRef);
      setIsPreAppointmentCompleted(!!patientDoc.data()?.preAppointmentAnswered);
    };

    if (currentUser) checkPreAppointmentStatus();
  }, [currentUser]);

  const handlePreAppointmentComplete = () => {
    setIsPreAppointmentCompleted(true);
    setShowFlipFormModal(false);
    if (selectedDoctor) setIsModalOpen(true);
  };

  const handleBookSlot = async (doctorId, slotIndex) => {
    try {
      const doctorRef = doc(firestore, 'users', doctorId);
      const doctorDoc = await getDoc(doctorRef);
      const doctorData = doctorDoc.data();
  
      if (!doctorData || !doctorData.availableSlots[slotIndex]) {
        console.error("Slot index or available slots data is incorrect.");
        return;
      }
  
      // Select and mark the slot as booked
      const updatedSlots = doctorData.availableSlots.map((slot, idx) => {
        if (idx === slotIndex) {
          return {
            ...slot,
            date: format(selectedDate, 'yyyy-MM-dd'), // Ensure date matches the selected date
            status: 'booked'
          };
        }
        return slot;
      });
  
      // Remove any potential duplicates with the same start time and date
      const uniqueSlots = updatedSlots.filter(
        (slot, idx, self) =>
          idx === self.findIndex(
            (s) => s.date === slot.date && s.start === slot.start
          )
      );
  
      // Update the Firestore document with the unique slots
      await updateDoc(doctorRef, { availableSlots: uniqueSlots });
  
      // Add the booked appointment to the 'appointments' collection
      const selectedSlot = uniqueSlots[slotIndex];
      const slotDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot.start}:00`;
      const appointmentTimeUtc = new Date(slotDateTime).toISOString();
  
      await addDoc(collection(firestore, 'appointments'), {
        doctor_id: doctorId,
        patient_id: currentUser.uid,
        doctor_name: doctorData.fullName,
        patient_name: currentUser.displayName,
        appointment_time: appointmentTimeUtc,
        appointment_duration: 30,
        status: 'pending',
        slotIndex,
      });
  
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };
  
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="container mx-auto p-6">
      
      {doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors available.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBookAppointment={() => {
                setSelectedDoctor(doctor);
                if (!isPreAppointmentCompleted) {
                  setShowFlipFormModal(true);
                } else {
                  setIsModalOpen(true);
                }
              }}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          doctor={selectedDoctor}
          selectedDate={selectedDate}
          nextSevenDays={nextSevenDays}
          setSelectedDate={setSelectedDate}
          handleBookSlot={handleBookSlot}
          closeModal={() => setIsModalOpen(false)}
        />
      )}

      <FlipFormModal
        questions={preAppointmentQuestions}
        isVisible={showFlipFormModal}
        onFinish={handlePreAppointmentComplete}
        closeModal={() => setShowFlipFormModal(false)}
      />
    </div>
  );
}

export default DoctorList;
