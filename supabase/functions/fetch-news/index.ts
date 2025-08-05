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

    const theNewsApiKey = Deno.env.get('THENEWSAPI_API_KEY');
    const newsDataApiKey = Deno.env.get('NEWSDATA_API_KEY');
    console.log('API Keys check:', { 
      theNewsApi: theNewsApiKey ? 'found' : 'missing',
      newsData: newsDataApiKey ? 'found' : 'missing'
    });
    
    if (!theNewsApiKey && !newsDataApiKey) {
      console.error('No API keys configured');
      // Return existing news from database instead of error
      const { data: existingNews, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(6);
      
      if (error) {
        console.error('Error fetching existing news:', error);
        return new Response(
          JSON.stringify({ error: 'No API keys configured and unable to fetch cached news' }),
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
    
    let filteredArticles: any[] = [];
    let apiUsed = '';
    
    // Try TheNewsAPI first
    if (theNewsApiKey) {
      try {
        const url = `https://api.thenewsapi.com/v1/news/all?api_token=${theNewsApiKey}&search=${encodeURIComponent(randomQuery)}&language=en&limit=20`;
        console.log('Trying TheNewsAPI with query:', randomQuery);
        
        const response = await fetch(url);
        console.log('TheNewsAPI response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('TheNewsAPI response data:', { resultCount: data.data?.length });
          
          if (data.data) {
            filteredArticles = data.data.filter((article: any) => {
              return article.description && article.title && article.url;
            });
            apiUsed = 'TheNewsAPI';
            console.log('TheNewsAPI success, filtered articles:', filteredArticles.length);
          }
        } else {
          console.log('TheNewsAPI failed with status:', response.status);
        }
      } catch (error) {
        console.log('TheNewsAPI error:', error);
      }
    }
    
    // Fallback to NewsData API if TheNewsAPI failed or no results
    if (filteredArticles.length === 0 && newsDataApiKey) {
      try {
        const url = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=${encodeURIComponent(randomQuery)}&language=en`;
        console.log('Trying NewsData API with query:', randomQuery);
        
        const response = await fetch(url);
        console.log('NewsData API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('NewsData API response data:', { status: data.status, resultCount: data.results?.length });
          
          if (data.status === 'success' && data.results) {
            filteredArticles = data.results.filter((article: any) => {
              return article.description && article.title && article.link;
            });
            apiUsed = 'NewsData';
            console.log('NewsData API success, filtered articles:', filteredArticles.length);
          }
        } else {
          console.log('NewsData API failed with status:', response.status);
        }
      } catch (error) {
        console.log('NewsData API error:', error);
      }
    }
    
    console.log('Final filtered articles count:', filteredArticles.length, 'from', apiUsed);
    
    if (filteredArticles.length > 0) {
      // Check for existing articles to prevent duplicates
      const articleLinks = filteredArticles.map((article: any) => 
        apiUsed === 'TheNewsAPI' ? article.url : article.link
      );
      
      const existingLinks = await supabase
        .from('news_articles')
        .select('link')
        .in('link', articleLinks);
      
      const existingLinksSet = new Set(existingLinks.data?.map(item => item.link) || []);
      
      // Filter out duplicates
      const newArticles = filteredArticles.filter((article: any) => {
        const articleLink = apiUsed === 'TheNewsAPI' ? article.url : article.link;
        return !existingLinksSet.has(articleLink);
      });
      
      console.log('New articles to save (after duplicate check):', newArticles.length);
      
      if (newArticles.length > 0) {
        // Save articles to database with proper field mapping
        const articlesToSave = newArticles.slice(0, 10).map((article: any) => {
          if (apiUsed === 'TheNewsAPI') {
            return {
              title: article.title,
              description: article.description,
              link: article.url,
              pub_date: article.published_at || new Date().toISOString(),
              source_id: article.source || 'unknown',
              image_url: article.image_url
            };
          } else {
            // NewsData API format
            return {
              title: article.title,
              description: article.description,
              link: article.link,
              pub_date: article.pubDate || new Date().toISOString(),
              source_id: article.source_id || 'unknown',
              image_url: article.image_url
            };
          }
        });
        
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