"use server";

import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";

const MINIO_BUCKET_NAME = "media";

const s3Client = new S3Client({
  endpoint: "https://minio.slocksert.dev/",
  region: "us-east-1",
  credentials: {
    accessKeyId: "tikservice",
    secretAccessKey: "tikservice_engenharia_software",
  },
  forcePathStyle: true,
});

async function ensureBucketExists() {
  try {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: MINIO_BUCKET_NAME,
      })
    );
  } catch (error) {
    console.log("error:", error);
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: MINIO_BUCKET_NAME,
      })
    );

    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: MINIO_BUCKET_NAME,
        Policy: JSON.stringify(policy),
      })
    );
  }
}

interface FileData {
  buffer: Buffer | number[];
  originalname: string;
  mimetype: string;
  size: number;
}

export async function getFileUploadUrl(
  file: FileData,
  fileType: string,
  messageId: string
) {
  try {
    await ensureBucketExists();

    const fileName = `${messageId}-${file.originalname.replace(/\s+/g, "-")}`;

    const fileContent = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Array.isArray(file.buffer)
      ? Buffer.from(file.buffer)
      : Buffer.from(file.buffer);

    const command = new PutObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: fileType,
      ContentLength: fileContent.length,
    });

    const result = await s3Client.send(command);
    console.log("File upload successful:", result);

    const fileUrl = `https://minio.slocksert.dev/${MINIO_BUCKET_NAME}/${fileName}`;
    console.log("Generated file URL:", fileUrl);

    return {
      fileUrl: fileUrl,
    };
  } catch (error) {
    console.error("Error uploading file to MinIO:", error);
    throw new Error("Failed to upload file");
  }
}

export async function uploadFile(
  file: FileData,
  prefix: string = "general",
  customFileName?: string
): Promise<{ fileUrl: string }> {
  try {
    await ensureBucketExists();

    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, "-");
    const fileName = customFileName
      ? `${prefix}-${customFileName}`
      : `${prefix}-${timestamp}-${sanitizedOriginalName}`;

    const fileContent = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Array.isArray(file.buffer)
      ? Buffer.from(file.buffer)
      : Buffer.from(file.buffer);

    const command = new PutObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
      ContentLength: fileContent.length,
    });

    const result = await s3Client.send(command);
    console.log("File upload successful:", result);

    const fileUrl = `https://minio.slocksert.dev/${MINIO_BUCKET_NAME}/${fileName}`;
    console.log("Generated file URL:", fileUrl);

    return {
      fileUrl: fileUrl,
    };
  } catch (error) {
    console.error("Error uploading file to MinIO:", error);
    throw new Error("Failed to upload file");
  }
}

export async function uploadProfileImage(
  file: FileData,
  userId: string
): Promise<{ fileUrl: string }> {
  return uploadFile(file, "profile", `${userId}-${Date.now()}`);
}

export async function uploadMessageImage(
  file: FileData,
  messageId: string
): Promise<{ fileUrl: string }> {
  return uploadFile(file, "message", messageId);
}

// Backward compatibility functions
export async function getImageUploadUrl(
  file: FileData,
  fileType: string,
  messageId: string
) {
  const result = await getFileUploadUrl(file, fileType, messageId);
  return { imageUrl: result.fileUrl };
}

export async function uploadImage(
  file: FileData,
  prefix: string = "general",
  customFileName?: string
): Promise<{ imageUrl: string }> {
  const result = await uploadFile(file, prefix, customFileName);
  return { imageUrl: result.fileUrl };
}

// Video-specific functions
export async function uploadVideo(
  file: FileData,
  prefix: string = "video",
  customFileName?: string
): Promise<{ videoUrl: string }> {
  const result = await uploadFile(file, prefix, customFileName);
  return { videoUrl: result.fileUrl };
}

export async function uploadMessageVideo(
  file: FileData,
  messageId: string
): Promise<{ videoUrl: string }> {
  return uploadVideo(file, "message", messageId);
}
