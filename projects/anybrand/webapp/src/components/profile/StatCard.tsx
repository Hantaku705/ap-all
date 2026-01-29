import { Users, UserPlus, Heart, Video, FileText } from "lucide-react";

interface StatCardProps {
  icon: "follower" | "following" | "likes" | "video" | "bio";
  value: number | string;
  label: string;
}

const iconMap = {
  follower: { icon: Users, color: "text-[#ff6b6b]", bg: "bg-[#ff6b6b]/10" },
  following: { icon: UserPlus, color: "text-green-500", bg: "bg-green-50" },
  likes: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  video: { icon: Video, color: "text-blue-500", bg: "bg-blue-50" },
  bio: { icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
};

function formatNumber(num: number | string): string {
  if (typeof num === "string") return num;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  const { icon: Icon, color, bg } = iconMap[icon];

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
