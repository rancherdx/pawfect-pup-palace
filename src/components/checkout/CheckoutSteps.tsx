
import { Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: number;
  onClick?: (index: number) => void;
}

const CheckoutSteps = ({ steps, currentStep, onClick }: CheckoutStepsProps) => {
  return (
    <ol className="relative space-y-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        const isClickable = index < currentStep;
        
        return (
          <li 
            key={index} 
            className={`flex items-start ${isClickable ? 'cursor-pointer' : ''}`}
            onClick={() => isClickable && onClick && onClick(index)}
          >
            <div 
              className={`
                flex items-center justify-center w-8 h-8 rounded-full mt-0.5
                ${isActive 
                  ? 'bg-brand-red text-white' 
                  : isComplete 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {isComplete ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="ml-3">
              <h3 
                className={`text-lg font-medium ${isActive ? 'text-brand-red' : ''}`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default CheckoutSteps;
