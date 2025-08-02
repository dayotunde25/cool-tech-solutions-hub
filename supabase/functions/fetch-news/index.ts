import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NEWSDATA_API_KEY');
    console.log('API Key check:', apiKey ? 'API key found' : 'API key missing');
    
    if (!apiKey) {
      console.error('NewsData API key not configured');
      return new Response(
        JSON.stringify({ error: 'NewsData.io API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Technical keywords for filtering relevant news
    const techKeywords = [
      'HVAC', 'air conditioning', 'refrigeration', 'solar panels', 'electrical', 
      'inverter', 'heat pump', 'cooling system', 'energy efficiency', 'smart home',
      'renewable energy', 'electric vehicle charging', 'home automation', 'solar energy',
      'electrical systems', 'refrigeration technology', 'climate control'
    ];

    // Search for technical news using relevant keywords
    const queries = ['HVAC technology', 'solar energy systems', 'electrical installation', 'refrigeration innovation'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(randomQuery)}&language=en&size=12&category=technology`;
    console.log('Making API request with query:', randomQuery);
    
    const response = await fetch(url);
    console.log('NewsData API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('NewsData API error response:', errorText);
      throw new Error(`NewsData.io API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('NewsData API response data:', { status: data.status, resultCount: data.results?.length });
    
    if (data.status === 'error') {
      console.error('NewsData API returned error:', data.message);
      throw new Error(data.message || 'Failed to fetch news');
    }
    
    // Filter articles for technical relevance
    const filteredArticles = data.results.filter((article: any) => {
      const content = `${article.title} ${article.description}`.toLowerCase();
      return techKeywords.some(keyword => content.includes(keyword.toLowerCase())) &&
             article.description && article.title;
    });
    
    return new Response(
      JSON.stringify({ 
        articles: filteredArticles.slice(0, 6),
        total: filteredArticles.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch news' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});