import { createFileRoute } from "@tanstack/react-router";
import { FeedPage } from "@/components/FeedPage";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities for you — The Blueprint" },
      { name: "description", content: "Grants, fellowships and open calls picked by AI for your learning trajectory." },
      { property: "og:title", content: "Opportunities for you — The Blueprint" },
      { property: "og:description", content: "Personalized opportunities found by AI based on your notes and learning." },
    ],
  }),
  component: () => <FeedPage kind="opportunity" />,
});
