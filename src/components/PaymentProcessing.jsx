import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentProcessing = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Payment confirmed', delay: 500 },
    { label: 'Updating inventory', delay: 1000 },
    { label: 'Preparing receipt', delay: 1500 }
  ];

  useEffect(() => {
    // Animate through steps
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, step.delay);
    });

    // Complete and redirect
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            {/* Confetti effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-ping absolute w-24 h-24 rounded-full bg-green-400 opacity-20"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Thank you for your purchase
        </p>

        {/* Progress Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = currentStep > index;
            const isActive = currentStep === index + 1;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isComplete ? 'bg-green-50' : isActive ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scaleIn">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-medium transition-colors ${
                    isComplete ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                  {isComplete && ' ✓'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Loading Bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Redirecting to your receipt...
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default PaymentProcessing;

