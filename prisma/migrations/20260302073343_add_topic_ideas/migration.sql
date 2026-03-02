-- CreateTable
CREATE TABLE "TopicIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
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
