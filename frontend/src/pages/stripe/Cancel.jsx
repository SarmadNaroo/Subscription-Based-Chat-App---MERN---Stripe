// src/pages/cancel/Cancel.js
import React from 'react';

const Cancel = () => {
  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto">
      <h1 className="text-3xl font-semibold text-center text-red-500">Payment Cancelled</h1>
      <p className="text-center text-gray-700">Your payment was not successful. Please try again.</p>
      <a href="/signup" className="btn btn-blue mt-4">Try Again</a>
    </div>
  );
};

export default Cancel;
