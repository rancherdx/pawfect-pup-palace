import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const faqData = [
  {
    question: "What breeds of puppies do you offer?",
    answer: "We specialize in breeding high-quality Golden Retrievers, Labrador Retrievers, and German Shepherds. Each breed is carefully selected for health, temperament, and breed standards."
  },
  {
    question: "How do I start the adoption process?",
    answer: "To begin the adoption process, please fill out our online application form. Once submitted, our team will review your application and contact you to discuss the next steps."
  },
  {
    question: "What is included in the adoption fee?",
    answer: "The adoption fee covers the cost of vaccinations, deworming, microchipping, and a health check by a licensed veterinarian. It also supports our breeding program and the care of our adult dogs."
  },
  {
    question: "Can I visit the puppies before adopting?",
    answer: "Yes, we encourage potential adopters to visit our puppies and meet their parents. Please contact us to schedule a visit."
  },
  {
    question: "What kind of support do you offer after adoption?",
    answer: "We provide ongoing support to our adopters, including advice on training, nutrition, and healthcare. We are always available to answer any questions you may have."
  },
  {
    question: "How do you ensure the health of your puppies?",
    answer: "We prioritize the health of our puppies by conducting regular health screenings, providing proper nutrition, and maintaining a clean and safe environment. Our puppies are raised with love and care to ensure they are well-adjusted and healthy."
  },
  {
    question: "Do you ship puppies to other states?",
    answer: "Yes, we offer shipping services to select states. Please contact us to discuss shipping options and associated costs."
  },
  {
    question: "What is your policy on returns?",
    answer: "We understand that circumstances may change. If you are unable to care for your adopted puppy, we will gladly take them back. Please contact us to discuss the return process."
  },
  {
    question: "How can I contact you for more information?",
    answer: "You can reach us by phone, email, or through our website's contact form. We are always happy to assist you with any questions or concerns."
  }
];

const FAQPage = () => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Find answers to common questions about our puppies, adoption process, and more.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <Card key={index} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full p-6 text-left justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => toggleExpanded(index)}
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                {expandedItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </Button>
              {expandedItems.includes(index) && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Still have questions? We're here to help!
        </p>
        <Button className="bg-brand-red hover:bg-red-700 text-white">
          Contact Us
        </Button>
      </div>
    </div>
  );
};

export default FAQPage;
