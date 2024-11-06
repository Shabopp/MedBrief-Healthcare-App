import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import ChevronRight from '@mui/icons-material/ChevronRight';


const recentAppointments = ({ fetchRecentAppointments, currentUserId }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [appointments, setAppointments] = useState([]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const loadAppointment = async () => {
      const recentAppointments = await fetchRecentAppointments(currentUserId);

      // Fetch each patient's name and pre-appointment data
      const appointmentsWithDetails = await Promise.all(
        recentAppointments.map(async (appointment) => {
          const patientDoc = await getDoc(doc(firestore, 'users', appointment.patient_id));
          const patientName = patientDoc.exists() ? patientDoc.data().fullName : 'Unknown';
          const patientAge = patientDoc.exists() ? patientDoc.data().age : 'Unknown';

          // Fetch pre-appointment questionnaire data
          const questionnaireDoc = await getDoc(doc(firestore, 'patients', appointment.patient_id));
          const primaryReason = questionnaireDoc.exists()
            ? questionnaireDoc.data().preAppointmentAnswers?.primaryReason || 'N/A'
            : 'N/A';

          return { ...appointment, patientName, primaryReason ,patientAge};
        })
      );
      setAppointments(appointmentsWithDetails);
    };

    loadAppointment();
  }, [currentUserId, fetchRecentAppointments]);

  return (
    <div className="col-span-1 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">recent appointment</h2>
      <p className="text-gray-600 mb-6">You have {appointments.length} appointments today</p>
      <ul className="space-y-4">
        {appointments.map((appointment, index) => (
          <motion.li
            key={appointment.id}
            className="flex items-center p-3 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex-1">
              <p className="font-medium">{appointment.patientName}</p>
              <p className="text-sm text-gray-600">{appointment.patientAge}</p>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              {new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default recentAppointments;
