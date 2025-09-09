-- CreateTable
CREATE TABLE "members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "qr_code" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "memberships" (
    "membership_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "membership_type" TEXT NOT NULL,
    "purchase_date" DATETIME NOT NULL,
    "expiration_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "memberships_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("member_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "access_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "scan_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    CONSTRAINT "access_logs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("member_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_qr_code_key" ON "members"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");
