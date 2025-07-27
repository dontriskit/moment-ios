import PlaylistDetailPageClient from "./page-wrapper";

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaylistDetailPageClient id={id} />;
}