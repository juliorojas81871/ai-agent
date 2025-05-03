# Portfolio

## Description

An AI-powered content analysis platform that helps YouTube creators optimize their videos through advanced insights. It features smart transcription, AI-generated thumbnails and titles, viral shot scripting, and interactive AI agent conversations. All built with Next.js, React, and integrated AI models like Anthropic and OpenAI.
If anyone want see this code, [please click at this link](https://ai-agent-n7654qqpz-juliorojas81871s-projects.vercel.app).

## Technologies & Methods Used

Frontend: Next.js 15, React 19, TailwindCSS, Radix UI (accessible components)
Authentication: Clerk (secure, modern user management)
Database: Convex (realtime backend as a service)
Media & Content Integration: youtubei.js for extracting video metadata and transcript data

Custom AI workflows for:
* Video analysis
* Transcription
* Thumbnail and title generation
* Script formatting
* Interactive agent conversations

## Steps to get code to run:
1. Open terminal
2. Type (You can also download the code):
```
git clone https://github.com/juliorojas81871/ai-agent
```

3. Make sure that you are in the right folder, if not cd to it.

4. Type:
```
pnpm install
```
5. Rename example-.env.local to .env.local and fill the empty key
6. Type this line in terminal:
```
pnpm run dev
```
7. Open another terminal at that folder and type
```
npx convex dev
```
8. Go to browser and type at the address bar:
```
http://localhost:3000/
```

## Example Pic:
![Notes Example Pic](https://github.com/juliorojas81871/ai-agent/tree/main/public/main.jpg)
