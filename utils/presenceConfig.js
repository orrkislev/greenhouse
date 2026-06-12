// Pronoun-aware lateness label map.
// Key is derived from profile.pronouns ('he' | 'she' | anything else → null).
// Value key is the stored lateness code ('none' | 'sometimes' | 'often').
export const LATENESS = {
    he:   { none: 'לא מאחר',    sometimes: 'לעיתים מאחר',    often: 'מאחר הרבה' },
    she:  { none: 'לא מאחרת',   sometimes: 'לעיתים מאחרת',   often: 'מאחרת הרבה' },
    null: { none: 'לא מאחר/ת',  sometimes: 'לעיתים מאחר/ת',  often: 'מאחר/ת הרבה' },
};

export const LATENESS_OPTIONS = ['none', 'sometimes', 'often'];

// Map a profile.pronouns value to a LATENESS key.
// 'he' → 'he', 'she' → 'she', everything else (null / '' / 'they') → null (neutral).
export const pronounsKey = (pronouns) => {
    if (pronouns === 'he') return 'he';
    if (pronouns === 'she') return 'she';
    return null;
};

// Compute presence percentage from presence_days and absence_days.
// Returns null if data is missing or total is 0.
export function presencePercent(presence_days, absence_days) {
    const total = (presence_days ?? 0) + (absence_days ?? 0);
    if (total === 0) return null;
    return Math.round(((presence_days??0) / total) * 100);
}
