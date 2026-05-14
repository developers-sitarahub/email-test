import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const fileType = file.type;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `email/header/${fileName}`,
      Body: buffer,
      ContentType: fileType,
      CacheControl: "max-age=31536000, public",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const cloudFrontUrl = `${process.env.CLOUDFRONT_BASE_URL}/email/header/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: cloudFrontUrl 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
