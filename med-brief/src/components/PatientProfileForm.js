import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

function PatientProfileForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    allergies: '',
    chronicConditions: '',
    pastSurgeries: '',
    currentMedications: '',
    familyHistory: '',
    profilePhotoUrl: '',
  });
  const [age, setAge] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(firestore, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData(data);
        calculateAge(data.dob);
      }
    };
    fetchData();
  }, [currentUser]);

  const calculateAge = (dob) => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const ageNow = new Date().getFullYear() - birthDate.getFullYear();
    setAge(ageNow);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'dob') calculateAge(value);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setFormData({ ...formData, profilePhotoUrl: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let photoUrl = formData.profilePhotoUrl;
    if (photoFile) {
      const photoRef = ref(storage, `profilePhotos/${currentUser.uid}`);
      await uploadBytes(photoRef, photoFile);
      photoUrl = await getDownloadURL(photoRef);
    }
    try {
      await setDoc(doc(firestore, 'users', currentUser.uid), {
        ...formData,
        profilePhotoUrl: photoUrl,
        role: 'patient',
        profileCompleted: true,
      }, { merge: true });
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
   
    <div className="min-h-screen flex items-center justify-center  ... py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 p-10 ">
        <h1
          className="text-left mb-4"
          style={{
            color: '#333333',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fontFamily: '"sharp-sans-semibold", Arial, sans-serif',
            fontSize: '38px',
            lineHeight: '44px',
            fontWeight: '400',
            textAlign: 'center',
          }}
        >
          Complete Your Profile
        </h1>

        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="flex flex-col items-center space-y-2">
            <label className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">
              Profile Picture
            </label>
            <div className="relative">
              {formData.profilePhotoUrl ? (
                <img
                  src={formData.profilePhotoUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border border-gray-300 object-cover shadow-md"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border border-gray-300 flex items-center justify-center text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">
                  No Image
                </div>
              )}
              <label
                htmlFor="profilePhoto"
                className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full cursor-pointer shadow-md text-white hover:bg-cyan-700 transition duration-200"
                title="Upload New Photo"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </label>
            </div>
          </div>
          <input
            id="profilePhoto"
            name="profilePhoto"
            type="file"
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="col-span-full">
              <label htmlFor="fullName" className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full mt-1 p-3 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-700 transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="dob" className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full mt-1 p-3 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-700 transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="age" className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="text"
                value={age}
                readOnly
                className="w-full mt-1 p-3 rounded-md border border-gray-300 shadow-sm bg-gray-100"
              />
            </div>

            {[ 
              { id: 'gender', label: 'Gender', type: 'text' },
              { id: 'bloodGroup', label: 'Blood Group', type: 'text' },
            ].map(({ id, label, type }) => (
              <div key={id} className="mb-4">
                <label htmlFor={id} className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">{label}</label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  value={formData[id]}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-3 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-700 transition duration-200"
                />
              </div>
            ))}
            <div className="col-span-full">
              <label htmlFor="phone" className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full mt-1 p-3 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-700 transition duration-200"
              />
            </div>

            {[ 
              { id: 'allergies', label: 'Known Allergies' },
              { id: 'chronicConditions', label: 'Chronic Conditions' },
              { id: 'pastSurgeries', label: 'Past Surgeries' },
              { id: 'currentMedications', label: 'Current Medications' },
              { id: 'familyHistory', label: 'Family Medical History' }
            ].map(({ id, label }) => (
              <div key={id} className="col-span-full mb-4">
                <label htmlFor={id} className="text-custom-gray font-sharp-sans-semibold text-custom-base leading-custom font-normal">{label}</label>
                <textarea
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition duration-200"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-700 text-white font-font-sharp-sans-semibold py-3 rounded-md shadow-md transition duration-200"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
    
  );
}

export default PatientProfileForm;
