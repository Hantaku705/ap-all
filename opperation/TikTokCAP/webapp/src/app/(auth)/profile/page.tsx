import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileSidebar, StatCard } from "@/components/profile";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { tiktok } = session.user;

  // TikTokデータがない場合のデフォルト値
  const profile = tiktok || {
    displayName: session.user.name || "クリエイター",
    avatarUrl: session.user.image || "/default-avatar.png",
    followerCount: 0,
    followingCount: 0,
    likesCount: 0,
    videoCount: 0,
    bioDescription: "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <ProfileSidebar />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    @{profile.displayName}
                  </h1>
                  <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ee5a5a]">
                    Select Category +
                  </button>
                </div>

                {/* Rules Card */}
                <div className="hidden w-64 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 lg:block">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Rules for Gaining Sample Quota:
                    </h3>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b6b]/20">
                      <ChevronRight className="h-4 w-4 text-[#ff6b6b]" />
                    </div>
                  </div>
                  <div className="mt-2 h-16 rounded bg-white/50" />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  icon="follower"
                  value={profile.followerCount}
                  label="Follower Count"
                />
                <StatCard
                  icon="following"
                  value={profile.followingCount}
                  label="Following Count"
                />
                <StatCard
                  icon="likes"
                  value={profile.likesCount}
                  label="Likes Count"
                />
                <StatCard
                  icon="video"
                  value={profile.videoCount}
                  label="Video Count"
                />
              </div>

              {/* Bio Description */}
              <div className="mt-4">
                <StatCard
                  icon="bio"
                  value={profile.bioDescription || "—"}
                  label="Bio Description"
                />
              </div>
            </div>

            {/* Unlock Commission Card */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Unlock the</h3>
                  <p className="text-2xl font-bold text-[#ff6b6b]">
                    Highest Commission
                  </p>
                </div>
                <Link
                  href="/commissions"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff6b6b] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#ee5a5a]"
                >
                  UNLOCK
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
