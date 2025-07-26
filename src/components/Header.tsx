
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="flex justify-between items-center py-2 text-sm border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>+234(90)33150460</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>dayotunde25@gmail.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Serving Your Area</span>
          </div>
        </div>
        
        {/* Main navigation */}
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-blue-600">
            Moscool Techical Services
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
            <a href="#news" className="text-gray-700 hover:text-blue-600 transition-colors">News</a>
            <a href="#feedback" className="text-gray-700 hover:text-blue-600 transition-colors">Feedback</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
          </nav>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Get Quote
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
