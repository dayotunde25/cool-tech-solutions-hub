
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Feedback = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create mailto link for email feedback
      const mailtoLink = `mailto:feedback@techservices.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      )}`;
      
      window.location.href = mailtoLink;

      toast({
        title: "Email Client Opened",
        description: "Your default email client should open with the feedback form filled out.",
      });

      // Clear form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue opening your email client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Send Us Your Feedback</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We value your opinion! Share your feedback, suggestions, or experiences with our services.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-6 h-6 text-blue-600" />
                <span>Feedback Form</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Your Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Input
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Your feedback, suggestions, or comments..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
