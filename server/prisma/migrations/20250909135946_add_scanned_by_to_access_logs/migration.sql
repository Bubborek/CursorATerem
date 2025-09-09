-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_access_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "scanned_by" TEXT,
    "scan_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    CONSTRAINT "access_logs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("member_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "access_logs_scanned_by_fkey" FOREIGN KEY ("scanned_by") REFERENCES "staff" ("staff_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_access_logs" ("log_id", "member_id", "result", "scan_time") SELECT "log_id", "member_id", "result", "scan_time" FROM "access_logs";
DROP TABLE "access_logs";
ALTER TABLE "new_access_logs" RENAME TO "access_logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
