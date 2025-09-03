const publishMap = new Map<string, boolean>();
export function setPublished(unitId: string, isActive: boolean) { publishMap.set(unitId, isActive); }
export function isPublished(unitId: string) { return publishMap.get(unitId) === true; }
export function allPublished() { return new Map(publishMap); }
