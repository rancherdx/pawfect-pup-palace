import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { puppiesApi } from '@/api';

/**
 * Calculates a human-readable age string from a birth date string.
 * @param {string} birthdayStr - The birth date of the puppy as a string.
 * @returns {string} A formatted string representing the puppy's age.
 */
const calculateAge = (birthdayStr: string) => {
  const birthday = new Date(birthdayStr);
  const today = new Date();
  
  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(today.getTime() - birthday.getTime());
  
  // Calculate years, months, weeks
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  const diffWeeks = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
  
  let ageDisplay = "";
  
  if (diffYears > 0) {
    ageDisplay += `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    if (diffMonths > 0) {
      ageDisplay += ` ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  } else if (diffMonths > 0) {
    ageDisplay += `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    if (diffWeeks > 0) {
      ageDisplay += ` ${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    }
  } else {
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    ageDisplay = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  
  return ageDisplay;
};

/**
 * @hook usePuppyDetails
 * @description A custom hook to fetch and process the details of a single puppy, including calculating its age.
 * @param {string | undefined} puppyId - The ID of the puppy to fetch. The query is disabled if the ID is not provided.
 * @returns {{ puppy: any, puppyAge: string, isLoading: boolean, error: any, refetch: () => void }} An object containing the puppy data, calculated age, and query state.
 */
const usePuppyDetails = (puppyId: string | undefined) => {
  const {
    data: puppy,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['puppy', puppyId],
    queryFn: () => puppyId ? puppiesApi.getPuppyById(puppyId) : null,
    enabled: !!puppyId,
  });

  // Calculate the puppy's age if we have a birth date
  // Handle both field name possibilities for compatibility
  const birthDate = (puppy as any)?.birth_date || (puppy as any)?.birthDate;
  const puppyAge = birthDate ? calculateAge(birthDate) : '';

  return {
    puppy,
    puppyAge,
    isLoading,
    error,
    refetch
  };
};

export default usePuppyDetails;