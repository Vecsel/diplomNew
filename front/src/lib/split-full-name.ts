export function splitFullName(fullName: string) {
  const [firstName = "", ...rest] = fullName.split(" ");
  return { firstName, lastName: rest.join(" ") };
}
