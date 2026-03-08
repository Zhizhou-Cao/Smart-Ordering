export async function POST(request: Request) {
  const formData = await request.formData();

  const response = await fetch('https://api.dify.ai/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_DIFY_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

