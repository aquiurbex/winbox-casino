
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SteamInventoryItem {
  appid: number
  contextid: string
  assetid: string
  classid: string
  instanceid: string
  amount: string
  pos: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const steamApiKey = Deno.env.get('STEAM_API_KEY')
  if (!steamApiKey) {
    return new Response(
      JSON.stringify({ error: 'Steam API key not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const url = new URL(req.url)
  const steamId = url.searchParams.get('steamId')
  
  if (!steamId) {
    return new Response(
      JSON.stringify({ error: 'Steam ID required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get CS2 inventory
    const inventoryResponse = await fetch(
      `https://api.steampowered.com/IEconService/GetInventoryItemsWithPrices/v1/?key=${steamApiKey}&appid=730&steamid=${steamId}`
    )
    const inventoryData = await inventoryResponse.json()

    // Get player stats
    const statsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=730&key=${steamApiKey}&steamid=${steamId}`
    )
    const statsData = await statsResponse.json()

    // Get player summary (including username)
    const playerResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`
    )
    const playerData = await playerResponse.json()

    // Check if username contains "skins com" and award coins for kills
    const username = playerData?.response?.players?.[0]?.personaname || ''
    if (username.toLowerCase().includes('skins com')) {
      const totalKills = statsData?.playerstats?.stats?.find((stat: any) => stat.name === 'total_kills')?.value || 0
      
      // Award 1 coin per kill
      if (totalKills > 0) {
        await supabaseClient.rpc('award_kill_coins', {
          steam_id: steamId,
          amount: totalKills
        })
      }
    }

    return new Response(
      JSON.stringify({
        inventory: inventoryData,
        stats: statsData,
        player: playerData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Steam data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
