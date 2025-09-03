// Minimal lodash/defaults implementation
export default function defaults<TObject extends Record<string, any>>(
  object: TObject,
  ...sources: Array<Partial<TObject> | null | undefined>
): TObject {
  if (object == null) {
    // @ts-ignore
    object = {};
  }
  for (const src of sources) {
    if (!src) continue;
    for (const key of Object.keys(src)) {
      if (object[key] === undefined) {
        // @ts-ignore
        object[key] = (src as any)[key];
      }
    }
  }
  return object;
}
