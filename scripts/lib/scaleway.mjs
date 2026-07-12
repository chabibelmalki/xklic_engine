// @ts-check
/**
 * Stockage objet Scaleway (S3-compatible) — miroir Node de `internal/media/media.go`
 * du back-office. Même bucket (`xklic-media`), mêmes credentials ; les assets des
 * sites vivent sous le préfixe « sites/ » (à côté de « products/ »).
 *
 * La config d'un site ne stocke que l'URL publique = MEDIA_BASE_URL + "/" + clé.
 * Changer de domaine média (ex. media.xklic.com) = une seule variable, rien en base.
 *
 * Env (lues via loadEnvLocal, l'env réel a priorité) :
 *   S3_ENDPOINT (défaut https://s3.fr-par.scw.cloud), S3_REGION (défaut fr-par),
 *   S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, MEDIA_BASE_URL.
 */
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { die } from "../onboard/util.mjs";

/** Préfixe de tous les assets de sites dans le bucket partagé. */
export const SITES_PREFIX = "sites";

/**
 * Construit un client Scaleway depuis l'environnement. `die` si une variable
 * requise manque (message actionnable, jamais un stacktrace).
 * @returns {{ upload: (key: string, data: Buffer, contentType: string) => Promise<string>,
 *             remove: (key: string) => Promise<void>,
 *             publicURL: (key: string) => string,
 *             bucket: string, baseURL: string }}
 */
export function scalewayFromEnv() {
  const endpoint = (process.env.S3_ENDPOINT || "https://s3.fr-par.scw.cloud").trim();
  const region = (process.env.S3_REGION || "fr-par").trim();
  const bucket = (process.env.S3_BUCKET || "").trim();
  const accessKey = (process.env.S3_ACCESS_KEY || "").trim();
  const secretKey = (process.env.S3_SECRET_KEY || "").trim();
  const baseURL = (process.env.MEDIA_BASE_URL || "").trim().replace(/\/+$/, "");

  const missing = [
    ["S3_BUCKET", bucket],
    ["S3_ACCESS_KEY", accessKey],
    ["S3_SECRET_KEY", secretKey],
    ["MEDIA_BASE_URL", baseURL],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    die(
      `Configuration Scaleway incomplète dans .env.local : ${missing.join(", ")} manquante(s).\n` +
        "  Copie les mêmes valeurs que le back-office (S3_* + MEDIA_BASE_URL).",
    );
  }

  const s3 = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: false, // virtual-hosted : <bucket>.s3.<region>.scw.cloud
  });

  /** @param {string} key */
  const publicURL = (key) => {
    if (!key) return "";
    if (/^https?:\/\//.test(key)) return key; // valeur déjà absolue (compat legacy)
    return `${baseURL}/${key.replace(/^\/+/, "")}`;
  };

  return {
    bucket,
    baseURL,
    publicURL,
    /**
     * Pousse un objet lisible publiquement (ACL par objet, jamais le bucket).
     * Cache immuable 1 an — d'où l'usage de clés versionnées par hash de contenu.
     * @param {string} key @param {Buffer} data @param {string} contentType
     * @returns {Promise<string>} l'URL publique
     */
    async upload(key, data, contentType) {
      const k = key.replace(/^\/+/, "");
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: k,
          Body: data,
          ContentType: contentType,
          ACL: "public-read",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      return publicURL(k);
    },
    /** @param {string} key */
    async remove(key) {
      if (!key) return;
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key.replace(/^\/+/, "") }));
    },
  };
}

/**
 * Empreinte courte (8 hex) du contenu — sert de suffixe de version dans la clé
 * pour casser le cache immuable quand une image change (mêmes octets → même URL).
 * @param {Buffer} data
 * @returns {string}
 */
export function contentHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 8);
}

/**
 * Content-Type d'après l'extension (les assets sites sont uploadés bruts, sans
 * transcodage — on préserve PNG à transparence / SVG / WebP déjà optimisés).
 * @param {string} ext extension avec le point, ex. ".png"
 * @returns {string}
 */
export function contentTypeFor(ext) {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    case ".avif":
      return "image/avif";
    case ".ico":
      return "image/x-icon";
    case ".jfif":
      return "image/jpeg";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}
