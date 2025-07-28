
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, RefreshCw, Key, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const { toast } = useToast();

  // Technical keywords for filtering relevant news
  const techKeywords = [
    'HVAC', 'air conditioning', 'refrigeration', 'solar panels', 'electrical', 
    'inverter', 'heat pump', 'cooling system', 'energy efficiency', 'smart home',
    'renewable energy', 'electric vehicle charging', 'home automation', 'solar energy',
    'electrical systems', 'refrigeration technology', 'climate control'
  ];

  useEffect(() => {
    // Load saved API key from localStorage
    const saved = localStorage.getItem('newsApiKey');
    if (saved) {
      setSavedApiKey(saved);
      fetchNews(saved);
    } else {
      // Show mock data if no API key
      loadMockData();
    }
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

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    localStorage.setItem('newsApiKey', apiKey);
    setSavedApiKey(apiKey);
    setApiKey('');
    setShowApiSetup(false);
    fetchNews(apiKey);
    toast({
      title: "Success",
      description: "API key saved! Now fetching live news..."
    });
  };

  const fetchNews = async (key: string = savedApiKey) => {
    if (!key) {
      loadMockData();
      return;
    }

    setLoading(true);
    try {
      // Search for technical news using relevant keywords
      const queries = ['HVAC technology', 'solar energy systems', 'electrical installation', 'refrigeration innovation'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${key}&q=${encodeURIComponent(randomQuery)}&language=en&size=12&category=technology`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch news');
      }
      
      // Filter articles for technical relevance
      const filteredArticles = data.results.filter((article: NewsArticle) => {
        const content = `${article.title} ${article.description}`.toLowerCase();
        return techKeywords.some(keyword => content.includes(keyword.toLowerCase())) &&
               article.description && article.title;
      });
      
      setArticles(filteredArticles.slice(0, 6));
      
      toast({
        title: "News Updated",
        description: `Found ${filteredArticles.length} relevant technical articles`
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch news. Showing cached content.",
        variant: "destructive"
      });
      // Fall back to mock data on error
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 minutes
  useEffect(() => {
    if (savedApiKey) {
      const interval = setInterval(() => {
        fetchNews();
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    }
  }, [savedApiKey]);

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
            {savedApiKey ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                ✓ Live News Active • Auto-refreshes every 30 min
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Demo Mode • Add API key for live news
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowApiSetup(!showApiSetup)} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {savedApiKey ? 'Update API' : 'Setup Live News'}
            </Button>
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

        {/* API Key Setup */}
        {showApiSetup && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Key className="w-5 h-5" />
                Setup Live News API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Get live industry news by adding your NewsData.io API key. Get a free key at{' '}
                <a href="https://newsdata.io" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                  newsdata.io
                </a>{' '}
                (Free plan includes 200 requests/day)
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your NewsData.io API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveApiKey} className="bg-blue-600 hover:bg-blue-700">
                  Save & Activate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
            <p className="text-gray-600">No news articles found. Try refreshing or setting up the API key for live news.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default News;
