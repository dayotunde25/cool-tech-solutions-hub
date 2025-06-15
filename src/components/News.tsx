
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Using NewsAPI.org - requires API key for production
      // For demo purposes, using a mock response structure
      
      // In production, you would use:
      // const response = await fetch(`https://newsapi.org/v2/everything?q=HVAC OR refrigeration OR solar OR electrical&sortBy=publishedAt&apiKey=YOUR_API_KEY`);
      
      // For now, we'll create mock data to demonstrate the structure
      const mockArticles: NewsArticle[] = [
        {
          title: "Latest Innovations in Solar Panel Technology for 2024",
          description: "Discover the newest developments in solar panel efficiency and installation techniques that are revolutionizing the renewable energy sector.",
          url: "#",
          urlToImage: "/placeholder.svg",
          publishedAt: "2024-01-15T10:30:00Z",
          source: { name: "Energy Tech News" }
        },
        {
          title: "HVAC Industry Trends: Smart Climate Control Systems",
          description: "How smart thermostats and AI-powered HVAC systems are changing the way we control indoor climate and reduce energy consumption.",
          url: "#",
          urlToImage: "/placeholder.svg",
          publishedAt: "2024-01-14T14:20:00Z",
          source: { name: "HVAC Weekly" }
        },
        {
          title: "Energy Efficiency Standards Update for Commercial Refrigeration",
          description: "New regulations and standards for commercial refrigeration systems aimed at reducing environmental impact and improving efficiency.",
          url: "#",
          urlToImage: "/placeholder.svg",
          publishedAt: "2024-01-13T09:15:00Z",
          source: { name: "Refrigeration Today" }
        },
        {
          title: "Electrical Safety Updates: New Code Requirements",
          description: "Important updates to electrical safety codes and what they mean for residential and commercial installations.",
          url: "#",
          urlToImage: "/placeholder.svg",
          publishedAt: "2024-01-12T16:45:00Z",
          source: { name: "Electrical Contractor" }
        }
      ];

      setArticles(mockArticles);
      
      toast({
        title: "News Updated",
        description: "Latest industry news has been loaded successfully.",
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section id="news" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading latest news...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Industry News</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest developments in technical services, energy efficiency, 
            and industry innovations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
          {articles.map((article, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>•</span>
                  <span>{article.source.name}</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-300"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Full Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            onClick={fetchNews}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Refresh News
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Note:</strong> To display live news, you'll need to obtain a free API key from{' '}
            <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              NewsAPI.org
            </a>{' '}
            and replace the mock data with actual API calls.
          </p>
        </div>
      </div>
    </section>
  );
};

export default News;
