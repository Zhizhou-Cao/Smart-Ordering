export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch('https://api.dify.ai/v1/workflows/run', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

