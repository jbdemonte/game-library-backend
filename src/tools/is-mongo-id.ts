const reMongoId = /^[0-9a-f]{24}$/;

export function isMongoId(id: string): boolean {
  return Boolean(id.match(reMongoId));
}
