export const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Mx.', 'Dr.']

// A saved salutation that isn't in the list stays selectable, so editing doesn't drop it
export const salutationOptions = (current) => (current && !SALUTATIONS.includes(current) ? [...SALUTATIONS, current] : SALUTATIONS)
