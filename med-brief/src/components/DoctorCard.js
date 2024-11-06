import React, { useEffect, useState } from 'react';
import { AiFillStar, AiFillHeart } from 'react-icons/ai';
import { FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import { startOfDay,format, parseISO, addDays, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';


const DoctorCard = ({ doctor, onBookAppointment,isVisible  }) => {
  const [availability, setAvailability] = useState([]);
  const [doctorMetrics, setDoctorMetrics] = useState({
    rating: null,
    reviews: null,
    recommendationText: '',
  });

  const recommendationOptions = [
    "Highly recommended · Excellent wait time",
    "Friendly staff · Comfortable environment",
    "Highly skilled · Thorough consultations",
    "Patient-centered care · Quick appointments",
    "Professional and caring · Efficient service",
  ];

  // Function to initialize unique metrics for each doctor
  const initializeMetrics = () => {
    const storedRating = localStorage.getItem(`doctor_${doctor.id}_rating`);
    const storedReviews = localStorage.getItem(`doctor_${doctor.id}_reviews`);
    const storedRecommendationText = localStorage.getItem(`doctor_${doctor.id}_recommendationText`);

    // If values are in localStorage, use them; otherwise, generate and store new ones
    const rating = storedRating || (Math.random() * 1.5 + 3.5).toFixed(1);
    const reviews = storedReviews || Math.floor(Math.random() * 450 + 50);
    const recommendationText =
      storedRecommendationText ||
      recommendationOptions[Math.floor(Math.random() * recommendationOptions.length)];

    // Store values in localStorage if they were generated
    if (!storedRating) localStorage.setItem(`doctor_${doctor.id}_rating`, rating);
    if (!storedReviews) localStorage.setItem(`doctor_${doctor.id}_reviews`, reviews);
    if (!storedRecommendationText)
      localStorage.setItem(`doctor_${doctor.id}_recommendationText`, recommendationText);

    // Update the state with persistent or generated values
    setDoctorMetrics({ rating, reviews, recommendationText });

  };
 // Get metrics from AuthContext
  const isLoyalPatient = true;



  useEffect(() => {
    initializeMetrics();
    
    const fetchAvailability = async () => {
      const doctorRef = doc(firestore, 'users', doctor.id);
      const doctorDoc = await getDoc(doctorRef);
  
      if (doctorDoc.exists()) {
        const doctorData = doctorDoc.data();
        const slots = Array.isArray(doctorData.availableSlots) ? doctorData.availableSlots : [];
  
        // Set `today` to the start of the day to avoid time component issues
        const today = startOfDay(new Date());
        const endDate = addDays(today, 13);
  
        const filteredSlots = slots.filter((slot) => {
          const slotDate = parseISO(slot.date);
          return isWithinInterval(slotDate, { start: today, end: endDate });
        });
  
        const groupedByDate = filteredSlots.reduce((acc, slot) => {
          const { date, status } = slot;
          if (!acc[date]) {
            acc[date] = { date, availableCount: 0, totalCount: 0 };
          }
          if (status === 'available') acc[date].availableCount += 1;
          acc[date].totalCount += 1;
          return acc;
        }, {});
  
        const daysRange = eachDayOfInterval({ start: today, end: endDate });
        const availabilityData = daysRange.map(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          return groupedByDate[dateString] || { date: dateString, availableCount: 0, totalCount: 0 };
        });
  
        setAvailability(availabilityData);
      } else {
        const today = startOfDay(new Date());
        const endDate = addDays(today, 13);
        const daysRange = eachDayOfInterval({ start: today, end: endDate });
        const availabilityData = daysRange.map(day => ({
          date: format(day, 'yyyy-MM-dd'),
          availableCount: 0,
          totalCount: 0,
        }));
        setAvailability(availabilityData);
      }
    };
  
    fetchAvailability();
  }, [doctor.id]);
  
  return (
    <div
    className={`bg-white p-6 rounded-lg flex flex-row justify-between gap-8  border-gray-300 transition-all duration-900 ease-in-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}
  >
    <div className="bg-white p-6 rounded-lg flex flex-row justify-between gap-8 border-b border-gray-300" >
  {/* Left Section */}
  {/* Doctor Info Section */}
  <div className="flex gap-6 items-start flex-1 ml-5 "
   > 
    <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200">
      <img
        src={doctor.profilePictureUrl || '/default-avatar.png'}
        alt={doctor.fullName}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="space-y-2">
      <div className='gap-2'>
        <span
          className="sc-ktJbId hxxqJi"
          style={{
            color: '#333333',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fontFamily: 'sharp-sans-semibold, Arial, sans-serif',
            fontSize: '24px',
            lineHeight: '28px',
            verticalAlign: 'baseline',
            letterSpacing: 'normal',
            wordSpacing: '0px',
            margin: '0px',
            padding: '0px',
            fontWeight: 400,
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontKerning: 'auto',
            fontOpticalSizing: 'auto',
            fontStretch: '100%',
            fontVariationSettings: 'normal',
            fontFeatureSettings: 'normal',
            textTransform: 'none',
            textAlign: 'start',
            textIndent: '0px',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline solid rgb(51, 51, 51)')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Dr. {doctor.fullName}
        </span>

        <p className="text-[#333333] bg-transparent font-sharp-sans text-[16px] leading-[22px] align-baseline tracking-normal 
                    m-0 p-0 font-normal text-start ">
          {doctor.specialization}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center ">
          <div className="text-[#333333] bg-black bg-transparent font-sharp-sans text-[16px] leading-[22px] font-normal not-italic tracking-normal m-0 mx-0 p-0 text-start no-underline">
            <AiFillStar className="h-4 w-4 fill-yellow-400" />
          </div>

          <span className="ml-1 font-medium text-[#333333]">{doctorMetrics.rating}</span>
          <span
            className="text-[#333333] bg-transparent font-sharp-sans text-[14px] leading-[22px] align-baseline tracking-normal m-0 p-0 font-normal text-start"
          >
            · {doctorMetrics.reviews} reviews
          </span>
        </div>
        {isLoyalPatient && (
          <span className="bg-pink-50 text-pink-600 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <AiFillHeart className="h-3 w-3 fill-current" /> LOYAL PATIENTS
          </span>
        )}
      </div>

      <p
        className="text-[#333333] bg-transparent font-sharp-sans text-[14px] leading-[22px] align-baseline tracking-normal m-0 p-0 font-normal text-start flex items-center"
      >
        <FaMapMarkerAlt className="mr-2 text-black-500" /> {doctor.clinicAddress}
      </p>

      <span className="text-[#333333] bg-black bg-transparent font-sharp-sans text-[14px] leading-[22px] align-baseline tracking-normal m-0 p-0 font-normal text-start flex items-center">
        <FaGraduationCap className="mr-2 text-black-500" /> {doctor.degrees}
      </span>
      <div className="text-sm">
        <span className="text-[#0053C6] font-semibold">New patient appointments</span>
        <span className="text-gray-600"> · {doctorMetrics.recommendationText}</span>
      </div>
      
    </div>
  </div>

  {/* Availability Section */}
  <div className="w-full lg:w-1/3 flex-shrink-0 mr-10 ">
    <div
      className="flex flex-wrap gap-[4px]" 
      style={{ maxWidth: '100%', minHeight: '100px', padding: '0 8px' }}
    >
      {availability.slice(0, 14).map((daySlot, index) => (
        <div
          key={index}
          onClick={() => daySlot.availableCount > 0 && onBookAppointment(daySlot.date)}
          className={`p-2 text-center rounded-lg ${
            daySlot.availableCount > 0 ? 'bg-cyan-300 text-[#333333] hover:bg-cyan-400 transition-colors duration-200 ease-in-out cursor-pointer hover:scale-105' : 'bg-gray-100  cursor-not-allowed text-[#A6A6A4]'
          }`}
          style={{
            width: 'calc(14.28% - 4px)',
            height: '100px',
          }}
        >
          <div className="text-sm font-medium font-family-sharp-sans-semibold">
            {format(parseISO(daySlot.date), 'EEE')}
          </div>
          <div className="text-xs font-sharp-sans-medium mt-1">
            {format(parseISO(daySlot.date), 'MMM d')}
          </div>
          <div className="mt-1 text-sm font-sharp-sans-medium">
            {daySlot.availableCount > 0 ? `${daySlot.availableCount} appts` : '0 appts'}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-end mt-2 mr-2">
      <button className="text-[#333333] hover:text-cyan-500 font-semibold">
        View all availability
      </button>
    </div>
  </div>
  </div>
</div>

  );
};

export default DoctorCard;