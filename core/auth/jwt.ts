import {
  generateKeyPair as joseGenerateKeyPair,
  SignJWT,
  jwtVerify,
  exportPKCS8,
  importPKCS8,
  exportSPKI,
  importSPKI,
} from "jose";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ALG = "RS256";
const ISSUER = "mtninsights";
const AUDIENCE = "mtninsights-api";

export async function generateKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  return joseGenerateKeyPair(ALG, { extractable: true }) as Promise<{
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }>;
}

export async function loadOrCreateKeys(keysDir: string): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const privatePath = join(keysDir, "private.pem");
  const publicPath = join(keysDir, "public.pem");

  if (existsSync(privatePath)) {
    const privatePem = readFileSync(privatePath, "utf-8");
    const publicPem = readFileSync(publicPath, "utf-8");
    const privateKey = (await importPKCS8(privatePem, ALG)) as CryptoKey;
    const publicKey = (await importSPKI(publicPem, ALG)) as CryptoKey;
    return { publicKey, privateKey };
  }

  mkdirSync(keysDir, { recursive: true });
  const { publicKey, privateKey } = await generateKeyPair();
  const privatePem = await exportPKCS8(privateKey);
  const publicPem = await exportSPKI(publicKey);
  writeFileSync(privatePath, privatePem, "utf-8");
  writeFileSync(publicPath, publicPem, "utf-8");
  return { publicKey, privateKey };
}

export async function signAccessToken(
  privateKey: CryptoKey,
  claims: { sub: string; tid: string; scope: string; jti: string },
): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(privateKey);
}

export async function verifyAccessToken(
  publicKey: CryptoKey,
  token: string,
): Promise<{
  sub: string;
  tid: string;
  scope: string;
  jti: string;
  iat: number;
  exp: number;
}> {
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return {
    sub: payload.sub as string,
    tid: payload.tid as string,
    scope: payload.scope as string,
    jti: payload.jti as string,
    iat: payload.iat as number,
    exp: payload.exp as number,
  };
}
