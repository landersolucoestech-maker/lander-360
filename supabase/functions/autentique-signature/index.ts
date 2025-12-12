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
      throw new Error('AUTENTIQUE_API_KEY não configurada. Configure em Configurações > Secrets.');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { contractId, documentId, action, pdfBase64 } = await req.json();

    console.log('Autentique signature request:', { action, contractId, documentId, hasPdf: !!pdfBase64 });

    if (action === 'create') {
      // Fetch contract details
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('*, artists(name, stage_name, email, full_name)')
        .eq('id', contractId)
        .single();

      if (contractError || !contract) {
        throw new Error('Contrato não encontrado');
      }

      const artistName = contract.artists?.full_name || contract.artists?.stage_name || contract.artists?.name || 'Artista';
      const artistEmail = contract.artists?.email;

      if (!artistEmail) {
        throw new Error('E-mail do artista não encontrado - necessário para assinatura digital');
      }

      if (!pdfBase64) {
        throw new Error('PDF do contrato não fornecido - gere a prévia antes de enviar para assinatura');
      }

      // Autentique uses multipart/form-data for file upload
      // We need to use their REST API endpoint for document creation with file
      const formData = new FormData();
      
      // Convert base64 to Blob
      const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
      
      // GraphQL mutation with file upload
      const operations = JSON.stringify({
        query: `
          mutation CreateDocumentMutation(
            $document: DocumentInput!,
            $signers: [SignerInput!]!,
            $file: Upload!
          ) {
            createDocument(
              document: $document,
              signers: $signers,
              file: $file
            ) {
              id
              name
              refusable
              sortable
              created_at
              signatures {
                public_id
                name
                email
                created_at
                action { name }
                link { short_link }
                user { id name email }
              }
            }
          }
        `,
        variables: {
          document: {
            name: contract.title || `Contrato - ${artistName}`,
          },
          signers: [
            {
              email: artistEmail,
              action: "SIGN",
              name: artistName
            },
            {
              email: "contratos@lander360.com",
              action: "SIGN",
              name: "Lander Records"
            }
          ],
          file: null
        }
      });

      const map = JSON.stringify({
        "0": ["variables.file"]
      });

      formData.append('operations', operations);
      formData.append('map', map);
      formData.append('0', pdfBlob, `contrato-${contractId}.pdf`);

      console.log('Sending to Autentique with file upload...');

      const response = await fetch('https://api.autentique.com.br/v2/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTENTIQUE_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Autentique create response:', JSON.stringify(result));

      if (result.errors) {
        const errorMessage = result.errors[0]?.message || 'Erro na API do Autentique';
        console.error('Autentique errors:', result.errors);
        throw new Error(errorMessage);
      }

      const doc = result.data?.createDocument;
      
      if (!doc?.id) {
        throw new Error('Documento não foi criado no Autentique');
      }

      // Update contract with document ID and status
      await supabase
        .from('contracts')
        .update({ 
          autentique_document_id: doc.id,
          status: 'pendente',
          signature_request_date: new Date().toISOString()
        })
        .eq('id', contractId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          documentId: doc.id,
          message: 'Contrato enviado para assinatura com sucesso',
          signatures: doc.signatures
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
              rejected {
                created_at
                reason
              }
            }
            files {
              signed
              original
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
        throw new Error(result.errors[0]?.message || 'Erro na API do Autentique');
      }

      const doc = result.data?.document;
      const allSigned = doc?.signatures?.every((s: any) => s.signed?.created_at);
      const anyRejected = doc?.signatures?.some((s: any) => s.rejected?.created_at);
      
      let status = 'pending';
      if (allSigned) status = 'signed';
      if (anyRejected) status = 'rejected';

      return new Response(
        JSON.stringify({ 
          success: true, 
          status,
          signedUrl: allSigned ? doc?.files?.signed : null,
          originalUrl: doc?.files?.original,
          signatures: doc?.signatures
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Ação inválida');

  } catch (error: any) {
    console.error('Autentique signature error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
