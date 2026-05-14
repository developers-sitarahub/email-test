import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadBase64ToS3(base64Data: string, type: string): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const fileName = `brand-${Date.now()}-${Math.random().toString(36).substring(7)}.${type.split('/')[1] || 'png'}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `email/assets/${fileName}`,
    Body: buffer,
    ContentType: type,
    CacheControl: "max-age=31536000, public",
  }));

  return `${process.env.CLOUDFRONT_BASE_URL}/email/assets/${fileName}`;
}

export async function processHtmlForS3(html: string): Promise<string> {
  let processedHtml = html;
  const base64Regex = /src="data:image\/([^;]+);base64,([^"]+)"/g;
  const matches = Array.from(html.matchAll(base64Regex));
  
  for (const m of matches) {
    const [fullMatch, type, data] = m;
    const uploadedUrl = await uploadBase64ToS3(data, `image/${type}`);
    processedHtml = processedHtml.replace(fullMatch, `src="${uploadedUrl}"`);
  }
  
  return processedHtml;
}
