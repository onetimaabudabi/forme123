import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { searchUsers, type PublicUser } from "@/lib/usernames";
import { useAuth } from "@/lib/auth";
import { UserRow } from "@/components/UserRow";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Forme" }] }),
  component: SearchScreen,
});

function SearchScreen() {
  const { profile } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await searchUsers(q.trim());
        setResults(r.filter((u) => u.uid !== profile?.uid));
      } catch { setResults([]); }
      finally { setBusy(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [q, profile?.uid]);

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Search</h1>
          <div className="size-10" />
        </div>
        <div className="mt-5 surface p-3 flex items-center gap-2">
          <SearchIcon className="size-4 text-foreground/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Search by username"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-4 space-y-2">
          {busy && <p className="text-xs text-foreground/40">Searching…</p>}
          {!busy && q.trim() && results.length === 0 && <p className="text-xs text-foreground/40">No matches.</p>}
          {results.map((u) => <UserRow key={u.uid} user={u} />)}
        </div>
      </div>
    </PhoneFrame>
  );
}