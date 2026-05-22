'use client';

export default function AvatarPlayer({ videoUrl }: { videoUrl: string }) {
  if (!videoUrl) return null;
  return (
    <div className="mt-2">
      <video controls src={videoUrl} className="w-full rounded-lg max-h-48" />
    </div>
  );
}
