import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LogOut, Mail, MessageSquare, Users, Settings, Key, CheckCircle, Plus, Edit, Trash2, FileText } from 'lucide-react';
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

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  category: string;
  post_type: string;
  price: number | null;
  currency: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmission[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsApiStatus, setNewsApiStatus] = useState<'checking' | 'configured' | 'not-configured'>('checking');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    fetchPosts();
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

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const postData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      image_url: formData.get('image_url') as string || null,
      video_url: formData.get('video_url') as string || null,
      category: formData.get('category') as string,
      post_type: formData.get('post_type') as string || 'portfolio',
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
      currency: formData.get('currency') as string || 'USD',
      published: formData.get('published') === 'on',
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        toast({ title: "Success", description: "Post updated successfully." });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert({ ...postData, author_id: user.id });
        if (error) throw error;
        toast({ title: "Success", description: "Post created successfully." });
      }

      fetchPosts();
      setShowPostForm(false);
      setEditingPost(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save post.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      fetchPosts();
      toast({ title: "Success", description: "Post deleted successfully." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const checkNewsApiStatus = async () => {
    setNewsApiStatus('checking');
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      console.log('News API response:', { data, error });
      
      // If there's a network or auth error, treat as not configured
      if (error) {
        console.error('Edge function error:', error);
        setNewsApiStatus('not-configured');
        return;
      }
      
      // Check if the response contains an error about API key configuration
      if (data && data.error) {
        if (data.error.includes('not configured') || data.error.includes('API key')) {
          setNewsApiStatus('not-configured');
        } else {
          // Other error, but API key might be configured
          setNewsApiStatus('configured');
        }
      } else if (data && (data.articles || data.total !== undefined)) {
        // Successfully got articles or a valid response structure
        setNewsApiStatus('configured');
      } else {
        // Unexpected response format
        setNewsApiStatus('not-configured');
      }
    } catch (error) {
      console.error('Failed to check news API status:', error);
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
            <TabsTrigger value="posts">Portfolio Posts</TabsTrigger>
            <TabsTrigger value="contact">Contact Submissions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Submissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Portfolio Posts</CardTitle>
                  <Button onClick={() => setShowPostForm(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showPostForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePostSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input 
                            id="title" 
                            name="title" 
                            defaultValue={editingPost?.title || ''} 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input 
                            id="category" 
                            name="category" 
                            defaultValue={editingPost?.category || 'general'} 
                            placeholder="e.g., Web Development, Mobile App, etc." 
                          />
                        </div>
                        <div>
                          <Label htmlFor="post_type">Type</Label>
                          <select 
                            id="post_type" 
                            name="post_type" 
                            defaultValue={editingPost?.post_type || 'portfolio'}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="portfolio">Portfolio Item</option>
                            <option value="sale">For Sale</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="image_url">Image URL (optional)</Label>
                          <Input 
                            id="image_url" 
                            name="image_url" 
                            type="url" 
                            defaultValue={editingPost?.image_url || ''} 
                            placeholder="https://example.com/image.jpg" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="video_url">Video URL (optional)</Label>
                          <Input 
                            id="video_url" 
                            name="video_url" 
                            type="url" 
                            defaultValue={editingPost?.video_url || ''} 
                            placeholder="https://example.com/video.mp4" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price (for sale items only)</Label>
                            <Input 
                              id="price" 
                              name="price" 
                              type="number" 
                              step="0.01"
                              defaultValue={editingPost?.price || ''} 
                              placeholder="0.00" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="currency">Currency</Label>
                            <select 
                              id="currency" 
                              name="currency" 
                              defaultValue={editingPost?.currency || 'USD'}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="NGN">USD</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="CAD">CAD</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea 
                            id="content" 
                            name="content" 
                            rows={6} 
                            defaultValue={editingPost?.content || ''} 
                            required 
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="published" 
                            name="published" 
                            defaultChecked={editingPost?.published || false} 
                          />
                          <Label htmlFor="published">Publish immediately</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">
                            {editingPost ? 'Update Post' : 'Create Post'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowPostForm(false);
                              setEditingPost(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No posts yet. Create your first post to showcase your work!</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              <Badge variant={post.published ? "default" : "secondary"}>
                                {post.published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {formatDate(post.created_at)}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingPost(post);
                                  setShowPostForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <Badge variant={post.post_type === 'sale' ? 'default' : 'secondary'}>
                              {post.post_type === 'sale' ? 'For Sale' : 'Portfolio'}
                            </Badge>
                            <Badge variant="outline">{post.category}</Badge>
                            {post.post_type === 'sale' && post.price && (
                              <Badge variant="outline" className="text-green-600">
                                {post.currency} {post.price}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            {post.image_url && <p><strong>Image:</strong> {post.image_url}</p>}
                            {post.video_url && <p><strong>Video:</strong> {post.video_url}</p>}
                          </div>
                          <div>
                            <p className="font-medium">Content:</p>
                            <p className="text-gray-700 mt-1 line-clamp-3">{post.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                        <div className="flex gap-2">
            <Button 
              onClick={() => fetchNews()} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Refresh'}
            </Button>
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
