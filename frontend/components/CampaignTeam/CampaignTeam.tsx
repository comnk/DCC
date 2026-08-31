"use client";

import "./CampaignTeam.scss";

import Image from "next/image";
import UserSearchBar from "@/components/SearchBars/UserSearchBar/UserSearchBar";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/User";

type Props = {
  creator: User;
  campaignId: string;
  accessToken: string;
};

function Avatar({ member }: { member: User }) {
  return (
    <div className="team-avatar">
      {member.profile_picture ? (
        <Image
          src={member.profile_picture}
          alt={member.display_name}
          className="team-avatar__img"
        />
      ) : (
        <div className="team-avatar__placeholder">
          {member.display_name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="team-avatar__info">
        <span className="team-avatar__name">{member.display_name}</span>
        {member.role && (
          <span className="team-avatar__role">
            {member.role
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </span>
        )}
        {member.email && (
          <span className="team-avatar__email">{member.email}</span>
        )}
      </div>
    </div>
  );
}

export default function CampaignTeam({
  creator,
  campaignId,
  accessToken,
}: Props) {
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchMembers = async () => {
      const membersData = await apiRequest<User[]>(
        `/campaigns/${campaignId}/members`,
        accessToken,
      );
      setMembers(membersData);
    };

    fetchMembers();
  }, [accessToken, campaignId]);

  const addMemberToCampaign = async (user: User) => {
    try {
      await apiRequest(`/campaigns/${campaignId}/members`, accessToken, {
        method: "POST",
        body: JSON.stringify({ user_id: user.id }),
      });

      setMembers((prev) => [...prev, user]);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const removeMemberFromCampaign = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        alert("You must be logged in to remove a member from the campaign");
        return;
      }

      const confirmed = confirm(
        "Are you sure you want to remove this member from the campaign?",
      );
      if (!confirmed) return;

      await apiRequest(`/campaigns/${campaignId}/members/${userId}`, accessToken, {
        method: "DELETE",
      });

      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <section className="campaign-team">
      <h2 className="campaign-team__title">Team</h2>

      <div className="campaign-team__section">
        <p className="campaign-team__section-label">Creator</p>
        <Avatar member={creator} />
      </div>

      <div className="campaign-team__section">
        <p className="campaign-team__section-label">Members</p>
        {members.length === 0 ? (
          <p className="campaign-team__empty">No members added yet.</p>
        ) : (
          <div className="campaign-team__members">
            {members.map((m) => (
              <div key={m.id} className="campaign-team__member-row">
                <Avatar member={m} />
                <button
                  className="campaign-team__remove-btn"
                  onClick={() => removeMemberFromCampaign(m.id)}
                  title="Remove member"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="campaign-team__section">
        <p className="campaign-team__section-label">Add Members</p>
        <UserSearchBar
          onAdd={(user) => addMemberToCampaign(user)}
          excludeIds={[creator.id, ...members.map((m) => m.id)]}
        />
      </div>
    </section>
  );
}
