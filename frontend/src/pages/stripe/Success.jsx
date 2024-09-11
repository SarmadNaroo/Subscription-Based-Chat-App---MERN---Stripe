import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const sessionId = queryParams.get("session_id");

      if (sessionId) {
        try {
          const res = await fetch(`/api/auth/success?session_id=${sessionId}`);
          const data = await res.json();

          if (data.success) {
            navigate("/login");
          } else {
            navigate("/signup");
          }
        } catch (error) {
          console.error("Error verifying subscription:", error);
          navigate("/signup"); // Navigate to signup on error
        }
      }
    };

    checkSubscription();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-3xl font-semibold text-green-500">Subscription Successful</h2>
      <p className="text-center text-gray-700 mt-4">Thank you for your payment. Please log in to continue.</p>
    </div>
  );
};

export default Success;
