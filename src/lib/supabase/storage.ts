import { createClient } from "@/lib/supabase/server";

const BUCKET = "company-documents";

export async function uploadDocument(
  companyId: string,
  folder: string,
  file: File
): Promise<{ path: string; error?: string }> {
  const supabase = await createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `${companyId}/${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { path: "", error: error.message };
  return { path };
}

export async function getSignedUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600); // 1 hour

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
