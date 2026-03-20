import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Params } from "@/types/Params";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  caption: string;
}

export default async function CampaignPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`http://localhost:8000/campaigns/${id}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Entry fetch failed:", res.status);
  }

  const campaign = await res.json();

  const campaign_posts = await fetch(
    `http://localhost:8000/campaigns/${id}/posts`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  ).then((res) => res.json());

  return (
    <div>
      <Navbar />
      <h1>Campaign Details</h1>
      <div>
        <button>
          <Link href={`/campaign/${id}/posts/new`}>Create Content</Link>
        </button>
        <button>
          <Link href={`/campaign/${id}/update`}>Update Campaign</Link>
        </button>
      </div>
      <p>
        <strong>Name:</strong> {campaign.name}
      </p>
      <p>
        <strong>Description:</strong> {campaign.description}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {new Date(campaign.start_date + "T00:00:00").toLocaleDateString()}
      </p>
      <p>
        <strong>End Date:</strong>{" "}
        {new Date(campaign.end_date + "T00:00:00").toLocaleDateString()}
      </p>
      <h2>Posts</h2>
      <ul>
        {campaign_posts.map((post: Post) => (
          <li key={post.id}>
            <Link href={`/campaign/${id}/posts/${post.id}`}>
              <strong>{post.title}</strong>
            </Link>
            <p>{post.caption}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
