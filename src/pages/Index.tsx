
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import News from '@/components/News';
import Feedback from '@/components/Feedback';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <About />
      <News />
      <Feedback />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
