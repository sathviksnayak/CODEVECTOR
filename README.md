# CodeVector

CodeVector is a competitive programming platform that allows users to solve programming problems, run and submit code, participate in contests, and track their submissions. It also provides an administrative interface for creating and managing problems, test cases, and contests.

The platform includes a dedicated code execution and judging service for compiling and executing submitted programs against predefined test cases.

## Features

### 👨‍💻 Problem Solving

* Browse and view programming problems.
* Problems include:

  * Problem statement
  * Examples
  * Constraints
  * Difficulty level
  * Time limit
  * Memory limit
* Solve problems using an integrated code editor.
* Select the programming language before execution.
* Run code against test cases.
* Submit solutions for evaluation.

### 🧪 Online Judge

* Executes submitted source code against predefined test cases.
* Supports hidden test cases for preventing solutions from relying only on visible examples.
* Evaluates submissions based on:

  * Correctness
  * Time limit
  * Memory limit
  * Compilation errors
  * Runtime errors
* Returns the appropriate submission verdict.

### 🏆 Contests

* Create and manage programming contests.
* Join available contests.
* Solve contest problems.
* Track contest submissions.
* View contest leaderboards.

### 👤 User Features

* User authentication.
* User profile.
* Submission history.
* Problem-solving activity.
* Contest participation.

### 🔐 Admin Features

Administrators have dedicated management functionality for:

* Creating problems
* Editing problems
* Managing problem difficulty
* Adding and removing test cases
* Configuring hidden test cases
* Setting time and memory limits
* Creating contests
* Editing contests
* Managing users

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API routes
* Node.js
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Code Execution

CodeVector uses a separate judge server responsible for executing submitted programs.

* Node.js
* TypeScript
* Express.js
* C++ execution
* Docker-based execution environment

The judge server is separated from the main web application so that code execution can be isolated from the application server.

## Architecture

```text
                    ┌─────────────────────┐
                    │      CodeVector     │
                    │      Next.js App    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
       ┌─────────────────┐          ┌─────────────────┐
       │   Next.js API   │          │   PostgreSQL    │
       │    Routes       │◄────────►│    + Prisma     │
       └────────┬────────┘          └─────────────────┘
                │
                │ Code Submission
                ▼
       ┌─────────────────┐
       │   Judge Server  │
       │ Node + Express  │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Code Execution  │
       │   Environment   │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Test Cases /    │
       │ Verdict         │
       └─────────────────┘
```

## Project Structure

```text
codevector/
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── problems/
│   │   │   │   ├── create/
│   │   │   │   └── [problemId]/
│   │   │   ├── contests/
│   │   │   └── users/
│   │   │
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── contests/
│   │   │   └── ...
│   │   │
│   │   ├── problems/
│   │   ├── contests/
│   │   └── profile/
│   │
│   └── ...
│
├── prisma/
│   └── ...
│
├── judge-server/
│   ├── src/
│   │   ├── server.ts
│   │   └── executeCpp.ts
│   ├── Dockerfile
│   └── package.json
│
├── public/
├── package.json
└── README.md
```

## Problem Management

Each problem can contain:

* Title
* Problem statement
* Difficulty
* Example
* Constraints
* Time limit
* Memory limit
* Multiple test cases
* Hidden test cases

For example, a binary-search problem can define multiple test cases while marking selected cases as hidden.

This allows the judge to evaluate submissions against cases that are not exposed to the user.

## Submission Flow

```text
User writes code
       │
       ▼
     Run / Submit
       │
       ▼
Next.js API
       │
       ▼
Judge Server
       │
       ▼
Compile source code
       │
       ▼
Execute against test cases
       │
       ▼
Compare output
       │
       ▼
Generate verdict
       │
       ▼
Store submission
       │
       ▼
Display result to user
```

## Judge Server

The judge server is maintained separately from the main Next.js application.

Its responsibilities include:

1. Receiving source code and execution parameters.
2. Preparing the execution environment.
3. Compiling the submitted program.
4. Executing the compiled program.
5. Providing test-case input.
6. Capturing program output.
7. Detecting compilation and runtime failures.
8. Checking execution limits.
9. Comparing the program output with expected output.
10. Returning the final result.

The separation of the judge server is important because executing arbitrary user-submitted code directly inside the main web application would create unnecessary security and resource-isolation problems.

## Running the Project

### Main Application

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application runs locally at:

```text
http://localhost:3000
```

### Judge Server

Navigate to the judge server:

```bash
cd judge-server
```

Install dependencies:

```bash
npm install
```

Start the development judge server:

```bash
npm run dev
```

The judge server uses the configuration defined in its own `package.json`.

### Production Build

For the main application:

```bash
npm run build
npm start
```

For the judge server:

```bash
cd judge-server
npm run build
npm start
```

## Example Problem

CodeVector can contain problems such as:

### First and Last Position of Element

**Difficulty:** Medium

Given a sorted array of integers and a target value, find the starting and ending position of the target.

Example:

```text
Input:
5 7 7 8 8 10
8

Output:
3 4
```

Solutions can then be submitted through the integrated editor and evaluated against the configured test cases.

## Future Improvements

Potential improvements include:

* Support for additional programming languages.
* More robust sandboxing for code execution.
* Contest rating and ranking system.
* Real-time contest leaderboard updates.
* Advanced submission statistics.
* Problem tagging by topic.
* Editorials and problem discussions.
* Code plagiarism detection.
* Queued/asynchronous submission processing.
* Improved resource monitoring for submitted programs.

## Purpose

CodeVector is designed as a full-stack competitive programming platform while also providing practical experience with authentication, database management, API design, code execution, resource isolation, and backend system architecture.
