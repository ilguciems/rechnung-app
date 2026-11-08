import { encryptWith, reencrypt } from "@/lib/crypto-utils";
import { prisma } from "@/lib/prisma-client";

/**
 * Re-encrypts the Mailjet credentials stored in the database after
 * DB_ENCRYPTION_KEY is replaced.
 *
 *   OLD_DB_ENCRYPTION_KEY=<old hex key> NEW_DB_ENCRYPTION_KEY=<new hex key> \
 *     pnpm rotate:db-key [--dry-run]
 *
 * GCM rejects a wrong key, so the script can tell a row that still needs the
 * rotation apart from one an earlier run already rewrote. Run it right after
 * switching the environment variable: until it finishes, organizations with
 * saved Mailjet settings cannot send mail.
 */
const DRY_RUN = process.argv.includes("--dry-run");

const oldKey = process.env.OLD_DB_ENCRYPTION_KEY;
const newKey = process.env.NEW_DB_ENCRYPTION_KEY;

if (!oldKey || !newKey) {
  throw new Error(
    "Set OLD_DB_ENCRYPTION_KEY and NEW_DB_ENCRYPTION_KEY for the rotation",
  );
}

if (oldKey === newKey) {
  throw new Error("The old and the new key are identical");
}

// Fails fast on a malformed key instead of halfway through the table.
encryptWith("key check", oldKey);
encryptWith("key check", newKey);

const configs = await prisma.mailjetConfig.findMany({
  select: {
    id: true,
    organizationId: true,
    publicKeyEnc: true,
    privateKeyEnc: true,
  },
});

let rotated = 0;
let skipped = 0;

for (const config of configs) {
  const publicKey = reencrypt(config.publicKeyEnc, oldKey, newKey);
  const privateKey = reencrypt(config.privateKeyEnc, oldKey, newKey);

  if (
    publicKey.status === "already-rotated" &&
    privateKey.status === "already-rotated"
  ) {
    skipped += 1;
    continue;
  }

  if (DRY_RUN) {
    rotated += 1;
    console.log(`would rotate organization ${config.organizationId}`);
    continue;
  }

  await prisma.mailjetConfig.update({
    where: { id: config.id },
    data: {
      publicKeyEnc:
        publicKey.status === "rotated" ? publicKey.value : config.publicKeyEnc,
      privateKeyEnc:
        privateKey.status === "rotated"
          ? privateKey.value
          : config.privateKeyEnc,
    },
  });

  rotated += 1;
  console.log(`rotated organization ${config.organizationId}`);
}

console.log(
  `${DRY_RUN ? "Dry run: " : ""}${rotated} of ${configs.length} configuration(s) rotated, ${skipped} already current`,
);

await prisma.$disconnect();
