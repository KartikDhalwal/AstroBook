// Zodiac Image
import Aries from '../assets/images/zodiac-image/Frame 44.png';
import Taurus from '../assets/images/zodiac-image/Frame 45.png';
import Gemini from '../assets/images/zodiac-image/Frame 46.png';
import Cancer from '../assets/images/zodiac-image/Frame 47.png';
import Leo from '../assets/images/zodiac-image/Frame 48.png';
import Virgo from '../assets/images/zodiac-image/Frame 49.png';
import Libra from '../assets/images/zodiac-image/Frame 50.png';
import Scorpio from '../assets/images/zodiac-image/Frame 51.png';
import Sagittarius from '../assets/images/zodiac-image/Frame 52.png';
import Capricorn from '../assets/images/zodiac-image/Frame 53.png';
import Aquarius from '../assets/images/zodiac-image/Frame 54.png';
import Pisces from '../assets/images/zodiac-image/Frame 55.png';

export const ZodiacImageWithName = [
    { title: 'Aries', zodiacSign: 'Aries', image: Aries },
    { title: 'Taurus', zodiacSign: 'Taurus', image: Taurus },
    { title: 'Gemini', zodiacSign: 'Gemini', image: Gemini },
    { title: 'Cancer', zodiacSign: 'Cancer', image: Cancer },
    { title: 'Leo', zodiacSign: 'Leo', image: Leo },
    { title: 'Virgo', zodiacSign: 'Virgo', image: Virgo },
    { title: 'Libra', zodiacSign: 'Libra', image: Libra },
    { title: 'Scorpio', zodiacSign: 'Scorpio', image: Scorpio },
    { title: 'Sagittarius', zodiacSign: 'Sagittarius', image: Sagittarius },
    { title: 'Capricorn', zodiacSign: 'Capricorn', image: Capricorn },
    { title: 'Aquarius', zodiacSign: 'Aquarius', image: Aquarius },
    { title: 'Pisces', zodiacSign: 'Pisces', image: Pisces },
];

// badWords.js

export const BadWords = [
    // ---- English Profanity ----
    "fuck", "fucker", "fuker", "fukk", "fuxk", "fucck", "f*ck", "f@ck", "phuck", "f_ck",
    "motherfucker", "motherfuker", "mf", "m.f", "mofo",
    "shit", "bullshit", "dipshit", "horseshit", "pieceofshit", "sh1t", "sh!t", "sht",
    "ass", "asshole", "a55hole", "a$$hole", "azzhole", "ashole", "arsehole",
    "bitch", "btch", "b!tch", "biatch", "betch", "b1tch",
    "slut", "slutt", "sluut", "sl@t", "s1ut",
    "whore", "whoar", "hoe", "h0e", "h0r", "h0ree",
    "skank", "prick", "pussy", "pusy", "pussee", "pussie", "pussee", "p@ssy",
    "cunt", "cnt", "c*nt", "c@nt", "kunt", "kuunt",
    "twat", "tw@t", "tw4t", "twatt",
    "dick", "dik", "d1ck", "d!ck", "d!k", "dic", "d1k", "dikk",
    "dickhead", "d1ckhead", "d!ckhead", "dickhed", "dikhed",
    "cock", "c0ck", "coque", "cok", "c0k", "cawk", "coq",
    "jerk", "jerkwad", "jerkoff", "jackass", "jack@ss",
    "bollocks", "bugger", "tosser", "wanker", "tosser", "git",
    "loser", "moron", "idiot", "stupid", "dumbass", "dumba55", "dumass",
    "retard", "r3tard", "r-tard", "reeetard",
    "goddamn", "godamn", "g0ddamn", "sonofabitch", "sob", "damn", "dammit", "bloody", "screwyou",

    // ---- Hindi Gaali ----
    "gandu", "g@ndu", "g4ndu", "gandu", "gaandu", "gaand",
    "madarchod", "mad@rch0d", "madrchod", "m@darchod", "mc", "m.c", "m@c",
    "behenchod", "bhenchod", "behnchod", "b3henchod", "bc", "b.c",
    "chutiya", "chu**ya", "chutya", "ch@tiya", "chootiya", "chootya", "chutia",
    "randi", "randee", "randiii", "raandi", "r@ndi", "randu",
    "lavda", "lavde", "l@vda", "l@vde", "lund", "l0nd", "loond", "l@nd",
    "bhosdike", "bhosda", "bhosdi", "bhosdika", "bh0sdike",
    "harami", "haramee", "haraami", "haramkhor", "haramkh0r",
    "kamina", "k@mina", "k4mina", "kameena",
    "kutte", "kutta", "kuttiya", "kutt@", "kuttiy@",
    "suar", "suwar", "soor", "suar ki aulaad",
    "nalayak", "bevakoof", "pagal", "ullu", "ullu ke pathe",
    "jhantu", "jh@ntu", "jh4ntu",
    "bhadwa", "bhadwe", "bh@dwa", "bhadwaa",
    "randwa", "randuaa", "randva",
    "tatti", "t@tti", "taati", "t4tti",
    "haggu", "haggoo", "hagguu", "gand", "g@nd",
    "gaandfat", "gandfat", "gaand mara", "gand mara",
    "chinal", "chnl", "chynal",
    "choot", "chut", "chutan", "chootan", "choot ke", "choot ka",
    "saala", "sale", "saale", "s@le", "s@ala",
    "nalla", "nalayak", "faltu", "fattu", "f4ttu",
    "chapri", "chhapri", "chhapdaa", "chirkut", "bakchod", "ullu",
    "padhri", "randbaaz", "randibaaz", "rakhail", "r@khail",

    // ---- Hinglish / Variants / Misspellings ----
    "m@darch0d", "m@darchod", "m@d4rch0d", "madarch0d",
    "b3hench0d", "bh3nchod", "bhench0d", "bh3nch0d",
    "choot1ya", "chut1ya", "chut!ya", "chut!yaa", "chu**iyaa",
    "raandee", "raandii", "rand1", "r@andee", "r@ndi",
    "lund@", "l0nda", "l0ndaa", "l0ndey",
    "f@ttu", "phattu", "phatttuu", "fattuu",
    "jhantuu", "jhantoo", "jhantiii", "jhanty",
    "bh0sdike", "bh0sda", "bh0sdee", "bh0sdi",
    "kuttey", "kuttiye", "kuttte", "kuttee",
    "har@mi", "hrmi", "haramee", "haraami",
    "ch0otiya", "ch00tiya", "chootyaa", "choot1y@",
    "mc bc", "m.c b.c", "mc-bc", "m.c-b.c", "mcbc",
];
