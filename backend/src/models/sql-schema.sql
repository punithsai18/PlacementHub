-- PlacementHub Azure SQL Schema
-- Run this script to initialize the database

-- Students table
CREATE TABLE Students (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(255)   NOT NULL,
    email           NVARCHAR(255)   NOT NULL UNIQUE,
    passwordHash    NVARCHAR(255)   NOT NULL,
    phone           NVARCHAR(50),
    course          NVARCHAR(255),
    graduationYear  INT,
    skills          NVARCHAR(MAX),
    resumeUrl       NVARCHAR(500),
    createdAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    updatedAt       DATETIME2
);

CREATE INDEX IX_Students_Email ON Students(email);

-- Companies table
CREATE TABLE Companies (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(255)   NOT NULL,
    email           NVARCHAR(255)   NOT NULL UNIQUE,
    passwordHash    NVARCHAR(255)   NOT NULL,
    website         NVARCHAR(500),
    industry        NVARCHAR(255),
    createdAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Companies_Email ON Companies(email);

-- Jobs table
CREATE TABLE Jobs (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    companyId       INT             NOT NULL REFERENCES Companies(id) ON DELETE CASCADE,
    title           NVARCHAR(255)   NOT NULL,
    description     NVARCHAR(MAX)   NOT NULL,
    location        NVARCHAR(255),
    salary          NVARCHAR(100),
    skills          NVARCHAR(MAX),
    deadline        DATETIME2,
    openings        INT             NOT NULL DEFAULT 1,
    isActive        BIT             NOT NULL DEFAULT 1,
    postedAt        DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Jobs_CompanyId ON Jobs(companyId);
CREATE INDEX IX_Jobs_IsActive  ON Jobs(isActive);

-- Applications table
CREATE TABLE Applications (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    studentId   INT             NOT NULL REFERENCES Students(id) ON DELETE CASCADE,
    jobId       INT             NOT NULL REFERENCES Jobs(id) ON DELETE CASCADE,
    status      NVARCHAR(50)    NOT NULL DEFAULT 'applied',
    -- status values: applied | shortlisted | interview | offered | rejected | placed
    appliedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    updatedAt   DATETIME2,
    CONSTRAINT UQ_Applications_Student_Job UNIQUE (studentId, jobId)
);

CREATE INDEX IX_Applications_StudentId ON Applications(studentId);
CREATE INDEX IX_Applications_JobId     ON Applications(jobId);
CREATE INDEX IX_Applications_Status    ON Applications(status);

-- Placements table
CREATE TABLE Placements (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    studentId   INT             NOT NULL REFERENCES Students(id),
    jobId       INT             NOT NULL REFERENCES Jobs(id),
    companyId   INT             NOT NULL REFERENCES Companies(id),
    salary      NVARCHAR(100),
    placedAt    DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Placements_Student_Job UNIQUE (studentId, jobId)
);

CREATE INDEX IX_Placements_StudentId  ON Placements(studentId);
CREATE INDEX IX_Placements_CompanyId  ON Placements(companyId);
