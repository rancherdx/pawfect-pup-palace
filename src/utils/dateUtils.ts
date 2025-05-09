
// Calculate age from a date string
export const calculateAge = (birthDateStr: string | undefined): string => {
  if (!birthDateStr) return 'Unknown';
  
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  // Calculate months
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += now.getMonth();
  
  // Calculate weeks for very young puppies
  if (months < 1) {
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${Math.floor(ageInDays / 7)} weeks`;
  }
  
  return `${months} months`;
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
