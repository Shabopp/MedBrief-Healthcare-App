import React, { useState } from 'react';
import FlipForm from './FlipForm';

function FlipFormModal({ questions, onFinish, isVisible, closeModal }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = questions.length;

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // Move to next question
    }
  };

  const handleProgressBarWidth = () => {
    return `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`; // Progress in percentage
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-[512px] max-h-full relative overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none text-2xl"
          onClick={closeModal}
        >
          &#x2715;
        </button>

        {/* Header Section */}
        <header className="flex items-center justify-between border-b border-solid border-[#e7edf3] pb-3 mb-6">
          <h2 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">
            Pre-Appointment Questionnaire
          </h2>
        </header>

        {/* Question Progress */}
        <div className="flex flex-col gap-2 px-4">
          <div className="flex justify-between">
            <p className="text-[#0e141b] text-base font-medium leading-normal">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="rounded bg-[#d0dbe7] w-full h-2">
            <div
              className="bg-[#1568c1] h-2 rounded transition-all duration-500 ease-in-out"
              style={{ width: handleProgressBarWidth() }}
            ></div>
          </div>

          <p className="text-[#4e7297] text-sm font-normal leading-normal">
            You're on the right track.
          </p>
        </div>

        {/* Render FlipForm - Pass current question */}
        <div className="px-4 pt-3">
          <FlipForm
            question={questions[currentQuestionIndex]}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
            onAnswer={handleNextQuestion}
            onFinish={onFinish}
          />
        </div>

        {/* Quit and Next Buttons */}

      </div>
    </div>
  );
}

export default FlipFormModal;
