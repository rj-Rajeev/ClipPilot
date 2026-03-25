let queue = [];

export async function POST(req) {
  const { videos, state } = await req.json();

  videos.forEach(v => {
    queue.push({ url: `https://youtube.com/watch?v=${v.id}`, state });
  });

  processQueue();

  return Response.json({ success: true });
}

async function processQueue() {
  if (processQueue.running) return;
  processQueue.running = true;

  while (queue.length > 0) {
    const job = queue.shift();

    try {
      await fetch(`${process.env.APP_BASE_URL || "http://localhost:3000"}/api/yt-download-upload`, {
        method: "POST",
        body: JSON.stringify(job),
      });
    } catch (e) {
      console.error("Job failed", e);
    }
  }

  processQueue.running = false;
}