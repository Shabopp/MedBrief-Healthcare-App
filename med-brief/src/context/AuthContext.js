// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'; 
import { auth, firestore } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [doctorMetrics, setDoctorMetrics] = useState({ rating: null, reviews: null, recommendationText: '' });

  const recommendationOptions = [
    "Highly recommended · Excellent wait time",
    "Friendly staff · Comfortable environment",
    "Highly skilled · Thorough consultations",
    "Patient-centered care · Quick appointments",
    "Professional and caring · Efficient service",
  ];
  const initializeMetrics = () => {
    // Check if values already exist in localStorage
    const storedRating = localStorage.getItem('doctorRating');
    const storedReviews = localStorage.getItem('doctorReviews');
    const storedRecommendationText = localStorage.getItem('doctorRecommendationText');

    // If values are in localStorage, use them; otherwise, generate and store new ones
    const rating = storedRating || (Math.random() * 1.5 + 3.5).toFixed(1);
    const reviews = storedReviews || Math.floor(Math.random() * 450 + 50);
    const recommendationText =
      storedRecommendationText ||
      recommendationOptions[Math.floor(Math.random() * recommendationOptions.length)];

    // Store values in localStorage if they were generated
    if (!storedRating) localStorage.setItem('doctorRating', rating);
    if (!storedReviews) localStorage.setItem('doctorReviews', reviews);
    if (!storedRecommendationText)
      localStorage.setItem('doctorRecommendationText', recommendationText);

    // Update the state with persistent or generated values
    setDoctorMetrics({ rating, reviews, recommendationText });
  };

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setCurrentUser({
                ...user,
                photoURL: userData.profilePhotoUrl || null,
              });
              setRole(userData.role);

              // Initialize doctor metrics
              initializeMetrics();
            }
          } else {
            setCurrentUser(null);
            setRole(null);
            setDoctorMetrics({ rating: null, reviews: null, recommendationText: '' });
          }
          setLoading(false);
        });
        return unsubscribe;
      })
      .catch((error) => {
        setErrorMsg(error.message);
        setLoading(false);
      });
  }, []);
  const signUp = async (email, password, name, role, specialization, experience) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        email,
        role,
        specialization,
        experience,
        profileCompleted: false,
        profilePhotoUrl: null, // Initialize profile photo URL as null
      });

      await signOut(auth);
      setErrorMsg('Signup successful. Please log in.');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setRole(null);
      setDoctorMetrics({ rating: null, reviews: null, recommendationText: '' });

      localStorage.removeItem('doctorRating');
      localStorage.removeItem('doctorReviews');
      localStorage.removeItem('doctorRecommendationText');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        doctorMetrics,
        signUp,
        login,
        logout,
        errorMsg,
        setErrorMsg,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
