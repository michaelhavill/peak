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
  type: "round" | "practice" | "bailout" | "cashout" | "bonus";
  label: string;
  net: number;
  bank: number;
};

type Records = {
  bestStreak: number;
  biggestWin: number;
  bestCashout: number;
  perfectRounds: number;
  bestDayStreak: number;
};

type ChipRecord = { w: number; l: number; d: number };

type Cashout = { amount: number; date: string };

type Save = {
  bank: number;
  day: string | null;
  dayStreak: number;
  rounds: number;
  playerLevel: number;
  recentAcc: number;
  hotStreak: number; // consecutive rounds at 80%+ first-try accuracy
  coldStreak: number; // consecutive losing betting rounds
  stats: Record<string, WordStat>;
  cashouts: Cashout[];
  history: HistoryEntry[];
  records: Records;
  chip: ChipRecord; // career record vs Chip (adaptive betting rounds only)
  doodles: string[]; // collected doodle-drop ids
  soundOn: boolean;
};

// In-progress round, persisted so a reload or closed tab never loses the bet
// or re-deals the question set.
type RoundSnapshot = {
  queue: Entry[];
  idx: number;
  bet: number;
  isPractice: boolean;
  isCustom: boolean;
  missed: Entry[];
  redo: Entry[];
  firstTryCorrect: number;
  streak: number;
  bestStreak: number;
  roundTotal: number;
  roundWords: string[];
  answered: boolean; // current word already answered (phase was right/wrong)
  bonusWord: string | null;
  bonusWon: boolean;
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

export const BANK: Entry[] = [
  // Level 1
  { w: "because", l: 1, p: "letter patterns", s: "Nate can't sit near the art cupboard because of the glue incident. Nobody talks about the glue incident.", h: "For the reason that.", d: "ecau", t: "Big Elephants Can Always Understand Small Elephants. First letters spell BECAUSE. Nate would ride the elephant." },
  { w: "beautiful", l: 1, p: "letter patterns", s: "Nate framed his most beautiful doodle and awarded it first prize. The judge was Nate.", h: "Very lovely to look at.", d: "eau", t: "Big Ears Aren't Ugly: B-E-A-U. Then -tiful with one L." },
  { w: "favourite", l: 1, p: "our words", s: "Cheez Doodles are Nate's favourite food group.", h: "The one you like best.", d: "our", t: "favOURite has OUR in it. Cheez Doodles are OUR favourite. Don't drop the U." },
  { w: "finally", l: 1, p: "double letters", s: "Nate finally cleaned his locker. The sandwich at the bottom had grown a beard.", h: "After a long time.", d: "lly", t: "FINAL + LY. The two L's meet in the middle: final-ly." },
  { w: "friend", l: 1, p: "ie / ei", s: "Francis has been Nate's best friend since the sandpit incident. Neither of them will say what happened.", h: "Someone you like and trust.", d: "end", t: "A frIEnd sticks with you until the END. The END is right there: fri-END." },
  { w: "until", l: 1, p: "single letters", s: "Nate is grounded until he is approximately forty-five.", h: "Up to the time that.", d: "til", t: "Until has only one L. It's not fuLL yet. Detention isn't over unTIL it's over." },
  { w: "Wednesday", l: 1, p: "silent letters", s: "Nate has a reserved seat in Wednesday detention. It has his name scratched into it.", h: "The day after Tuesday.", d: "dnes", t: "Say it like a robot: WED. NES. DAY. The sneaky D and S hide in the middle, like Nate hiding homework." },
  { w: "February", l: 1, p: "silent letters", s: "February is the shortest month, but Nate's detention list still needed extra pages.", h: "The second month of the year.", d: "ru", t: "Feb-RU-ary. The RU is freezing and hiding: Feb-BRR-uary. Say the R out loud when you write it." },
  { w: "different", l: 1, p: "double letters", s: "Gina and Nate are so different they can't even agree on how to spell 'different'.", h: "Not the same.", d: "ffe", t: "Two F's, then ER: di-FFE-rent. And there's a RENT at the end: diffe-RENT." },
  { w: "thought", l: 1, p: "ought words", s: "Nate thought the test was next week. It was today.", h: "Used your brain, past tense.", d: "ought", t: "The OUGHT gang: thOUGHT, bOUGHT, brOUGHT. Learn OUGHT once and you own the whole gang." },
  { w: "caught", l: 1, p: "ought words", s: "Mrs. Godfrey caught Nate drawing her as a T. rex. The likeness did not help his case.", h: "Grabbed or discovered someone.", d: "augh", t: "You get cAUGHT, you get tAUGHT. Same -AUGHT ending. Mrs. Godfrey does both." },
  { w: "surprise", l: 1, p: "hidden letters", s: "The teacher announced a surprise quiz, so Nate announced a surprise headache.", h: "Something unexpected.", d: "rpr", t: "Don't lose the first R: suR-prise. A quiz can surprise you, but it can never 'suprise' you." },
  { w: "chocolate", l: 1, p: "hidden letters", s: "Nate traded his chocolate for a comic. Bold move.", h: "The best kind of sweet.", d: "co", t: "CHOC-O-LATE. The middle O is quiet but it's there. Never trade away the middle O." },
  { w: "colour", l: 1, p: "our words", s: "Nate's favourite colour is whatever Gina hates.", h: "Red, blue, green, and friends.", d: "our", t: "colOUR has OUR in it too. It's OUR colour, with a U. Same club as favOURite." },
  { w: "remember", l: 1, p: "letter patterns", s: "Nate can remember every Cheez Doodle flavour ever made, but not his own locker code.", h: "To keep something in your mind.", d: "mem", t: "re-MEM-ber: there's a MEMory in the middle. MEM. Even Nate can hold three letters." },
  { w: "minute", l: 1, p: "hidden letters", s: "Nate's record for emptying a bag of Cheez Doodles is one minute. He is furious it isn't faster.", h: "Sixty seconds.", d: "ute", t: "A tiny newt lives at the end: min-UTE. Sixty seconds, one newt." },
  { w: "island", l: 1, p: "silent letters", s: "Stranded on a desert island, Nate would build a raft, then use it as a table for Cheez Doodles.", h: "Land surrounded by water.", d: "isl", t: "An ISland IS LAND with water around it. The S is silent, like Nate when Mrs. Godfrey asks who did it." },
  { w: "answer", l: 1, p: "silent letters", s: "Nate guessed the answer. Confidently. Wrongly.", h: "The reply to a question.", d: "sw", t: "an-SW-er: the W is silent. It's there, just not talking. Very unlike Dee Dee." },
  { w: "people", l: 1, p: "letter patterns", s: "The cafeteria fits two hundred people and one food fight.", h: "More than one person.", d: "eo", t: "PEO: People Eat Oranges. Then -PLE. The O sneaks in before the P can stop it." },
  { w: "whole", l: 1, p: "silent letters", s: "Nate ate the whole bag. Obviously.", h: "All of it, complete.", d: "wh", t: "Silent W at the front, like WHO. WHO ate the WHOle bag? We all know who." },
  { w: "enough", l: 1, p: "ought words", s: "In the history of the world, nobody has ever said 'enough Cheez Doodles'. Nate checked.", h: "As much as is needed.", d: "ough", t: "e-NOUGH: the OUGH gang making an UFF sound this time." },
  { w: "guess", l: 1, p: "silent letters", s: "Guess who set off the fire alarm with an egg salad sandwich. Correct first time.", h: "An answer without knowing.", d: "gue", t: "GU-ESS: silent U after the G, then a double S." },
  { w: "heard", l: 1, p: "ear words", s: "Nate heard the ice cream van from three streets away. He cannot hear Mrs. Godfrey from one metre.", h: "Listened, past tense.", d: "ear", t: "You HEAR with your EAR: h-EAR-d. The ear stays in." },
  { w: "laugh", l: 1, p: "augh words", s: "Teddy tried not to laugh in assembly. He lasted four seconds. A school record.", h: "What you do at a good joke.", d: "augh", t: "L-AUGH: AUGH makes the AFF sound. Laughing is tough, like enough." },
  { w: "listen", l: 1, p: "silent letters", s: "Listen for Mrs. Godfrey's footsteps. Then run.", h: "To pay attention with your ears.", d: "ten", t: "Silent T: lis-T-en. The T listens quietly and says nothing." },
  { w: "often", l: 1, p: "silent letters", s: "Nate visits detention often. It's basically his office.", h: "Many times.", d: "ten", t: "Silent T, same as listen: of-T-en. The T clocks in but doesn't speak." },
  { w: "question", l: 1, p: "tion words", s: "Nate's answer had nothing to do with the question.", h: "Something you ask.", d: "tion", t: "QUEST + ION: every question is a QUEST. Nate treats them as optional quests." },
  { w: "trouble", l: 1, p: "ouble words", s: "Nate can find trouble in an empty room.", h: "Problems or difficulty.", d: "ouble", t: "TR + OUBLE. Double trouble: OUBLE is in both words." },
  { w: "young", l: 1, p: "ou words", s: "Nate plans to retire young. From homework.", h: "Not old.", d: "oun", t: "Y-OUNG: the OU makes an UH sound. Just memorise the OU. It's young and rebellious." },
  { w: "promise", l: 1, p: "ise words", s: "Nate made a promise to behave all day. It lasted eleven minutes, a personal best.", h: "Saying you will definitely do something.", d: "ise", t: "PROM + ISE: it ends in -ISE, not -iss. A promise you can spell is a promise you can break politely." },
  // Level 2
  { w: "recommend", l: 2, p: "double letters", s: "Teddy would not recommend the egg salad to his worst enemy. And Teddy keeps a list.", h: "To suggest something as good.", d: "comm", t: "RE + COMMEND. One C, two M's. Warn people about the egg salad twice as hard." },
  { w: "tomorrow", l: 2, p: "double letters", s: "The test is tomorrow. Nate's entire plan is for tomorrow to never arrive.", h: "The day after today.", d: "morr", t: "One M, two R's: to-MOR-ROW. Tomorrow is too far away to carry two M's." },
  { w: "receive", l: 2, p: "ie / ei", s: "Nate is about to receive his third detention slip this week. He is collecting the full set.", h: "To get something.", d: "cei", t: "I before E, except after C. That C flips it: re-CEI-ve. Gina never misses this one, so you can't either." },
  { w: "believe", l: 2, p: "ie / ei", s: "Nate cannot believe Artur won the raffle too. Nobody can. Artur wins everything.", h: "To accept something as true.", d: "lie", t: "Never beLIEve a LIE. The LIE is sitting right there in the middle." },
  { w: "weird", l: 2, p: "ie / ei", s: "Spitsy is a weird dog. He is scared of cats.", h: "Strange or unusual.", d: "ei", t: "Weird is weird. It breaks the I-before-E rule, the way Spitsy breaks all dog rules." },
  { w: "achieve", l: 2, p: "ie / ei", s: "Nate plans to achieve greatness, right after this nap.", h: "To succeed at something.", d: "chie", t: "I before E: a-CHIE-ve. It has CHIE in it, like CHIEF. Chief of doodles." },
  { w: "ceiling", l: 2, p: "ie / ei", s: "Nate's gum has been on the classroom ceiling so long it should pay rent.", h: "The top surface of a room.", d: "cei", t: "After C comes EI: CEI-ling. The gum stuck up there has had years to learn this." },
  { w: "vacuum", l: 2, p: "double vowels", s: "Nate's locker needs a vacuum, a shovel, and possibly a hazmat suit.", h: "A machine that sucks up dirt.", d: "uu", t: "One C, two U's. A vacUUm sucks Up, Up. Nate's locker would break it anyway." },
  { w: "calendar", l: 2, p: "unstressed vowels", s: "Nate's calendar has one entry: summer. Every other day is labelled 'obstacle'.", h: "A chart of days and months.", d: "dar", t: "It ends in -dAR. Read it like a pirate counting down to summer: calend-ARRR." },
  { w: "category", l: 2, p: "unstressed vowels", s: "In the category of doodling during class, Nate is world class.", h: "A group of similar things.", d: "cat", t: "It starts with CAT. Spitsy is terrified of the first three letters." },
  { w: "government", l: 2, p: "silent letters", s: "Class president today, running the whole government tomorrow. Nate has plans.", h: "The group that runs a country.", d: "rnm", t: "GOVERN + MENT. The N hides between R and M, like Nate hiding from Mrs. Godfrey." },
  { w: "immediately", l: 2, p: "double letters", s: "Mrs. Godfrey saw the drawing and gave out detention immediately. Light travels slower.", h: "Right away, without delay.", d: "mm", t: "Two M's: i-MM-ediately. Detention starts i-MM-ediately. There is no time to drop an M." },
  { w: "jealous", l: 2, p: "unstressed vowels", s: "Nate is not jealous of Artur. He just keeps a folder of everything Artur wins. For science.", h: "Wanting what someone else has.", d: "ea", t: "j-EA-lous. The EA is jealous nobody notices it. Then it ends in -OUS like famous." },
  { w: "knowledge", l: 2, p: "silent letters", s: "Francis shares his knowledge of jellyfish facts every single day. Nobody has ever asked.", h: "Facts and information you know.", d: "know", t: "KNOW + LEDGE. You KNOW a fact, then park it on a LEDGE. Francis has about nine thousand ledges." },
  { w: "lightning", l: 2, p: "silent letters", s: "When the lunch bell rings, Nate moves like lightning. In lessons, more like fog.", h: "Electric flash in the sky.", d: "htn", t: "Lightning is too fast for an extra E. LIGHT + NING. Add an E and you get 'lightening', which is what hair does." },
  { w: "neighbour", l: 2, p: "ie / ei", s: "Nate's neighbour pays him to walk Spitsy. In practice, Spitsy walks Nate.", h: "Someone who lives next door.", d: "eighbour", t: "EIGH like a horse saying neigh over the fence at Spitsy. And don't drop the U: good neighbOURs always bring U something." },
  { w: "pigeon", l: 2, p: "unstressed vowels", s: "A pigeon swiped Nate's last Cheez Doodle. Unforgivable.", h: "A common grey city bird.", d: "geo", t: "pi-GE-on. A sneaky E slips in before the ON, the same way that pigeon slipped in and took the Cheez Doodle." },
  { w: "scissors", l: 2, p: "double letters", s: "Dee Dee borrowed scissors for a quiet little art project. The glitter reached three classrooms.", h: "A tool for cutting paper.", d: "sciss", t: "SC at the start, double S in the middle: SCi-SS-ors. The SC is silent. Dee Dee is not." },
  { w: "stomach", l: 2, p: "silent letters", s: "Scientists should study Nate's stomach. It fears nothing, not even the canteen curry.", h: "The organ that digests food.", d: "ach", t: "It ends in -ACH but sounds like K. Easy to remember: stomACHe is what the cafeteria gives you." },
  { w: "actually", l: 2, p: "double letters", s: "Nate actually studied. The world did not end.", h: "In real fact.", d: "lly", t: "ACTUAL + LY. Two L's collide in the middle: actual-ly. Same crash as finally." },
  { w: "address", l: 2, p: "double letters", s: "Nate wrote the wrong address on the envelope. On purpose.", h: "Where someone lives.", d: "ddress", t: "ADD your aDDress: double D, double S. Generous word." },
  { w: "although", l: 2, p: "ought words", s: "Although the plan was clearly terrible, Teddy voted yes before Nate finished the sentence.", h: "Even though.", d: "ough", t: "AL with one L, then THOUGH. The OUGH gang strikes again." },
  { w: "decide", l: 2, p: "c and s sounds", s: "Nate couldn't decide between two pranks, so he did both. His detention was also doubled.", h: "To make a choice.", d: "cide", t: "de-CIDE: the C does the S sound, like in deCision. The referee has deCided." },
  { w: "disappear", l: 2, p: "double letters", s: "Nate's homework can disappear in broad daylight, in front of witnesses.", h: "To vanish from sight.", d: "sapp", t: "DIS + APPEAR: one S, two P's. The homework disappears. The P's never do." },
  { w: "disappoint", l: 2, p: "double letters", s: "The vending machine ran out of Cheez Doodles. No machine has ever managed to disappoint so many.", h: "To let someone down.", d: "sapp", t: "DIS + APPOINT: one S, two P's. Same family as disappear. They travel together." },
  { w: "doubt", l: 2, p: "silent letters", s: "There is no doubt who set up the bucket prank.", h: "Not being sure.", d: "bt", t: "Silent B: dou-B-t. The B hides, like Nate behind the bins." },
  { w: "forty", l: 2, p: "hidden letters", s: "Nate owes Francis forty cents. The interest is growing.", h: "The number 40.", d: "for", t: "FORTY loses the U that FOUR has. Four, fourteen... then forty goes rogue. No U." },
  { w: "guard", l: 2, p: "silent letters", s: "Nate stands guard over his snack drawer like it holds the crown jewels. It holds one biscuit.", h: "To protect something.", d: "gua", t: "GU-ARD: silent U after the G, like in GUess. The U is the quiet bodyguard." },
  { w: "humour", l: 2, p: "our words", s: "Mrs. Godfrey does not share Nate's sense of humour.", h: "Being funny.", d: "our", t: "humOUR: the OUR club again, with favOURite and colOUR. Membership requires a U." },
  { w: "important", l: 2, p: "ant words", s: "Nate missed the important part of the instructions. Also the start. And the end.", h: "Mattering a lot.", d: "ant", t: "import-ANT: there's an ANT at the end carrying something important. Ants always are." },
  { w: "library", l: 2, p: "hidden letters", s: "Nate got shushed in the library for laughing at his own comic.", h: "A building full of books.", d: "rar", t: "li-BRAR-y: two R's with only an A between them. Say lib-RA-ry slowly, like the librarian is watching." },
  { w: "opposite", l: 2, p: "double letters", s: "Gina and Nate sit on opposite sides of the classroom. Mrs. Godfrey measured it herself.", h: "Completely different.", d: "pp", t: "o-PP-osite: double P, single S. Opposites attract double P's." },
  { w: "potatoes", l: 2, p: "es plurals", s: "The canteen mashed potatoes could stop a door.", h: "More than one spud.", d: "oes", t: "One potato, two potat-OES: add ES, like heroes. The canteen potatoes are not heroes." },
  { w: "probably", l: 2, p: "hidden letters", s: "It was probably Nate. It was definitely Nate.", h: "Most likely.", d: "bab", t: "PROB-AB-LY: say all three chunks out loud. Don't squash the AB, even if Nate would." },
  { w: "science", l: 2, p: "ie / ei", s: "Nate's science project involved a volcano and regret.", h: "The study of how things work.", d: "cie", t: "SC first, then IE: sci-ence. Science breaks the I-before-E rule and writes its own." },
  { w: "special", l: 2, p: "cial words", s: "The lunch special is called 'Chef's Surprise'. The surprise is the chef won't eat it.", h: "Better or different from normal.", d: "cial", t: "spe-CIAL: the CIAL makes the SHUL sound. Special words get special endings." },
  { w: "straight", l: 2, p: "aigh words", s: "Nate can't draw a straight line without a ruler. Or with one.", h: "Not bent or curved.", d: "aigh", t: "str-AIGH-t: the AIGH gang, borrowed from eight. A straight line of silent letters." },
  { w: "suppose", l: 2, p: "double letters", s: "I suppose the fire drill wasn't Nate's fault. This time.", h: "To think something is likely.", d: "pp", t: "su-PP-ose: double P, like oPPosite. Suppose both P's showed up? They did." },
  { w: "through", l: 2, p: "ought words", s: "The paper plane sailed through the open door. Into Mrs. Godfrey.", h: "From one side to the other.", d: "ough", t: "THR + OUGH: the OUGH gang making an OO sound this time. Same gang, new disguise." },
  { w: "usually", l: 2, p: "double letters", s: "Nate is usually late. Punctually late.", h: "Most of the time.", d: "ually", t: "USUAL + LY: usual-ly. Two L's meet, just like actually and finally. It's a club." },
  { w: "vegetable", l: 2, p: "hidden letters", s: "Nate treats every vegetable as a personal insult.", h: "Plant food like carrots and peas.", d: "eta", t: "veg-E-TABLE: there's a TABLE at the end. Put the vegetables on the TABLE, then don't eat them. Classic Nate." },
  { w: "cousin", l: 2, p: "hidden letters", s: "Nate's cousin found the emergency Cheez Doodles. Some things cannot be forgiven.", h: "Your aunt or uncle's child.", d: "ousi", t: "c-OUSI-n: the O-U-S-I squad in the middle. A cousin always brings extra vowels." },
  // Level 3
  { w: "separate", l: 3, p: "unstressed vowels", s: "Mrs. Godfrey moved Nate and Teddy to separate desks, then separate rooms. Separate schools are being discussed.", h: "To divide or keep apart.", d: "ara", t: "There's A RAT in sepARATe. Nate would name it Mr. Cheez." },
  { w: "definitely", l: 3, p: "unstressed vowels", s: "Someone drew on the whiteboard. It was definitely not Nate, says a note signed by Nate.", h: "Without any doubt.", d: "finite", t: "It's de-FINITE-ly. FINITE is hiding inside. There is no letter A in it, no matter what Nate scribbles." },
  { w: "embarrassed", l: 3, p: "double letters", s: "Nate was embarrassed when Ellen showed his baby bath photos to the whole class. With commentary.", h: "Feeling awkward or ashamed.", d: "rrass", t: "Double R, double S. Twice as embarrassing, like Ellen showing the baby photos. Both albums." },
  { w: "necessary", l: 3, p: "double letters", s: "Francis carries three spare pencils because it's necessary. Nate has never owned a pencil by Friday.", h: "Absolutely needed.", d: "cess", t: "One Collar, two Sleeves: one C, two S's. Even Nate's wrinkled shirt follows this rule." },
  { w: "occasionally", l: 3, p: "double letters", s: "Occasionally, Nate's locker avalanche misses him completely.", h: "Once in a while.", d: "ccas", t: "Two C's, one S. C's travel in pairs, like Nate and detention." },
  { w: "restaurant", l: 3, p: "silent letters", s: "Dad took them to a restaurant instead of cooking. The smoke alarm finally got a night off.", h: "A place where meals are served.", d: "au", t: "Rest-AU-rant. The sneaky AU in the middle is where Dad's wallet goes to rest." },
  { w: "rhythm", l: 3, p: "silent letters", s: "Nate's band has volume. Rhythm is still a work in progress.", h: "A repeated pattern of beats.", d: "hyth", t: "Rhythm Helps Your Two Hips Move. First letters spell it. No real vowels, just Y. Nate's band still can't find it." },
  { w: "licence", l: 3, p: "c and s sounds", s: "Ellen earned her driver's licence on the fourth attempt. Nate walks everywhere now.", h: "An official permit.", d: "cence", t: "The noun ends in -CE: li-CEN-CE, like advICE. You would give Ellen advice about her licence. License with an S is only the verb." },
  { w: "privilege", l: 3, p: "unstressed vowels", s: "Sitting far away from Gina is a privilege Nate has earned.", h: "A special right or advantage.", d: "lege", t: "It ends in -LEGE, like coLLEGE. No D anywhere. Detention has a D. Privilege doesn't." },
  { w: "environment", l: 3, p: "silent letters", s: "Detention is basically Nate's natural environment.", h: "The surroundings you live in.", d: "iron", t: "There's IRON in the middle: env-IRON-ment. The N before M is quiet but it's there." },
  { w: "independent", l: 3, p: "unstressed vowels", s: "Nate is an independent artist. His teachers call it doodling in class.", h: "Not needing help from others.", d: "dent", t: "It ends in -ENT, and every vowel after the first I is an E: independ-E-nt. E's all the way down." },
  { w: "mischievous", l: 3, p: "unstressed vowels", s: "When Nate gets his mischievous grin, Francis starts writing the apology letter early.", h: "Playfully causing trouble.", d: "chie", t: "MIS-CHIE-VOUS. Three syllables only. No extra I after the V, no matter how mischievous that grin is." },
  { w: "occurred", l: 3, p: "double letters", s: "The cafeteria food fight occurred right after the egg salad appeared.", h: "Happened.", d: "ccurr", t: "Doubles everywhere: two C's AND two R's. The food fight was big enough to double everything." },
  { w: "argument", l: 3, p: "hidden letters", s: "The argument was about the last Cheez Doodle. Obviously.", h: "A disagreement.", d: "gum", t: "There's GUM stuck in the middle of ar-GUM-ent. Argue drops its E before the fight starts." },
  { w: "awkward", l: 3, p: "letter pileups", s: "Nate waved back at someone who was waving at Gina, then finished the whole wave anyway. Awkward.", h: "Uncomfortable and clumsy.", d: "wkw", t: "Awkward is spelled awkwardly: W-K-W in a row. The word demonstrates itself." },
  { w: "business", l: 3, p: "hidden letters", s: "Nate's doodle business is booming. All profits are paid in Cheez Doodles.", h: "Buying, selling, or work.", d: "busi", t: "BUSY becomes BUSI-ness: the Y turns into an I when the NESS arrives. Business makes you busy." },
  { w: "character", l: 3, p: "ch as k", s: "Doctor Cesspool is Nate's greatest character.", h: "A person in a story.", d: "ch", t: "CH sounds like K: CHaracter. Same disguise as stomaCH. The CH is in character." },
  { w: "eighth", l: 3, p: "letter pileups", s: "Nate came eighth in the spelling bee. Ironic.", h: "Position number 8 in a line.", d: "ghth", t: "EIGHT + H: eigh-TH keeps all of eight, then adds an H. Four consonants queue at the end." },
  { w: "especially", l: 3, p: "cial words", s: "Nate hates tests, especially surprise ones.", h: "More than usual.", d: "ciall", t: "E + SPECIAL + LY: e-SPECIAL-ly. Special is hiding inside, wearing an E as a hat." },
  { w: "exercise", l: 3, p: "c and s sounds", s: "Coach John says exercise builds character. Nate remains unconvinced.", h: "Moving your body to stay fit.", d: "xerc", t: "e-XERC-ise: X first, then C. No S until the very end. The S skipped the workout." },
  { w: "experience", l: 3, p: "ence words", s: "Nate has so much detention experience he offers guided tours.", h: "Something that happens to you.", d: "ience", t: "exper-I-ENCE: ends in -ENCE. An experience you sit through, like science's boring cousin." },
  { w: "grammar", l: 3, p: "ar endings", s: "Gina corrects everyone's grammar. Everyone's.", h: "The rules of a language.", d: "mar", t: "grammAR ends in -AR. Bad gramm-ER is the trap. Gina would circle it in red." },
  { w: "height", l: 3, p: "ie / ei", s: "Nate's height ranking in class: not up for discussion.", h: "How tall something is.", d: "eigh", t: "HEIGHT borrows EIGH from EIGHT, then ends in T. High and eight had a baby." },
  { w: "interrupt", l: 3, p: "double letters", s: "Never interrupt Nate mid-doodle. Dee Dee did it once. Once.", h: "To butt in while someone talks.", d: "rr", t: "inte-RR-upt: double R. You barge in with both R's or not at all." },
  { w: "peculiar", l: 3, p: "unstressed vowels", s: "A peculiar smell led everyone straight to Nate's locker.", h: "Odd or strange.", d: "liar", t: "A LIAR hides at the end of pecu-LIAR. Peculiar, but true." },
  { w: "possess", l: 3, p: "double letters", s: "Nate does not possess a single tidy habit.", h: "To own or have.", d: "ssess", t: "Four S's total: po-SS-e-SS. A greedy word. It possesses all the S's." },
  { w: "queue", l: 3, p: "silent letters", s: "Nate cut the lunch queue on pizza day. Survivors still talk about it.", h: "A line of people waiting.", d: "ueue", t: "Q does all the work while U-E-U-E queue up silently behind it. The most patient word in English." },
  { w: "strength", l: 3, p: "letter pileups", s: "It took the combined strength of Nate, Teddy and Francis to open Nate's locker. The locker fought back.", h: "Being strong.", d: "ngth", t: "STRONG becomes STRENGTH: an N-G-T-H pile-up at the end. Flex all four consonants." },
  { w: "tongue", l: 3, p: "silent letters", s: "Nate burnt his tongue on canteen soup that was somehow both frozen and volcanic.", h: "The thing you taste with.", d: "gue", t: "TON + GUE: ends in -GUE like league. The UE is silent, just showing off." },
  // Level 4
  { w: "accommodate", l: 4, p: "double letters", s: "The school hall can accommodate every kid and one very loud Dee Dee.", h: "To have room for.", d: "ccomm", t: "Two C's AND two M's. It's a big word with room for everyone: a-CC-o-MM-odate." },
  { w: "conscience", l: 4, p: "hidden letters", s: "Nate's conscience showed up three pranks too late.", h: "The little voice that knows right from wrong.", d: "science", t: "CON + SCIENCE. Your conscience is the SCIENCE of knowing better." },
  { w: "conscious", l: 4, p: "unstressed vowels", s: "Nate is technically conscious in first period. Technically.", h: "Awake and aware.", d: "sci", t: "CON-SCI-OUS: the SCI hides in the middle, like science with the end bitten off." },
  { w: "exaggerate", l: 4, p: "double letters", s: "Nate would never exaggerate. He's told us a billion times.", h: "To make something sound bigger than it is.", d: "gg", t: "One X, then a double G: exa-GG-erate. Exaggerating needs extra letters. Obviously." },
  { w: "guarantee", l: 4, p: "silent letters", s: "Chip can guarantee nothing except more spelling.", h: "A promise that something will happen.", d: "gua", t: "GUA at the start, like GUARD, then -RANTEE. A guarantee always guards its silent U." },
  { w: "noticeable", l: 4, p: "hidden letters", s: "The smell from Nate's locker is noticeable from the gym.", h: "Easy to see or notice.", d: "cea", t: "NOTICE keeps its E before -ABLE: notice-able. The E stays so the C stays soft." },
  { w: "occurrence", l: 4, p: "double letters", s: "A quiet day at P.S. 38 is a rare occurrence.", h: "Something that happens.", d: "ccurr", t: "Like occurred, but ending in -ENCE: two C's, two R's, then ENCE. Everything doubles except the ending." },
  { w: "parallel", l: 4, p: "double letters", s: "Nate and Gina live in parallel universes. Thankfully.", h: "Lines that never meet.", d: "llel", t: "The twin L's in the middle ARE parallel lines: para-LL-el. The word draws itself." },
  { w: "parliament", l: 4, p: "hidden letters", s: "Class president is one step from parliament, according to Nate.", h: "Where a country's laws get made.", d: "lia", t: "par-LIA-ment: I before A in the middle. Say par-LI-A-ment like a very posh robot." },
  { w: "persuade", l: 4, p: "unstressed vowels", s: "Teddy tried to persuade the canteen to serve pizza daily. His petition got four signatures. Two were his.", h: "To talk someone into something.", d: "suade", t: "PER + SUADE: the SUA squad in the middle. Per-SUA-de someone smoothly." },
  { w: "physically", l: 4, p: "silent letters", s: "Nate is physically incapable of tidying his locker.", h: "To do with the body.", d: "hys", t: "PH makes the F sound, then the Y sneaks in early: PH-Y-SIC-ALLY. Physical + LY, both L's included." },
  { w: "pronunciation", l: 4, p: "hidden letters", s: "Francis corrects Nate's pronunciation. Nate pronounces revenge.", h: "The way a word is said.", d: "nunci", t: "Pro-NUN-ciation, not pro-NOUN-ciation. The O from pronounce gets left in detention." },
  { w: "questionnaire", l: 4, p: "double letters", s: "Nate answered the careers questionnaire with 'cartoonist' fifteen times.", h: "A list of questions to answer.", d: "nn", t: "QUESTION + NAIRE with a double N handshake in the middle: question-naire." },
  { w: "recognise", l: 4, p: "hidden letters", s: "Teddy didn't recognise Nate in a tie. Nobody did.", h: "To know someone when you see them.", d: "gn", t: "RE-COG-NISE: there's a COG turning in the middle. Drop the G and the machine breaks." },
  { w: "sincerely", l: 4, p: "hidden letters", s: "Nate signed the apology letter 'sincerely unsorry'.", h: "Meaning it truly.", d: "cere", t: "SINCERE + LY: keep the whole word, just add LY. Sin-CERE-ly yours, Nate." },
  { w: "sufficient", l: 4, p: "double letters", s: "One warning is sufficient for most kids. Nate's teachers order warnings in bulk.", h: "Enough for the job.", d: "ffici", t: "Double F, then -ICIENT: su-FF-icient. The CI makes a SH sound, like special's sneaky cousin." },
  { w: "temperature", l: 4, p: "hidden letters", s: "The cafeteria soup has one temperature: volcano.", h: "How hot or cold something is.", d: "pera", t: "TEM-PER-A-TURE: say all four chunks out loud. The middle PERA is quiet but it's there." },
  { w: "thorough", l: 4, p: "ought words", s: "Mrs. Godfrey's homework checks are extremely thorough.", h: "Complete, with nothing missed.", d: "orough", t: "THOROUGH is THROUGH with an extra O near the front: tho-ROUGH. The OUGH gang's longest member." },
  { w: "unnecessary", l: 4, p: "double letters", s: "Nate finds most rules deeply unnecessary.", h: "Not needed at all.", d: "nn", t: "UN + NECESSARY: the UN brings its own N, so it's u-NN-ecessary. One collar, two sleeves still applies." },
  { w: "manoeuvre", l: 4, p: "silent letters", s: "Dodging Mrs. Godfrey takes an expert manoeuvre.", h: "A skilful move.", d: "oeuv", t: "man-OEU-vre: the OEU is French and refuses to explain itself. Memorise the vowel pile: O, E, U." },
  { w: "millennium", l: 4, p: "double letters", s: "Cleaning Nate's locker is the project of the millennium.", h: "A thousand years.", d: "llenn", t: "Two L's AND two N's: mi-LL-e-NN-ium. A thousand years needs double everything." },
  { w: "apparently", l: 4, p: "double letters", s: "Apparently doodling counts as 'not listening'. Says Mrs. Godfrey.", h: "It seems that way.", d: "pp", t: "a-PP-arently: double P, and there's a PARENT hiding inside apparently. Don't tell Dad." },
  { w: "committee", l: 4, p: "double letters", s: "The prank planning committee meets behind the bins.", h: "A group that makes decisions.", d: "mmittee", t: "The greediest word in English: double M, double T, double E. Commi-TT-EE keeps them all." },
  { w: "desperate", l: 4, p: "unstressed vowels", s: "By Friday, Nate is desperate for the weekend.", h: "Wanting something very badly.", d: "sper", t: "des-PER-ate: PER, not PAR. A RAT lives in sepArate, but desperate stays PER-fect." },
  { w: "curiosity", l: 4, p: "hidden letters", s: "Curiosity got Nate into the teachers' lounge. Detention got him out.", h: "Wanting to know things.", d: "osi", t: "CURIOUS drops its U-S for -ITY: curi-OS-ity. The extra U from curious doesn't make the trip." },
  { w: "disastrous", l: 4, p: "hidden letters", s: "The volcano project was disastrous. Award-winningly disastrous.", h: "Terrible, like a disaster.", d: "strous", t: "DISASTER drops its E before -OUS: disastr-ous. The E saw the disaster coming and fled." },
];

const PRAISE = [
  "Correct. Even Gina would be impressed. Don't tell her.",
  "Nailed it. Doodle yourself a trophy.",
  "Boom. Francis-level brain power.",
  "Right. You've earned one imaginary Cheez Doodle.",
  "Correct. Mrs. Godfrey has nothing on you.",
  "Flawless. P.S. 38 spelling legend status.",
  "Yep. Chip's wallet just flinched.",
  "Correct. Somewhere, Artur is nervous.",
  "That's the one. Teddy owes me a dollar, he bet against you.",
  "Right again. Dee Dee is composing a musical about it.",
  "Correct. Write that on the whiteboard and sign it 'definitely not Nate'.",
];

// Streak 3+: the trash talk heats up with the streak
const PRAISE_HOT = [
  "You're ON FIRE. The sprinklers are worried.",
  "Another one?! Chip is checking the rulebook for a way out.",
  "Unstoppable. Mrs. Godfrey just filed a complaint.",
  "This is getting embarrassing. For Chip. Keep going.",
  "The streak lives! Gina has started a rumor that you're cheating.",
  "Chip is sweating actual pencil shavings.",
];

const ROASTS = [
  "Nope. That earns you a Mrs. Godfrey glare.",
  "Wrong. Straight to spelling detention.",
  "Missed it. Even Spitsy could do better. Maybe.",
  "Oof. Gina just got another A plus somewhere.",
  "Incorrect. The word goes back in the pile for revenge.",
  "Nope. Locker avalanche of shame.",
  "Wrong, and Chip is doing his little victory doodle about it.",
  "Missed. The word is telling all its friends.",
  "Nope. That spelling goes on the fridge of shame.",
  "Incorrect. Somewhere a dictionary just sighed.",
];

const GENERIC_TRICK = "No cheat sheet for this one. Stare at the letters. Take a brain photo. Nate calls that studying.";

const ROUND_SIZE = 8;
const STARTING_BANK = 20;
const BROKE_BAILOUT = 5;
const MAX_LEVEL = 4;
// Promotion: two consecutive rounds at 80%+ first-try accuracy moves him up a
// level. Blended accuracy under 55% moves him down. The level (and all word
// stats) live in the save, so they survive cashouts - only the bankroll resets.
const HOT_ROUND_ACC = 0.8;
const HOT_ROUNDS_TO_LEVEL_UP = 2;
// Comfort mode: after two losing bets in a row, half the next round is words
// he reliably gets right - but only while the bank is at $10 or less. Above
// $10 he plays on merit. The broke bailout ($5) is a floor, never a boost,
// so no assistance ever lifts him past $10.
const COLD_ROUNDS_FOR_COMFORT = 2;
const COMFORT_BANK_CAP = 10;
// Payday goal shown as a progress bar on the betting desk - a finish line to
// run at instead of a shapeless grind.
const PAYDAY_GOAL = 40;
// Custom school lists play as ONE round covering the whole list (no silent
// 8-word truncation), capped for sanity.
const CUSTOM_ROUND_CAP = 20;
// Day-streak milestone bonuses (real money - calendar-capped, so cheap for Dad)
const STREAK_BONUS: Record<number, number> = { 3: 1, 7: 3, 14: 5, 30: 10 };
// Secret bonus word: one word per adaptive betting round pays +$1 on a
// first-try correct. Reward-side variability on top of the skill bet.
const BONUS_WORD_CASH = 1;
// At max level, every 2 consecutive hot rounds pay Chip's respect bonus
// instead of a level-up, so the hot-streak counter never goes dead.
const RESPECT_BONUS = 1;
const DOODLE_DROP_CHANCE = 0.3;
const STORE_KEY = "spelling-showdown-v1";
const ROUND_KEY = "spelling-showdown-round-v1";

// -------------------------------------------------------------
// RANK LADDER: permanent progression driven by career WINS vs
// Chip (adaptive betting rounds finished net-positive). Levels
// 1-4 are word difficulty; rank is the thing he climbs forever.
// -------------------------------------------------------------
const RANKS: { wins: number; title: string }[] = [
  { wins: 0, title: "Rookie of Room 216" },
  { wins: 3, title: "Doodle Cadet" },
  { wins: 7, title: "Cheez Doodle Champ" },
  { wins: 12, title: "Prank Captain" },
  { wins: 18, title: "Locker Legend" },
  { wins: 25, title: "Detention Hall of Famer" },
  { wins: 35, title: "P.S. 38 Superstar" },
  { wins: 50, title: "Showdown Boss" },
  { wins: 75, title: "Big Time Big Shot" },
  { wins: 100, title: "Immortal Doodler" },
];

export function rankFor(wins: number) {
  let current = RANKS[0];
  let next: { title: string; winsNeeded: number } | null = null;
  for (const r of RANKS) {
    if (wins >= r.wins) current = r;
    else { next = { title: r.title, winsNeeded: r.wins - wins }; break; }
  }
  return { title: current.title, next };
}

// -------------------------------------------------------------
// DOODLE DROPS: a 12-piece collection. On a won betting round
// there's a chance Chip hands over a doodle he hasn't got yet.
// -------------------------------------------------------------
type Doodle = { id: string; icon: string; name: string; cap: string; rare: boolean };
const DOODLES: Doodle[] = [
  { id: "golden-doodle", icon: "🧀", name: "The Golden Cheez Doodle", cap: "One in a million. Do not eat.", rare: true },
  { id: "glue-incident", icon: "🧴", name: "The Glue Incident File", cap: "CLASSIFIED. Nobody talks about it.", rare: true },
  { id: "red-pen", icon: "🖊️", name: "Mrs. Godfrey's Red Pen", cap: "Runs dry twice a week. Entirely Nate's fault.", rare: false },
  { id: "detention-slip", icon: "📄", name: "Signed Detention Slip", cap: "Framed. Nate's most common trophy.", rare: false },
  { id: "lucky-pencil", icon: "✏️", name: "Nate's Lucky Pencil", cap: "Chewed on one end. Genius on the other.", rare: false },
  { id: "spitsy-cone", icon: "🐶", name: "Spitsy's Cone of Shame", cap: "He wears it with zero shame.", rare: false },
  { id: "fleece-ball", icon: "🧶", name: "Fleeceball Game Ball", cap: "MVP: not Gina. Never Gina.", rare: false },
  { id: "locker-medal", icon: "🏅", name: "Locker Avalanche Survivor Medal", cap: "Awarded for surviving Nate's locker. Twice.", rare: false },
  { id: "gina-aplus", icon: "💯", name: "One of Gina's A-Pluses", cap: "She has hundreds. She counted.", rare: false },
  { id: "joke-notebook", icon: "📓", name: "Teddy's Joke Notebook", cap: "Half the jokes are about egg salad.", rare: false },
  { id: "fact-book", icon: "📘", name: "Francis's Book of Facts", cap: "Volume 9 of 40. Jellyfish edition.", rare: false },
  { id: "hall-pass", icon: "🎫", name: "The Eternal Hall Pass", cap: "Expired in 2009. Still works.", rare: false },
];

export function pickDoodleDrop(owned: string[], roll: () => number = Math.random): string | null {
  const unowned = DOODLES.filter((d) => !owned.includes(d.id));
  if (unowned.length === 0) return null;
  // rares weigh 1, commons weigh 3
  const weighted: Doodle[] = unowned.flatMap((d) => (d.rare ? [d] : [d, d, d]));
  return weighted[Math.floor(roll() * weighted.length)].id;
}

// -------------------------------------------------------------
// HOMOPHONE SAFETY for pasted school lists: the words teachers
// love are the ones TTS can't disambiguate. Each gets a spoken
// meaning line so the bet is never a coin flip.
// -------------------------------------------------------------
const HOMOPHONE_HINTS: Record<string, string> = {
  their: "The one that means it belongs to them.",
  there: "The one that means in that place.",
  "they're": "The one that is short for they are.",
  to: "The one you go TO school with.",
  too: "The one that means also, or too much.",
  two: "The number after one.",
  your: "The one that means it belongs to you.",
  "you're": "The one that is short for you are.",
  its: "The one that means belonging to it. No apostrophe.",
  "it's": "The one that is short for it is.",
  weather: "The one with rain and sunshine.",
  whether: "The one that means if.",
  where: "The one that asks about a place.",
  wear: "The one you do with clothes.",
  hear: "The one you do with your ears.",
  here: "The one that means this place.",
  right: "The one that means correct, or the opposite of left.",
  write: "The one you do with a pencil.",
  knew: "The past of know. Starts with a silent K.",
  new: "The opposite of old.",
  know: "The one about knowing things. Silent K.",
  no: "The opposite of yes.",
  week: "Seven days.",
  weak: "The opposite of strong.",
  board: "The flat piece of wood.",
  bored: "What Nate is in social studies.",
  brake: "The one that stops a bike.",
  break: "The one that means to smash, or a rest.",
  piece: "A piece of pie. Pie starts it: P I E.",
  peace: "The calm one.",
  plain: "The ordinary one.",
  plane: "The flying one.",
  principal: "The head of the school. Your PAL, allegedly.",
  principle: "The rule you live by.",
  aloud: "The one that means out loud.",
  allowed: "The one that means permitted.",
  passed: "The one where you went past, or passed a test.",
  past: "The one about history, or beyond.",
};

// -------------------------------------------------------------
// SOUND: tiny WebAudio synth - no assets, fails silently.
// -------------------------------------------------------------
let audioCtx: AudioContext | null = null;
function playSfx(kind: "correct" | "wrong" | "bonus" | "win" | "lose" | "rankup" | "record", on: boolean) {
  if (!on || typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const ctx = audioCtx;
    const t0 = ctx.currentTime;
    const note = (freq: number, start: number, dur: number, type: OscillatorType = "triangle", gain = 0.12) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, t0 + start);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t0 + start);
      o.stop(t0 + start + dur + 0.02);
    };
    if (kind === "correct") { note(660, 0, 0.09); note(880, 0.09, 0.13); }
    else if (kind === "wrong") { note(170, 0, 0.16, "sawtooth", 0.07); }
    else if (kind === "bonus") { note(1046, 0, 0.08); note(1318, 0.08, 0.16); }
    else if (kind === "win") { [523, 659, 784, 1046].forEach((f, i) => note(f, i * 0.09, 0.13)); }
    else if (kind === "lose") { note(220, 0, 0.14, "sawtooth", 0.06); note(174, 0.14, 0.22, "sawtooth", 0.06); }
    else if (kind === "rankup") { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * 0.08, 0.15)); }
    else if (kind === "record") { note(1046, 0, 0.07); note(1568, 0.07, 0.2); }
  } catch { /* sound is a garnish, never an error */ }
}

// -------------------------------------------------------------
// ALIGNMENT DIFF: edit-distance backtrace so a dropped letter
// shows as a gap at the right spot instead of a wall of red.
// -------------------------------------------------------------
export type DiffOp = { ch: string; kind: "ok" | "wrong" | "extra" | "missing" };
export function alignDiff(guess: string, answer: string): DiffOp[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const m = g.length, n = a.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + (g[i - 1] === a[j - 1] ? 0 : 1),
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1
      );
    }
  }
  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && g[i - 1] === a[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      ops.unshift({ ch: g[i - 1], kind: "ok" }); i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.unshift({ ch: g[i - 1], kind: "wrong" }); i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.unshift({ ch: g[i - 1], kind: "extra" }); i--;
    } else {
      ops.unshift({ ch: a[j - 1], kind: "missing" }); j--;
    }
  }
  return ops;
}

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
  hotStreak: 0,
  coldStreak: 0,
  stats: {},          // word -> {a: attempts, m: misses, cs: correctStreak, seen: roundNumber}
  cashouts: [],
  history: [],        // ledger rows: {d, type, label, net, bank}
  records: { bestStreak: 0, biggestWin: 0, bestCashout: 0, perfectRounds: 0, bestDayStreak: 0 },
  chip: { w: 0, l: 0, d: 0 },
  doodles: [],
  soundOn: true,
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

export function buildRound(save: Save): Entry[] {
  const { stats, playerLevel, rounds, recentAcc } = save;
  const chosen: Entry[] = [];
  const used = new Set<string>();
  const take = (e: Entry | undefined) => { if (e && !used.has(e.w)) { chosen.push(e); used.add(e.w); } };
  const seenAgo = (w: string) => (stats[w] && stats[w].a > 0) ? rounds - (stats[w].seen || 0) : Infinity;

  // 0. Comfort mix: after two losing bets in a row with the bank at
  //    $COMFORT_BANK_CAP or less, half the round is words he reliably gets
  //    right (correct streak of 2+), to bank some wins and lift spirits.
  if ((save.coldStreak || 0) >= COLD_ROUNDS_FOR_COMFORT && save.bank <= COMFORT_BANK_CAP) {
    shuffle(BANK.filter((e) => { const st = stats[e.w]; return !!st && st.cs >= 2; }))
      .slice(0, Math.floor(ROUND_SIZE / 2))
      .forEach(take);
  }

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
  // When he's winning at 80%+, reach UP a level for fill words before reaching
  // down, so the next level gets tested while he's hot instead of coasting.
  const stretching = recentAcc >= HOT_ROUND_ACC && playerLevel < MAX_LEVEL;
  const levelOrder = stretching
    ? [playerLevel, Math.min(MAX_LEVEL, playerLevel + 1), Math.max(1, playerLevel - 1)]
    : [playerLevel, Math.max(1, playerLevel - 1), Math.min(MAX_LEVEL, playerLevel + 1)];
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

// Everything that happens when a round ends, as a pure function so it can be
// applied both live (finishRound) and when settling an orphaned round found
// at load time (the reload-mid-round bug).
type SettleInput = {
  isPractice: boolean;
  isCustom: boolean; // custom school-list rounds never move rank, records, or the Chip record
  bet: number;
  roundTotal: number;
  firstTryCorrect: number;
  roundWords: string[];
  missedWords: string[];
  bestStreakRound: number;
  bonusWon: boolean;
  doodleDrop: string | null;
};

export type SettleResult = {
  next: Save;
  payout: Payout;
  bailedOut: boolean;
  leveledUp: boolean;
  leveledDown: boolean;
  rankUp: string | null;
  newRecords: string[];
  streakBonus: number;
  streakBroken: number;
  respectBonus: number;
};

export function settleRound(save: Save, p: SettleInput): SettleResult {
  const misses = p.missedWords.length;
  const pay = p.isPractice
    ? { label: "practice", amount: 0, mult: 0 }
    : payoutFor(misses, p.roundTotal, p.bet);
  const newBank = p.isPractice ? save.bank : Math.max(0, save.bank - p.bet + pay.amount);

  // Update word stats (first-try outcomes only; revenge laps are practice)
  const stats = { ...save.stats };
  const roundNum = save.rounds + 1;
  for (const w of p.roundWords) {
    const st = stats[w] || { a: 0, m: 0, cs: 0, seen: 0 };
    const missed = p.missedWords.includes(w);
    stats[w] = {
      a: st.a + 1,
      m: st.m + (missed ? 1 : 0),
      cs: missed ? 0 : st.cs + 1,
      seen: roundNum,
    };
  }

  // Difficulty tuning: promote after HOT_ROUNDS_TO_LEVEL_UP consecutive
  // rounds at 80%+ first-try accuracy; demote only on a sustained slump.
  // Custom school-list rounds are excluded: a hard teacher list must never
  // demote him, and a trivial pasted list must never farm the ladder.
  const ranked = !p.isCustom;
  const roundAcc = p.roundTotal ? p.firstTryCorrect / p.roundTotal : 0.7;
  const recentAcc = ranked ? 0.6 * roundAcc + 0.4 * save.recentAcc : save.recentAcc;
  let hotStreak = ranked ? (roundAcc >= HOT_ROUND_ACC ? (save.hotStreak || 0) + 1 : 0) : (save.hotStreak || 0);
  let playerLevel = save.playerLevel;
  let leveledUp = false;
  let leveledDown = false;
  let respectBonus = 0;
  if (ranked) {
    if (hotStreak >= HOT_ROUNDS_TO_LEVEL_UP && playerLevel < MAX_LEVEL) {
      playerLevel += 1;
      hotStreak = 0;
      leveledUp = true;
    } else if (hotStreak >= HOT_ROUNDS_TO_LEVEL_UP && playerLevel === MAX_LEVEL) {
      // Max level: the hot streak converts to cash so the counter never dies
      hotStreak = 0;
      respectBonus = RESPECT_BONUS;
    } else if (recentAcc < 0.55 && playerLevel > 1) {
      playerLevel -= 1;
      leveledDown = true;
    }
  }

  // Losing streak drives comfort mode; only betting rounds count either way
  const net = p.isPractice ? 0 : pay.amount - p.bet;
  const lost = !p.isPractice && net < 0;
  const coldStreak = p.isPractice ? (save.coldStreak || 0) : lost ? (save.coldStreak || 0) + 1 : 0;

  // Career record vs Chip: adaptive betting rounds only. Win = net positive.
  const chip: ChipRecord = { ...(save.chip || { w: 0, l: 0, d: 0 }) };
  let rankUp: string | null = null;
  if (!p.isPractice && ranked) {
    const beforeTitle = rankFor(chip.w).title;
    if (net > 0) chip.w += 1;
    else if (net < 0) chip.l += 1;
    else chip.d += 1;
    const afterTitle = rankFor(chip.w).title;
    if (afterTitle !== beforeTitle) rankUp = afterTitle;
  }

  // Daily streak, with milestone bonuses and honest break detection
  const today = todayStr();
  let dayStreak = save.dayStreak;
  let streakBonus = 0;
  let streakBroken = 0;
  if (save.day !== today) {
    if (save.day === yesterdayStr()) {
      dayStreak = dayStreak + 1;
      if (STREAK_BONUS[dayStreak]) streakBonus = STREAK_BONUS[dayStreak];
    } else {
      if (save.day !== null && save.dayStreak >= 3) streakBroken = save.dayStreak;
      dayStreak = 1;
    }
  }

  // Personal records (adaptive rounds only, so they can't be farmed).
  // First-ever values seed silently; announcements only for beaten records.
  const records: Records = { ...(save.records || FRESH_SAVE.records) };
  const newRecords: string[] = [];
  if (ranked) {
    if (p.bestStreakRound > records.bestStreak) {
      if (records.bestStreak >= 5) newRecords.push(`Best streak: ${p.bestStreakRound} (was ${records.bestStreak})`);
      records.bestStreak = Math.max(records.bestStreak, p.bestStreakRound);
    }
    if (!p.isPractice && net > 0 && net > records.biggestWin) {
      if (records.biggestWin > 0) newRecords.push(`Biggest win: +$${net} (was +$${records.biggestWin})`);
      records.biggestWin = net;
    }
    if (misses === 0 && p.roundTotal >= 6) records.perfectRounds += 1;
  }
  if (dayStreak > records.bestDayStreak) records.bestDayStreak = dayStreak;

  let bank = newBank;
  let history = save.history || [];
  if (p.isPractice) {
    history = withHistory(history, { d: today, type: "practice", label: `Practice: ${p.firstTryCorrect}/${p.roundTotal} first try`, net: 0, bank });
  } else {
    history = withHistory(history, { d: today, type: "round", label: `Bet $${p.bet}, ${misses} ${misses === 1 ? "miss" : "misses"} (${pay.label})`, net, bank });
  }
  // Earned extras land after the round entry so the ledger reads in order
  if (p.bonusWon) {
    bank += BONUS_WORD_CASH;
    history = withHistory(history, { d: today, type: "bonus", label: "Bonus word hit", net: BONUS_WORD_CASH, bank });
  }
  if (respectBonus > 0) {
    bank += respectBonus;
    history = withHistory(history, { d: today, type: "bonus", label: "Chip's respect bonus (2 hot rounds at max level)", net: respectBonus, bank });
  }
  if (streakBonus > 0) {
    bank += streakBonus;
    history = withHistory(history, { d: today, type: "bonus", label: `Day streak bonus (day ${dayStreak})`, net: streakBonus, bank });
  }
  // Never leave him on $0: the bailout floors a busted bank at $5. It is a
  // floor only - assistance never lifts the bank above $10.
  let bailedOut = false;
  if (!p.isPractice && bank < 1) {
    bank = BROKE_BAILOUT;
    bailedOut = true;
    history = withHistory(history, { d: today, type: "bailout", label: "Cheez Doodle fund bailout", net: BROKE_BAILOUT, bank });
  }

  const doodles = p.doodleDrop ? [...(save.doodles || []), p.doodleDrop] : (save.doodles || []);

  const payout: Payout = { result: pay.label, amount: pay.amount, misses, net, betAmt: p.bet, prevBank: save.bank, newBank: bank };
  const next: Save = { ...save, bank, stats, rounds: roundNum, recentAcc, playerLevel, hotStreak, coldStreak, day: today, dayStreak, history, records, chip, doodles };
  return { next, payout, bailedOut, leveledUp, leveledDown, rankUp, newRecords, streakBonus, streakBroken, respectBonus };
}

// Doodle-burst sparks for a correct answer: fixed fan-out so the animation
// is identical every time (no Math.random in render).
const SPARKS = [
  { c: "⭐", x: -70, y: -45, r: -20 },
  { c: "✨", x: 60, y: -60, r: 15 },
  { c: "💥", x: 95, y: 0, r: 30 },
  { c: "⭐", x: -100, y: 5, r: -35 },
  { c: "✨", x: -50, y: 50, r: 10 },
  { c: "🎉", x: 80, y: 45, r: 25 },
  { c: "⚡", x: 15, y: -75, r: 45 },
  { c: "⭐", x: -10, y: 65, r: -15 },
];

// One-liner shown under a correct answer in a betting round: what the round
// pays if he holds this pace to the end.
function potLine(p: { label: string; amount: number }) {
  switch (p.label) {
    case "clean": return `Pot: $${p.amount}. Perfect pace, that's DOUBLE your bet!`;
    case "good": return `Pot: $${p.amount}. One slip, still winning!`;
    case "even": return `Pot: $${p.amount}. Money back so far, keep pushing!`;
    case "graze":
    case "half":
    case "rough": return `$${p.amount} still on the table. Rescue mission!`;
    default: return "The bet's gone, but glory is still available. Finish strong.";
  }
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
  // Alignment-aware: a dropped letter shows as a yellow gap at the right
  // spot instead of turning the whole tail of the word red.
  const ops = alignDiff(guess, answer);
  return (
    <div className="diffline" aria-label={`You wrote ${guess}`}>
      {ops.map((op, i) => (
        <span
          key={i}
          className={op.kind === "ok" ? "" : op.kind === "missing" ? "diffmiss" : "diffbad"}
        >{op.ch}</span>
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
  const [levelMsg, setLevelMsg] = useState("");
  const [resumed, setResumed] = useState(false);
  const [isCustomRound, setIsCustomRound] = useState(false);
  const [customError, setCustomError] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [bonusWord, setBonusWord] = useState<string | null>(null);
  const [bonusWon, setBonusWon] = useState(false);
  const [extras, setExtras] = useState<{
    rankUp: string | null;
    newRecords: string[];
    streakBonus: number;
    streakBroken: number;
    respectBonus: number;
    leveledDown: number;
    doodleDrop: string | null;
  } | null>(null);
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

    // Restore an unfinished round. Previously a reload or closed tab mid-round
    // lost the round without scoring it and dealt a fresh question set.
    try {
      const rawRound = localStorage.getItem(ROUND_KEY);
      const sn: RoundSnapshot | null = rawRound ? JSON.parse(rawRound) : null;
      if (sn && Array.isArray(sn.queue) && sn.queue.length > 0) {
        let q: Entry[] = sn.queue;
        let i = Math.min(Math.max(sn.idx || 0, 0), q.length - 1);
        let rd: Entry[] = Array.isArray(sn.redo) ? sn.redo : [];
        let complete = false;
        if (sn.answered) {
          // The current word was already answered; advance the way next() would
          if (i + 1 < q.length) i += 1;
          else if (rd.length > 0) { q = shuffle(rd); rd = []; i = 0; }
          else complete = true;
        }
        setBet(sn.bet || 0);
        setIsPractice(!!sn.isPractice);
        setIsCustomRound(!!sn.isCustom);
        setMissedWords(sn.missed || []);
        setFirstTryCorrect(sn.firstTryCorrect || 0);
        setBestStreak(sn.bestStreak || 0);
        setRoundTotal(sn.roundTotal || q.length);
        setBonusWord(sn.bonusWord || null);
        setBonusWon(!!sn.bonusWon);
        roundWordsRef.current = sn.roundWords || [];
        if (complete) {
          // Every word was answered but the round never got scored: settle it
          // now so the bet and the word stats aren't lost.
          const res = settleRound(loaded, {
            isPractice: !!sn.isPractice,
            isCustom: !!sn.isCustom,
            bet: sn.bet || 0,
            roundTotal: sn.roundTotal || q.length,
            firstTryCorrect: sn.firstTryCorrect || 0,
            roundWords: sn.roundWords || [],
            missedWords: (sn.missed || []).map((m) => m.w),
            bestStreakRound: sn.bestStreak || 0,
            bonusWon: !!sn.bonusWon,
            doodleDrop: null,
          });
          loaded = res.next;
          if (res.leveledUp) setLevelMsg(`LEVEL UP. Two hot rounds in a row - Chip is moving you to level ${res.next.playerLevel} words.`);
          if (res.bailedOut) setBailoutMsg("Busted to zero. Chip fronted you $5 from the Cheez Doodle fund. Don't tell Mrs. Godfrey.");
          setExtras({
            rankUp: res.rankUp,
            newRecords: res.newRecords,
            streakBonus: res.streakBonus,
            streakBroken: res.streakBroken,
            respectBonus: res.respectBonus,
            leveledDown: res.leveledDown ? res.next.playerLevel : 0,
            doodleDrop: null,
          });
          setPayout(res.payout);
          savedThisRound.current = true;
          try { localStorage.setItem(STORE_KEY, JSON.stringify(loaded)); } catch {}
          localStorage.removeItem(ROUND_KEY);
          setScreen("done");
        } else {
          setQueue(q);
          setRedo(rd);
          setIdx(i);
          setStreak(sn.streak || 0);
          setPhase("ask");
          setHintShown(loaded.playerLevel === 1);
          setResumed(true);
          setScreen("play");
        }
      }
    } catch {
      try { localStorage.removeItem(ROUND_KEY); } catch {}
    }
    setSave(loaded);
  }, []);

  // Snapshot the in-progress round on every change so nothing is lost if the
  // tab closes or reloads mid-round.
  useEffect(() => {
    if (screen !== "play" || queue.length === 0) return;
    try {
      const sn: RoundSnapshot = {
        queue, idx, bet, isPractice, isCustom: isCustomRound,
        missed: missedWords, redo, firstTryCorrect, streak, bestStreak,
        roundTotal, roundWords: roundWordsRef.current,
        answered: phase !== "ask",
        bonusWord, bonusWon,
      };
      localStorage.setItem(ROUND_KEY, JSON.stringify(sn));
    } catch {}
  }, [screen, queue, idx, phase, bet, isPractice, isCustomRound, missedWords, redo, firstTryCorrect, streak, bestStreak, roundTotal, bonusWord, bonusWon]);

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
    setCustomError("");
    setCustomNote("");
    let round: Entry[];
    if (mode === "custom") {
      // Tolerant of how school lists actually arrive: numbered lines,
      // bullets, tabs, spaces, commas - strip decoration, then split wide.
      const words = [...new Set(
        customText
          .split(/\n+/)
          .map((line) => line.replace(/^\s*(?:\d+[.):]?|[-*•·])\s*/, ""))
          .join(" ")
          .split(/[\s,;]+/)
          .map((w) => w.trim().toLowerCase())
          .filter((w) => /^[a-z''-]{2,}$/i.test(w))
      )];
      if (words.length === 0) {
        setCustomError("Couldn't find any words in that. Paste them one per line, or separated by commas or spaces.");
        return;
      }
      const mkCustom = (w: string): Entry => ({
        w, l: 2, p: "your list",
        s: HOMOPHONE_HINTS[w] || `Spell the word: ${w}.`,
        h: HOMOPHONE_HINTS[w] || "From your own list.",
        d: null, t: null,
      });
      // One round covers the whole list (no silent 8-word truncation)
      round = shuffle(words.map(mkCustom)).slice(0, CUSTOM_ROUND_CAP);
      if (words.length > CUSTOM_ROUND_CAP) {
        setCustomNote(`Big list! Playing ${CUSTOM_ROUND_CAP} of your ${words.length} words this round.`);
      }
    } else {
      round = buildRound(save);
    }
    setIsCustomRound(mode === "custom");
    // Secret bonus word: adaptive betting rounds only, revealed on a first-try hit
    setBonusWord(mode === "adaptive" && !practice ? pick(round).w : null);
    setBonusWon(false);
    setExtras(null);
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
    setLevelMsg("");
    setResumed(false);
    setScreen("play");
  }

  function submit() {
    if (!current || phase !== "ask" || !input.trim()) return;
    const guess = input.trim().toLowerCase();
    const answer = current.w.toLowerCase();
    if (guess === answer) {
      const wasMissed = missedWords.some((m) => m.w === current.w);
      const hitBonus = !wasMissed && !bonusWon && bonusWord === current.w;
      if (!wasMissed) setFirstTryCorrect((n) => n + 1);
      if (hitBonus) setBonusWon(true);
      const ns = streak + 1;
      setStreak(ns);
      setBestStreak((b) => Math.max(b, ns));
      setFlash(pick(ns >= 3 ? PRAISE_HOT : PRAISE));
      setPhase("right");
      playSfx(hitBonus ? "bonus" : "correct", !!save?.soundOn);
    } else {
      setStreak(0);
      setFlash(pick(ROASTS));
      setLastGuess(guess);
      setRetype("");
      if (!missedWords.some((m) => m.w === current.w)) setMissedWords((m) => [...m, current]);
      setRedo((r) => [...r, current]);
      setPhase("wrong");
      playSfx("wrong", !!save?.soundOn);
    }
  }

  function finishRound() {
    if (savedThisRound.current || !save) return;
    savedThisRound.current = true;
    // Doodle drops are decided here (random, win-gated, adaptive bets only)
    // so settleRound stays a pure function.
    const payPreview = isPractice ? { amount: 0 } : payoutFor(missedWords.length, roundTotal, bet);
    const wonBet = !isPractice && !isCustomRound && payPreview.amount - bet > 0;
    const doodleDrop = wonBet && Math.random() < DOODLE_DROP_CHANCE ? pickDoodleDrop(save.doodles || []) : null;
    const res = settleRound(save, {
      isPractice,
      isCustom: isCustomRound,
      bet,
      roundTotal,
      firstTryCorrect,
      roundWords: roundWordsRef.current,
      missedWords: missedWords.map((m) => m.w),
      bestStreakRound: bestStreak,
      bonusWon,
      doodleDrop,
    });
    if (res.leveledUp) setLevelMsg(`LEVEL UP. Two hot rounds in a row - Chip is moving you to level ${res.next.playerLevel} words.`);
    if (res.bailedOut) setBailoutMsg("Busted to zero. Chip fronted you $5 from the Cheez Doodle fund. Don't tell Mrs. Godfrey.");
    setExtras({
      rankUp: res.rankUp,
      newRecords: res.newRecords,
      streakBonus: res.streakBonus,
      streakBroken: res.streakBroken,
      respectBonus: res.respectBonus,
      leveledDown: res.leveledDown ? res.next.playerLevel : 0,
      doodleDrop,
    });
    setPayout(res.payout);
    const snd = !!save.soundOn;
    if (res.rankUp || res.leveledUp) playSfx("rankup", snd);
    else if (res.newRecords.length > 0 || doodleDrop) playSfx("record", snd);
    else if (!isPractice) playSfx(res.payout.net >= 0 ? "win" : "lose", snd);
    try { localStorage.removeItem(ROUND_KEY); } catch {}
    persist(res.next);
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
    const records: Records = { ...(save.records || FRESH_SAVE.records) };
    let recordNote = "";
    if (record.amount > records.bestCashout) {
      if (records.bestCashout > 0) recordNote = ` ⭐ NEW RECORD payday (old best: $${records.bestCashout}).`;
      records.bestCashout = record.amount;
    }
    persist({
      ...save,
      bank: STARTING_BANK,
      records,
      cashouts: [...save.cashouts, record],
      history: withHistory(save.history, { d: record.date, type: "cashout", label: `CASHED OUT $${record.amount} - reset to $${STARTING_BANK}`, net: -record.amount + STARTING_BANK, bank: STARTING_BANK }),
    });
    setConfirmCashout(false);
    setBailoutMsg(`CASHED OUT $${record.amount}. Go collect from Dad.${recordNote} Bankroll reset to $${STARTING_BANK}.`);
    playSfx(recordNote ? "record" : "win", !!save.soundOn);
    setBet(0);
  }

  const isRedoLap = current && queue.length < roundTotal;
  // What the round pays if he finishes at the current miss count
  const potential = !isPractice && bet > 0 ? payoutFor(missedWords.length, roundTotal, bet) : null;
  const chipRec: ChipRecord = save?.chip || { w: 0, l: 0, d: 0 };
  const rank = rankFor(chipRec.w);
  const recs: Records = save?.records || FRESH_SAVE.records;
  const ownedDoodles = save?.doodles || [];
  const masteredCount = save ? BANK.filter((e) => (save.stats[e.w]?.cs ?? 0) >= 3).length : 0;
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
        .burst { position: relative; display: inline-block; }
        .spark {
          position: absolute; left: 45%; top: 25%; font-size: 20px;
          pointer-events: none; opacity: 0; animation: sparkfly 0.8s ease-out forwards;
        }
        @keyframes sparkfly {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(var(--rot)); opacity: 0; }
        }
        .winline { font-size: 21px; color: #2E8B57; margin: 12px 0 0; transform: rotate(-1deg); animation: winpop 0.3s ease-out; }
        @keyframes winpop { from { transform: scale(0.6) rotate(-1deg); opacity: 0; } to { transform: scale(1) rotate(-1deg); opacity: 1; } }
        .sentline { font-size: 15px; color: #4A4A45; margin: 10px 0 0; font-style: italic; }
        .bonusline { font-size: 20px; color: #B8860B; margin: 10px 0 0; transform: rotate(-1deg); animation: winpop 0.3s ease-out; }
        .warnline { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; color: #D63B2F; font-size: 17px; margin: 8px 0 0; }
        .rankup {
          font-size: 26px; color: #B8860B; border: 3px solid #B8860B; display: inline-block;
          padding: 3px 14px; border-radius: 8px; transform: rotate(-2deg); margin: 12px 0 0;
          background: #FFFDF0; animation: stampIn 0.25s ease-out;
        }
        .recordline { font-size: 20px; color: #2E8B57; margin: 6px 0 0; animation: winpop 0.3s ease-out; }
        .leveldown { font-size: 19px; color: #D63B2F; margin: 8px 0 0; }
        .goalwrap { height: 12px; background: #EEF3FF; border: 2px solid #1D2A44; border-radius: 8px; overflow: hidden; margin-top: 12px; }
        .goalbar { height: 100%; background: #2E8B57; transition: width 0.4s ease; }
        .goalbar.blue { background: #2B5FD9; }
        .statchip { display: inline-block; background: #fff; border: 2px solid #1D2A44; border-radius: 8px; padding: 2px 10px; margin: 4px 6px 0 0; font-size: 13px; font-weight: 700; }
        .vsline { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 22px; }
        .doodleshelf { font-size: 22px; letter-spacing: 4px; margin: 4px 0 0; }
        .doodledrop { display: flex; gap: 12px; align-items: center; background: #FFFDF0; border: 3px dashed #B8860B; border-radius: 10px; padding: 12px 14px; margin-top: 12px; animation: winpop 0.3s ease-out; }
        .doodleicon { font-size: 42px; }
        @media (prefers-reduced-motion: reduce) { .stamp { animation: none; } .btn { transition: none; } .spark { display: none; } .winline, .bonusline, .recordline, .rankup, .doodledrop { animation: none; } .goalbar { transition: none; } }
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
        .diffmiss { background: #FFE24A; border-radius: 4px; padding: 0 2px; box-shadow: 0 0 0 2px #FFE24A; color: #1D2A44; }
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <h1 className="hand">Spelling Showdown</h1>
          <button className="toggle" style={{ marginTop: 10, whiteSpace: "nowrap" }} onClick={() => persist({ ...save, soundOn: !save.soundOn })}>
            {save.soundOn ? "🔊 sound on" : "🔇 sound off"}
          </button>
        </div>
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
                  Spelling level: {save.playerLevel} / {MAX_LEVEL}
                  {save.hotStreak > 0 && save.playerLevel < MAX_LEVEL ? " 🔥 one more hot round to level up" : ""}
                  {save.hotStreak > 0 && save.playerLevel === MAX_LEVEL ? " 🔥 one more hot round = respect bonus" : ""}<br />
                  Day streak: {save.dayStreak} {save.dayStreak >= 3 ? "🔥" : ""}<br />
                  Rounds played: {save.rounds}<br />
                  {save.cashouts.length > 0 && <>Cashed out so far: ${save.cashouts.reduce((s, c) => s + c.amount, 0)}</>}
                </div>
              </div>
              <div className="goalwrap" aria-hidden="true"><div className="goalbar" style={{ width: `${Math.min(100, (save.bank / PAYDAY_GOAL) * 100)}%` }} /></div>
              <p className="payline" style={{ fontWeight: 900 }}>
                {save.bank >= PAYDAY_GOAL
                  ? `PAYDAY READY: $${save.bank} in the bank. Cash out and make Dad pay up, or keep stacking.`
                  : `Payday goal: $${PAYDAY_GOAL} - you're $${PAYDAY_GOAL - save.bank} away.`}
              </p>
              {save.day && save.day !== todayStr() && save.dayStreak >= 2 && (
                <p className="warnline">⚠️ Play a round today or your {save.dayStreak}-day streak resets.</p>
              )}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span className="cheatlabel hand" style={{ margin: 0, fontSize: 18, color: "#B8860B" }}>THE TROPHY SHELF</span>
                <span className="vsline">YOU {chipRec.w} - {chipRec.l} CHIP{chipRec.d > 0 ? ` (${chipRec.d} draws)` : ""}</span>
              </div>
              <p className="payline" style={{ fontWeight: 900, marginTop: 8 }}>
                Rank: <span className="hand" style={{ fontSize: 20 }}>{rank.title}</span>
                {rank.next && <> · {rank.next.winsNeeded} more {rank.next.winsNeeded === 1 ? "win" : "wins"} vs Chip to become <b>{rank.next.title}</b></>}
                {!rank.next && <> · top of the ladder. Nobody outdoodles you.</>}
              </p>
              <div style={{ marginTop: 6 }}>
                {recs.bestStreak > 0 && <span className="statchip">🔥 Best streak: {recs.bestStreak}</span>}
                {recs.biggestWin > 0 && <span className="statchip">💰 Biggest win: +${recs.biggestWin}</span>}
                {recs.bestCashout > 0 && <span className="statchip">🤑 Best payday: ${recs.bestCashout}</span>}
                {recs.perfectRounds > 0 && <span className="statchip">✨ Perfect rounds: {recs.perfectRounds}</span>}
                {recs.bestDayStreak > 1 && <span className="statchip">📅 Longest day streak: {recs.bestDayStreak}</span>}
                {recs.bestStreak === 0 && recs.biggestWin === 0 && recs.bestCashout === 0 && recs.perfectRounds === 0 && recs.bestDayStreak <= 1 && (
                  <span className="statchip">Empty shelf. Chip says that&apos;s embarrassing.</span>
                )}
              </div>
              <p className="payline" style={{ fontWeight: 900, marginTop: 10, marginBottom: 2 }}>Word collection: {masteredCount} / {BANK.length} captured</p>
              <div className="goalwrap" aria-hidden="true"><div className="goalbar blue" style={{ width: `${(masteredCount / BANK.length) * 100}%` }} /></div>
              <p className="payline" style={{ fontWeight: 900, marginTop: 10, marginBottom: 2 }}>Doodle collection: {ownedDoodles.length} / {DOODLES.length}</p>
              <p className="doodleshelf" title="Win betting rounds for a chance at doodle drops">
                {DOODLES.map((d) => (ownedDoodles.includes(d.id) ? d.icon : "▢")).join(" ")}
              </p>
              <p style={{ fontSize: 12, color: "#4A4A45", margin: "4px 0 0" }}>Doodles drop from winning bet rounds. Two are rare. Chip won&apos;t say which.</p>
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
                  {customError && <p className="savewarn" style={{ marginTop: 8 }}>{customError}</p>}
                  <p style={{ fontSize: 12, color: "#4A4A45", marginTop: 8 }}>
                    One round covers your whole list (up to {CUSTOM_ROUND_CAP} words). List rounds pay real money but don&apos;t move your level or rank - Chip only ranks his own words.
                  </p>
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
              <span>{isPractice || !potential ? "Practice" : `Bet $${bet} · Pot $${potential.amount}`}</span>
              <span>Streak: {streak} {streak >= 3 ? "🔥" : ""}</span>
              <span>Misses: {missedWords.length}</span>
            </div>

            {isRedoLap && <div className="lap">REVENGE ROUND - clear these to keep 1.5x alive.</div>}
            {resumed && <div className="lap" style={{ color: "#2B5FD9" }}>Found your unfinished round. Picking up right where you left off.</div>}
            {customNote && <div className="lap" style={{ color: "#2B5FD9" }}>{customNote}</div>}

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
                <div style={{ marginTop: 10 }} className="burst" key={`burst-${idx}-${queue.length}`}>
                  <span className="stamp good hand">CORRECT ✓{streak >= 3 ? ` ×${streak}` : ""}</span>
                  {(streak >= 3
                    ? [...SPARKS, ...SPARKS.map((s) => ({ c: "🔥", x: s.x * 1.6, y: s.y * 1.6, r: -s.r }))]
                    : SPARKS
                  ).map((s, i) => (
                    <span
                      key={i}
                      className="spark"
                      aria-hidden="true"
                      style={{ "--dx": `${s.x}px`, "--dy": `${s.y}px`, "--rot": `${s.r}deg`, animationDelay: `${i * 0.03}s` } as React.CSSProperties}
                    >{s.c}</span>
                  ))}
                </div>
                {bonusWon && bonusWord === current.w && (
                  <p className="bonusline hand">🎯 BONUS WORD! +$1 stashed for the payout.</p>
                )}
                {potential && <p className="winline hand">{potLine(potential)}</p>}
                <p className="sentline">&quot;{current.s}&quot;</p>
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
            {extras?.rankUp && <p className="rankup hand">🏆 RANK UP: {extras.rankUp}</p>}
            {levelMsg && <p className="escaped" style={{ fontSize: 20 }}>{levelMsg}</p>}
            {extras && extras.leveledDown > 0 && (
              <p className="leveldown hand">LEVEL DOWN. Chip dropped you to level {extras.leveledDown} words. Two hot rounds wins it back.</p>
            )}
            {extras?.newRecords.map((r) => (
              <p key={r} className="recordline hand">⭐ NEW RECORD - {r}</p>
            ))}
            {bonusWon && <p className="bonusline hand">🎯 Bonus word banked: +${BONUS_WORD_CASH}</p>}
            {extras && extras.respectBonus > 0 && (
              <p className="escaped">Chip&apos;s respect bonus: +${extras.respectBonus}. Two hot rounds at max level. He hates paying this.</p>
            )}
            {extras && extras.streakBonus > 0 && (
              <p className="escaped">Day streak bonus: +${extras.streakBonus} for day {save.dayStreak}. Showing up pays.</p>
            )}
            {extras && extras.streakBroken > 0 && (
              <p className="warnline">Your {extras.streakBroken}-day streak ended. Chip noticed. New one starts today.</p>
            )}
            {extras?.doodleDrop && (() => {
              const d = DOODLES.find((x) => x.id === extras.doodleDrop);
              return d ? (
                <div className="doodledrop">
                  <span className="doodleicon" aria-hidden="true">{d.icon}</span>
                  <div>
                    <p className="cheatlabel" style={{ color: "#B8860B", margin: 0 }}>DOODLE DROP{d.rare ? " - RARE!" : ""}</p>
                    <p style={{ margin: "2px 0", fontWeight: 900 }}>{d.name}</p>
                    <p style={{ margin: 0, fontSize: 14 }}>{d.cap} · Collection: {ownedDoodles.length}/{DOODLES.length}</p>
                  </div>
                </div>
              ) : null;
            })()}
            <p className="payline" style={{ fontWeight: 900, marginTop: 10 }}>
              First-try: {firstTryCorrect}/{roundTotal} · Best streak: {bestStreak} · Day streak: {save.dayStreak} {save.dayStreak >= 3 ? "🔥" : ""} · Level: {save.playerLevel}/{MAX_LEVEL}
            </p>
            {!isPractice && !isCustomRound && (
              <p className="payline" style={{ fontWeight: 900 }}>
                YOU {chipRec.w} - {chipRec.l} CHIP · Rank: {rank.title}
                {rank.next && <> · {rank.next.winsNeeded} {rank.next.winsNeeded === 1 ? "win" : "wins"} to {rank.next.title}</>}
              </p>
            )}

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
              {!isPractice && !isCustomRound && bet >= 1 && bet <= save.bank && (
                <button className="btn blue" onClick={() => startRound("adaptive")}>REMATCH CHIP (bet ${bet})</button>
              )}
              {isPractice && (
                <button className="btn" onClick={() => startRound("adaptive", true)}>Run it back (practice)</button>
              )}
              <button className="btn ghost" onClick={() => { setScreen("start"); setBet(0); }}>Back to the Betting Desk</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
