import { ParallaxProvider as Provider } from 'react-scroll-parallax';
import { ReactNode } from 'react';

export const ParallaxProvider = ({ children }: { children: ReactNode }) => {
  return <Provider>{children}</Provider>;
};
