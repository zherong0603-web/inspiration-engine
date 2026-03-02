-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TopicIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT NOT NULL DEFAULT '通用',
    "source" TEXT,
    "sourceUrl" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "hotScore" INTEGER NOT NULL DEFAULT 0,
    "potential" TEXT,
    "status" TEXT NOT NULL DEFAULT '待处理',
    "usedInContentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TopicIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TopicIdea" ("category", "createdAt", "description", "hotScore", "id", "potential", "source", "sourceUrl", "status", "tags", "title", "updatedAt", "usedInContentId", "userId") SELECT "category", "createdAt", "description", "hotScore", "id", "potential", "source", "sourceUrl", "status", "tags", "title", "updatedAt", "usedInContentId", "userId" FROM "TopicIdea";
DROP TABLE "TopicIdea";
ALTER TABLE "new_TopicIdea" RENAME TO "TopicIdea";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
