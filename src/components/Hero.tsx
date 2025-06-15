
import { Button } from '@/components/ui/button';
import { Zap, Wrench, Shield } from 'lucide-react';

// Extra technician/repairman photo for accent
const heroExtraImage =
  "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=500&q=80";

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Professional <span className="text-blue-600">Technical Services</span> You Can Trust
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert installation, repair, and maintenance services for refrigeration, air-conditioning, 
              solar systems, electrical work, and more. Available 24/7 for your technical needs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Schedule Service
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Emergency Call
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 mt-12">
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="text-gray-700">24/7 Emergency</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="w-6 h-6 text-blue-500" />
                <span className="text-gray-700">Expert Technicians</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-500" />
                <span className="text-gray-700">Licensed & Insured</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Professional technician working" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
            </div>
            <div className="hidden md:block absolute -bottom-10 -right-12" aria-hidden="true">
              <img
                src={heroExtraImage}
                alt="Man performing AC repair"
                className="rounded-full border-4 border-blue-100 shadow-xl w-36 h-36 object-cover object-center"
                loading="lazy"
                style={{ zIndex: 5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

