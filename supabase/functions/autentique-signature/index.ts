import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const AUTENTIQUE_API_KEY = Deno.env.get('AUTENTIQUE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!AUTENTIQUE_API_KEY) {
      throw new Error('AUTENTIQUE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { contractId, documentId, action } = await req.json();

    console.log('Autentique signature request:', { action, contractId, documentId });

    if (action === 'create') {
      // Fetch contract details
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('*, artists(name, stage_name, email, full_name)')
        .eq('id', contractId)
        .single();

      if (contractError || !contract) {
        throw new Error('Contract not found');
      }

      const artistName = contract.artists?.stage_name || contract.artists?.name || 'Artista';
      const artistEmail = contract.artists?.email;

      if (!artistEmail) {
        throw new Error('Artist email not found - required for digital signature');
      }

      // Create document in Autentique via GraphQL API
      const mutation = `
        mutation CreateDocument($document: DocumentInput!) {
          createDocument(document: $document) {
            id
            name
            signatures {
              public_id
              name
              email
              signed {
                created_at
              }
            }
          }
        }
      `;

      const variables = {
        document: {
          name: contract.title || `Contrato - ${artistName}`,
          message: `Por favor, assine o contrato de ${contract.service_type || 'edição'} musical.`,
          reminder: "WEEKLY",
          sortable: true,
          signers: [
            {
              email: artistEmail,
              action: "SIGN",
              name: artistName
            },
            {
              email: "contratos@lander360.com", // Company signer
              action: "SIGN",
              name: "Lander Records"
            }
          ]
        }
      };

      const response = await fetch('https://api.autentique.com.br/v2/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTENTIQUE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const result = await response.json();
      console.log('Autentique create response:', JSON.stringify(result));

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Autentique API error');
      }

      const doc = result.data?.createDocument;
      
      // Update contract with document ID
      await supabase
        .from('contracts')
        .update({ 
          document_url: doc?.id,
          status: 'pendente'
        })
        .eq('id', contractId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          documentId: doc?.id,
          message: 'Document created and sent for signature'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'status') {
      // Check document status
      const query = `
        query GetDocument($id: UUID!) {
          document(id: $id) {
            id
            name
            created_at
            signatures {
              public_id
              name
              email
              signed {
                created_at
              }
            }
            files {
              signed
            }
          }
        }
      `;

      const response = await fetch('https://api.autentique.com.br/v2/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTENTIQUE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables: { id: documentId } }),
      });

      const result = await response.json();
      console.log('Autentique status response:', JSON.stringify(result));

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Autentique API error');
      }

      const doc = result.data?.document;
      const allSigned = doc?.signatures?.every((s: any) => s.signed?.created_at);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: allSigned ? 'signed' : 'pending',
          signedUrl: allSigned ? doc?.files?.signed : null,
          signatures: doc?.signatures
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Autentique signature error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
