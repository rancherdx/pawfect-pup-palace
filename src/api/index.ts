
import * as auth from './authApi'; // Only if it exists, otherwise comment this line
import * as puppiesApi from './puppiesApi';
import * as littersApi from './littersApi';

// Uncomment and export actual APIs as they exist.
// Placeholder for testimonialApi so Home.tsx does not break
export const testimonialApi = {
  getAllPublic: async () => ([]),
};

export {
  auth,
  puppiesApi,
  littersApi,
  testimonialApi,
};
