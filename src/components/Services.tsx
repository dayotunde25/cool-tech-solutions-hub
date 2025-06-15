
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Refrigerator, 
  Fan, 
  Sun, 
  Zap, 
  Wrench, 
  Settings, 
  HousePlug 
} from 'lucide-react';

const serviceImages = [
  "https://images.unsplash.com/photo-1595674057936-9891f1bb4cb6?auto=format&fit=crop&w=400&q=80", // Refrigerator
  "https://images.unsplash.com/photo-1503389152951-9c3c317b99c7?auto=format&fit=crop&w=400&q=80", // AC
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", // Solar
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80", // Inverter
  "https://images.unsplash.com/photo-1508873699372-7aeab60b46c7?auto=format&fit=crop&w=400&q=80", // Electrical
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80", // Consulting/Technician
];

const Services = () => {
  const services = [
    {
      icon: <Refrigerator className="w-12 h-12 text-blue-600" />,
      title: "Refrigeration",
      description: "Commercial and residential refrigeration installation, repair, and maintenance services.",
      features: ["Installation", "Emergency Repairs", "Preventive Maintenance", "Energy Efficiency Upgrades"],
      image: serviceImages[0],
      imageAlt: "Modern refrigerator in kitchen",
    },
    {
      icon: <Fan className="w-12 h-12 text-blue-600" />,
      title: "Air Conditioning",
      description: "Complete HVAC solutions including installation, servicing, and energy-efficient upgrades.",
      features: ["AC Installation", "Duct Cleaning", "System Repairs", "Regular Servicing"],
      image: serviceImages[1],
      imageAlt: "Technician servicing an air conditioner",
    },
    {
      icon: <Sun className="w-12 h-12 text-blue-600" />,
      title: "Solar Systems",
      description: "Solar panel installation, maintenance, and consulting for sustainable energy solutions.",
      features: ["Solar Installation", "System Design", "Performance Monitoring", "Maintenance"],
      image: serviceImages[2],
      imageAlt: "Array of solar panels on a roof",
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-600" />,
      title: "Inverter Services",
      description: "Power inverter installation, repair, and optimization for uninterrupted power supply.",
      features: ["Inverter Installation", "Battery Replacement", "System Upgrades", "Troubleshooting"],
      image: serviceImages[3],
      imageAlt: "Inverter panel close-up",
    },
    {
      icon: <HousePlug className="w-12 h-12 text-blue-600" />,
      title: "Electrical Work",
      description: "Comprehensive electrical services from wiring to safety inspections and upgrades.",
      features: ["Wiring & Rewiring", "Electrical Panels", "Safety Inspections", "Code Compliance"],
      image: serviceImages[4],
      imageAlt: "Electrician checking fuse box",
    },
    {
      icon: <Settings className="w-12 h-12 text-blue-600" />,
      title: "Consulting",
      description: "Expert technical consulting to help you make informed decisions about your systems.",
      features: ["System Analysis", "Energy Audits", "Upgrade Recommendations", "Cost Optimization"],
      image: serviceImages[5],
      imageAlt: "Technician consulting at site",
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Technical Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive technical services across multiple specialties, 
            ensuring your systems run efficiently and reliably.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    className="rounded-md shadow-md w-40 h-28 object-cover object-center border border-gray-200"
                    loading="lazy"
                  />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

