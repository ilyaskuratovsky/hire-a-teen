import { FirestoreDataConverter } from "firebase-admin/firestore";
//import { FirestoreEvent } from "firebase-functions/firestore";

export type FirestoreAdmin = {
  phone?: string;
  textMessagingStatus?: "allowed" | "none" | null | "";
};

export type FirestoreJobRequest = {
  id?: string;
  address?: string;
  createdAt?: string;
  email?: string;
  name?: string;
  notes?: string;
  phone?: string;
  preferred_contact?: Array<"call" | "text" | "email">;
  type?: string;
};

export const FirestoreAdminConverter: FirestoreDataConverter<FirestoreAdmin> = {
  toFirestore: (data) => data,
  fromFirestore: (snapshot) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      phone: data.phone,
      textMessagingStatus: data.textMessagingStatus,
    };
  },
};

export function toFirestoreJobRequest(
  jobId: string,
  data: FirebaseFirestore.DocumentData | null | undefined,
): FirestoreJobRequest | null {
  if (data == null) {
    return null;
  }
  const jobData: FirestoreJobRequest = {
    id: jobId,
    type: typeof data.type === "string" ? data.type : "Empty",
    address: typeof data.address === "string" ? data.address : undefined,
    notes: typeof data.notes === "string" ? data.notes : undefined,
  };
  return jobData;
}
