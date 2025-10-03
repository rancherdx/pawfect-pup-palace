import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PawPrint } from "lucide-react";

/**
 * @component NotFound
 * @description An enhanced, user-friendly 404 "Page Not Found" component. It features a playful
 * design, on-brand messaging, and multiple navigation options to guide the user.
 *
 * @returns {JSX.Element} The rendered and improved 404 page.
 */
const NotFound = () => {
  return (
    <div className="flex-grow flex items-center justify-center bg-background text-foreground px-4">
      <div className="text-center max-w-lg">
        {/* Playful Illustration */}
        <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&q=80&w=400"
              alt="A cute dog looking confused"
              className="mx-auto rounded-full w-48 h-48 object-cover shadow-lg border-4 border-primary"
            />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-2">
          Oops! Page Not Found
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          It looks like this page is in the doghouse. Let's get you back on track.
        </p>

        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button size="lg" variant="default" className="bg-brand-red hover:bg-red-700">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link to="/puppies">
            <Button size="lg" variant="outline">
              <PawPrint className="mr-2 h-5 w-5" />
              View Puppies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;