
import { Check } from "lucide-react";
import { motion } from "framer-motion";

/**
 * @interface Step
 * @description Defines the structure for a single step in the checkout process.
 */
interface Step {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

/**
 * @interface CheckoutStepsProps
 * @description Defines the props for the CheckoutSteps component.
 */
interface CheckoutStepsProps {
  /** An array of step objects to be displayed. */
  steps: Step[];
  /** The index of the current active step. */
  currentStep: number;
  /** Optional callback function to be invoked when a completed step is clicked. */
  onClick?: (index: number) => void;
}

/**
 * @component CheckoutSteps
 * @description A component that visually represents the steps in a multi-step process, like a checkout flow.
 * It indicates completed, active, and upcoming steps.
 * @param {CheckoutStepsProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered checkout steps progress bar.
 */
const CheckoutSteps = ({ steps, currentStep, onClick }: CheckoutStepsProps) => {
  return (
    <div className="relative mb-8">
      {/* Progress bar */}
      <div className="hidden md:block absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full">
        <motion.div 
          className="h-full bg-brand-red rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <ol className="relative flex flex-col md:flex-row justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const isClickable = index < currentStep;
          
          return (
            <li 
              key={index} 
              className={`
                flex flex-row md:flex-col items-center md:items-start mb-4 md:mb-0 
                ${isClickable ? 'cursor-pointer' : ''}
                ${index < steps.length - 1 ? 'md:w-full' : ''}
              `}
              onClick={() => isClickable && onClick && onClick(index)}
            >
              <div className="flex items-start md:items-center mb-0 md:mb-2">
                <motion.div 
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full mt-0.5
                    transition-colors duration-300
                    ${isActive 
                      ? 'bg-brand-red text-white shadow-md' 
                      : isComplete 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isActive ? [1, 1.1, 1] : 1,
                    rotate: isComplete ? [0, 10, 0] : 0
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                  }}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                <div className="ml-3 md:ml-0 md:mt-0">
                  <h3 
                    className={`text-base md:text-lg font-medium ${isActive ? 'text-brand-red' : ''}`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default CheckoutSteps;
