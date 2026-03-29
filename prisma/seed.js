import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.delete("schema");
const connectionString = dbUrl.toString();
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Fixed UUIDs for seed data ───────────────────────
// Pattern: 00000000-0000-0000-0000-00000000XXXX (easy to identify as seed)
const SEED_IDS = {
  categories: {
    selfHelp:     "00000000-0000-0000-0000-000000000c01",
    productivity: "00000000-0000-0000-0000-000000000c02",
    mindfulness:  "00000000-0000-0000-0000-000000000c03",
    business:     "00000000-0000-0000-0000-000000000c04",
    finance:      "00000000-0000-0000-0000-000000000c05",
  },
  books: {
    atomicHabits:    "00000000-0000-0000-0000-000000000b01",
    deepWork:        "00000000-0000-0000-0000-000000000b02",
    powerOfNow:      "00000000-0000-0000-0000-000000000b03",
    thinkAndGrowRich:"00000000-0000-0000-0000-000000000b04",
    richDadPoorDad:  "00000000-0000-0000-0000-000000000b05",
  },
  users: {
    admin:  "00000000-0000-0000-0000-000000000u01",
    rahul:  "00000000-0000-0000-0000-000000000u02",
    priya:  "00000000-0000-0000-0000-000000000u03",
    amit:   "00000000-0000-0000-0000-000000000u04",
    sneha:  "00000000-0000-0000-0000-000000000u05",
    vikram: "00000000-0000-0000-0000-000000000u06",
    neha:   "00000000-0000-0000-0000-000000000u07",
    arjun:  "00000000-0000-0000-0000-000000000u08",
    kavya:  "00000000-0000-0000-0000-000000000u09",
  },
};

const allCategoryIds = Object.values(SEED_IDS.categories);
const allBookIds = Object.values(SEED_IDS.books);

// ─── Helpers ──────────────────────────────────────────
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log("Seeding database...\n");

  // ─── Clean up only seed data (other developers' data stays) ──
  const seedPhones = ["+910000000000", "+911111111111", "+912222222222", "+913333333333", "+914444444444", "+915555555555", "+916666666666", "+917777777777", "+918888888888"];
  const existingUsers = await prisma.user.findMany({ where: { phone: { in: seedPhones } }, select: { id: true } });
  const existingUserIds = existingUsers.map((u) => u.id);

  if (existingUserIds.length > 0) {
    await prisma.activeBook.deleteMany({ where: { userId: { in: existingUserIds } } });
    await prisma.userQuoteRead.deleteMany({ where: { userId: { in: existingUserIds } } });
    await prisma.purchase.deleteMany({ where: { userId: { in: existingUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: existingUserIds } } });
  }
  await prisma.bookContent.deleteMany({ where: { bookId: { in: allBookIds } } });
  await prisma.book.deleteMany({ where: { id: { in: allBookIds } } });
  await prisma.category.deleteMany({ where: { id: { in: allCategoryIds } } });
  console.log("✓ Cleared seed data only (other data untouched)");

  // ─── Categories ───────────────────────────────────────
  const [selfHelp, productivity, mindfulness, business, finance] =
    await Promise.all([
      prisma.category.upsert({ where: { name: "Self Help" }, update: {}, create: { id: SEED_IDS.categories.selfHelp, name: "Self Help" } }),
      prisma.category.upsert({ where: { name: "Productivity" }, update: {}, create: { id: SEED_IDS.categories.productivity, name: "Productivity" } }),
      prisma.category.upsert({ where: { name: "Mindfulness" }, update: {}, create: { id: SEED_IDS.categories.mindfulness, name: "Mindfulness" } }),
      prisma.category.upsert({ where: { name: "Business" }, update: {}, create: { id: SEED_IDS.categories.business, name: "Business" } }),
      prisma.category.upsert({ where: { name: "Finance" }, update: {}, create: { id: SEED_IDS.categories.finance, name: "Finance" } }),
    ]);
  console.log("✓ 5 categories seeded");

  // ─── Books ────────────────────────────────────────────
  const [atomicHabits, deepWork, powerOfNow, thinkAndGrowRich, richDadPoorDad] =
    await Promise.all([
      prisma.book.create({ data: { id: SEED_IDS.books.atomicHabits, title: "Atomic Habits", author: "James Clear", description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.", categoryId: selfHelp.id, price: 299, rating: 4.8, totalPages: 320, publishedYear: 2018, tags: ["Self Help", "Psychology", "Productivity"], totalQuotes: 31, isActive: true } }),
      prisma.book.create({ data: { id: SEED_IDS.books.deepWork, title: "Deep Work", author: "Cal Newport", description: "Rules for focused success in a distracted world. Learn to work deeply and produce at an elite level.", categoryId: productivity.id, price: 249, rating: 4.6, totalPages: 296, publishedYear: 2016, tags: ["Productivity", "Focus", "Career"], totalQuotes: 31, isActive: true } }),
      prisma.book.create({ data: { id: SEED_IDS.books.powerOfNow, title: "The Power of Now", author: "Eckhart Tolle", description: "A guide to spiritual enlightenment. Discover the power of living in the present moment.", categoryId: mindfulness.id, price: 199, rating: 4.5, totalPages: 236, publishedYear: 1997, tags: ["Mindfulness", "Spirituality", "Meditation"], totalQuotes: 31, isActive: true } }),
      prisma.book.create({ data: { id: SEED_IDS.books.thinkAndGrowRich, title: "Think and Grow Rich", author: "Napoleon Hill", description: "The classic guide to success and wealth creation through the power of thought and desire.", categoryId: business.id, price: 179, rating: 4.7, totalPages: 238, publishedYear: 1937, tags: ["Business", "Success", "Wealth"], totalQuotes: 31, isActive: true } }),
      prisma.book.create({ data: { id: SEED_IDS.books.richDadPoorDad, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", description: "What the rich teach their kids about money that the poor and middle class do not.", categoryId: finance.id, price: 219, rating: 4.6, totalPages: 336, publishedYear: 1997, tags: ["Finance", "Investing", "Money"], totalQuotes: 31, isActive: true } }),
    ]);
  console.log("✓ 5 books seeded");

  // ─── Book Contents (Atomic Habits — 31 quotes) ────────
  const atomicHabitsQuotes = [
    { en: "You do not rise to the level of your goals. You fall to the level of your systems.", hi: "आप अपने लक्ष्यों के स्तर तक नहीं उठते। आप अपनी प्रणालियों के स्तर तक गिरते हैं।" },
    { en: "Every action you take is a vote for the type of person you wish to become.", hi: "आप जो भी कार्य करते हैं, वह उस व्यक्ति के लिए एक वोट है जो आप बनना चाहते हैं।" },
    { en: "Habits are the compound interest of self-improvement.", hi: "आदतें आत्म-सुधार का चक्रवृद्धि ब्याज हैं।" },
    { en: "The most practical way to change who you are is to change what you do.", hi: "आप जो हैं उसे बदलने का सबसे व्यावहारिक तरीका यह है कि आप जो करते हैं उसे बदलें।" },
    { en: "Success is the product of daily habits, not once-in-a-lifetime transformations.", hi: "सफलता दैनिक आदतों का परिणाम है, न कि जीवन में एक बार होने वाले परिवर्तनों का।" },
    { en: "Goals are good for setting a direction, but systems are best for making progress.", hi: "लक्ष्य दिशा निर्धारित करने के लिए अच्छे हैं, लेकिन प्रगति के लिए सिस्टम सबसे अच्छे हैं।" },
    { en: "The seed of every habit is a single, tiny decision.", hi: "हर आदत का बीज एक छोटा सा निर्णय है।" },
    { en: "Be the designer of your world and not merely the consumer of it.", hi: "अपनी दुनिया के डिजाइनर बनें, न केवल उसके उपभोक्ता।" },
    { en: "You don't have to be the victim of your environment. You can also be the architect of it.", hi: "आपको अपने वातावरण का शिकार नहीं बनना है। आप इसके वास्तुकार भी हो सकते हैं।" },
    { en: "Never miss twice. If you miss one day, try to get back on track as quickly as possible.", hi: "कभी भी दो बार न चूकें। यदि आप एक दिन चूक जाते हैं, तो जल्द से जल्द वापस पटरी पर आने की कोशिश करें।" },
    { en: "The more pride you have in a particular aspect of your identity, the more motivated you will be.", hi: "आप अपनी पहचान के किसी पहलू पर जितना अधिक गर्व करते हैं, उससे जुड़ी आदतों को बनाए रखने के लिए उतने ही प्रेरित होंगे।" },
    { en: "A small habit will not transform your life immediately, but the routine of doing it will transform you.", hi: "एक छोटी सी आदत तुरंत आपके जीवन को नहीं बदलेगी, लेकिन इसे करने की दिनचर्या आपको बदल देगी।" },
    { en: "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing.", hi: "लक्ष्य निर्धारित करने का उद्देश्य खेल जीतना है। सिस्टम बनाने का उद्देश्य खेल खेलते रहना है।" },
    { en: "Standardize before you optimize. You can't improve a habit that doesn't exist.", hi: "अनुकूलित करने से पहले मानकीकृत करें। आप उस आदत में सुधार नहीं कर सकते जो अस्तित्व में नहीं है।" },
    { en: "The two-minute rule: When you start a new habit, it should take less than two minutes to do.", hi: "दो मिनट का नियम: जब आप एक नई आदत शुरू करते हैं, तो इसे करने में दो मिनट से कम समय लगना चाहिए।" },
    { en: "It is easy to overestimate one defining moment and underestimate the value of small daily improvements.", hi: "एक निर्णायक क्षण को अधिक आंकना और दैनिक छोटे सुधारों को कम आंकना बहुत आसान है।" },
    { en: "Ultimately, it is your commitment to the process that will determine your progress.", hi: "अंततः, यह प्रक्रिया के प्रति आपकी प्रतिबद्धता है जो आपकी प्रगति निर्धारित करेगी।" },
    { en: "The road to mastery requires patience.", hi: "महारत का रास्ता धैर्य की मांग करता है।" },
    { en: "Cravings are the motivational force behind every habit.", hi: "लालसाएं हर आदत के पीछे की प्रेरक शक्ति हैं।" },
    { en: "When you fall in love with the process rather than the product, you don't have to wait to be happy.", hi: "जब आप उत्पाद के बजाय प्रक्रिया से प्यार करते हैं, तो आपको खुश होने के लिए इंतजार नहीं करना पड़ता।" },
    { en: "We imitate the habits of three groups: the close, the many, and the powerful.", hi: "हम तीन समूहों की आदतों की नकल करते हैं: निकट, अनेक और शक्तिशाली।" },
    { en: "The most effective form of motivation is progress.", hi: "प्रेरणा का सबसे प्रभावी रूप प्रगति है।" },
    { en: "Mastery requires patience, and patience requires trust in the process.", hi: "महारत के लिए धैर्य चाहिए, और धैर्य के लिए प्रक्रिया पर भरोसा चाहिए।" },
    { en: "A habit must be established before it can be improved.", hi: "एक आदत को बेहतर बनाने से पहले उसे स्थापित करना होगा।" },
    { en: "The costs of your bad habits are in the future. The costs of good habits are in the present.", hi: "आपकी बुरी आदतों की कीमत भविष्य में है। अच्छी आदतों की कीमत वर्तमान में है।" },
    { en: "Professionals stick to the schedule; amateurs let life get in the way.", hi: "पेशेवर कार्यक्रम से चिपके रहते हैं; शौकिया जिंदगी को आड़े आने देते हैं।" },
    { en: "You should be far more concerned with your current trajectory than with your current results.", hi: "आपको अपने परिणामों की तुलना में अपनी वर्तमान दिशा के बारे में कहीं अधिक चिंतित होना चाहिए।" },
    { en: "The real winners in life look at every situation with a fresh perspective.", hi: "जीवन में असली विजेता वे लोग हैं जो हर स्थिति को एक नए दृष्टिकोण से देखते हैं।" },
    { en: "Habits are not a finish line to be crossed, they are a lifestyle to be lived.", hi: "आदतें पार करने की कोई फिनिश लाइन नहीं हैं, वे जीने का एक तरीका हैं।" },
    { en: "Your outcomes are a lagging measure of your habits.", hi: "आपके परिणाम आपकी आदतों का एक पिछड़ा हुआ माप हैं।" },
    { en: "Get 1 percent better each day for one year, and you'll end up thirty-seven times better.", hi: "एक साल के लिए हर दिन 1 प्रतिशत बेहतर होते जाएं, और आप सैंतीस गुना बेहतर हो जाएंगे।" },
  ];

  const atomicHabitsDescriptions = [
    { en: "Focus on building systems that lead to your goals, rather than obsessing over the goals themselves.", hi: "लक्ष्यों पर जुनूनी होने के बजाय ऐसी प्रणालियाँ बनाने पर ध्यान दें जो लक्ष्यों की ओर ले जाएँ।" },
    { en: "Small decisions accumulate over time to shape the person you become.", hi: "छोटे-छोटे निर्णय समय के साथ जमा होकर उस व्यक्ति को आकार देते हैं जो आप बनते हैं।" },
    { en: "Small habits may seem insignificant, but over time they compound into remarkable results.", hi: "छोटी आदतें महत्वहीन लग सकती हैं, लेकिन समय के साथ वे उल्लेखनीय परिणामों में बदल जाती हैं।" },
    { en: "Identity-based habits are the key to lasting change. Act as the person you want to become.", hi: "पहचान-आधारित आदतें स्थायी परिवर्तन की कुंजी हैं। उस व्यक्ति की तरह कार्य करें जो आप बनना चाहते हैं।" },
    { en: "Consistent daily actions, no matter how small, lead to lasting success.", hi: "लगातार दैनिक क्रियाएं, चाहे कितनी भी छोटी हों, स्थायी सफलता की ओर ले जाती हैं।" },
    { en: "Systems help you make consistent progress every day, regardless of whether you feel motivated.", hi: "सिस्टम आपको हर दिन लगातार प्रगति करने में मदद करता है, चाहे आप प्रेरित महसूस करें या नहीं।" },
    { en: "Starting small and simple is the key to building a habit that lasts.", hi: "छोटी और सरल शुरुआत ही एक स्थायी आदत बनाने की कुंजी है।" },
    { en: "Consciously design your environment to make good habits easier and bad habits harder.", hi: "अच्छी आदतों को आसान और बुरी आदतों को कठिन बनाने के लिए अपने वातावरण को डिजाइन करें।" },
    { en: "Shape your environment to support the habits you want to build.", hi: "अपने वातावरण को उन आदतों का समर्थन करने के लिए आकार दें जो आप बनाना चाहते हैं।" },
    { en: "Breaking a habit once is an accident; breaking it twice starts a new pattern.", hi: "एक बार आदत तोड़ना एक दुर्घटना है; दो बार तोड़ना एक नई आदत की शुरुआत है।" },
    { en: "Linking habits to your identity makes them more durable and motivating.", hi: "आदतों को अपनी पहचान से जोड़ना उन्हें अधिक टिकाऊ और प्रेरक बनाता है।" },
    { en: "Small consistent steps, taken daily, lead to profound transformation over time.", hi: "छोटे-छोटे लगातार कदम, प्रतिदिन उठाए गए, समय के साथ गहरे परिवर्तन की ओर ले जाते हैं।" },
    { en: "A clear system helps you stay consistent and make steady progress toward your goals.", hi: "एक स्पष्ट प्रणाली आपको लगातार बने रहने और अपने लक्ष्यों की ओर स्थिर प्रगति करने में मदद करती है।" },
    { en: "Perfecting the basics is the foundation of mastery.", hi: "मूल बातों को सिद्ध करना महारत की नींव है।" },
    { en: "Making habits easy to start is more important than making them easy to sustain.", hi: "आदतों को शुरू करना आसान बनाना उन्हें बनाए रखना आसान बनाने से ज्यादा महत्वपूर्ण है।" },
    { en: "Tiny improvements accumulate over time into remarkable results.", hi: "छोटे-छोटे सुधार समय के साथ जमा होकर उल्लेखनीय परिणाम देते हैं।" },
    { en: "Falling in love with the process of improvement drives sustainable change.", hi: "सुधार की प्रक्रिया से प्यार करना ही टिकाऊ परिवर्तन को प्रेरित करता है।" },
    { en: "Trust the journey, not just the destination.", hi: "केवल मंजिल पर नहीं, यात्रा पर भरोसा करें।" },
    { en: "Understanding your cravings gives you the power to reshape your habits.", hi: "अपनी लालसाओं को समझना आपको अपनी आदतों को नया आकार देने की शक्ति देता है।" },
    { en: "Enjoy the journey of improvement and let that enjoyment be your motivation.", hi: "सुधार की यात्रा का आनंद लें और उस आनंद को अपनी प्रेरणा बनने दें।" },
    { en: "Surround yourself with people who have the habits you want to develop.", hi: "खुद को उन लोगों से घेरें जिनके पास वे आदतें हैं जो आप विकसित करना चाहते हैं।" },
    { en: "Small wins create momentum that powers continued growth.", hi: "छोटी जीतें वह गति पैदा करती हैं जो निरंतर विकास को शक्ति देती हैं।" },
    { en: "The slow, steady path is the most reliable road to mastery.", hi: "धीमा, स्थिर रास्ता महारत की सबसे विश्वसनीय सड़क है।" },
    { en: "Before you can optimize a habit, you must first make it consistent.", hi: "किसी आदत को अनुकूलित करने से पहले, आपको पहले इसे सुसंगत बनाना होगा।" },
    { en: "Good habits are an investment that pays dividends in the future.", hi: "अच्छी आदतें एक निवेश हैं जो भविष्य में लाभांश देती हैं।" },
    { en: "Showing up consistently is what separates professionals from amateurs.", hi: "लगातार उपस्थित रहना ही पेशेवरों को शौकियों से अलग करता है।" },
    { en: "Focus on your direction and speed of improvement, not just where you are now.", hi: "केवल अभी आप कहाँ हैं इस पर नहीं, बल्कि अपनी दिशा और सुधार की गति पर ध्यान दें।" },
    { en: "A fresh perspective allows you to see opportunities where others see obstacles.", hi: "एक नया दृष्टिकोण आपको वहाँ अवसर देखने की अनुमति देता है जहाँ दूसरे बाधाएँ देखते हैं।" },
    { en: "Habits are not a destination; they are a way of living each day.", hi: "आदतें कोई मंजिल नहीं हैं; वे हर दिन जीने का एक तरीका हैं।" },
    { en: "Your habits today are shaping the outcomes you will see tomorrow.", hi: "आज आपकी आदतें उन परिणामों को आकार दे रही हैं जो आप कल देखेंगे।" },
    { en: "Consistent 1% improvements each day lead to extraordinary results over time.", hi: "हर दिन लगातार 1% सुधार समय के साथ असाधारण परिणामों की ओर ले जाते हैं।" },
  ];

  await prisma.bookContent.deleteMany({ where: { bookId: atomicHabits.id } });
  await prisma.bookContent.createMany({
    data: atomicHabitsQuotes.map((quote, i) => ({
      bookId: atomicHabits.id,
      chapterNumber: Math.floor(i / 5) + 1,
      chapterTitle: `Chapter ${Math.floor(i / 5) + 1}`,
      quoteIndex: i + 1,
      quotes: quote,
      descriptions: atomicHabitsDescriptions[i],
    })),
  });
  console.log("✓ 31 quotes seeded for Atomic Habits");

  // ─── Deep Work — 31 quotes ────────────────────────────
  const deepWorkQuotes = [
    { en: "Deep work is the ability to focus without distraction on a cognitively demanding task.", hi: "डीप वर्क बिना किसी विक्षेप के किसी कठिन कार्य पर ध्यान केंद्रित करने की क्षमता है।" },
    { en: "If you don't produce, you won't thrive—no matter how skilled or talented you are.", hi: "यदि आप उत्पादन नहीं करते, तो आप फले-फूलेंगे नहीं—चाहे आप कितने भी कुशल या प्रतिभाशाली हों।" },
    { en: "Clarity about what matters provides clarity about what does not.", hi: "जो मायने रखता है उसके बारे में स्पष्टता यह स्पष्टता देती है कि क्या नहीं मायने रखता।" },
    { en: "The ability to perform deep work is becoming increasingly rare and valuable.", hi: "गहरा काम करने की क्षमता तेजी से दुर्लभ और मूल्यवान होती जा रही है।" },
    { en: "Batch similar shallow tasks and dedicate blocks of time to deep work.", hi: "समान उथले कार्यों को एक साथ करें और गहरे काम के लिए समय के ब्लॉक समर्पित करें।" },
    { en: "To produce at your peak level you need to work for extended periods with full concentration.", hi: "अपने उच्चतम स्तर पर उत्पादन करने के लिए आपको पूर्ण एकाग्रता के साथ लंबे समय तक काम करना होगा।" },
    { en: "Efforts to deepen your focus will struggle if you don't simultaneously wean your mind from a dependence on distraction.", hi: "यदि आप एक साथ अपने मन को विक्षेप पर निर्भरता से नहीं छुड़ाते, तो आपका ध्यान गहरा करने के प्रयास संघर्ष करेंगे।" },
    { en: "Human beings are at their best when immersed deeply in something challenging.", hi: "मनुष्य अपने सर्वश्रेष्ठ होते हैं जब वे किसी चुनौतीपूर्ण चीज़ में गहराई से डूबे होते हैं।" },
    { en: "The key to developing a deep work habit is to move beyond good intentions and add routines to your working life.", hi: "गहरे काम की आदत विकसित करने की कुंजी अच्छे इरादों से आगे बढ़ना और अपने कार्य जीवन में दिनचर्या जोड़ना है।" },
    { en: "Idleness is not just a vacation, an indulgence or a vice; it is as indispensable as deep work.", hi: "आलस्य सिर्फ छुट्टी, विलासिता या दोष नहीं है; यह गहरे काम जितना ही अपरिहार्य है।" },
    { en: "When you work, work hard. When you're done, be done.", hi: "जब आप काम करें, कठिन काम करें। जब आप पूरा करें, पूरी तरह पूरा करें।" },
    { en: "Busyness as proxy for productivity is a trap that keeps you from doing great work.", hi: "उत्पादकता के विकल्प के रूप में व्यस्तता एक जाल है जो आपको महान काम करने से रोकती है।" },
    { en: "Schedule every minute of your day to maximize your deep work output.", hi: "अपने गहरे काम के उत्पादन को अधिकतम करने के लिए अपने दिन के हर मिनट को निर्धारित करें।" },
    { en: "Embrace boredom. The ability to concentrate intensely is a skill that must be trained.", hi: "बोरियत को स्वीकार करें। तीव्रता से ध्यान केंद्रित करने की क्षमता एक कौशल है जिसे प्रशिक्षित किया जाना चाहिए।" },
    { en: "A deep life is a good life.", hi: "एक गहरा जीवन एक अच्छा जीवन है।" },
    { en: "Finish your work by five-thirty — protect your evenings for rest and recovery.", hi: "अपना काम साढ़े पांच बजे तक समाप्त करें — अपनी शाम आराम और पुनर्प्राप्ति के लिए सुरक्षित रखें।" },
    { en: "Quit social media if it's fragmenting your attention without adding real value.", hi: "सोशल मीडिया छोड़ें यदि यह वास्तविक मूल्य जोड़े बिना आपका ध्यान खंडित कर रहा है।" },
    { en: "The shallow work will always fill the time you give it.", hi: "उथला काम हमेशा उस समय को भर देगा जो आप उसे देते हैं।" },
    { en: "Concentration is like a mental muscle — the more you train it, the stronger it gets.", hi: "एकाग्रता एक मानसिक मांसपेशी की तरह है — जितना अधिक आप इसे प्रशिक्षित करते हैं, यह उतना ही मजबूत होता है।" },
    { en: "Resting your brain after intensive work is not laziness — it is essential recovery.", hi: "गहन काम के बाद अपने मस्तिष्क को आराम देना आलस्य नहीं है — यह आवश्यक पुनर्प्राप्ति है।" },
    { en: "Great creative minds think like artists but work like accountants.", hi: "महान रचनात्मक दिमाग कलाकारों की तरह सोचते हैं लेकिन लेखाकारों की तरह काम करते हैं।" },
    { en: "Your work is craft — treat it with the same respect a craftsman has for his trade.", hi: "आपका काम शिल्प है — इसे उसी सम्मान के साथ व्यवहार करें जो एक कारीगर अपने व्यापार के लिए करता है।" },
    { en: "Flow states are the reward for pushing past distraction into deep concentration.", hi: "फ्लो अवस्थाएं विक्षेप से परे गहरी एकाग्रता में जाने का पुरस्कार हैं।" },
    { en: "Be wary of anything that fragments your time and attention.", hi: "किसी भी चीज़ से सावधान रहें जो आपके समय और ध्यान को खंडित करती है।" },
    { en: "The professional gives the work the time it needs, every single day.", hi: "पेशेवर काम को हर दिन वह समय देता है जिसकी उसे जरूरत है।" },
    { en: "Attention is your most valuable resource — protect it fiercely.", hi: "ध्यान आपका सबसे मूल्यवान संसाधन है — इसे सख्ती से सुरक्षित रखें।" },
    { en: "Willpower is a finite resource — design your environment to reduce the need for it.", hi: "इच्छाशक्ति एक सीमित संसाधन है — अपने वातावरण को इसकी आवश्यकता कम करने के लिए डिजाइन करें।" },
    { en: "Depth of work produces depth of meaning.", hi: "काम की गहराई अर्थ की गहराई पैदा करती है।" },
    { en: "Access to information is not the same as the ability to think deeply about it.", hi: "जानकारी तक पहुंच इसके बारे में गहराई से सोचने की क्षमता के समान नहीं है।" },
    { en: "The future belongs to those who can hold deep focus in a distracted world.", hi: "भविष्य उनका है जो एक विचलित दुनिया में गहरा ध्यान बनाए रख सकते हैं।" },
    { en: "Mastery and meaning come from deep engagement, not shallow busyness.", hi: "महारत और अर्थ गहरी संलग्नता से आते हैं, उथली व्यस्तता से नहीं।" },
  ];

  await prisma.bookContent.deleteMany({ where: { bookId: deepWork.id } });
  await prisma.bookContent.createMany({
    data: deepWorkQuotes.map((quote, i) => ({
      bookId: deepWork.id,
      chapterNumber: Math.floor(i / 5) + 1,
      chapterTitle: `Chapter ${Math.floor(i / 5) + 1}`,
      quoteIndex: i + 1,
      quotes: quote,
      descriptions: { en: "Apply deep work principles to produce your best output each day.", hi: "हर दिन अपना सर्वश्रेष्ठ उत्पादन करने के लिए गहरे काम के सिद्धांतों को लागू करें।" },
    })),
  });
  console.log("✓ 31 quotes seeded for Deep Work");

  // ─── Users ────────────────────────────────────────────
  // 1 admin + 8 normal users with different languages and platforms
  // Also clear quote reads
  await prisma.userQuoteRead.deleteMany();

  const admin = await prisma.user.create({
    data: { id: SEED_IDS.users.admin, phone: "+910000000000", name: "Admin", email: "admin@bookshelf.com", preferredLanguage: "en", role: "ADMIN" },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { id: SEED_IDS.users.rahul,  phone: "+911111111111", name: "Rahul Sharma",  email: "rahul@example.com",   preferredLanguage: "en", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.priya,  phone: "+912222222222", name: "Priya Patel",   email: "priya@example.com",   preferredLanguage: "hi", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.amit,   phone: "+913333333333", name: "Amit Kumar",    email: "amit@example.com",    preferredLanguage: "en", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.sneha,  phone: "+914444444444", name: "Sneha Gupta",   email: "sneha@example.com",   preferredLanguage: "hi", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.vikram, phone: "+915555555555", name: "Vikram Singh",  email: "vikram@example.com",  preferredLanguage: "en", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.neha,   phone: "+916666666666", name: "Neha Joshi",    email: "neha@example.com",    preferredLanguage: "hi", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.arjun,  phone: "+917777777777", name: "Arjun Mehta",   email: "arjun@example.com",   preferredLanguage: "en", role: "USER" } }),
    prisma.user.create({ data: { id: SEED_IDS.users.kavya,  phone: "+918888888888", name: "Kavya Reddy",   email: "kavya@example.com",   preferredLanguage: "hi", role: "USER" } }),
  ]);

  const [rahul, priya, amit, sneha, vikram, neha, arjun, kavya] = users;
  console.log(`✓ 1 admin + ${users.length} normal users seeded`);

  // ─── Purchases ────────────────────────────────────────
  // Mix of: active 31-day, active 90-day, expired, multiple books per user
  const purchases = await Promise.all([
    // Rahul — Atomic Habits (active, 31 days, Android)
    prisma.purchase.create({ data: {
      userId: rahul.id, bookId: atomicHabits.id, durationDays: 31,
      purchaseToken: "token-rahul-ah-001", platform: "GOOGLE_PLAY",
      startDate: daysAgo(5), endDate: daysFromNow(26), status: "ACTIVE",
    }}),
    // Priya — Deep Work (active, 90 days, iOS)
    prisma.purchase.create({ data: {
      userId: priya.id, bookId: deepWork.id, durationDays: 90,
      purchaseToken: "token-priya-dw-001", platform: "APP_STORE",
      startDate: daysAgo(10), endDate: daysFromNow(80), status: "ACTIVE",
    }}),
    // Amit — Power of Now (active, 31 days, Android)
    prisma.purchase.create({ data: {
      userId: amit.id, bookId: powerOfNow.id, durationDays: 31,
      purchaseToken: "token-amit-pon-001", platform: "GOOGLE_PLAY",
      startDate: daysAgo(1), endDate: daysFromNow(30), status: "ACTIVE",
    }}),
    // Sneha — Atomic Habits (active, 90 days, iOS) + Deep Work expired
    prisma.purchase.create({ data: {
      userId: sneha.id, bookId: atomicHabits.id, durationDays: 90,
      purchaseToken: "token-sneha-ah-001", platform: "APP_STORE",
      startDate: daysAgo(15), endDate: daysFromNow(75), status: "ACTIVE",
    }}),
    // Sneha — Deep Work (expired)
    prisma.purchase.create({ data: {
      userId: sneha.id, bookId: deepWork.id, durationDays: 31,
      purchaseToken: "token-sneha-dw-old", platform: "APP_STORE",
      startDate: daysAgo(40), endDate: daysAgo(9), status: "EXPIRED",
    }}),
    // Vikram — Think and Grow Rich (active, 31 days, Android)
    prisma.purchase.create({ data: {
      userId: vikram.id, bookId: thinkAndGrowRich.id, durationDays: 31,
      purchaseToken: "token-vikram-tgr-001", platform: "GOOGLE_PLAY",
      startDate: daysAgo(3), endDate: daysFromNow(28), status: "ACTIVE",
    }}),
    // Neha — Rich Dad Poor Dad (active, 90 days, iOS)
    prisma.purchase.create({ data: {
      userId: neha.id, bookId: richDadPoorDad.id, durationDays: 90,
      purchaseToken: "token-neha-rdpd-001", platform: "APP_STORE",
      startDate: daysAgo(20), endDate: daysFromNow(70), status: "ACTIVE",
    }}),
    // Arjun — Atomic Habits expired, now Deep Work active
    prisma.purchase.create({ data: {
      userId: arjun.id, bookId: atomicHabits.id, durationDays: 31,
      purchaseToken: "token-arjun-ah-old", platform: "GOOGLE_PLAY",
      startDate: daysAgo(50), endDate: daysAgo(19), status: "EXPIRED",
    }}),
    prisma.purchase.create({ data: {
      userId: arjun.id, bookId: deepWork.id, durationDays: 31,
      purchaseToken: "token-arjun-dw-001", platform: "GOOGLE_PLAY",
      startDate: daysAgo(7), endDate: daysFromNow(24), status: "ACTIVE",
    }}),
    // Kavya — Power of Now (active, 31 days, iOS)
    prisma.purchase.create({ data: {
      userId: kavya.id, bookId: powerOfNow.id, durationDays: 31,
      purchaseToken: "token-kavya-pon-001", platform: "APP_STORE",
      startDate: daysAgo(2), endDate: daysFromNow(29), status: "ACTIVE",
    }}),
  ]);

  const [
    rahulAH, priyaDW, amitPON, snehaAH, _snehaExpired,
    vikramTGR, nehaRDPD, _arjunExpired, arjunDW, kavyaPON
  ] = purchases;

  console.log(`✓ ${purchases.length} purchases seeded`);

  // ─── Active Books ─────────────────────────────────────
  // Only set active book for users with an ACTIVE purchase
  await Promise.all([
    prisma.activeBook.create({ data: { userId: rahul.id,  purchaseId: rahulAH.id  } }),
    prisma.activeBook.create({ data: { userId: priya.id,  purchaseId: priyaDW.id  } }),
    prisma.activeBook.create({ data: { userId: amit.id,   purchaseId: amitPON.id  } }),
    prisma.activeBook.create({ data: { userId: sneha.id,  purchaseId: snehaAH.id  } }),
    prisma.activeBook.create({ data: { userId: vikram.id, purchaseId: vikramTGR.id } }),
    prisma.activeBook.create({ data: { userId: neha.id,   purchaseId: nehaRDPD.id } }),
    prisma.activeBook.create({ data: { userId: arjun.id,  purchaseId: arjunDW.id  } }),
    prisma.activeBook.create({ data: { userId: kavya.id,  purchaseId: kavyaPON.id } }),
  ]);

  console.log("✓ 8 active books seeded");

  // ─── Summary ──────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seed complete! Here's what was created:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Users (OTP for all: 1234)
  Admin  : +910000000000  (admin@bookshelf.com)
  Rahul  : +911111111111  → Atomic Habits (active, day 6/31)
  Priya  : +912222222222  → Deep Work (active, day 11/90)  [Hindi]
  Amit   : +913333333333  → Power of Now (active, day 2/31)
  Sneha  : +914444444444  → Atomic Habits (active, day 16/90) + expired Deep Work  [Hindi]
  Vikram : +915555555555  → Think and Grow Rich (active, day 4/31)
  Neha   : +916666666666  → Rich Dad Poor Dad (active, day 21/90)  [Hindi]
  Arjun  : +917777777777  → Deep Work (active, day 8/31) + expired Atomic Habits
  Kavya  : +918888888888  → Power of Now (active, day 3/31)  [Hindi]

📚 Books: Atomic Habits, Deep Work, Power of Now, Think and Grow Rich, Rich Dad Poor Dad
📁 Categories: Self Help, Productivity, Mindfulness, Business, Finance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
