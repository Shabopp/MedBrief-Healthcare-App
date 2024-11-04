import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const AnimatedText = () => {
    const messages = [
      "Streamlined Healthcare Services",
      "AI-Powered Medical Transcription",
      "Efficient Appointment Scheduling",
      "Personalized Patient Care",
      "Secure Health Records Management"
    ]
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length)
      }, 3000) // Change message every 3 seconds

      return () => clearInterval(interval)
    }, [])

  return (
    <div className="overflow-hidden py-4 bg-blue-50">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear"
        }}
        className="whitespace-nowrap"
      >
        {messages.map((message, index) => (
          <span key={index} className="inline-block mx-8 text-xl font-semibold text-blue-600">
            {message}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default AnimatedText