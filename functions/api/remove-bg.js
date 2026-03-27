export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const formData = new FormData();
        formData.append('image_file', await context.request.blob());
        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': context.env.REMOVEBG_API_KEY
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const imageBlob = await response.blob();
        return new Response(imageBlob, {
            headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
