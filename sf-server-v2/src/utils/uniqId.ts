import ShortUniqueId from 'short-unique-id';

const regularUid = new ShortUniqueId({ length: 13 });
const specialUid = new ShortUniqueId({
  length: 13,
  dictionary: 'alphanum_upper',
});

export const uniqId = (forCase?: boolean): string => {
  if (forCase) {
    const id = specialUid.randomUUID();
    return `${id.slice(0, 9)}-${id.slice(9)}`;
  }

  return regularUid.randomUUID();
};
