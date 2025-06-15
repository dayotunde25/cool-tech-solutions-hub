
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Clock, Star } from 'lucide-react';

const About = () => {
  const stats = [
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      number: "15+",
      label: "Years Experience"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      number: "500+",
      label: "Happy Customers"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      number: "24/7",
      label: "Emergency Service"
    },
    {
      icon: <Star className="w-8 h-8 text-blue-600" />,
      number: "4.9",
      label: "Average Rating"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Professional team at work" 
              className="rounded-lg shadow-lg"
            />
          </div>
          
          <div className="lg:w-1/2 lg:pl-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose TechServices Pro?
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              With over 15 years of experience in the technical services industry, we've built our 
              reputation on reliability, expertise, and exceptional customer service. Our certified 
              technicians are equipped with the latest tools and knowledge to handle any technical challenge.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From emergency repairs to planned installations, we're committed to keeping your systems 
              running smoothly and efficiently. We serve both residential and commercial clients with 
              the same level of dedication and professionalism.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
