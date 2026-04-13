import { ScanContent } from "@/components/scan/ScanContent";

export default function ScanPage({
  searchParams,
}: {
  searchParams: { trackerId?: string };
}) {
  return <ScanContent trackerId={searchParams.trackerId} />;
}
