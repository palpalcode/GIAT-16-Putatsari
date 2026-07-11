export async function uploadToObjectUrl(uploadURL: string, file: File): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": file.type || "application/octet-stream",
  };

  if (uploadURL.includes("/storage/v1/object/upload/sign/")) {
    headers["cache-control"] = "max-age=3600";
    headers["x-upsert"] = "false";
  }

  const response = await fetch(uploadURL, {
    method: "PUT",
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to storage");
  }
}
