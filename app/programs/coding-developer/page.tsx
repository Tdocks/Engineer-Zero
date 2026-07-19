import { CodingDeveloperApp } from "@/components/CodingDeveloperApp";

export const metadata = {
  title: "LaunchCode AI | Engineer Zero",
  description: "A shared four-day Python and AI prototype readiness program.",
};

export default async function CodingDeveloperPage({
  searchParams,
}: {
  searchParams: Promise<{
    path?: string;
    lesson?: string;
    challenge?: string;
  }>;
}) {
  const { path, lesson, challenge } = await searchParams;
  return (
    <CodingDeveloperApp
      initialLessonId={lesson}
      initialChallengeId={challenge}
      emergencyPath={path === "interview-emergency"}
    />
  );
}
