"use client";
import { createClient } from "@/lib/supabase/client";

interface Props {
  onError: (msg: string) => void;
}

export default function GoogleSignInButton({ onError }: Props) {
  const supabase = createClient();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) onError(error.message);
  };

  return <button onClick={handleSignIn}>Sign in with Google</button>;
}
