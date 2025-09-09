/*
  Warnings:

  - Added the required column `username` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "qr_code" TEXT NOT NULL,
    "password_hash" TEXT,
    "member_since" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_members" ("created_at", "email", "first_name", "last_name", "member_id", "member_since", "password_hash", "phone_number", "qr_code", "updated_at", "username") 
SELECT 
    "created_at", 
    "email", 
    "first_name", 
    "last_name", 
    "member_id", 
    "member_since", 
    "password_hash", 
    "phone_number", 
    "qr_code", 
    "updated_at",
    LOWER("first_name") || LOWER("last_name") || CAST(ROWID AS TEXT)
FROM "members";
DROP TABLE "members";
ALTER TABLE "new_members" RENAME TO "members";
CREATE UNIQUE INDEX "members_username_key" ON "members"("username");
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");
CREATE UNIQUE INDEX "members_qr_code_key" ON "members"("qr_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
