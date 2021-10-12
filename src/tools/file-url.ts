export function fileUrl(systemId: string, romId: string, file: string): string {
  return `/download/${systemId}/${romId}/${file}`;
}
