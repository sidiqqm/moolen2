import React from 'react';

const QuestionCard = ({ question, value, onAnswer }) => {
  return (
    <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-xl">
      <p className="text-lg font-medium mb-4">{question.text}</p>
      <div className="flex justify-between mb-2">
        {[0, 1, 2, 3, 4, 5].map((val) => (
          <label key={val} className="flex flex-col items-center">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={val}
              checked={value === val}
              onChange={() => onAnswer(val)}
              className="mb-1 accent-blue-600"
            />
            <span>{val}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Not at all</span>
        <span>Extremely</span>
      </div>
    </div>
  );
};

export default QuestionCard;
