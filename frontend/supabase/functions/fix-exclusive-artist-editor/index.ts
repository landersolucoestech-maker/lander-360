import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Simple API key for security (use the anon key)
const ALLOWED_API_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Exclusive artists list
const EXCLUSIVE_ARTISTS = [
  // Nomes artísticos
  'dj stay',
  'dj md tr3ze',
  'dj md tr3zê',
  'rapha radamá',
  'rapha radama',
  'mc diogo da gv',
  // Nomes reais (full_name)
  'carlos daniel de moura',
  'raphael lopes de souza',
  'diogo junior pereira',
  'david alexandre ferreira aires',
  'allison batista barbosa militano',
  // Deyvisson
  'deyvisson lander andrade 06204919652',
  'deyvisson lander andrade',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all music registry entries
    const { data: entries, error: fetchError } = await supabase
      .from('music_registry')
      .select('id, title, participants')
      .not('participants', 'is', null);

    if (fetchError) {
      throw new Error(`Error fetching entries: ${fetchError.message}`);
    }

    const updatedEntries: string[] = [];
    const skippedEntries: string[] = [];

    for (const entry of entries || []) {
      const participants = entry.participants as any[];
      
      if (!participants || participants.length === 0) {
        skippedEntries.push(`${entry.title}: No participants`);
        continue;
      }

      // Check if any participant is an exclusive artist
      const hasExclusiveArtist = participants.some((p: any) => 
        EXCLUSIVE_ARTISTS.includes(p.name?.toLowerCase().trim())
      );

      if (!hasExclusiveArtist) {
        skippedEntries.push(`${entry.title}: No exclusive artist`);
        continue;
      }

      // Check if Deyvisson is already an editor
      const hasLanderEditor = participants.some((p: any) => 
        (p.name?.toLowerCase().trim() === 'deyvisson lander andrade 06204919652' || 
         p.name?.toLowerCase().trim() === 'deyvisson lander andrade') && 
        p.role === 'editor'
      );

      if (hasLanderEditor) {
        skippedEntries.push(`${entry.title}: Deyvisson already editor`);
        continue;
      }

      // Add Deyvisson as editor with 10%
      const newParticipants = [
        {
          name: 'Deyvisson Lander Andrade 06204919652',
          role: 'editor',
          link: 'Link 1',
          contract_start_date: '',
          percentage: 10,
        },
        ...participants
      ];

      // Redistribute percentages: Deyvisson gets 10%, others split 90%
      const otherCount = participants.length;
      const remainingPercentage = 90;
      const evenPercentage = Math.floor(remainingPercentage / otherCount);
      const remainder = remainingPercentage - (evenPercentage * otherCount);

      const updatedParticipants = newParticipants.map((p: any, idx: number) => {
        if (idx === 0) {
          // Deyvisson
          return { ...p, link: 'Link 1', percentage: 10 };
        } else {
          const otherIdx = idx - 1;
          const isLast = otherIdx === otherCount - 1;
          const percentage = isLast ? evenPercentage + remainder : evenPercentage;
          return { ...p, link: `Link ${idx + 1}`, percentage };
        }
      });

      // Update the entry
      const { error: updateError } = await supabase
        .from('music_registry')
        .update({ participants: updatedParticipants })
        .eq('id', entry.id);

      if (updateError) {
        console.error(`Error updating ${entry.title}: ${updateError.message}`);
      } else {
        updatedEntries.push(entry.title);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedEntries,
        skipped: skippedEntries,
        message: `Updated ${updatedEntries.length} entries, skipped ${skippedEntries.length}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
