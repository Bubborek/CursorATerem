-- CreateTable
CREATE TABLE "daily_points" (
    "daily_points_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "base_points" INTEGER NOT NULL DEFAULT 100,
    "streak_multiplier" REAL NOT NULL DEFAULT 1.0,
    "total_points" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_points_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("member_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_badges" (
    "badge_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "point_value" INTEGER NOT NULL DEFAULT 50,
    "criteria" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_badges" ("badge_id", "created_at", "criteria", "description", "icon_url", "name", "updated_at") SELECT "badge_id", "created_at", "criteria", "description", "icon_url", "name", "updated_at" FROM "badges";
DROP TABLE "badges";
ALTER TABLE "new_badges" RENAME TO "badges";
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");
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
    "updated_at" DATETIME NOT NULL,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "avatar_url" TEXT,
    "bio" TEXT,
    "last_visit_date" DATETIME
);
INSERT INTO "new_members" ("created_at", "email", "first_name", "last_name", "member_id", "member_since", "password_hash", "phone_number", "qr_code", "updated_at", "username") SELECT "created_at", "email", "first_name", "last_name", "member_id", "member_since", "password_hash", "phone_number", "qr_code", "updated_at", "username" FROM "members";
DROP TABLE "members";
ALTER TABLE "new_members" RENAME TO "members";
CREATE UNIQUE INDEX "members_username_key" ON "members"("username");
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");
CREATE UNIQUE INDEX "members_qr_code_key" ON "members"("qr_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "daily_points_member_id_date_key" ON "daily_points"("member_id", "date");
