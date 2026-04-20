"use client";

import "./CampaignTeam.scss";

import Image from "next/image";
import UserSearchBar from "@/components/SearchBars/UserSearchBar/UserSearchBar";

type Member = {
  id: string;
  display_name: string;
  role: string;
  profile_picture?: string;
  email?: string;
};

type Props = {
  creator: Member;
  members: Member[];
};

function Avatar({ member }: { member: Member }) {
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

export default function CampaignTeam({ creator, members }: Props) {
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
              <Avatar key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>

      <div className="campaign-team__section">
        <p className="campaign-team__section-label">Add Members</p>
        <UserSearchBar
          onAdd={(user) => console.log("TODO: add member", user)}
          excludeIds={[creator.id, ...members.map((m) => m.id)]}
        />
      </div>
    </section>
  );
}
