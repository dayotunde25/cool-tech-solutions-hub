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
    
    if (!apiKey) {
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
    
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(randomQuery)}&language=en&size=12&category=technology`
    );
    
    if (!response.ok) {
      throw new Error(`NewsData.io API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
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