import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('fetch-news function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const apiKey = Deno.env.get('THENEWSAPI_API_KEY');
    console.log('API Key check:', apiKey ? 'API key found' : 'API key missing');
    
    if (!apiKey) {
      console.error('TheNewsAPI API key not configured');
      // Return existing news from database instead of error
      const { data: existingNews, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(6);
      
      if (error) {
        console.error('Error fetching existing news:', error);
        return new Response(
          JSON.stringify({ error: 'No API key configured and unable to fetch cached news' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          articles: existingNews || [],
          total: existingNews?.length || 0,
          cached: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Broader search terms to ensure we get results
    const queries = ['technology', 'energy', 'electrical', 'solar', 'innovation'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const url = `https://api.thenewsapi.com/v1/news/all?api_token=${apiKey}&search=${encodeURIComponent(randomQuery)}&language=en&limit=20`;
    console.log('Making API request with query:', randomQuery);
    
    const response = await fetch(url);
    console.log('TheNewsAPI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TheNewsAPI error response:', errorText);
      throw new Error(`TheNewsAPI Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('TheNewsAPI response data:', { resultCount: data.data?.length });
    
    if (!data.data) {
      console.error('TheNewsAPI returned no data');
      throw new Error('No data returned from TheNewsAPI');
    }
    
    // Filter articles to ensure we have required fields
    const filteredArticles = data.data.filter((article: any) => {
      return article.description && article.title && article.url;
    });
    
    console.log('Filtered articles count:', filteredArticles.length);
    
    if (filteredArticles.length > 0) {
      // Check for existing articles to prevent duplicates
      const existingLinks = await supabase
        .from('news_articles')
        .select('link')
        .in('link', filteredArticles.map((article: any) => article.url));
      
      const existingLinksSet = new Set(existingLinks.data?.map(item => item.link) || []);
      
      // Filter out duplicates
      const newArticles = filteredArticles.filter((article: any) => 
        !existingLinksSet.has(article.url)
      );
      
      console.log('New articles to save (after duplicate check):', newArticles.length);
      
      if (newArticles.length > 0) {
        // Save articles to database
        const articlesToSave = newArticles.slice(0, 10).map((article: any) => ({
          title: article.title,
          description: article.description,
          link: article.url,
          pub_date: article.published_at || new Date().toISOString(),
          source_id: article.source || 'unknown',
          image_url: article.image_url
        }));
        
        // Insert new articles
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert(articlesToSave);
        
        if (insertError) {
          console.error('Error saving articles:', insertError);
        } else {
          console.log('Successfully saved', articlesToSave.length, 'articles');
        }
        
        // Keep only the latest 30 articles
        const { data: allArticles, error: fetchError } = await supabase
          .from('news_articles')
          .select('id')
          .order('pub_date', { ascending: false });
        
        if (!fetchError && allArticles && allArticles.length > 30) {
          const articlesToDelete = allArticles.slice(30);
          const idsToDelete = articlesToDelete.map(a => a.id);
          
          const { error: deleteError } = await supabase
            .from('news_articles')
            .delete()
            .in('id', idsToDelete);
          
          if (deleteError) {
            console.error('Error deleting old articles:', deleteError);
          } else {
            console.log('Deleted', idsToDelete.length, 'old articles');
          }
        }
      }
    }
    
    // Fetch latest articles from database to return
    const { data: latestNews, error: fetchLatestError } = await supabase
      .from('news_articles')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(6);
    
    if (fetchLatestError) {
      console.error('Error fetching latest news:', fetchLatestError);
      return new Response(
        JSON.stringify({ 
          articles: filteredArticles.slice(0, 6),
          total: filteredArticles.length 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        articles: latestNews || [],
        total: latestNews?.length || 0 
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