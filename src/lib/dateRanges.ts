export function getDateRange(option: string) {
  const now = new Date();
  let from: Date | null = null;
  let to: Date | null = new Date();

  switch (option) {
    case "7days":
      from = new Date();
      from.setDate(now.getDate() - 7);
      break;

    case "30days":
      from = new Date();
      from.setDate(now.getDate() - 30);
      break;

    case "thisMonth":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "custom":
      return { from: null, to: null };

    default:
      return { from: null, to: null };
  }

  return { from, to };
}
