import { notFound } from "next/navigation";

// Legacy workbench retired — no longer linked from in-app navigation.
// Keep file to avoid 404 from any external bookmarks; redirect to notFound() instead.
export default function LegacyPage() {
  notFound();
}
