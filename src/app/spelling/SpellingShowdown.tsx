"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// -------------------------------------------------------------
// WORD BANK: ~100 words. w=word, l=level(1-3), p=pattern,
// s=sentence, h=hint, d=danger letters, t=Chip's cheat trick
// -------------------------------------------------------------
type Entry = {
  w: string;
  l: number;
  p: string;
  s: string;
  h: string;
  d: string | null;
  t: string | null;
};

type WordStat = { a: number; m: number; cs: number; seen: number };

type HistoryEntry = {
  d: string;
  type: "round" | "practice" | "bailout" | "cashout";
  label: string;
  net: number;
  bank: number;
};

type Cashout = { amount: number; date: string };

type Save = {
  bank: number;
  day: string | null;
  dayStreak: number;
  rounds: number;
  playerLevel: number;
  recentAcc: number;
  stats: Record<string, WordStat>;
  cashouts: Cashout[];
  history: HistoryEntry[];
};

type Payout = {
  result: string;
  amount: number;
  misses: number;
  net: number;
  betAmt: number;
  prevBank: number;
  newBank: number;
};

const BANK: Entry[] = [
  // Level 1
  { w: "because", l: 1, p: "letter patterns", s: "Nate got detention because of the glue incident.", h: "For the reason that.", d: "ecau", t: "Big Elephants Can Always Understand Small Elephants. First letters spell BECAUSE. Nate would ride the elephant." },
  { w: "beautiful", l: 1, p: "letter patterns", s: "Nate drew a beautiful comic. He says so himself.", h: "Very lovely to look at.", d: "eau", t: "Big Ears Aren't Ugly: B-E-A-U. Then -tiful with one L." },
  { w: "favourite", l: 1, p: "our words", s: "Cheez Doodles are Nate's favourite food group.", h: "The one you like best.", d: "our", t: "favOURite has OUR in it. Cheez Doodles are OUR favourite. Don't drop the U." },
  { w: "finally", l: 1, p: "double letters", s: "Nate finally cleaned his locker. Last year's sandwich was in there.", h: "After a long time.", d: "lly", t: "FINAL + LY. The two L's meet in the middle: final-ly." },
  { w: "friend", l: 1, p: "ie / ei", s: "Francis is Nate's best friend, even during maths.", h: "Someone you like and trust.", d: "end", t: "A frIEnd sticks with you until the END. The END is right there: fri-END." },
  { w: "until", l: 1, p: "single letters", s: "Nate is grounded until further notice.", h: "Up to the time that.", d: "til", t: "Until has only one L. It's not fuLL yet. Detention isn't over unTIL it's over." },
  { w: "Wednesday", l: 1, p: "silent letters", s: "Detention on Wednesday. Again.", h: "The day after Tuesday.", d: "dnes", t: "Say it like a robot: WED. NES. DAY. The sneaky D and S hide in the middle, like Nate hiding homework." },
  { w: "February", l: 1, p: "silent letters", s: "February is too cold for outdoor pranks. Nate does them anyway.", h: "The second month of the year.", d: "ru", t: "Feb-RU-ary. The RU is freezing and hiding: Feb-BRR-uary. Say the R out loud when you write it." },
  { w: "different", l: 1, p: "double letters", s: "Gina and Nate could not be more different.", h: "Not the same.", d: "ffe", t: "Two F's, then ER: di-FFE-rent. And there's a RENT at the end: diffe-RENT." },
  { w: "thought", l: 1, p: "ought words", s: "Nate thought the test was next week. It was today.", h: "Used your brain, past tense.", d: "ought", t: "The OUGHT gang: thOUGHT, bOUGHT, brOUGHT. Learn OUGHT once and you own the whole gang." },
  { w: "caught", l: 1, p: "ought words", s: "Mrs. Godfrey caught Nate mid-doodle.", h: "Grabbed or discovered someone.", d: "augh", t: "You get cAUGHT, you get tAUGHT. Same -AUGHT ending. Mrs. Godfrey does both." },
  { w: "surprise", l: 1, p: "hidden letters", s: "The pop quiz was a surprise to everyone except Gina.", h: "Something unexpected.", d: "rpr", t: "Don't lose the first R: suR-prise. A quiz can surprise you, but it can never 'suprise' you." },
  { w: "chocolate", l: 1, p: "hidden letters", s: "Nate traded his chocolate for a comic. Bold move.", h: "The best kind of sweet.", d: "co", t: "CHOC-O-LATE. The middle O is quiet but it's there. Never trade away the middle O." },
  { w: "colour", l: 1, p: "our words", s: "Nate's favourite colour is whatever Gina hates.", h: "Red, blue, green, and friends.", d: "our", t: "colOUR has OUR in it too. It's OUR colour, with a U. Same club as favOURite." },
  { w: "remember", l: 1, p: "letter patterns", s: "Remember to feed Spitsy. Nate forgot. Twice.", h: "To keep something in your mind.", d: "mem", t: "re-MEM-ber: there's a MEMory in the middle. MEM. Even Nate can hold three letters." },
  { w: "minute", l: 1, p: "hidden letters", s: "Nate can empty a bag of Cheez Doodles in one minute.", h: "Sixty seconds.", d: "ute", t: "A tiny newt lives at the end: min-UTE. Sixty seconds, one newt." },
  { w: "island", l: 1, p: "silent letters", s: "Nate would bring Cheez Doodles to a desert island.", h: "Land surrounded by water.", d: "isl", t: "An ISland IS LAND with water around it. The S is silent, like Nate when Mrs. Godfrey asks who did it." },
  { w: "answer", l: 1, p: "silent letters", s: "Nate guessed the answer. Confidently. Wrongly.", h: "The reply to a question.", d: "sw", t: "an-SW-er: the W is silent. It's there, just not talking. Very unlike Dee Dee." },
  { w: "people", l: 1, p: "letter patterns", s: "The cafeteria fits two hundred people and one food fight.", h: "More than one person.", d: "eo", t: "PEO: People Eat Oranges. Then -PLE. The O sneaks in before the P can stop it." },
  { w: "whole", l: 1, p: "silent letters", s: "Nate ate the whole bag. Obviously.", h: "All of it, complete.", d: "wh", t: "Silent W at the front, like WHO. WHO ate the WHOle bag? We all know who." },
  { w: "enough", l: 1, p: "ought words", s: "One detention was enough. Nate got three.", h: "As much as is needed.", d: "ough", t: "e-NOUGH: the OUGH gang making an UFF sound this time." },
  { w: "guess", l: 1, p: "silent letters", s: "Take a guess who got detention.", h: "An answer without knowing.", d: "gue", t: "GU-ESS: silent U after the G, then a double S." },
  { w: "heard", l: 1, p: "ear words", s: "Nate heard the ice cream van from three streets away.", h: "Listened, past tense.", d: "ear", t: "You HEAR with your EAR: h-EAR-d. The ear stays in." },
  { w: "laugh", l: 1, p: "augh words", s: "Teddy tried not to laugh. He failed.", h: "What you do at a good joke.", d: "augh", t: "L-AUGH: AUGH makes the AFF sound. Laughing is tough, like enough." },
  { w: "listen", l: 1, p: "silent letters", s: "Listen for Mrs. Godfrey's footsteps. Then run.", h: "To pay attention with your ears.", d: "ten", t: "Silent T: lis-T-en. The T listens quietly and says nothing." },
  { w: "often", l: 1, p: "silent letters", s: "Nate visits detention often. It's basically his office.", h: "Many times.", d: "ten", t: "Silent T, same as listen: of-T-en. The T clocks in but doesn't speak." },
  { w: "question", l: 1, p: "tion words", s: "Nate's answer had nothing to do with the question.", h: "Something you ask.", d: "tion", t: "QUEST + ION: every question is a QUEST. Nate treats them as optional quests." },
  { w: "trouble", l: 1, p: "ouble words", s: "Nate can find trouble in an empty room.", h: "Problems or difficulty.", d: "ouble", t: "TR + OUBLE. Double trouble: OUBLE is in both words." },
  { w: "young", l: 1, p: "ou words", s: "Nate plans to retire young. From homework.", h: "Not old.", d: "oun", t: "Y-OUNG: the OU makes an UH sound. Just memorise the OU. It's young and rebellious." },
  { w: "promise", l: 1, p: "ise words", s: "Nate made a promise to behave. It lasted an hour.", h: "Saying you will definitely do something.", d: "ise", t: "PROM + ISE: it ends in -ISE, not -iss. A promise you can spell is a promise you can break politely." },
  // Level 2
  { w: "recommend", l: 2, p: "double letters", s: "Teddy does not recommend the cafeteria egg salad. Ever.", h: "To suggest something as good.", d: "comm", t: "RE + COMMEND. One C, two M's. Warn people about the egg salad twice as hard." },
  { w: "tomorrow", l: 2, p: "double letters", s: "The social studies test is tomorrow, and Nate has not opened the book.", h: "The day after today.", d: "morr", t: "One M, two R's: to-MOR-ROW. Tomorrow is too far away to carry two M's." },
  { w: "receive", l: 2, p: "ie / ei", s: "Nate is about to receive his third detention slip this week.", h: "To get something.", d: "cei", t: "I before E, except after C. That C flips it: re-CEI-ve. Gina never misses this one, so you can't either." },
  { w: "believe", l: 2, p: "ie / ei", s: "Nate cannot believe Gina got another A plus.", h: "To accept something as true.", d: "lie", t: "Never beLIEve a LIE. The LIE is sitting right there in the middle." },
  { w: "weird", l: 2, p: "ie / ei", s: "Spitsy is a weird dog. He is scared of cats.", h: "Strange or unusual.", d: "ei", t: "Weird is weird. It breaks the I-before-E rule, the way Spitsy breaks all dog rules." },
  { w: "achieve", l: 2, p: "ie / ei", s: "Nate plans to achieve greatness, right after this nap.", h: "To succeed at something.", d: "chie", t: "I before E: a-CHIE-ve. It has CHIE in it, like CHIEF. Chief of doodles." },
  { w: "ceiling", l: 2, p: "ie / ei", s: "A wad of Nate's gum is still stuck to the classroom ceiling.", h: "The top surface of a room.", d: "cei", t: "After C comes EI: CEI-ling. The gum stuck up there has had years to learn this." },
  { w: "vacuum", l: 2, p: "double vowels", s: "Nate's locker needs a vacuum, a shovel, and possibly a hazmat suit.", h: "A machine that sucks up dirt.", d: "uu", t: "One C, two U's. A vacUUm sucks Up, Up. Nate's locker would break it anyway." },
  { w: "calendar", l: 2, p: "unstressed vowels", s: "Nate's calendar counts down the days until the summer holidays.", h: "A chart of days and months.", d: "dar", t: "It ends in -dAR. Read it like a pirate counting down to summer: calend-ARRR." },
  { w: "category", l: 2, p: "unstressed vowels", s: "In the category of doodling during class, Nate is world class.", h: "A group of similar things.", d: "cat", t: "It starts with CAT. Spitsy is terrified of the first three letters." },
  { w: "government", l: 2, p: "silent letters", s: "Class president today, running the whole government tomorrow. Nate has plans.", h: "The group that runs a country.", d: "rnm", t: "GOVERN + MENT. The N hides between R and M, like Nate hiding from Mrs. Godfrey." },
  { w: "immediately", l: 2, p: "double letters", s: "Mrs. Godfrey sent Nate to detention immediately.", h: "Right away, without delay.", d: "mm", t: "Two M's: i-MM-ediately. Detention starts i-MM-ediately. There is no time to drop an M." },
  { w: "jealous", l: 2, p: "unstressed vowels", s: "Nate is a little jealous of Artur, who wins at everything.", h: "Wanting what someone else has.", d: "ea", t: "j-EA-lous. The EA is jealous nobody notices it. Then it ends in -OUS like famous." },
  { w: "knowledge", l: 2, p: "silent letters", s: "Francis has endless knowledge of completely random facts.", h: "Facts and information you know.", d: "know", t: "KNOW + LEDGE. You KNOW a fact, then park it on a LEDGE. Francis has about nine thousand ledges." },
  { w: "lightning", l: 2, p: "silent letters", s: "Nate dodged the falling locker pile like lightning.", h: "Electric flash in the sky.", d: "htn", t: "Lightning is too fast for an extra E. LIGHT + NING. Add an E and you get 'lightening', which is what hair does." },
  { w: "neighbour", l: 2, p: "ie / ei", s: "Nate's neighbour asked him to walk Spitsy again.", h: "Someone who lives next door.", d: "eighbour", t: "EIGH like a horse saying neigh over the fence at Spitsy. And don't drop the U: good neighbOURs always bring U something." },
  { w: "pigeon", l: 2, p: "unstressed vowels", s: "A pigeon swiped Nate's last Cheez Doodle. Unforgivable.", h: "A common grey city bird.", d: "geo", t: "pi-GE-on. A sneaky E slips in before the ON, the same way that pigeon slipped in and took the Cheez Doodle." },
  { w: "scissors", l: 2, p: "double letters", s: "Dee Dee borrowed the scissors for another dramatic art project.", h: "A tool for cutting paper.", d: "sciss", t: "SC at the start, double S in the middle: SCi-SS-ors. The SC is silent. Dee Dee is not." },
  { w: "stomach", l: 2, p: "silent letters", s: "Nate's stomach can hold an entire bag of Cheez Doodles.", h: "The organ that digests food.", d: "ach", t: "It ends in -ACH but sounds like K. Easy to remember: stomACHe is what the cafeteria gives you." },
  { w: "actually", l: 2, p: "double letters", s: "Nate actually studied. The world did not end.", h: "In real fact.", d: "lly", t: "ACTUAL + LY. Two L's collide in the middle: actual-ly. Same crash as finally." },
  { w: "address", l: 2, p: "double letters", s: "Nate wrote the wrong address on the envelope. On purpose.", h: "Where someone lives.", d: "ddress", t: "ADD your aDDress: double D, double S. Generous word." },
  { w: "although", l: 2, p: "ought words", s: "Although it rained, the prank went ahead.", h: "Even though.", d: "ough", t: "AL with one L, then THOUGH. The OUGH gang strikes again." },
  { w: "decide", l: 2, p: "c and s sounds", s: "Nate can't decide which prank comes first.", h: "To make a choice.", d: "cide", t: "de-CIDE: the C does the S sound, like in deCision. The referee has deCided." },
  { w: "disappear", l: 2, p: "double letters", s: "Nate's homework tends to disappear.", h: "To vanish from sight.", d: "sapp", t: "DIS + APPEAR: one S, two P's. The homework disappears. The P's never do." },
  { w: "disappoint", l: 2, p: "double letters", s: "A cancelled snow day will disappoint the entire school.", h: "To let someone down.", d: "sapp", t: "DIS + APPOINT: one S, two P's. Same family as disappear. They travel together." },
  { w: "doubt", l: 2, p: "silent letters", s: "There is no doubt who set up the bucket prank.", h: "Not being sure.", d: "bt", t: "Silent B: dou-B-t. The B hides, like Nate behind the bins." },
  { w: "forty", l: 2, p: "hidden letters", s: "Nate owes Francis forty cents. The interest is growing.", h: "The number 40.", d: "for", t: "FORTY loses the U that FOUR has. Four, fourteen... then forty goes rogue. No U." },
  { w: "guard", l: 2, p: "silent letters", s: "Nate stands guard over his snack drawer.", h: "To protect something.", d: "gua", t: "GU-ARD: silent U after the G, like in GUess. The U is the quiet bodyguard." },
  { w: "humour", l: 2, p: "our words", s: "Mrs. Godfrey does not share Nate's sense of humour.", h: "Being funny.", d: "our", t: "humOUR: the OUR club again, with favOURite and colOUR. Membership requires a U." },
  { w: "important", l: 2, p: "ant words", s: "Snack scheduling is important business.", h: "Mattering a lot.", d: "ant", t: "import-ANT: there's an ANT at the end carrying something important. Ants always are." },
  { w: "library", l: 2, p: "hidden letters", s: "Nate got shushed in the library for laughing at his own comic.", h: "A building full of books.", d: "rar", t: "li-BRAR-y: two R's with only an A between them. Say lib-RA-ry slowly, like the librarian is watching." },
  { w: "opposite", l: 2, p: "double letters", s: "Gina is the opposite of Nate in every possible way.", h: "Completely different.", d: "pp", t: "o-PP-osite: double P, single S. Opposites attract double P's." },
  { w: "potatoes", l: 2, p: "es plurals", s: "The canteen mashed potatoes could stop a door.", h: "More than one spud.", d: "oes", t: "One potato, two potat-OES: add ES, like heroes. The canteen potatoes are not heroes." },
  { w: "probably", l: 2, p: "hidden letters", s: "It was probably Nate. It was definitely Nate.", h: "Most likely.", d: "bab", t: "PROB-AB-LY: say all three chunks out loud. Don't squash the AB, even if Nate would." },
  { w: "science", l: 2, p: "ie / ei", s: "Nate's science project involved a volcano and regret.", h: "The study of how things work.", d: "cie", t: "SC first, then IE: sci-ence. Science breaks the I-before-E rule and writes its own." },
  { w: "special", l: 2, p: "cial words", s: "Today's lunch special: mystery meat. Again.", h: "Better or different from normal.", d: "cial", t: "spe-CIAL: the CIAL makes the SHUL sound. Special words get special endings." },
  { w: "straight", l: 2, p: "aigh words", s: "Nate can't draw a straight line without a ruler. Or with one.", h: "Not bent or curved.", d: "aigh", t: "str-AIGH-t: the AIGH gang, borrowed from eight. A straight line of silent letters." },
  { w: "suppose", l: 2, p: "double letters", s: "I suppose the fire drill wasn't Nate's fault. This time.", h: "To think something is likely.", d: "pp", t: "su-PP-ose: double P, like oPPosite. Suppose both P's showed up? They did." },
  { w: "through", l: 2, p: "ought words", s: "The paper plane sailed through the open door. Into Mrs. Godfrey.", h: "From one side to the other.", d: "ough", t: "THR + OUGH: the OUGH gang making an OO sound this time. Same gang, new disguise." },
  { w: "usually", l: 2, p: "double letters", s: "Nate is usually late. Punctually late.", h: "Most of the time.", d: "ually", t: "USUAL + LY: usual-ly. Two L's meet, just like actually and finally. It's a club." },
  { w: "vegetable", l: 2, p: "hidden letters", s: "Nate treats every vegetable as a personal insult.", h: "Plant food like carrots and peas.", d: "eta", t: "veg-E-TABLE: there's a TABLE at the end. Put the vegetables on the TABLE, then don't eat them. Classic Nate." },
  { w: "cousin", l: 2, p: "hidden letters", s: "Nate's cousin visits and eats all the snacks.", h: "Your aunt or uncle's child.", d: "ousi", t: "c-OUSI-n: the O-U-S-I squad in the middle. A cousin always brings extra vowels." },
  // Level 3
  { w: "separate", l: 3, p: "unstressed vowels", s: "Mrs. Godfrey made Nate and Teddy sit at separate desks. Again.", h: "To divide or keep apart.", d: "ara", t: "There's A RAT in sepARATe. Nate would name it Mr. Cheez." },
  { w: "definitely", l: 3, p: "unstressed vowels", s: "Nate is definitely getting detention for that.", h: "Without any doubt.", d: "finite", t: "It's de-FINITE-ly. FINITE is hiding inside. There is no letter A in it, no matter what Nate scribbles." },
  { w: "embarrassed", l: 3, p: "double letters", s: "Nate was embarrassed when Ellen showed everyone his baby photos.", h: "Feeling awkward or ashamed.", d: "rrass", t: "Double R, double S. Twice as embarrassing, like Ellen showing the baby photos. Both albums." },
  { w: "necessary", l: 3, p: "double letters", s: "Francis says studying is necessary. Nate strongly disagrees.", h: "Absolutely needed.", d: "cess", t: "One Collar, two Sleeves: one C, two S's. Even Nate's wrinkled shirt follows this rule." },
  { w: "occasionally", l: 3, p: "double letters", s: "Occasionally, Nate's locker avalanche misses him completely.", h: "Once in a while.", d: "ccas", t: "Two C's, one S. C's travel in pairs, like Nate and detention." },
  { w: "restaurant", l: 3, p: "silent letters", s: "Dad took them to a restaurant instead of cooking. Everyone cheered.", h: "A place where meals are served.", d: "au", t: "Rest-AU-rant. The sneaky AU in the middle is where Dad's wallet goes to rest." },
  { w: "rhythm", l: 3, p: "silent letters", s: "Nate's band has volume. Rhythm is still a work in progress.", h: "A repeated pattern of beats.", d: "hyth", t: "Rhythm Helps Your Two Hips Move. First letters spell it. No real vowels, just Y. Nate's band still can't find it." },
  { w: "licence", l: 3, p: "c and s sounds", s: "Ellen just got her driver's licence, and Nate refuses to ride with her.", h: "An official permit.", d: "cence", t: "The noun ends in -CE: li-CEN-CE, like advICE. You would give Ellen advice about her licence. License with an S is only the verb." },
  { w: "privilege", l: 3, p: "unstressed vowels", s: "Sitting far away from Gina is a privilege Nate has earned.", h: "A special right or advantage.", d: "lege", t: "It ends in -LEGE, like coLLEGE. No D anywhere. Detention has a D. Privilege doesn't." },
  { w: "environment", l: 3, p: "silent letters", s: "Detention is basically Nate's natural environment.", h: "The surroundings you live in.", d: "iron", t: "There's IRON in the middle: env-IRON-ment. The N before M is quiet but it's there." },
  { w: "independent", l: 3, p: "unstressed vowels", s: "Nate is an independent artist. His teachers call it doodling in class.", h: "Not needing help from others.", d: "dent", t: "It ends in -ENT, and every vowel after the first I is an E: independ-E-nt. E's all the way down." },
  { w: "mischievous", l: 3, p: "unstressed vowels", s: "Nate's mischievous grin means a prank is coming.", h: "Playfully causing trouble.", d: "chie", t: "MIS-CHIE-VOUS. Three syllables only. No extra I after the V, no matter how mischievous that grin is." },
  { w: "occurred", l: 3, p: "double letters", s: "The cafeteria food fight occurred right after the egg salad appeared.", h: "Happened.", d: "ccurr", t: "Doubles everywhere: two C's AND two R's. The food fight was big enough to double everything." },
  { w: "argument", l: 3, p: "hidden letters", s: "The argument was about the last Cheez Doodle. Obviously.", h: "A disagreement.", d: "gum", t: "There's GUM stuck in the middle of ar-GUM-ent. Argue drops its E before the fight starts." },
  { w: "awkward", l: 3, p: "letter pileups", s: "Nate waved at someone who wasn't waving at him. Awkward.", h: "Uncomfortable and clumsy.", d: "wkw", t: "Awkward is spelled awkwardly: W-K-W in a row. The word demonstrates itself." },
  { w: "business", l: 3, p: "hidden letters", s: "Selling doodles at lunch is Nate's side business.", h: "Buying, selling, or work.", d: "busi", t: "BUSY becomes BUSI-ness: the Y turns into an I when the NESS arrives. Business makes you busy." },
  { w: "character", l: 3, p: "ch as k", s: "Doctor Cesspool is Nate's greatest character.", h: "A person in a story.", d: "ch", t: "CH sounds like K: CHaracter. Same disguise as stomaCH. The CH is in character." },
  { w: "eighth", l: 3, p: "letter pileups", s: "Nate came eighth in the spelling bee. Ironic.", h: "Position number 8 in a line.", d: "ghth", t: "EIGHT + H: eigh-TH keeps all of eight, then adds an H. Four consonants queue at the end." },
  { w: "especially", l: 3, p: "cial words", s: "Nate hates tests, especially surprise ones.", h: "More than usual.", d: "ciall", t: "E + SPECIAL + LY: e-SPECIAL-ly. Special is hiding inside, wearing an E as a hat." },
  { w: "exercise", l: 3, p: "c and s sounds", s: "Coach John says exercise builds character. Nate remains unconvinced.", h: "Moving your body to stay fit.", d: "xerc", t: "e-XERC-ise: X first, then C. No S until the very end. The S skipped the workout." },
  { w: "experience", l: 3, p: "ence words", s: "Detention is quite the experience.", h: "Something that happens to you.", d: "ience", t: "exper-I-ENCE: ends in -ENCE. An experience you sit through, like science's boring cousin." },
  { w: "grammar", l: 3, p: "ar endings", s: "Gina corrects everyone's grammar. Everyone's.", h: "The rules of a language.", d: "mar", t: "grammAR ends in -AR. Bad gramm-ER is the trap. Gina would circle it in red." },
  { w: "height", l: 3, p: "ie / ei", s: "Nate's height ranking in class: not up for discussion.", h: "How tall something is.", d: "eigh", t: "HEIGHT borrows EIGH from EIGHT, then ends in T. High and eight had a baby." },
  { w: "interrupt", l: 3, p: "double letters", s: "Never interrupt Nate mid-doodle.", h: "To butt in while someone talks.", d: "rr", t: "inte-RR-upt: double R. You barge in with both R's or not at all." },
  { w: "peculiar", l: 3, p: "unstressed vowels", s: "A peculiar smell led everyone straight to Nate's locker.", h: "Odd or strange.", d: "liar", t: "A LIAR hides at the end of pecu-LIAR. Peculiar, but true." },
  { w: "possess", l: 3, p: "double letters", s: "Nate does not possess a single tidy habit.", h: "To own or have.", d: "ssess", t: "Four S's total: po-SS-e-SS. A greedy word. It possesses all the S's." },
  { w: "queue", l: 3, p: "silent letters", s: "Nate cut the lunch queue. Once.", h: "A line of people waiting.", d: "ueue", t: "Q does all the work while U-E-U-E queue up silently behind it. The most patient word in English." },
  { w: "strength", l: 3, p: "letter pileups", s: "Opening the sports cupboard takes real strength.", h: "Being strong.", d: "ngth", t: "STRONG becomes STRENGTH: an N-G-T-H pile-up at the end. Flex all four consonants." },
  { w: "tongue", l: 3, p: "silent letters", s: "Nate burnt his tongue racing to finish lunch first.", h: "The thing you taste with.", d: "gue", t: "TON + GUE: ends in -GUE like league. The UE is silent, just showing off." },
];

const PRAISE = [
  "Correct. Even Gina would be impressed. Don't tell her.",
  "Nailed it. Doodle yourself a trophy.",
  "Boom. Francis-level brain power.",
  "Right. You've earned one imaginary Cheez Doodle.",
  "Correct. Mrs. Godfrey has nothing on you.",
  "Flawless. P.S. 38 spelling legend status.",
];

const ROASTS = [
  "Nope. That earns you a Mrs. Godfrey glare.",
  "Wrong. Straight to spelling detention.",
  "Missed it. Even Spitsy could do better. Maybe.",
  "Oof. Gina just got another A plus somewhere.",
  "Incorrect. The word goes back in the pile for revenge.",
  "Nope. Locker avalanche of shame.",
];

const GENERIC_TRICK = "No cheat sheet for this one. Stare at the letters. Take a brain photo. Nate calls that studying.";

const ROUND_SIZE = 8;
const STARTING_BANK = 20;
const BROKE_BAILOUT = 5;
const STORE_KEY = "spelling-showdown-v1";

// Graduated payout: soft landings for near misses, full bust only for a blowout.
// Bands are miss-rate based so short custom lists stay fair.
function payoutFor(misses: number, total: number, bet: number) {
  const r = total > 0 ? misses / total : 1;
  let mult: number, label: string;
  if (misses === 0)      { mult = 2;    label = "clean"; }
  else if (r <= 0.125 + 1e-9) { mult = 1.5;  label = "good"; }
  else if (r <= 0.25 + 1e-9)  { mult = 1;    label = "even"; }
  else if (r <= 0.375 + 1e-9) { mult = 0.75; label = "graze"; }
  else if (r <= 0.5 + 1e-9)   { mult = 0.5;  label = "half"; }
  else if (r <= 0.625 + 1e-9) { mult = 0.25; label = "rough"; }
  else                   { mult = 0;    label = "bust"; }
  return { label, amount: Math.round(bet * mult), mult };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Never let a displayed hint contain the answer (or a near-form of it).
// Covers the built-in bank and anything from a pasted custom list.
function safeHint(hint: string, word: string) {
  if (!hint || !word) return hint;
  const stem = word.length > 5 ? word.slice(0, word.length - 2) : word;
  const re = new RegExp(`[A-Za-z]*(?:${word}|${stem})[A-Za-z]*`, "gi");
  return hint.replace(re, "_____");
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const FRESH_SAVE: Save = {
  bank: STARTING_BANK,
  day: null,          // last played date
  dayStreak: 0,
  rounds: 0,
  playerLevel: 1,
  recentAcc: 0.7,
  stats: {},          // word -> {a: attempts, m: misses, cs: correctStreak, seen: roundNumber}
  cashouts: [],
  history: [],        // ledger rows: {d, type, label, net, bank}
};

const HISTORY_CAP = 200;
function withHistory(history: HistoryEntry[] | undefined, entry: HistoryEntry) {
  return [...(history || []), entry].slice(-HISTORY_CAP);
}

// -------------------------------------------------------------
// ADAPTIVE ENGINE
// Picks each round to hit two KPIs: learning (drill weaknesses,
// spaced retrieval, pattern siblings) and enjoyment (win rate
// stays in the flow zone, fresh words, occasional easy wins).
// -------------------------------------------------------------
function weakestPatterns(stats: Record<string, WordStat>) {
  const agg: Record<string, { a: number; m: number }> = {};
  for (const entry of BANK) {
    const st = stats[entry.w];
    if (!st || st.a < 1) continue;
    if (!agg[entry.p]) agg[entry.p] = { a: 0, m: 0 };
    agg[entry.p].a += st.a;
    agg[entry.p].m += st.m;
  }
  return Object.entries(agg)
    .filter(([, v]) => v.a >= 2 && v.m / v.a > 0.3)
    .sort((x, y) => y[1].m / y[1].a - x[1].m / x[1].a)
    .map(([p, v]) => ({ pattern: p, rate: v.m / v.a }));
}

function strugglingWords(stats: Record<string, WordStat>) {
  return BANK
    .filter((e) => {
      const st = stats[e.w];
      return st && st.m > 0 && st.cs < 2;
    })
    .sort((a, b) => {
      const sa = stats[a.w], sb = stats[b.w];
      return (sb.m / sb.a) - (sa.m / sa.a) || (sa.seen || 0) - (sb.seen || 0);
    });
}

function buildRound(save: Save): Entry[] {
  const { stats, playerLevel, rounds } = save;
  const chosen: Entry[] = [];
  const used = new Set<string>();
  const take = (e: Entry | undefined) => { if (e && !used.has(e.w)) { chosen.push(e); used.add(e.w); } };
  const seenAgo = (w: string) => (stats[w] && stats[w].a > 0) ? rounds - (stats[w].seen || 0) : Infinity;

  // 1. Struggle words, max 3, with spaced-repetition timing:
  //    missed last attempt -> comes back next round;
  //    recovering (got it right once) -> rests at least 2 rounds before its confirmation test.
  strugglingWords(stats)
    .filter((e) => stats[e.w].cs === 0 || seenAgo(e.w) >= 2)
    .slice(0, 3)
    .forEach(take);

  // 2. Up to 2 NEVER-SEEN words from his weakest patterns (teach the pattern via fresh words)
  const weak = weakestPatterns(stats).slice(0, 2).map((x) => x.pattern);
  if (weak.length) {
    shuffle(BANK.filter((e) => !used.has(e.w) && weak.includes(e.p) && seenAgo(e.w) === Infinity && e.l <= playerLevel + 1))
      .slice(0, 2).forEach(take);
  }

  // 3. One confidence refresh: mastered but not seen for 6+ rounds
  const stale = BANK.filter((e) => stats[e.w] && stats[e.w].cs >= 3 && seenAgo(e.w) >= 6 && !used.has(e.w));
  if (stale.length) take(pick(stale));

  // 4. Fill with diversity guaranteed: never-seen words first, then words resting 3+ rounds.
  //    Nothing seen in the last 2 rounds can enter this bucket.
  const eligible = (e: Entry) => !used.has(e.w) && (!stats[e.w] || stats[e.w].cs < 3) && seenAgo(e.w) >= 3;
  const levelOrder = [playerLevel, Math.max(1, playerLevel - 1), Math.min(3, playerLevel + 1)];
  for (const lvl of levelOrder) {
    const fresh = shuffle(BANK.filter((e) => eligible(e) && e.l === lvl && seenAgo(e.w) === Infinity));
    const rested = shuffle(BANK.filter((e) => eligible(e) && e.l === lvl && seenAgo(e.w) !== Infinity));
    for (const e of [...fresh, ...rested]) {
      if (chosen.length >= ROUND_SIZE) break;
      take(e);
    }
    if (chosen.length >= ROUND_SIZE) break;
  }

  // 5. Relax only if the bank is nearly exhausted: first allow 1-round rest, then anything
  if (chosen.length < ROUND_SIZE) {
    for (const e of shuffle(BANK.filter((x) => !used.has(x.w) && seenAgo(x.w) >= 1))) {
      if (chosen.length >= ROUND_SIZE) break;
      take(e);
    }
  }
  if (chosen.length < ROUND_SIZE) {
    for (const e of shuffle(BANK)) {
      if (chosen.length >= ROUND_SIZE) break;
      take(e);
    }
  }
  return shuffle(chosen.slice(0, ROUND_SIZE));
}

// -- Doodle mascot: original character "Chip" --
function Chip({ mood }: { mood: "happy" | "sad" | "neutral" }) {
  const mouth =
    mood === "happy" ? "M 38 62 Q 50 74 62 62" :
    mood === "sad" ? "M 38 68 Q 50 58 62 68" :
    "M 40 65 L 60 65";
  return (
    <svg viewBox="0 0 100 110" width="86" height="95" aria-hidden="true">
      <path d="M 25 30 L 30 12 L 38 26 L 46 8 L 52 25 L 62 10 L 66 27 L 76 18 L 74 32"
        fill="none" stroke="#1D2A44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="50" cy="52" rx="28" ry="30" fill="#FDFBF4" stroke="#1D2A44" strokeWidth="3" />
      <circle cx="40" cy="46" r={mood === "happy" ? 3.5 : 3} fill="#1D2A44" />
      <circle cx="60" cy="46" r={mood === "happy" ? 3.5 : 3} fill="#1D2A44" />
      {mood === "sad" && (
        <>
          <path d="M 34 38 L 45 42" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 66 38 L 55 42" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      <path d="M 50 50 Q 54 56 49 58" fill="none" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
      <path d={mouth} fill="none" stroke="#1D2A44" strokeWidth="3" strokeLinecap="round" />
      <path d="M 36 82 Q 50 78 64 82 L 68 105 Q 50 100 32 105 Z"
        fill="#FFE24A" stroke="#1D2A44" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function MarkedWord({ word, danger }: { word: string; danger: string | null }) {
  if (!danger) return <div className="bigword">{word}</div>;
  const i = word.toLowerCase().indexOf(danger.toLowerCase());
  if (i === -1) return <div className="bigword">{word}</div>;
  return (
    <div className="bigword">
      {word.slice(0, i)}
      <span className="mark">{word.slice(i, i + danger.length)}</span>
      {word.slice(i + danger.length)}
    </div>
  );
}

function DiffGuess({ guess, answer }: { guess: string; answer: string }) {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  return (
    <div className="diffline" aria-label={`You wrote ${guess}`}>
      {g.split("").map((ch, i) => (
        <span key={i} className={ch === a[i] ? "" : "diffbad"}>{ch}</span>
      ))}
    </div>
  );
}

export default function SpellingShowdown() {
  const [save, setSave] = useState<Save | null>(null); // persistent state, null while loading
  const [storageOk, setStorageOk] = useState(true);
  const [screen, setScreen] = useState<"start" | "play" | "done">("start");
  const [bet, setBet] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [queue, setQueue] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"ask" | "right" | "wrong">("ask");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [missedWords, setMissedWords] = useState<Entry[]>([]);
  const [redo, setRedo] = useState<Entry[]>([]);
  const [flash, setFlash] = useState("");
  const [hintShown, setHintShown] = useState(false);
  const [retype, setRetype] = useState("");
  const [lastGuess, setLastGuess] = useState("");
  const [roundTotal, setRoundTotal] = useState(ROUND_SIZE);
  const [payout, setPayout] = useState<Payout | null>(null); // set when round finishes
  const [confirmCashout, setConfirmCashout] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [bailoutMsg, setBailoutMsg] = useState("");
  const [speechOk, setSpeechOk] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const retypeRef = useRef<HTMLInputElement>(null);
  const savedThisRound = useRef(false);
  const roundWordsRef = useRef<string[]>([]);

  // -- Load persistent save on mount (localStorage; per browser/device) --
  useEffect(() => {
    let loaded: Save = { ...FRESH_SAVE };
    let ok = true;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) loaded = { ...FRESH_SAVE, ...JSON.parse(raw) };
      else localStorage.setItem(STORE_KEY, JSON.stringify(loaded));
    } catch {
      ok = false;
    }
    setStorageOk(ok);
    if (loaded.bank < 1) {
      loaded.bank = BROKE_BAILOUT;
      loaded.history = withHistory(loaded.history, { d: todayStr(), type: "bailout", label: "Cheez Doodle fund bailout", net: BROKE_BAILOUT, bank: BROKE_BAILOUT });
      setBailoutMsg("You were broke, so Chip fronted you $5 from the Cheez Doodle fund. Don't tell Mrs. Godfrey.");
    }
    setSave(loaded);
  }, []);

  function persist(next: Save) {
    setSave(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); }
    catch { setStorageOk(false); }
  }

  const speak = useCallback((entry: Entry, wordOnly = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setSpeechOk(false); return; }
    window.speechSynthesis.cancel();
    const text = wordOnly ? entry.w : `${entry.w}. ... ${entry.s} ... ${entry.w}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = "en-GB";
    const voices = window.speechSynthesis.getVoices();
    const gb = voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => (v.lang || "").startsWith("en-NZ")) ||
      voices.find((v) => (v.lang || "").startsWith("en-AU"));
    if (gb) u.voice = gb;
    window.speechSynthesis.speak(u);
  }, []);

  const current = queue[idx];

  useEffect(() => {
    if (screen === "play" && phase === "ask" && current) {
      const t = setTimeout(() => speak(current), 350);
      inputRef.current?.focus();
      return () => clearTimeout(t);
    }
    if (screen === "play" && phase === "wrong") {
      const t = setTimeout(() => retypeRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [screen, phase, idx, current, speak]);

  function startRound(mode: "adaptive" | "custom", practice = false) {
    if (!save) return;
    if (!practice && (bet < 1 || bet > save.bank)) return;
    if (practice) setBet(0);
    setIsPractice(practice);
    let round: Entry[];
    if (mode === "custom") {
      const words = customText.split(/[\n,;]+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => /^[a-z''-]{2,}$/i.test(w));
      if (words.length === 0) return;
      round = shuffle(words.map((w): Entry => ({ w, l: 2, p: "your list", s: `Spell the word: ${w}.`, h: "From your own list.", d: null, t: null }))).slice(0, ROUND_SIZE);
    } else {
      round = buildRound(save);
    }
    savedThisRound.current = false;
    roundWordsRef.current = round.map((e) => e.w);
    setQueue(round);
    setRoundTotal(round.length);
    setIdx(0);
    setStreak(0); setBestStreak(0); setFirstTryCorrect(0);
    setMissedWords([]); setRedo([]);
    setInput(""); setRetype(""); setLastGuess("");
    setPayout(null);
    setPhase("ask");
    setHintShown(save.playerLevel === 1);
    setBailoutMsg("");
    setScreen("play");
  }

  function submit() {
    if (!current || phase !== "ask" || !input.trim()) return;
    const guess = input.trim().toLowerCase();
    const answer = current.w.toLowerCase();
    if (guess === answer) {
      const wasMissed = missedWords.some((m) => m.w === current.w);
      if (!wasMissed) setFirstTryCorrect((n) => n + 1);
      const ns = streak + 1;
      setStreak(ns);
      setBestStreak((b) => Math.max(b, ns));
      setFlash(pick(PRAISE));
      setPhase("right");
    } else {
      setStreak(0);
      setFlash(pick(ROASTS));
      setLastGuess(guess);
      setRetype("");
      if (!missedWords.some((m) => m.w === current.w)) setMissedWords((m) => [...m, current]);
      setRedo((r) => [...r, current]);
      setPhase("wrong");
    }
  }

  function finishRound() {
    if (savedThisRound.current || !save) return;
    savedThisRound.current = true;
    const misses = missedWords.length;
    const pay = isPractice
      ? { label: "practice", amount: 0, mult: 0 }
      : payoutFor(misses, roundTotal, bet);
    const newBank = isPractice ? save.bank : Math.max(0, save.bank - bet + pay.amount);

    // Update word stats (first-try outcomes only; revenge laps are practice)
    const stats = { ...save.stats };
    const roundNum = save.rounds + 1;
    for (const w of roundWordsRef.current) {
      const st = stats[w] || { a: 0, m: 0, cs: 0, seen: 0 };
      const missed = missedWords.some((m) => m.w === w);
      stats[w] = {
        a: st.a + 1,
        m: st.m + (missed ? 1 : 0),
        cs: missed ? 0 : st.cs + 1,
        seen: roundNum,
      };
    }

    // Difficulty tuning: blend accuracy, adjust level
    const roundAcc = roundTotal ? firstTryCorrect / roundTotal : 0.7;
    const recentAcc = 0.6 * roundAcc + 0.4 * save.recentAcc;
    let playerLevel = save.playerLevel;
    if (recentAcc > 0.85 && playerLevel < 3) playerLevel += 1;
    else if (recentAcc < 0.55 && playerLevel > 1) playerLevel -= 1;

    // Daily streak
    const today = todayStr();
    let dayStreak = save.dayStreak;
    if (save.day !== today) {
      dayStreak = save.day === yesterdayStr() ? dayStreak + 1 : 1;
    }

    let bank = newBank;
    let history = save.history || [];
    if (isPractice) {
      history = withHistory(history, { d: today, type: "practice", label: `Practice: ${firstTryCorrect}/${roundTotal} first try`, net: 0, bank });
    } else {
      history = withHistory(history, { d: today, type: "round", label: `Bet $${bet}, ${misses} ${misses === 1 ? "miss" : "misses"} (${pay.label})`, net: pay.amount - bet, bank });
    }
    if (!isPractice && bank < 1) {
      bank = BROKE_BAILOUT;
      history = withHistory(history, { d: today, type: "bailout", label: "Cheez Doodle fund bailout", net: BROKE_BAILOUT, bank });
      setBailoutMsg("Busted to zero. Chip fronted you $5 from the Cheez Doodle fund. Don't tell Mrs. Godfrey.");
    }

    setPayout({ result: pay.label, amount: pay.amount, misses, net: isPractice ? 0 : pay.amount - bet, betAmt: bet, prevBank: save.bank, newBank: bank });
    persist({ ...save, bank, stats, rounds: roundNum, recentAcc, playerLevel, day: today, dayStreak, history });
  }

  function next() {
    setInput("");
    setHintShown(save?.playerLevel === 1);
    setRetype("");
    setLastGuess("");
    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
      setPhase("ask");
    } else if (redo.length > 0) {
      setQueue(shuffle(redo));
      setRedo([]);
      setIdx(0);
      setPhase("ask");
    } else {
      window.speechSynthesis?.cancel();
      finishRound();
      setScreen("done");
    }
  }

  const retypeMatches = current ? retype.trim().toLowerCase() === current.w.toLowerCase() : false;

  function handleKey(e: { key: string }) {
    if (e.key === "Enter") {
      if (phase === "ask") submit();
      else if (phase === "right") next();
      else if (phase === "wrong" && retypeMatches) next();
    }
  }

  function cashOut() {
    if (!save) return;
    const record = { amount: save.bank, date: todayStr() };
    persist({
      ...save,
      bank: STARTING_BANK,
      cashouts: [...save.cashouts, record],
      history: withHistory(save.history, { d: record.date, type: "cashout", label: `CASHED OUT $${record.amount} - reset to $${STARTING_BANK}`, net: -record.amount + STARTING_BANK, bank: STARTING_BANK }),
    });
    setConfirmCashout(false);
    setBailoutMsg(`CASHED OUT $${record.amount}. Go collect from Dad. Bankroll reset to $${STARTING_BANK}.`);
    setBet(0);
  }

  const isRedoLap = current && queue.length < roundTotal;
  const weak = save ? weakestPatterns(save.stats).slice(0, 2) : [];
  const struggles = save ? strugglingWords(save.stats).slice(0, 3) : [];

  if (!save) {
    return <div style={{ fontFamily: "sans-serif", padding: 40, textAlign: "center" }}>Opening Chip&apos;s ledger...</div>;
  }

  return (
    <div className="wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Nunito:wght@400;700;900&display=swap');
        .wrap {
          min-height: 100vh;
          background-color: #FDFBF4;
          background-image: repeating-linear-gradient(#FDFBF4 0px, #FDFBF4 31px, #C9D8F0 32px);
          font-family: 'Nunito', system-ui, sans-serif;
          color: #1D2A44;
          display: flex; justify-content: center;
          padding: 24px 16px 48px; position: relative;
        }
        .wrap::before {
          content: ''; position: fixed; top: 0; bottom: 0; left: 44px;
          width: 2px; background: #E8A5A5; z-index: 0;
        }
        .page { width: 100%; max-width: 620px; position: relative; z-index: 1; }
        .hand { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; }
        h1.hand { font-size: 44px; line-height: 1; margin: 0 0 4px; transform: rotate(-1.5deg); }
        .sub { font-size: 15px; margin: 0 0 18px; color: #4A4A45; }
        .card {
          background: #fff; border: 3px solid #1D2A44; border-radius: 10px;
          box-shadow: 4px 4px 0 #1D2A44; padding: 22px; margin-bottom: 18px;
        }
        .bubble {
          position: relative; background: #fff; border: 3px solid #1D2A44;
          border-radius: 16px; padding: 14px 18px; font-size: 19px; margin-left: 10px; flex: 1;
        }
        .bubble::before { content: ''; position: absolute; left: -16px; top: 34px; border: 8px solid transparent; border-right-color: #1D2A44; }
        .bubble::after { content: ''; position: absolute; left: -11px; top: 36px; border: 6px solid transparent; border-right-color: #fff; }
        .row { display: flex; align-items: flex-start; gap: 4px; }
        .btn {
          font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 20px;
          background: #FFE24A; border: 3px solid #1D2A44; border-radius: 8px;
          box-shadow: 3px 3px 0 #1D2A44; padding: 8px 20px; cursor: pointer; color: #1D2A44;
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #1D2A44; }
        .btn:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 #1D2A44; }
        .btn:focus-visible { outline: 3px dashed #2B5FD9; outline-offset: 3px; }
        .btn.ghost { background: #fff; font-size: 17px; }
        .btn.blue { background: #2B5FD9; color: #fff; }
        .btn.red { background: #D63B2F; color: #fff; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn.betpick { background: #fff; }
        .btn.betpick.on { background: #2E8B57; color: #fff; }
        .spellinput {
          font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 30px; letter-spacing: 3px;
          width: 100%; box-sizing: border-box; border: none; border-bottom: 3px dashed #1D2A44;
          background: transparent; padding: 6px 4px; color: #2B5FD9;
        }
        .spellinput:focus { outline: none; border-bottom-color: #2B5FD9; }
        .statbar {
          display: flex; justify-content: space-between; font-weight: 900; font-size: 13px;
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; flex-wrap: wrap; gap: 6px;
        }
        .stamp {
          font-family: 'Patrick Hand', 'Comic Sans MS', cursive; display: inline-block;
          border: 3px solid #D63B2F; color: #D63B2F; font-size: 26px; padding: 2px 14px;
          border-radius: 6px; transform: rotate(-6deg); animation: stampIn 0.25s ease-out;
        }
        .stamp.good { border-color: #2E8B57; color: #2E8B57; transform: rotate(4deg); }
        @keyframes stampIn { from { transform: scale(2.2) rotate(-6deg); opacity: 0; } to { transform: scale(1) rotate(-6deg); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .stamp { animation: none; } .btn { transition: none; } }
        .flash { font-size: 17px; margin-top: 8px; font-weight: 700; }
        .missrow { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #C9D8F0; font-size: 16px; }
        .tag { font-size: 12px; font-weight: 900; text-transform: uppercase; background: #FFE24A; border: 2px solid #1D2A44; border-radius: 20px; padding: 1px 10px; }
        textarea.paste { width: 100%; box-sizing: border-box; min-height: 90px; font-family: 'Nunito', sans-serif; font-size: 15px; border: 3px solid #1D2A44; border-radius: 8px; padding: 10px; background: #fff; }
        .lap { font-family: 'Patrick Hand', cursive; color: #D63B2F; font-size: 18px; transform: rotate(-1deg); margin-bottom: 8px; }
        .btnrow { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
        .cheat { background: #FFFDF0; border: 3px dashed #1D2A44; border-radius: 10px; padding: 14px 16px; margin-top: 14px; transform: rotate(-0.6deg); }
        .cheatlabel { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 15px; letter-spacing: 2px; color: #D63B2F; margin: 0 0 6px; }
        .bigword { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 34px; letter-spacing: 4px; margin: 2px 0 8px; word-break: break-all; }
        .mark { background: #FFE24A; border-radius: 4px; padding: 0 2px; box-shadow: 0 0 0 2px #FFE24A; }
        .diffline { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 22px; letter-spacing: 4px; margin: 0 0 8px; word-break: break-all; }
        .diffbad { color: #D63B2F; text-decoration: line-through; }
        .tricktext { font-size: 16px; margin: 8px 0 0; line-height: 1.45; }
        .retypelabel { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 19px; margin: 14px 0 2px; }
        .retypeinput { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 26px; letter-spacing: 3px; width: 100%; box-sizing: border-box; border: none; border-bottom: 3px dashed #D63B2F; background: transparent; padding: 4px; color: #1D2A44; }
        .retypeinput:focus { outline: none; }
        .retypeinput.ok { border-bottom: 3px solid #2E8B57; color: #2E8B57; }
        .escaped { font-family: 'Patrick Hand', cursive; color: #2E8B57; font-size: 18px; margin-top: 6px; }
        .wallet {
          font-family: 'Patrick Hand', cursive; font-size: 40px; color: #2E8B57;
          border: 3px solid #1D2A44; border-radius: 10px; box-shadow: 3px 3px 0 #1D2A44;
          background: #fff; display: inline-block; padding: 4px 22px; transform: rotate(-1deg);
        }
        .walletlabel { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #4A4A45; }
        .payline { font-size: 15px; margin: 3px 0; }
        .bailout { font-family: 'Patrick Hand', cursive; font-size: 18px; color: #D63B2F; margin: 8px 0; transform: rotate(-0.5deg); }
        .coach { background: #EEF3FF; border: 3px solid #1D2A44; border-radius: 10px; padding: 14px 16px; margin-top: 14px; }
        .savewarn { font-size: 13px; color: #D63B2F; font-weight: 700; }
        .toggle { background: none; border: none; font-family: 'Nunito'; font-weight: 900; font-size: 14px; color: #2B5FD9; cursor: pointer; text-decoration: underline; padding: 0; }
      `}</style>

      <div className="page">
        <h1 className="hand">Spelling Showdown</h1>
        <p className="sub">Chip says the word. You spell it. Real(ish) money on the line.</p>

        {screen === "start" && (
          <>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div className="walletlabel">Bankroll</div>
                  <div className="wallet">${save.bank}</div>
                </div>
                <div style={{ textAlign: "right", fontWeight: 900, fontSize: 14 }}>
                  Day streak: {save.dayStreak} {save.dayStreak >= 3 ? "🔥" : ""}<br />
                  Rounds played: {save.rounds}<br />
                  {save.cashouts.length > 0 && <>Cashed out so far: ${save.cashouts.reduce((s, c) => s + c.amount, 0)}</>}
                </div>
              </div>
              {bailoutMsg && <p className="bailout">{bailoutMsg}</p>}
              {!storageOk && <p className="savewarn">Heads up: saving isn&apos;t working on this device, so the bankroll resets when you close this.</p>}

              <div className="row" style={{ marginTop: 14 }}>
                <Chip mood="neutral" />
                <div className="bubble hand">
                  Place your bet, or warm up in practice for free. The closer to perfect, the bigger the payout. Only a total blowout takes the lot.
                </div>
              </div>

              <div className="coach" style={{ marginTop: 12 }}>
                <p className="cheatlabel" style={{ color: "#2B5FD9" }}>THE PAYOUT LADDER (8-word round)</p>
                <p className="payline">Perfect: <b>double your bet</b> · 1 miss: <b>×1.5</b> · 2 misses: <b>money back</b></p>
                <p className="payline">3 misses: <b>lose a quarter</b> · 4: <b>lose half</b> · 5: <b>lose three-quarters</b> · 6+: <b>lose it all</b></p>
              </div>

              <p style={{ fontWeight: 900, margin: "14px 0 4px" }}>Your bet:</p>
              <div className="btnrow" style={{ marginTop: 4 }}>
                {[1, 2, 5].map((b) => (
                  <button key={b} className={`btn betpick ${bet === b ? "on" : ""}`} disabled={b > save.bank} onClick={() => setBet(b)}>${b}</button>
                ))}
                <button className={`btn betpick ${bet === Math.max(1, Math.floor(save.bank / 2)) && bet > 5 ? "on" : ""}`} onClick={() => setBet(Math.max(1, Math.floor(save.bank / 2)))}>Half (${Math.max(1, Math.floor(save.bank / 2))})</button>
                <button className={`btn betpick ${bet === save.bank ? "on" : ""}`} onClick={() => setBet(save.bank)}>All in (${save.bank})</button>
              </div>

              <div className="btnrow">
                <button className="btn" disabled={bet < 1} onClick={() => startRound("adaptive")}>
                  {bet < 1 ? "Pick a bet first" : `Start today's round ($${bet} at stake)`}
                </button>
                <button className="btn ghost" onClick={() => startRound("adaptive", true)}>
                  Practice (no bet)
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#4A4A45", marginTop: 10 }}>
                Round mix: up to 3 review words he&apos;s missed before, and at least 5 that are brand new or haven&apos;t appeared for several rounds. Practice rounds still teach Chip what to drill next.
              </p>
            </div>

            <div className="card">
              <button className="toggle" onClick={() => setShowCustom(!showCustom)}>
                {showCustom ? "Hide" : "Use this week's school list instead"}
              </button>
              {showCustom && (
                <>
                  <textarea
                    className="paste"
                    style={{ marginTop: 10 }}
                    placeholder="separate, definitely, mischievous&#10;one per line or comma-separated"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                  <div className="btnrow">
                    <button className="btn blue" onClick={() => startRound("custom")} disabled={!customText.trim() || bet < 1}>
                      {bet < 1 ? "Pick a bet first" : "Start: My List"}
                    </button>
                    <button className="btn ghost" onClick={() => startRound("custom", true)} disabled={!customText.trim()}>
                      Practice My List (no bet)
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="card">
              {!confirmCashout ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontWeight: 900 }}>Payday time?</span>
                  <button className="btn red" onClick={() => setConfirmCashout(true)}>Cash Out ${save.bank}</button>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 900, marginTop: 0 }}>
                    Cash out ${save.bank} real money from Dad, and the bankroll resets to ${STARTING_BANK}. Chip keeps his notes on which words beat you. Sure?
                  </p>
                  <div className="btnrow">
                    <button className="btn red" onClick={cashOut}>Yes, pay me</button>
                    <button className="btn ghost" onClick={() => setConfirmCashout(false)}>Not yet</button>
                  </div>
                </>
              )}
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span className="cheatlabel hand" style={{ margin: 0, fontSize: 18 }}>THE LEDGER</span>
                <button className="toggle" onClick={() => setShowLedger(!showLedger)}>
                  {showLedger ? "Hide" : `Show ${(save.history || []).length} entries`}
                </button>
              </div>
              {(() => {
                const hist = save.history || [];
                const won = hist.filter((h) => h.type === "round" && h.net > 0).reduce((s, h) => s + h.net, 0);
                const lost = hist.filter((h) => h.type === "round" && h.net < 0).reduce((s, h) => s - h.net, 0);
                const paid = save.cashouts.reduce((s, c) => s + c.amount, 0);
                return (
                  <p className="payline" style={{ marginTop: 8 }}>
                    Lifetime: <b style={{ color: "#2E8B57" }}>+${won} won</b> · <b style={{ color: "#D63B2F" }}>-${lost} lost</b> · <b>${paid} cashed out</b>
                  </p>
                );
              })()}
              {showLedger && (
                <div style={{ marginTop: 8, maxHeight: 260, overflowY: "auto" }}>
                  {(save.history || []).length === 0 && <p className="payline">Nothing yet. The first bet writes the first line.</p>}
                  {[...(save.history || [])].reverse().map((h, i) => (
                    <div className="missrow" key={i} style={{ fontSize: 14, gap: 8 }}>
                      <span style={{ color: "#4A4A45", whiteSpace: "nowrap" }}>{h.d ? h.d.slice(5) : ""}</span>
                      <span style={{ flex: 1, padding: "0 8px" }}>{h.label}</span>
                      <span style={{ fontWeight: 900, whiteSpace: "nowrap", color: h.net > 0 ? "#2E8B57" : h.net < 0 ? "#D63B2F" : "#4A4A45" }}>
                        {h.type === "practice" ? "-" : `${h.net >= 0 ? "+" : "-"}$${Math.abs(h.net)}`}
                      </span>
                      <span style={{ fontWeight: 900, whiteSpace: "nowrap", marginLeft: 10 }}>${h.bank}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {screen === "play" && current && (
          <div className="card">
            <div className="statbar">
              <span>Word {Math.min(idx + 1, queue.length)} / {queue.length}</span>
              <span>{isPractice ? "Practice" : `At stake: $${bet}`}</span>
              <span>Streak: {streak} {streak >= 3 ? "🔥" : ""}</span>
              <span>Misses: {missedWords.length}</span>
            </div>

            {isRedoLap && <div className="lap">REVENGE ROUND - clear these to keep 1.5x alive.</div>}

            <div className="row">
              <Chip mood={phase === "right" ? "happy" : phase === "wrong" ? "sad" : "neutral"} />
              <div className="bubble hand">
                {phase === "ask" && (speechOk ? "Here it comes... listen close." : `No sound? Fine. Definition: ${safeHint(current.h, current.w)}`)}
                {phase === "right" && flash}
                {phase === "wrong" && (<>{flash}<br />Cheat sheet&apos;s out. Read the trick, then write it yourself.</>)}
              </div>
            </div>

            {phase === "ask" && (
              <>
                <input
                  ref={inputRef}
                  className="spellinput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  aria-label="Type the spelling here"
                  placeholder="type it here..."
                />
                {hintShown && <p className="flash">Hint: {safeHint(current.h, current.w)}</p>}
                <div className="btnrow">
                  <button className="btn" onClick={submit}>Check It</button>
                  <button className="btn ghost" onClick={() => speak(current)}>Hear Again</button>
                  <button className="btn ghost" onClick={() => speak(current, true)}>Just the Word</button>
                  {!hintShown && (
                    <button className="btn ghost" onClick={() => setHintShown(true)}>Hint</button>
                  )}
                </div>
              </>
            )}

            {phase === "right" && (
              <>
                <div style={{ marginTop: 10 }}><span className="stamp good hand">CORRECT ✓</span></div>
                <div className="btnrow">
                  <button className="btn" onClick={next} onKeyDown={handleKey} autoFocus>Next Word →</button>
                </div>
              </>
            )}

            {phase === "wrong" && (
              <>
                <div style={{ marginTop: 10 }}><span className="stamp hand">SEE ME.</span></div>
                <div className="cheat">
                  <p className="cheatlabel">CHIP&apos;S CHEAT SHEET (Mrs. Godfrey hates this)</p>
                  <MarkedWord word={current.w} danger={current.d} />
                  {lastGuess && lastGuess.toLowerCase() !== current.w.toLowerCase() && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 900, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>You wrote:</p>
                      <DiffGuess guess={lastGuess} answer={current.w} />
                    </>
                  )}
                  <p className="tricktext">{current.t || GENERIC_TRICK}</p>
                  <p className="retypelabel">Now YOU write it. That&apos;s how you get out of detention:</p>
                  <input
                    ref={retypeRef}
                    className={`retypeinput ${retypeMatches ? "ok" : ""}`}
                    value={retype}
                    onChange={(e) => setRetype(e.target.value)}
                    onKeyDown={handleKey}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    aria-label="Retype the correct spelling to continue"
                    placeholder="spell it right to escape..."
                  />
                  {retypeMatches && <p className="escaped">Detention escaped. It comes back later for revenge, though.</p>}
                </div>
                <div className="btnrow">
                  <button className="btn ghost" onClick={() => speak(current, true)}>Hear It</button>
                  <button className="btn" onClick={next} disabled={!retypeMatches}>Keep Going →</button>
                </div>
              </>
            )}
          </div>
        )}

        {screen === "done" && payout && (
          <div className="card">
            <div className="row">
              <Chip mood={payout.result === "bust" || payout.result === "rough" ? "sad" : "happy"} />
              <div className="bubble hand">
                {payout.result === "practice" && `Practice round done. ${payout.misses === 0 ? "Perfect, and it cost you nothing. Imagine if money had been on that." : "No money moved, but I took notes. Those words are marked."}`}
                {payout.result === "clean" && `PERFECT ROUND. Your $${bet} just became $${payout.amount}. I want a rematch.`}
                {payout.result === "good" && `One slip, cleaned up in the Revenge Round. $${bet} pays $${payout.amount}. Solid.`}
                {payout.result === "even" && `Two misses. Money back, no more, no less. The house calls that a warning.`}
                {payout.result === "graze" && `Three misses. You lose $${bet - payout.amount} of your $${bet}. Stings a little. Meant to.`}
                {payout.result === "half" && `Four misses. Half your $${bet} is gone. The other half survived out of pity.`}
                {payout.result === "rough" && `Five misses. You keep $${payout.amount} of $${bet}. Barely walked out of there.`}
                {payout.result === "bust" && `${payout.misses} misses. Total blowout. The $${bet} is mine. The Cheez Doodle fund thanks you.`}
              </div>
            </div>

            {isPractice ? (
              <div style={{ marginTop: 14 }}>
                <span className="stamp good hand" style={{ transform: "rotate(-3deg)" }}>PRACTICE - NO MONEY MOVED</span>
              </div>
            ) : (
              <div className="coach" style={{ marginTop: 14 }}>
                <p className="cheatlabel" style={{ color: "#2B5FD9" }}>THE RECEIPT</p>
                <p className="payline">
                  Bet <b>${payout.betAmt}</b> · {payout.misses} {payout.misses === 1 ? "miss" : "misses"} · paid back <b>${payout.amount}</b> · net <b>{payout.net >= 0 ? `+$${payout.net}` : `-$${Math.abs(payout.net)}`}</b>
                </p>
                <p className="payline">
                  Bankroll: ${payout.prevBank} → <b>${payout.newBank}</b>
                </p>
              </div>
            )}
            {!isPractice && (
              <div style={{ marginTop: 14 }}>
                <div className="walletlabel">Bankroll</div>
                <div className="wallet">${save.bank}</div>
              </div>
            )}
            {bailoutMsg && <p className="bailout">{bailoutMsg}</p>}
            <p className="payline" style={{ fontWeight: 900, marginTop: 10 }}>
              First-try: {firstTryCorrect}/{roundTotal} · Best streak: {bestStreak} · Day streak: {save.dayStreak} {save.dayStreak >= 3 ? "🔥" : ""}
            </p>

            {missedWords.length > 0 && (
              <>
                <p style={{ fontWeight: 900, marginBottom: 4 }}>Words that fought back:</p>
                {missedWords.map((m) => (
                  <div className="missrow" key={m.w}>
                    <span className="hand" style={{ fontSize: 20 }}>{m.w}</span>
                    <span className="tag">{m.p}</span>
                  </div>
                ))}
              </>
            )}

            <div className="coach">
              <p className="cheatlabel" style={{ color: "#2B5FD9" }}>CHIP&apos;S CLIPBOARD</p>
              {weak.length > 0 ? (
                <p className="payline">
                  Wobbliest patterns: {weak.map((x) => `${x.pattern} (${Math.round(x.rate * 100)}% missed)`).join(", ")}. Tomorrow&apos;s round will lean on these.
                </p>
              ) : (
                <p className="payline">Not enough data yet. A few more rounds and Chip will know exactly where to attack.</p>
              )}
              {struggles.length > 0 && (
                <p className="payline">
                  Coming back for revenge soon: {struggles.map((e) => e.w).join(", ")}.
                </p>
              )}
            </div>

            <div className="btnrow">
              <button className="btn" onClick={() => { setScreen("start"); setBet(0); }}>Back to the Betting Desk</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
