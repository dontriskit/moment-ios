"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OnboardingQuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // TODO: Save quiz answers and mark onboarding as complete
    // For now, just redirect
    setTimeout(() => {
      router.push("/for-you");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {currentStep} of 5</span>
            <span>{currentStep * 20}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-yellow-500 transition-all duration-300"
              style={{ width: `${currentStep * 20}%` }}
            />
          </div>
        </div>

        {/* Quiz content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">
            {currentStep === 1 && "What brings you to Activations?"}
            {currentStep === 2 && "How would you describe your current state?"}
            {currentStep === 3 && "What time of day do you prefer to listen?"}
            {currentStep === 4 && "What's your experience level?"}
            {currentStep === 5 && "When is your birthday?"}
          </h2>

          {/* Placeholder content - would be replaced with actual quiz options */}
          <div className="space-y-3 mb-8">
            {currentStep < 5 ? (
              <>
                <button className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  Option 1
                </button>
                <button className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  Option 2
                </button>
                <button className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  Option 3
                </button>
              </>
            ) : (
              <input
                type="date"
                className="w-full p-4 bg-white/10 rounded-lg text-white placeholder-white/50"
                placeholder="Select your birthday"
              />
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 py-3 font-bold text-white transition-transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : currentStep === 5 ? (
              "COMMIT"
            ) : (
              "NEXT"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}