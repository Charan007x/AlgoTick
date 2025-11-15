import React from 'react';

const FloatingAddButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black rounded-full shadow-2xl hover:shadow-[#61dca3]/50 transition-all transform hover:scale-110 active:scale-95 z-50 flex items-center justify-center group"
      aria-label="Add Question"
    >
      <svg
        className="w-8 h-8 transition-transform group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};

export default FloatingAddButton;
