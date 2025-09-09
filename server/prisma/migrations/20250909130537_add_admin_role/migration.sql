-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_staff" (
    "staff_id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_staff" ("created_at", "email", "first_name", "last_name", "password_hash", "staff_id", "updated_at") SELECT "created_at", "email", "first_name", "last_name", "password_hash", "staff_id", "updated_at" FROM "staff";
DROP TABLE "staff";
ALTER TABLE "new_staff" RENAME TO "staff";
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
