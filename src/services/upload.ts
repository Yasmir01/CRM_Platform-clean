export async function uploadFile(file: File) {
  const presign = await fetch("/api/storage/presign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, ext: file.name.split(".").pop() }),
  }).then((r) => r.json());

  await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return { key: presign.key } as { key: string };
}
