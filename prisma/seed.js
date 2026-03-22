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

async function main() {
  console.log("Seeding database...");

  // ─── Categories ───────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Self Help" },
      update: {},
      create: { name: "Self Help" },
    }),
    prisma.category.upsert({
      where: { name: "Productivity" },
      update: {},
      create: { name: "Productivity" },
    }),
    prisma.category.upsert({
      where: { name: "Mindfulness" },
      update: {},
      create: { name: "Mindfulness" },
    }),
    prisma.category.upsert({
      where: { name: "Business" },
      update: {},
      create: { name: "Business" },
    }),
    prisma.category.upsert({
      where: { name: "Finance" },
      update: {},
      create: { name: "Finance" },
    }),
  ]);

  console.log(`✓ ${categories.length} categories seeded`);

  const [selfHelp, productivity, mindfulness] = categories;

  // ─── Books ────────────────────────────────────────────
  const atomicHabits = await prisma.book.upsert({
    where: { id: "book-atomic-habits" },
    update: {},
    create: {
      id: "book-atomic-habits",
      title: "Atomic Habits",
      author: "James Clear",
      categoryId: selfHelp.id,
      price: 299,
      totalQuotes: 31,
      isActive: true,
    },
  });

  const deepWork = await prisma.book.upsert({
    where: { id: "book-deep-work" },
    update: {},
    create: {
      id: "book-deep-work",
      title: "Deep Work",
      author: "Cal Newport",
      categoryId: productivity.id,
      price: 249,
      totalQuotes: 31,
      isActive: true,
    },
  });

  const powerOfNow = await prisma.book.upsert({
    where: { id: "book-power-of-now" },
    update: {},
    create: {
      id: "book-power-of-now",
      title: "The Power of Now",
      author: "Eckhart Tolle",
      categoryId: mindfulness.id,
      price: 199,
      totalQuotes: 31,
      isActive: true,
    },
  });

  console.log(`✓ 3 books seeded`);

  // ─── Book Contents (31 quotes for Atomic Habits) ──────
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
    { en: "The more pride you have in a particular aspect of your identity, the more motivated you will be to maintain the habits associated with it.", hi: "आप अपनी पहचान के किसी विशेष पहलू पर जितना अधिक गर्व करते हैं, उससे जुड़ी आदतों को बनाए रखने के लिए आप उतने ही अधिक प्रेरित होंगे।" },
    { en: "A small habit will not transform your life immediately, but the routine of doing it will transform you.", hi: "एक छोटी सी आदत तुरंत आपके जीवन को नहीं बदलेगी, लेकिन इसे करने की दिनचर्या आपको बदल देगी।" },
    { en: "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing the game.", hi: "लक्ष्य निर्धारित करने का उद्देश्य खेल जीतना है। सिस्टम बनाने का उद्देश्य खेल खेलते रहना है।" },
    { en: "Standardize before you optimize. You can't improve a habit that doesn't exist.", hi: "अनुकूलित करने से पहले मानकीकृत करें। आप उस आदत में सुधार नहीं कर सकते जो अस्तित्व में नहीं है।" },
    { en: "The two-minute rule: When you start a new habit, it should take less than two minutes to do.", hi: "दो मिनट का नियम: जब आप एक नई आदत शुरू करते हैं, तो इसे करने में दो मिनट से कम समय लगना चाहिए।" },
    { en: "It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis.", hi: "एक निर्णायक क्षण के महत्व को अधिक आंकना और दैनिक आधार पर छोटे सुधार करने के मूल्य को कम आंकना बहुत आसान है।" },
    { en: "Ultimately, it is your commitment to the process that will determine your progress.", hi: "अंततः, यह प्रक्रिया के प्रति आपकी प्रतिबद्धता है जो आपकी प्रगति निर्धारित करेगी।" },
    { en: "The road to mastery requires patience.", hi: "महारत का रास्ता धैर्य की मांग करता है।" },
    { en: "Cravings are the motivational force behind every habit.", hi: "लालसाएं हर आदत के पीछे की प्रेरक शक्ति हैं।" },
    { en: "When you fall in love with the process rather than the product, you don't have to wait to give yourself permission to be happy.", hi: "जब आप उत्पाद के बजाय प्रक्रिया से प्यार करते हैं, तो आपको खुश होने की अनुमति देने के लिए इंतजार नहीं करना पड़ता।" },
    { en: "We imitate the habits of three groups in particular: the close, the many, and the powerful.", hi: "हम विशेष रूप से तीन समूहों की आदतों की नकल करते हैं: निकट, अनेक और शक्तिशाली।" },
    { en: "The most effective form of motivation is progress.", hi: "प्रेरणा का सबसे प्रभावी रूप प्रगति है।" },
    { en: "Mastery requires patience, and patience requires trust in the process.", hi: "महारत के लिए धैर्य चाहिए, और धैर्य के लिए प्रक्रिया पर भरोसा चाहिए।" },
    { en: "A habit must be established before it can be improved.", hi: "एक आदत को बेहतर बनाने से पहले उसे स्थापित करना होगा।" },
    { en: "The costs of your bad habits are in the future. The costs of good habits are in the present.", hi: "आपकी बुरी आदतों की कीमत भविष्य में है। अच्छी आदतों की कीमत वर्तमान में है।" },
    { en: "Professionals stick to the schedule; amateurs let life get in the way.", hi: "पेशेवर कार्यक्रम से चिपके रहते हैं; शौकिया जिंदगी को आड़े आने देते हैं।" },
    { en: "You should be far more concerned with your current trajectory than with your current results.", hi: "आपको अपने वर्तमान परिणामों की तुलना में अपनी वर्तमान दिशा के बारे में कहीं अधिक चिंतित होना चाहिए।" },
    { en: "The real winners in life are the people who look at every situation with a fresh perspective.", hi: "जीवन में असली विजेता वे लोग हैं जो हर स्थिति को एक नए दृष्टिकोण से देखते हैं।" },
    { en: "Habits are not a finish line to be crossed, they are a lifestyle to be lived.", hi: "आदतें पार करने की कोई फिनिश लाइन नहीं हैं, वे जीने का एक तरीका हैं।" },
    { en: "Your outcomes are a lagging measure of your habits.", hi: "आपके परिणाम आपकी आदतों का एक पिछड़ा हुआ माप हैं।" },
    { en: "Get 1 percent better each day for one year, and you'll end up thirty-seven times better by the time you're done.", hi: "एक साल के लिए हर दिन 1 प्रतिशत बेहतर होते जाएं, और जब आप पूरा कर लें तो आप सैंतीस गुना बेहतर हो जाएंगे।" },
  ];

  const atomicHabitsDescriptions = [
    { en: "Focus on building systems that lead to your goals, rather than obsessing over the goals themselves.", hi: "लक्ष्यों पर जुनूनी होने के बजाय ऐसी प्रणालियाँ बनाने पर ध्यान दें जो आपके लक्ष्यों की ओर ले जाएँ।" },
    { en: "Small decisions accumulate over time to shape the person you become.", hi: "छोटे-छोटे निर्णय समय के साथ जमा होकर उस व्यक्ति को आकार देते हैं जो आप बनते हैं।" },
    { en: "Small habits may seem insignificant, but over time they compound into remarkable results.", hi: "छोटी आदतें महत्वहीन लग सकती हैं, लेकिन समय के साथ वे उल्लेखनीय परिणामों में बदल जाती हैं।" },
    { en: "Identity-based habits are the key to lasting change. Act as the person you want to become.", hi: "पहचान-आधारित आदतें स्थायी परिवर्तन की कुंजी हैं। उस व्यक्ति की तरह कार्य करें जो आप बनना चाहते हैं।" },
    { en: "Consistent daily actions, no matter how small, are what lead to lasting success.", hi: "लगातार दैनिक क्रियाएं, चाहे कितनी भी छोटी हों, स्थायी सफलता की ओर ले जाती हैं।" },
    { en: "Systems help you make consistent progress every day, regardless of whether you feel motivated.", hi: "सिस्टम आपको हर दिन लगातार प्रगति करने में मदद करता है, चाहे आप प्रेरित महसूस करें या नहीं।" },
    { en: "Starting small and simple is the key to building a habit that lasts.", hi: "छोटी और सरल शुरुआत ही एक स्थायी आदत बनाने की कुंजी है।" },
    { en: "Consciously design your environment to make good habits easier and bad habits harder.", hi: "अच्छी आदतों को आसान और बुरी आदतों को कठिन बनाने के लिए सचेत रूप से अपने वातावरण को डिजाइन करें।" },
    { en: "Shape your environment to support the habits you want to build.", hi: "अपने वातावरण को उन आदतों का समर्थन करने के लिए आकार दें जो आप बनाना चाहते हैं।" },
    { en: "Breaking a habit once is an accident; breaking it twice starts a new pattern.", hi: "एक बार आदत तोड़ना एक दुर्घटना है; दो बार तोड़ना एक नई आदत की शुरुआत है।" },
    { en: "Linking habits to your identity makes them more durable and motivating.", hi: "आदतों को अपनी पहचान से जोड़ना उन्हें अधिक टिकाऊ और प्रेरक बनाता है।" },
    { en: "Small consistent steps, taken daily, lead to profound transformation over time.", hi: "छोटे-छोटे लगातार कदम, प्रतिदिन उठाए गए, समय के साथ गहरे परिवर्तन की ओर ले जाते हैं।" },
    { en: "Having a clear system helps you stay consistent and make steady progress toward your goals.", hi: "एक स्पष्ट प्रणाली होने से आपको लगातार बने रहने और अपने लक्ष्यों की ओर स्थिर प्रगति करने में मदद मिलती है।" },
    { en: "Perfecting the basics is the foundation of mastery.", hi: "मूल बातों को सिद्ध करना महारत की नींव है।" },
    { en: "Making habits easy to start is more important than making them easy to sustain.", hi: "आदतों को शुरू करना आसान बनाना उन्हें बनाए रखना आसान बनाने से ज्यादा महत्वपूर्ण है।" },
    { en: "Tiny improvements accumulate over time into remarkable results.", hi: "छोटे-छोटे सुधार समय के साथ जमा होकर उल्लेखनीय परिणाम देते हैं।" },
    { en: "Falling in love with the process of improvement is what drives sustainable change.", hi: "सुधार की प्रक्रिया से प्यार करना ही टिकाऊ परिवर्तन को प्रेरित करता है।" },
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

  // Delete existing content for this book to avoid duplicates
  await prisma.bookContent.deleteMany({ where: { bookId: atomicHabits.id } });

  const contentData = atomicHabitsQuotes.map((quote, i) => ({
    bookId: atomicHabits.id,
    chapterNumber: Math.floor(i / 5) + 1,
    chapterTitle: `Chapter ${Math.floor(i / 5) + 1}`,
    quoteIndex: i + 1,
    quotes: quote,
    descriptions: atomicHabitsDescriptions[i],
  }));

  await prisma.bookContent.createMany({ data: contentData });
  console.log(`✓ 31 quotes seeded for Atomic Habits`);

  // ─── Admin User ───────────────────────────────────────
  await prisma.user.upsert({
    where: { phone: "+910000000000" },
    update: {},
    create: {
      phone: "+910000000000",
      email: "admin@bookshelf.com",
      preferredLanguage: "en",
      role: "ADMIN",
    },
  });

  console.log(`✓ Admin user seeded (phone: +910000000000, OTP: 1234)`);

  console.log("\nSeeding complete!");
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
