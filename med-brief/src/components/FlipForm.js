import React, { useState } from 'react';
import { firestore } from '../firebase/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function FlipForm({ question, isLastQuestion, onAnswer, onFinish }) {
  const { currentUser } = useAuth();
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer); // Store selected answer temporarily
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question.key]: answer,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const patientRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(patientRef, {
        preAppointmentAnswers: answers,
        preAppointmentAnswered: true, // Mark as completed
      });
      setIsSubmitting(false);
      onFinish(); // Notify the parent component after form completion
    } catch (error) {
      console.error('Error saving pre-appointment answers:', error);
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (selectedAnswer) {
      onAnswer(); // Move to next question
    }
  };

  return (
    <div className="flip-form">
      <h2 className="text-xl font-bold mb-4">{question.label}</h2>

      {/* Radio button options */}
      {question.type === 'mcq' ? (
        <div className="options-container space-y-4">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-4 rounded-xl border border-solid border-[#d0dbe7] p-[15px] cursor-pointer"
            >
              <input
                type="radio"
                className="h-5 w-5 border-2 border-[#d0dbe7] bg-transparent text-transparent checked:border-[#1568c1] checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0"
                name={`question-${question.key}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={() => handleAnswerSelection(option)}
              />
              <div className="flex grow flex-col">
                <p className="text-[#0e141b] text-sm font-medium leading-normal">{option}</p>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <input
          type="text"
          placeholder="Enter your answer"
          className="form-input p-3 border border-gray-300 rounded-lg w-full"
          onBlur={(e) => handleAnswerSelection(e.target.value)}
        />
      )}

      {/* Show Next or Finish button based on the question */}
      <button
        className={`mt-8 ${selectedAnswer ? 'bg-blue-600' : 'bg-gray-400'} text-white text-lg font-semibold rounded-lg py-3 px-6 w-full transition`}
        onClick={isLastQuestion ? handleSubmit : handleNext}
        disabled={!selectedAnswer}
      >
        {isLastQuestion ? 'Finish' : 'Next Question'}
      </button>

      {/* Show loading indicator when submitting */}
      {isSubmitting && <p className="text-blue-500 mt-4">Saving your answers...</p>}
    </div>
  );
}

export default FlipForm;
