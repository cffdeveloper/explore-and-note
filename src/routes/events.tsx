import { createFileRoute } from "@tanstack/react-router";
import { FeedPage } from "@/components/FeedPage";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events for you — The Blueprint" },
      { name: "description", content: "Live AI-scouted events matching your learning across all 8 pillars." },
      { property: "og:title", content: "Events for you — The Blueprint" },
      { property: "og:description", content: "Personalized events found by AI based on your notes and learning." },
    ],
  }),
  component: () => <FeedPage kind="event" />,
});
