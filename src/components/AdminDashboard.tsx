import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Mail, MessageSquare, Users, Settings, Key, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service_needed?: string;
  message: string;
  created_at: string;
}

interface FeedbackSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsApiStatus, setNewsApiStatus] = useState<'checking' | 'configured' | 'not-configured'>('checking');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    checkNewsApiStatus();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const [contactResult, feedbackResult] = await Promise.all([
        supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('feedback_submissions')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (contactResult.error) throw contactResult.error;
      if (feedbackResult.error) throw feedbackResult.error;

      setContactSubmissions(contactResult.data || []);
      setFeedbackSubmissions(feedbackResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkNewsApiStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        setNewsApiStatus('not-configured');
        return;
      }
      
      if (data.error && data.error.includes('not configured')) {
        setNewsApiStatus('not-configured');
      } else {
        setNewsApiStatus('configured');
      }
    } catch (error) {
      setNewsApiStatus('not-configured');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{contactSubmissions.length}</p>
                  <p className="text-gray-600">Contact Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{feedbackSubmissions.length}</p>
                  <p className="text-gray-600">Feedback Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{contactSubmissions.length + feedbackSubmissions.length}</p>
                  <p className="text-gray-600">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contact">Contact Submissions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Submissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Form Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {contactSubmissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No contact submissions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {contactSubmissions.map((submission) => (
                      <Card key={submission.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{submission.name}</h3>
                            <Badge variant="outline">
                              {formatDate(submission.created_at)}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Email:</strong> {submission.email}</p>
                            {submission.phone && <p><strong>Phone:</strong> {submission.phone}</p>}
                            {submission.service_needed && <p><strong>Service:</strong> {submission.service_needed}</p>}
                          </div>
                          <div className="mt-4">
                            <p className="font-medium">Message:</p>
                            <p className="text-gray-700 mt-1">{submission.message}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackSubmissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No feedback submissions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbackSubmissions.map((submission) => (
                      <Card key={submission.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{submission.name}</h3>
                            <Badge variant="outline">
                              {formatDate(submission.created_at)}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Email:</strong> {submission.email}</p>
                            <p><strong>Subject:</strong> {submission.subject}</p>
                          </div>
                          <div className="mt-4">
                            <p className="font-medium">Message:</p>
                            <p className="text-gray-700 mt-1">{submission.message}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* News API Configuration */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      News API Configuration
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          NewsData.io API integration for live industry news
                        </p>
                        <div className="flex items-center gap-2">
                          {newsApiStatus === 'checking' && (
                            <Badge variant="outline">
                              Checking...
                            </Badge>
                          )}
                          {newsApiStatus === 'configured' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Configured
                            </Badge>
                          )}
                          {newsApiStatus === 'not-configured' && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Not Configured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={checkNewsApiStatus}
                          variant="outline" 
                          size="sm"
                        >
                          Check Status
                        </Button>
                      </div>
                    </div>
                    {newsApiStatus === 'not-configured' && (
                      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800 mb-2">
                          The NewsData.io API key is not configured. To enable live news:
                        </p>
                        <ol className="text-sm text-orange-700 space-y-1 ml-4 list-decimal">
                          <li>Get a free API key from <a href="https://newsdata.io" target="_blank" rel="noopener noreferrer" className="underline">newsdata.io</a></li>
                          <li>Go to the <a href="https://supabase.com/dashboard/project/mkgwqkpwmblhinbzaqub/settings/functions" target="_blank" rel="noopener noreferrer" className="underline">Supabase Edge Functions settings</a></li>
                          <li>Add a new secret named <code className="bg-orange-100 px-1 rounded">NEWSDATA_API_KEY</code></li>
                          <li>Paste your API key as the value</li>
                          <li>Click "Check Status" to verify the configuration</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;