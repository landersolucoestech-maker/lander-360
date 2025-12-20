import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const AUTENTIQUE_API_KEY = Deno.env.get('AUTENTIQUE_API_KEY');
const AUTENTIQUE_API_URL = 'https://api.autentique.com.br/v2/graphql';

async function graphqlRequest(query: string, variables?: Record<string, any>) {
  const response = await fetch(AUTENTIQUE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTENTIQUE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Autentique error: ${error}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL error');
  }

  return data.data;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (!AUTENTIQUE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Autentique API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, documentId, documentName, content, signers } = await req.json();

    let result;

    switch (action) {
      case 'create': {
        const query = `
          mutation CreateDocument($document: DocumentInput!, $signers: [SignerInput!]!) {
            createDocument(document: $document, signers: $signers) {
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
                link {
                  short_link
                }
              }
            }
          }
        `;

        const variables = {
          document: {
            name: documentName,
            content_base64: btoa(content),
            content_type: 'text/html',
          },
          signers: signers.map((s: any) => ({
            email: s.email,
            name: s.name,
            action: s.action || 'SIGN',
          })),
        };

        result = await graphqlRequest(query, variables);
        break;
      }

      case 'status': {
        const query = `
          query Document($id: UUID!) {
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
            }
          }
        `;

        result = await graphqlRequest(query, { id: documentId });
        break;
      }

      case 'list': {
        const query = `
          query Documents($limit: Int) {
            documents(limit: $limit) {
              data {
                id
                name
                created_at
                signatures {
                  name
                  email
                  signed {
                    created_at
                  }
                }
              }
            }
          }
        `;

        result = await graphqlRequest(query, { limit: 20 });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: create, status, or list' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
