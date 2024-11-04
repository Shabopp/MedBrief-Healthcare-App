import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedText from './AnimatedText';
import {
  Calendar,
  Clock,
  Download,
  Heart,
  Headphones,
  Pill,
  UserPlus,
  Stethoscope,
  Home,
  FileText,
  Users,
  ThumbsUp,
  Award,
  Menu,
  DatabaseZap,
  AudioLines,
  ChevronRight,
  
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [stats, setStats] = useState({
    providers: 0,
    administrators: 0,
    budget: 0
  });

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth?mode=login');
  };

  const handleSignUpClick = () => {
    navigate('/auth?mode=signup');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const animateStats = () => {
      setStats(prev => ({
        providers: Math.min(prev.providers + 1, 80),
        administrators: Math.min(prev.administrators + 100, 15432),
        budget: Math.min(prev.budget + 0.1, 26)
      }));
    };

    window.addEventListener('scroll', handleScroll);
    const interval = setInterval(animateStats, 20);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const features = [
    { icon: AudioLines, title: "AI-Powered Transcription", color: "orange",text: "Real-time transcription of consultations, Provides an accurate, automated record of each interaction. " },
    { icon: FileText, title: "AI-Driven Prescription ", color: "blue",text: "Automated consultation summaries and prescription details.Ensures accuracy and clarity in medication instructions." },
    { icon: Calendar, title: "Easy Appointments", color: "green",text: "Simplified appointment scheduling with real-time availability,efficiently manage schedules and patient histories. " },
    { icon: DatabaseZap, title: "Data-Driven Insights", color: "purple",text: "A dedicated analytics dashboard enables doctors to monitor patient health trends, help assess outcomes over time." },
  ];

  const statsData = [
    { icon: Users, value: stats.providers, label: "Health Provider Shortage Areas", color: "blue" },
    { icon: Home, value: stats.administrators, label: "State Health Administrators", color: "yellow" },
    { icon: FileText, value: `$${stats.budget.toFixed(1)}mln`, label: "Annual MDHHS Budget", color: "green" },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">MediCare</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {['Find a Doctor', 'News', 'Services', 'Contact Us'].map((item, index) => (
              <motion.a
                key={index}
                href="#"
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
            <motion.button className="md:hidden px-4 py-2 border border-gray-300 rounded-md">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-4 pt-24 pb-12 md:py-32 "
        style={{ opacity, scale }}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-blue-100 text-red-500 px-3 py-1 rounded-full"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Health Comes First</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-bold leading-tight text-gray-900"
            >
              Effortless Healthcare at Your Fingertips
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600"
            >
           Streamlining healthcare for a better experience. From scheduling to treatment, we bring care closer to you


            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col w-full sm:w-auto sm:flex-row py-4"
            >
             <button onClick={handleLoginClick} class="flex flex-row items-center justify-center border-2 text-white bg-black  border-black w-full px-5 py-2 mb-4 text-[16px] font-normal leading-[26px] text-center tracking-normal shadow focus:outline-none sm:mb-0 sm:w-auto sm:mr-4 md:pl-8 md:pr-6 xl:pl-12 xl:pr-10 hover:shadow-lg hover:-translate-y-1">
  LOGIN
  <span class="ml-4">
    <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" class="w-5 h-5 fill-current">
      <path fill="currentColor" d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"></path>
    </svg>
  </span>
</button>

<button onClick={handleSignUpClick} class="flex items-center justify-center w-full px-5 py-2 text-[16px] font-normal leading-[26px] capitalize duration-100 transform border-2 border-black rounded-sm cursor-pointer focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:outline-none sm:w-auto sm:px-6 hover:shadow-lg hover:-translate-y-1">
<UserPlus class="mr-2 h-4 w-4"/>
  Sign Up
 
</button>

            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 100 }}
            className="relative"
          >
           
            <img
              src='https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
              alt="Medical Professional"
              className="rounded-full shadow-2xl w-full h-auto object-cover hover:scale-105 transition duration-300 transform hover:shadow-2xl" 
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 space-y-4 rounded-lg shadow-lg hover:scale-105 transition duration-300 transform hover:shadow-2xl"
            >
              <div className={`h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center`}>
                <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
              </div>
              <h3 className="font-semibold text-xl">{feature.title}</h3>
              <p className="text-gray-600">
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-20  py-12 bg-blue-50 rounded-xl ">
        <div className="grid md:grid-cols-3 gap-12">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className={`h-16 w-16 bg-${stat.color}-500 rounded-full flex items-center justify-center`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className={`text-3xl font-bold text-${stat.color}-600`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Care Section */}
      <section className="container mx-auto px-4 py-12 bg-gradient-to-b from-sky-200 to-gray-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="absolute left-0 top-0 h-full w-full bg-blue-500 rounded-full -z-10 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
            <img
              src="https://images.pexels.com/photos/3991782/pexels-photo-3991782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940https://images.pexels.com/photos/3991782/pexels-photo-3991782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940 "
              alt="Doctor"
              className="rounded-r-full  shadow-2xl"
            />
         
          </motion.div>
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 100  }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">
            Empowering Patients with Accessible, Personalized Healthcare
            </h2>
            <p className="text-xl text-gray-600">
            Our platform offers a seamless experience, allowing you to schedule, consult, and access your health records in one place. Empowering you to focus on what matters most—your well-being.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="h-6 w-6 text-blue-500" />
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                </div>
                <div className="text-gray-600">Positive Feedback</div>
                <motion.div
                  className="mt-2 h-2 bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <div className="text-3xl font-bold text-yellow-600">2,000+</div>
                </div>
                <div className="text-gray-600">Experienced Doctors</div>
                <motion.div
                  className="mt-2 h-2 bg-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* lower Care Section */}
      <section className="container mx-auto px-4 py-12 bg-gradient-to-t from-rose-200 to-gray-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 100  }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">
            The Future of Consultations
            </h2>
            <p className="text-xl text-gray-600">
            Empower your practice with tools for AI-assisted transcriptions, automated summaries, and streamlined appointment management. Our platform helps you provide modern, efficient care with minimal administrative hassle.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="h-6 w-6 text-blue-500" />
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                </div>
                <div className="text-gray-600">Positive Feedback</div>
                <motion.div
                  className="mt-2 h-2 bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <div className="text-3xl font-bold text-yellow-600">2,000+</div>
                </div>
                <div className="text-gray-600">Experienced Doctors</div>
                <motion.div
                  className="mt-2 h-2 bg-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="absolute left-0 top-0 h-full w-full bg-blue-500 rounded-full -z-10 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
            <img
              src="https://d1uhlocgth3qyq.cloudfront.net/provider-message-1232w___4b6fa.jpg"
              alt="Doctor"
              className="rounded-l-full shadow-2xl "
            />
           
            
            
          </motion.div>
        </div>
      </section>
     

      {/* Free Consultation Section */}
      
    </div>
  );
};

export default Homepage;
