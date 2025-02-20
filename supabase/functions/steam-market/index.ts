
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketResponse {
  success: boolean
  lowest_price?: string
  volume?: string
  median_price?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const marketHashName = url.searchParams.get('market_hash_name')
    
    if (!marketHashName) {
      return new Response(
        JSON.stringify({ error: 'Market hash name required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const marketUrl = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=${encodeURIComponent(marketHashName)}`
    const response = await fetch(marketUrl)
    const data: MarketResponse = await response.json()

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch market data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert price string to coins (1 cent = 1 coin)
    const priceString = data.lowest_price || data.median_price
    if (!priceString) {
      return new Response(
        JSON.stringify({ error: 'No price data available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const price = Math.floor(parseFloat(priceString.replace('€', '')) * 100)

    return new Response(
      JSON.stringify({
        success: true,
        coins: price,
        market_data: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
