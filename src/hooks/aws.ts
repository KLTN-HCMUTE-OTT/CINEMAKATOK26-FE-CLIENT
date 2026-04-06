// AWS S3 Configuration
export const AWS_CONFIG = {
  s3: {
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    region: process.env.NEXT_PUBLIC_S3_REGION,
    baseUrl: process.env.NEXT_PUBLIC_S3_BASE_URL
  }
}

// Helper function to get full S3 URL
export const getS3Url = (path: string): string => {
  if (!path) return ''

  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Remove leading slash if exists
  const cleanPath = path.startsWith('/') ? path.substring(1) : path

  return `${AWS_CONFIG.s3.baseUrl}/${cleanPath}`
}
