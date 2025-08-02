import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Play, DollarSign } from 'lucide-react';

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
  created_at: string;
}

const Portfolio = () => {
  const [portfolioPosts, setPortfolioPosts] = useState<Post[]>([]);
  const [salePosts, setSalePosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'sale'>('portfolio');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const portfolio = data?.filter(post => post.post_type === 'portfolio') || [];
      const sale = data?.filter(post => post.post_type === 'sale') || [];
      
      setPortfolioPosts(portfolio);
      setSalePosts(sale);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPosts = activeTab === 'portfolio' ? portfolioPosts : salePosts;

  if (loading) {
    return (
      <section id="portfolio" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Work & Marketplace</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Showcasing our recent projects and items available for purchase
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Portfolio ({portfolioPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sale'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Sale ({salePosts.length})
            </button>
          </div>
        </div>

        {currentPosts.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">
              No {activeTab === 'portfolio' ? 'portfolio items' : 'items for sale'} available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  {(post.image_url || post.video_url) && (
                    <div className="aspect-video overflow-hidden bg-muted">
                      {post.video_url ? (
                        <div className="relative w-full h-full">
                          <video
                            src={post.video_url}
                            poster={post.image_url || undefined}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      ) : post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : null}
                    </div>
                  )}
                  
                  {/* Post Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      post.post_type === 'sale'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {post.post_type === 'sale' ? 'For Sale' : 'Portfolio'}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                      {post.category}
                    </span>
                    {post.post_type === 'sale' && post.price && (
                      <span className="inline-flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {post.currency} {post.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-3 mb-4">{post.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <Link to={`/post/${post.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;