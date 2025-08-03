import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source_id: string;
  image_url?: string;
}

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const loadMockData = () => {
    const mockArticles: NewsArticle[] = [
      {
        title: "Latest Innovations in Smart HVAC Systems Drive Energy Efficiency",
        description: "New smart thermostats and AI-powered HVAC controls are revolutionizing home climate management, reducing energy costs by up to 30%.",
        link: "#",
        pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        source_id: "HVAC Industry Today"
      },
      {
        title: "Solar Panel Efficiency Reaches Record High in 2024",
        description: "Breakthrough in perovskite solar cell technology promises to make solar installations more affordable and efficient than ever before.",
        link: "#",
        pubDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source_id: "Solar Power World"
      },
      {
        title: "New Refrigeration Standards Set to Reduce Environmental Impact",
        description: "Updated EPA regulations for commercial refrigeration systems focus on reducing greenhouse gas emissions and improving energy efficiency.",
        link: "#",
        pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source_id: "Refrigeration & AC Today"
      },
      {
        title: "Electric Vehicle Charging Infrastructure Expands Rapidly",
        description: "Residential EV charging installations surge as more homeowners adopt electric vehicles, creating new opportunities for electrical contractors.",
        link: "#",
        pubDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        source_id: "Electrical Contractor"
      }
    ];
    setArticles(mockArticles);
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      // First try to fetch from database directly
      const { data: dbArticles, error: dbError } = await supabase
        .from('news_articles')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(6);
      
      if (!dbError && dbArticles && dbArticles.length > 0) {
        setIsConfigured(true);
        setArticles(dbArticles.map(article => ({
          title: article.title,
          description: article.description || '',
          link: article.link,
          pubDate: article.pub_date,
          source_id: article.source_id || 'Unknown',
          image_url: article.image_url
        })));
        
        toast({
          title: "News Loaded",
          description: `Showing ${dbArticles.length} latest articles from database`
        });
        
        // Try to fetch fresh news in background
        supabase.functions.invoke('fetch-news').catch(console.error);
        return;
      }
      
      // If no articles in DB, try to fetch fresh news
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        // API key not configured, use mock data
        if (data.error.includes('not configured')) {
          setIsConfigured(false);
          loadMockData();
          return;
        }
        throw new Error(data.error);
      }
      
      setIsConfigured(true);
      setArticles(data.articles || []);
      
      toast({
        title: "News Updated",
        description: `Found ${data.total || data.articles?.length || 0} fresh articles`
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsConfigured(false);
      toast({
        title: "News Unavailable",
        description: "Using demo articles. Contact admin to configure live news.",
        variant: "destructive"
      });
      // Fall back to mock data on error
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 minutes if configured
  useEffect(() => {
    if (isConfigured) {
      const interval = setInterval(() => {
        fetchNews();
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    }
  }, [isConfigured]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Industry News</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest technical news in HVAC, solar, electrical, and refrigeration industries
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {isConfigured ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                ✓ Live News Active • Auto-refreshes every 30 min
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Demo Mode • Contact admin for live news
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Fetching latest industry news...</p>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              {article.image_url && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{article.source_id}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(article.pubDate)}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3 mb-4">{article.description}</p>
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read More <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No news articles found. Try refreshing or contact the administrator.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default News;