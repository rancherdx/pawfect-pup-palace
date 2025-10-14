
import { Link } from "react-router-dom";
import { PawPrint, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

const Footer = () => {
  const { contactInfo } = useContactInfo();

  return (
    <footer className="bg-secondary pt-12 pb-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">GDS Puppies</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Breeding healthy, happy puppies for loving families since 2010. Our puppies are raised with love and care.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/puppies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Available Puppies</Link>
              </li>
              <li>
                <Link to="/adopt" className="text-sm text-muted-foreground hover:text-primary transition-colors">Adoption Process</Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-base font-semibold mb-4">More Info</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/reviews" className="text-sm text-muted-foreground hover:text-primary transition-colors">Customer Reviews</Link>
              </li>
              <li>
                <Link to="/health" className="text-sm text-muted-foreground hover:text-primary transition-colors">Health Guarantee</Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  {contactInfo ? `${contactInfo.address_city}, ${contactInfo.address_state}` : 'Detroit, Michigan'}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {contactInfo?.phone || '(555) 123-4567'}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {contactInfo?.email || 'contact@gdspuppies.com'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GDS Puppies. All rights reserved.</p>
          <div className="mt-2 space-x-3 sm:space-x-4"> {/* Adjusted spacing for more links */}
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
            <Link to="/user-data-deletion" className="hover:text-primary transition-colors">Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
