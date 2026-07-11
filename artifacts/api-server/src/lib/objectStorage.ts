import { Storage, type File } from "@google-cloud/storage";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const DEFAULT_SUPABASE_BUCKET = "kkn-putatsari-uploads";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

type UploadMetadata = {
  name?: string;
  size?: number;
  contentType?: string;
};

type SupabaseStorageConfig = {
  storageUrl: string;
  serviceRoleKey: string;
  bucketName: string;
};

export type StoredObject =
  | {
      provider: "replit";
      file: File;
    }
  | {
      provider: "supabase";
      objectName: string;
      isPublic: boolean;
    };

export class ObjectStorageService {
  constructor() {}

  private getSupabaseStorageConfig(): SupabaseStorageConfig | null {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_SUPABASE_BUCKET;

    if (!supabaseUrl || !serviceRoleKey) {
      return null;
    }

    return {
      storageUrl: `${supabaseUrl}/storage/v1`,
      serviceRoleKey,
      bucketName,
    };
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
        .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      if (this.getSupabaseStorageConfig()) {
        return ["public"];
      }

      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<StoredObject | null> {
    const supabaseConfig = this.getSupabaseStorageConfig();

    for (const searchPath of this.getPublicObjectSearchPaths()) {
      if (supabaseConfig) {
        const objectName = joinObjectPath(
          normalizeSupabaseSearchPath(searchPath, supabaseConfig.bucketName),
          filePath,
        );
        if (await supabaseObjectExists(supabaseConfig, objectName)) {
          return { provider: "supabase", objectName, isPublic: true };
        }
        continue;
      }

      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return { provider: "replit", file };
      }
    }

    return null;
  }

  async downloadObject(object: StoredObject, cacheTtlSec: number = 3600): Promise<Response> {
    if (object.provider === "supabase") {
      const supabaseConfig = this.getSupabaseStorageConfig();
      if (!supabaseConfig) {
        throw new Error("Supabase Storage is not configured");
      }

      const response = await fetch(supabaseObjectUrl(supabaseConfig, object.objectName), {
        headers: getSupabaseHeaders(supabaseConfig),
        signal: AbortSignal.timeout(30_000),
      });

      if (response.status === 404) {
        throw new ObjectNotFoundError();
      }
      if (!response.ok) {
        throw new Error(`Failed to download object: ${response.status}`);
      }

      const headers = new Headers(response.headers);
      headers.set(
        "Cache-Control",
        `${object.isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
      );

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    }

    const [metadata] = await object.file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(object.file);
    const isPublic = aclPolicy?.visibility === "public";

    const nodeStream = object.file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(metadata: UploadMetadata = {}): Promise<string> {
    const supabaseConfig = this.getSupabaseStorageConfig();
    const entityId = createObjectEntityId(metadata);

    if (supabaseConfig) {
      return createSupabaseSignedUploadURL(supabaseConfig, entityId);
    }

    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const fullPath = `${privateObjectDir}/${entityId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  async getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    const supabaseConfig = this.getSupabaseStorageConfig();

    if (supabaseConfig) {
      if (!(await supabaseObjectExists(supabaseConfig, entityId))) {
        throw new ObjectNotFoundError();
      }
      return { provider: "supabase", objectName: entityId, isPublic: false };
    }

    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return { provider: "replit", file: objectFile };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const supabaseConfig = this.getSupabaseStorageConfig();
    if (supabaseConfig && rawPath.startsWith(supabaseConfig.storageUrl)) {
      const objectName = parseSupabaseObjectName(rawPath, supabaseConfig);
      if (objectName) {
        return `/objects/${objectName}`;
      }
    }

    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async uploadObjectEntity(
    body: Buffer,
    metadata: UploadMetadata = {},
  ): Promise<string> {
    const supabaseConfig = this.getSupabaseStorageConfig();
    const entityId = createObjectEntityId(metadata);

    if (supabaseConfig) {
      const response = await fetch(supabaseObjectUrl(supabaseConfig, entityId), {
        method: "POST",
        headers: {
          ...getSupabaseHeaders(supabaseConfig),
          "Content-Type": metadata.contentType ?? "application/octet-stream",
          "cache-control": "max-age=3600",
          "x-upsert": "false",
        },
        body,
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Failed to upload object: ${response.status} ${text}`);
      }

      return `/objects/${entityId}`;
    }

    const privateObjectDir = this.getPrivateObjectDir();
    const fullPath = `${privateObjectDir}/${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    const file = objectStorageClient.bucket(bucketName).file(objectName);
    await file.save(body, {
      contentType: metadata.contentType ?? "application/octet-stream",
      resumable: false,
    });

    return `/objects/${entityId}`;
  }

  async deleteObjectEntity(objectPath: string): Promise<void> {
    if (!objectPath.startsWith("/objects/")) {
      return;
    }

    const entityId = objectPath.slice("/objects/".length);
    const supabaseConfig = this.getSupabaseStorageConfig();

    if (supabaseConfig) {
      const response = await fetch(
        `${supabaseConfig.storageUrl}/object/${encodeURIComponent(supabaseConfig.bucketName)}`,
        {
          method: "DELETE",
          headers: {
            ...getSupabaseHeaders(supabaseConfig),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefixes: [entityId] }),
          signal: AbortSignal.timeout(30_000),
        },
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete object: ${response.status}`);
      }
      return;
    }

    const privateDir = this.getPrivateObjectDir();
    const fullPath = `${privateDir}/${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    await objectStorageClient.bucket(bucketName).file(objectName).delete({
      ignoreNotFound: true,
    });
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    if (objectFile.provider === "replit") {
      await setObjectAclPolicy(objectFile.file, aclPolicy);
    }
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    if (objectFile.provider === "supabase") {
      return objectFile.isPublic || Boolean(userId);
    }

    return canAccessObject({
      userId,
      objectFile: objectFile.file,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

function createObjectEntityId(metadata: UploadMetadata = {}): string {
  return `uploads/${randomUUID()}${getFileExtension(metadata)}`;
}

function getFileExtension({ name, contentType }: UploadMetadata): string {
  const fromName = name?.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0]?.toLowerCase();
  if (fromName) {
    return fromName;
  }

  switch (contentType) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

function joinObjectPath(...parts: string[]): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

function encodeObjectName(objectName: string): string {
  return objectName
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function decodeObjectName(objectName: string): string {
  return objectName
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => decodeURIComponent(part))
    .join("/");
}

function normalizeSupabaseSearchPath(searchPath: string, bucketName: string): string {
  const trimmed = searchPath.replace(/^\/+|\/+$/g, "");
  if (trimmed === bucketName) {
    return "";
  }
  if (trimmed.startsWith(`${bucketName}/`)) {
    return trimmed.slice(bucketName.length + 1);
  }
  return trimmed;
}

function getSupabaseHeaders(config: SupabaseStorageConfig): Record<string, string> {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  };
}

function supabaseObjectUrl(config: SupabaseStorageConfig, objectName: string): string {
  return `${config.storageUrl}/object/${encodeURIComponent(config.bucketName)}/${encodeObjectName(objectName)}`;
}

async function supabaseObjectExists(
  config: SupabaseStorageConfig,
  objectName: string,
): Promise<boolean> {
  const response = await fetch(supabaseObjectUrl(config, objectName), {
    method: "HEAD",
    headers: getSupabaseHeaders(config),
    signal: AbortSignal.timeout(30_000),
  });

  if (response.ok) {
    return true;
  }
  if (response.status === 400 || response.status === 404) {
    return false;
  }

  throw new Error(`Failed to check object existence: ${response.status}`);
}

async function createSupabaseSignedUploadURL(
  config: SupabaseStorageConfig,
  objectName: string,
): Promise<string> {
  const response = await fetch(
    `${config.storageUrl}/object/upload/sign/${encodeURIComponent(config.bucketName)}/${encodeObjectName(objectName)}`,
    {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(config),
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to create Supabase signed upload URL: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    url?: string;
    signedURL?: string;
    signedUrl?: string;
  };
  const signedPath = data.url ?? data.signedURL ?? data.signedUrl;
  if (!signedPath) {
    throw new Error("Supabase did not return a signed upload URL");
  }

  if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) {
    return signedPath;
  }

  return `${config.storageUrl}${signedPath}`;
}

function parseSupabaseObjectName(
  rawPath: string,
  config: SupabaseStorageConfig,
): string | null {
  const url = new URL(rawPath);
  const storagePath = new URL(config.storageUrl).pathname.replace(/\/+$/, "");
  const bucketPart = encodeURIComponent(config.bucketName);
  const possiblePrefixes = [
    `${storagePath}/object/upload/sign/${bucketPart}/`,
    `${storagePath}/object/${bucketPart}/`,
  ];

  for (const prefix of possiblePrefixes) {
    if (url.pathname.startsWith(prefix)) {
      return decodeObjectName(url.pathname.slice(prefix.length));
    }
  }

  return null;
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json() as { signed_url: string };
  return signedURL;
}
