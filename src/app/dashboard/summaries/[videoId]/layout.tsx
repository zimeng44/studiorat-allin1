import dynamic from "next/dynamic";
// import YouTubePlayer from "@/components/custom/YouTubePlayer";
const YouTubePlayer = dynamic(
  () => import("@/components/custom/YouTubePlayer"),
  { ssr: false },
);
import { getSummaryById } from "@/data/loaders";
import { extractYouTubeID } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function SummarySingleRoute({
  params,
  children,
}: {
  readonly params: any;
  readonly children: React.ReactNode;
}) {
  const data = await getSummaryById(params.videoId);

  if (data?.error?.status === 404) return notFound();

  const videoId = extractYouTubeID(data.videoId);

  return (
    <div>
      <div className="grid h-full grid-cols-5 gap-4 p-4">
        <div className="col-span-3">{children}</div>
        <div className="col-span-2">
          <div>
            <YouTubePlayer videoId={videoId} />
          </div>
        </div>
      </div>
    </div>
  );
}
