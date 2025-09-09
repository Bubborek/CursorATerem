-- CreateTable
CREATE TABLE "badges" (
    "badge_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "criteria" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "member_badges" (
    "member_badge_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "member_badges_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("member_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "member_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges" ("badge_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_members" ("created_at", "email", "first_name", "last_name", "member_id", "phone_number", "qr_code", "updated_at") SELECT "created_at", "email", "first_name", "last_name", "member_id", "phone_number", "qr_code", "updated_at" FROM "members";
DROP TABLE "members";
ALTER TABLE "new_members" RENAME TO "members";
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");
CREATE UNIQUE INDEX "members_qr_code_key" ON "members"("qr_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "member_badges_member_id_badge_id_key" ON "member_badges"("member_id", "badge_id");
