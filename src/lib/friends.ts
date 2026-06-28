import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { getDb } from "./firebase";
import { getPublicUser, type PublicUser } from "./usernames";
import { notify } from "./social";

export type FriendRequest = {
  id: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: Date;
};

export type Friend = {
  uid: string;
  since: Date;
  user?: PublicUser | null;
};

export async function sendFriendRequest(fromUid: string, toUid: string): Promise<string> {
  if (fromUid === toUid) throw new Error("You can't add yourself");
  // Already friends?
  const exists = await getDoc(doc(getDb(), "friends", fromUid, "list", toUid));
  if (exists.exists()) throw new Error("Already friends");
  // Existing pending request either direction?
  const db = getDb();
  const pendingA = await getDocs(query(collection(db, "friend_requests"),
    where("fromUid", "==", fromUid), where("toUid", "==", toUid), where("status", "==", "pending"), limit(1)));
  if (!pendingA.empty) return pendingA.docs[0].id;
  const pendingB = await getDocs(query(collection(db, "friend_requests"),
    where("fromUid", "==", toUid), where("toUid", "==", fromUid), where("status", "==", "pending"), limit(1)));
  if (!pendingB.empty) {
    // Auto-accept the reciprocal request.
    await acceptFriendRequest(toUid, pendingB.docs[0].id, fromUid);
    return pendingB.docs[0].id;
  }
  const ref = await addDoc(collection(db, "friend_requests"), {
    fromUid, toUid, status: "pending", createdAt: Timestamp.now(),
  });
  notify(toUid, "friend_request", { fromUid, requestId: ref.id }).catch(() => {});
  return ref.id;
}

/** Called by the recipient. fromUid is the sender. */
export async function acceptFriendRequest(recipientUid: string, requestId: string, otherUid: string): Promise<void> {
  const db = getDb();
  const reqRef = doc(db, "friend_requests", requestId);
  await updateDoc(reqRef, { status: "accepted", acceptedAt: Timestamp.now() });
  const now = Timestamp.now();
  await setDoc(doc(db, "friends", recipientUid, "list", otherUid), { since: now });
  await setDoc(doc(db, "friends", otherUid, "list", recipientUid), { since: now });
  notify(otherUid, "friend_accepted", { byUid: recipientUid }).catch(() => {});
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  await updateDoc(doc(getDb(), "friend_requests", requestId), { status: "declined" });
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  await updateDoc(doc(getDb(), "friend_requests", requestId), { status: "cancelled" });
}

export async function removeFriend(uid: string, otherUid: string): Promise<void> {
  await deleteDoc(doc(getDb(), "friends", uid, "list", otherUid));
  await deleteDoc(doc(getDb(), "friends", otherUid, "list", uid)).catch(() => {});
}

export async function listIncomingRequests(uid: string): Promise<FriendRequest[]> {
  const db = getDb();
  const q = query(collection(db, "friend_requests"),
    where("toUid", "==", uid), where("status", "==", "pending"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { fromUid: string; toUid: string; status: FriendRequest["status"]; createdAt: Timestamp };
    return { id: d.id, fromUid: data.fromUid, toUid: data.toUid, status: data.status, createdAt: data.createdAt.toDate() };
  });
}

export async function listOutgoingRequests(uid: string): Promise<FriendRequest[]> {
  const db = getDb();
  const q = query(collection(db, "friend_requests"),
    where("fromUid", "==", uid), where("status", "==", "pending"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { fromUid: string; toUid: string; status: FriendRequest["status"]; createdAt: Timestamp };
    return { id: d.id, fromUid: data.fromUid, toUid: data.toUid, status: data.status, createdAt: data.createdAt.toDate() };
  });
}

export async function listFriendUids(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(getDb(), "friends", uid, "list"));
  return snap.docs.map((d) => d.id);
}

export async function listFriends(uid: string): Promise<Friend[]> {
  const snap = await getDocs(collection(getDb(), "friends", uid, "list"));
  const friends: Friend[] = snap.docs.map((d) => {
    const data = d.data() as { since: Timestamp };
    return { uid: d.id, since: data.since?.toDate?.() ?? new Date() };
  });
  // Hydrate public profile in parallel.
  await Promise.all(friends.map(async (f) => { f.user = await getPublicUser(f.uid).catch(() => null); }));
  return friends;
}

export async function isFriend(uid: string, otherUid: string): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), "friends", uid, "list", otherUid));
  return snap.exists();
}