const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');

// Pseudo-random deterministic generator based on string hash
function createSeededRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash / 233280);
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

const CATEGORY_HOOKS = {
  'college-girl': [
    'brings a youthful, energetic, and playful vibe',
    'is a modern, ambitious student who loves lively conversation and fun outings',
    'offers a refreshing, sweet, and down-to-earth companionship experience',
    'is naturally cheerful, charming, and loves sharing relaxed, unhurried moments',
    'combines casual elegance with an open-minded, spontaneous personality',
    'loves cozy cafe dates, indie music, and late-night lighthearted chats'
  ],
  'air-hostess': [
    'embodies poise, international grace, and worldly charm',
    'is a well-traveled globetrotter with impeccable social etiquette',
    'possesses an elegant demeanor, fluent conversational flair, and refined styling',
    'is accustomed to five-star hospitality and executive social standards',
    'brings cultured conversation and sophisticated company for discerning guests',
    'is naturally polite, punctual, and effortlessly graceful in any social setting'
  ],
  'celebrity': [
    'commands attention with striking glamour and captivating red-carpet presence',
    'is a high-profile luxury muse who complements executive social engagements',
    'delivers an ultra-exclusive, premium companion experience with unmatched style',
    'is accustomed to luxury lifestyle, high-fashion styling, and VIP discretion',
    'offers charismatic presence and elite social companionship for private occasions',
    'combines breathtaking aesthetics with an enchanting, magnetic aura'
  ],
  'elite': [
    'represents top-tier sophistication and bespoke companion luxury',
    'is designed for refined gentlemen who appreciate high standards and exclusivity',
    'brings radiant confidence, intelligent dialogue, and graceful social manners',
    'is comfortable in five-star hotel lounges, private dinners, and executive galas',
    'exemplifies classic beauty blended with high-class etiquette and poise',
    'offers polished companionship where luxury and mutual respect meet effortlessly'
  ],
  'vip': [
    'stands out with a bold, seductive confidence and VIP exclusivity',
    'is a glamorous companion who knows how to make every meeting memorable',
    'blends charismatic elegance with an attentive, warm-hearted connection',
    'is tailored for distinguished clients seeking premium, hassle-free meetings',
    'provides five-star private suite companionship with absolute discretion',
    'has a magnetic charm that turns ordinary evenings into extraordinary memories'
  ],
  'high-profile': [
    'is a confident, chic companion who moves comfortably in high-society circles',
    'delivers discreet, executive-grade companionship for business and leisure',
    'prides herself on privacy, punctuality, and an upscale, fashionable lifestyle',
    'is an engaging conversationalist who appreciates fine wine and intimate dining',
    'offers an exclusive retreat from the fast-paced demands of corporate life',
    'ensures a polished, memorable experience with zero compromises on quality'
  ],
  'companion': [
    'is a warm, empathetic companion who truly listens and makes you feel relaxed',
    'focuses on authentic connection, emotional comfort, and calm peaceful vibes',
    'is ideal for stress-free evenings, intimate dinners, and soothing company',
    'brings genuine kindness, a soft-spoken charm, and deep attentiveness',
    'loves meaningful conversations, slow evenings, and uncomplicated moments',
    'creates an inviting, judgment-free space where you can completely unwind'
  ],
  'housewife': [
    'offers grounded, mature warmth and a naturally caring touch',
    'is understanding, unhurried, and appreciates genuine, respectful chemistry',
    'brings sensual maturity and a comforting, welcoming personality',
    'is perfect for gentlemen seeking an authentic, discreet, and relaxed bond',
    'values emotional harmony, quiet privacy, and deep mutual understanding',
    'provides a cozy, nurturing atmosphere where you feel valued and respected'
  ],
  'independent': [
    'is a strictly self-managed companion with 100% direct communication',
    'operates with full transparency, genuine unfiltered photos, and zero middlemen',
    'believes in honest chemistry, mutual courtesy, and clear mutual expectations',
    'is confident, friendly, and straightforward to coordinate with on WhatsApp',
    'values her independence and treats every genuine gentleman with great respect',
    'ensures a safe, comfortable, and discreet meeting without advance hassles'
  ]
};

const VIBE_PARAGRAPHS = [
  'When spending time together, she focuses on creating a comfortable, relaxed atmosphere where you can leave everyday stress behind. Whether you prefer an intimate candlelit dinner, unwinding over deep conversation in a luxury hotel suite, or a quiet private escape, she adapts naturally to your rhythm and mood.',
  'Known for her captivating smile and charming conversational flow, she effortlessly keeps the mood upbeat, relaxed, and genuinely engaging. She values quality time and ensures every moment spent in her company feels organic, unhurried, and special.',
  'Her warm demeanor makes it easy to feel completely at ease right from the first minute. She enjoys discussing travel, lifestyle, art, cinema, and current trends, making her an exceptional companion for both intellectual banter and relaxed personal connection.',
  'She believes that the best companionship stems from mutual chemistry and respect. Her attentive nature means she is completely present in the moment, ensuring your time together feels genuine, private, and deeply fulfilling.',
  'From stylish social outings to peaceful private evenings, her adaptable personality fits seamlessly into your plans. She is cultured, respectful of your time, and genuinely loves meeting refined, polite gentlemen.',
  'She takes pride in maintaining top-tier personal grooming, fitness, and elegance. Her soft-spoken charm, gentle touch, and polite nature guarantee an unforgettable experience tailored around your comfort and privacy.',
  'Whether accompanying you on an evening dinner date or sharing relaxed private hours away from the city bustle, she brings a soothing, peaceful aura that helps you recharge and completely unwind.',
  'Her easy-going nature and sparkling humor make any setting feel lively and warm. She values discretion above all else, allowing you to enjoy her charming company with complete peace of mind.'
];

const DISCRETION_PARAGRAPHS = [
  'Privacy and discretion are strictly upheld at all times. She is available for direct coordination on WhatsApp with zero agency intervention, ensuring complete confidentiality for both sides.',
  'All meetings are coordinated directly with her on WhatsApp (+91 6351615378). She requests polite, respectful communication from gentlemen who value genuine, discrete companionship.',
  'She maintains strict standards of hygiene, safety, and mutual respect. For genuine bookings and real-time availability in the area, connect directly with her on WhatsApp.',
  'With 100% verified real photos and no advance payment requirements, she offers a transparent, honest, and reliable companionship experience. Discreet gentlemen are always warmly welcomed.',
  'She respects your personal space and schedule. Advance notice via direct WhatsApp message is appreciated to ensure she can dedicate her undivided attention to your meeting.',
  'Complete confidentiality is guaranteed. She meets polite, well-mannered individuals who appreciate high standards, mutual boundaries, and seamless direct communication.'
];

function generateDescription(profile, rng) {
  const name = profile.name;
  const cityName = profile.city?.name || 'the city';
  const stateName = profile.city?.state || '';
  const areaName = profile.area || `${cityName} Centre`;
  const catSlug = profile.category?.slug || 'independent';
  const catName = profile.category?.name || 'Independent';
  const age = profile.displayAge || 23;
  const height = profile.heightCm ? `${profile.heightCm} cm` : 'tall and graceful';
  const languages = (profile.languages && profile.languages.length) ? profile.languages.join(' and ') : 'English and Hindi';
  const availability = profile.availability ? profile.availability.toLowerCase() : 'flexible';

  const categoryHooks = CATEGORY_HOOKS[catSlug] || CATEGORY_HOOKS['independent'];
  const hook1 = pick(categoryHooks, rng);
  const hook2 = pick(categoryHooks.filter(h => h !== hook1), rng) || 'radiates effortless charm';

  // Paragraph 1: Personal Profile Intro
  const p1Templates = [
    `${name} is a verified ${age}-year-old ${catName.toLowerCase()} companion based in ${areaName}, ${cityName}. Standing ${height} with an elegant, photogenic presence, she ${hook1}. Fluent in ${languages}, she takes genuine pride in offering refined, unhurried companionship for gentlemen seeking quality over quantity.`,
    `Meet ${name}, an enchanting ${age}-year-old independent ${catName.toLowerCase()} model available for genuine meetings across ${areaName}, ${cityName}. With her graceful posture (${height}) and warm demeanor, she ${hook1}. She speaks ${languages} fluently and ${hook2}, ensuring every encounter is smooth, comfortable, and memorable.`,
    `A verified 18+ companion in ${areaName}, ${cityName}, ${name} (${age} years) ${hook1}. Measuring ${height}, she brings a rare combination of feminine elegance, wit, and poise. She communicates effortlessly in ${languages} and specializes in discreet, high-class companionship for discerning individuals.`,
    `Welcome to the verified profile of ${name}, a charming ${age}-year-old ${catName.toLowerCase()} companion residing in ${areaName}, ${cityName}. She ${hook1} and ${hook2}. Standing ${height} and conversant in ${languages}, she is preferred by gentlemen who value polite etiquette and genuine authenticity.`,
    `${name} (${age} yrs, ${height}) is an independent ${catName.toLowerCase()} companion offering five-star hospitality in ${areaName}, ${cityName}. She ${hook1}. Whether for an intimate evening or private relaxation, she communicates fluently in ${languages} and brings natural grace to every setting.`
  ];
  const p1 = pick(p1Templates, rng);

  // Paragraph 2: Vibe & Experience
  const p2 = pick(VIBE_PARAGRAPHS, rng);

  // Paragraph 3: Availability & Discretion
  const p3Close = pick(DISCRETION_PARAGRAPHS, rng);
  const p3 = `Her schedule is typically ${availability}, accommodating both scheduled engagements and last-minute plans when possible. ${p3Close}`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}

function generateSeoDescription(profile, rng) {
  const name = profile.name;
  const cityName = profile.city?.name || 'India';
  const areaName = profile.area || cityName;
  const age = profile.displayAge || 23;
  const catName = profile.category?.name || 'Escort';

  const templates = [
    `Meet ${name} (${age} yrs), verified ${catName.toLowerCase()} companion in ${areaName}, ${cityName}. 100% genuine photos, polite etiquette & direct WhatsApp 6351615378.`,
    `Connect with ${name} in ${areaName}, ${cityName}. 18+ verified ${catName.toLowerCase()} with real photos, complete discretion & direct WhatsApp contact (+91 6351615378).`,
    `Verified independent companion ${name} (${age} yrs) in ${areaName}, ${cityName}. Elegant, discreet & real photos. Direct WhatsApp booking with zero middlemen.`,
    `Book ${name} in ${areaName}, ${cityName}. Premium 18+ ${catName.toLowerCase()} companion, genuine pictures, 100% privacy & direct WhatsApp (+91 6351615378).`
  ];
  return pick(templates, rng);
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  console.log('Fetching all profiles with cities and categories...');
  const profiles = await Profile.find({})
    .populate('city', 'name state slug')
    .populate('category', 'name slug')
    .lean();

  console.log(`Found ${profiles.length} profiles to update.`);

  const bulkOps = [];
  const generatedDescriptions = new Set();

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const rng = createSeededRandom(String(profile._id) + (profile.name || '') + i);

    let desc = generateDescription(profile, rng);
    // Ensure 100% uniqueness in the rare case of collision
    if (generatedDescriptions.has(desc)) {
      desc += `\n\nDirect contact reference: REF-${String(profile._id).slice(-6).toUpperCase()}.`;
    }
    generatedDescriptions.add(desc);

    const seoDesc = generateSeoDescription(profile, rng);

    bulkOps.push({
      updateOne: {
        filter: { _id: profile._id },
        update: {
          $set: {
            description: desc,
            seoDescription: seoDesc
          }
        }
      }
    });
  }

  console.log(`Generated ${generatedDescriptions.size} unique descriptions.`);
  console.log('Executing bulkWrite in batches of 500...');

  const batchSize = 500;
  for (let i = 0; i < bulkOps.length; i += batchSize) {
    const batch = bulkOps.slice(i, i + batchSize);
    await Profile.bulkWrite(batch);
    console.log(`Updated ${Math.min(i + batchSize, bulkOps.length)} / ${bulkOps.length} profiles...`);
  }

  console.log('\n--- VERIFICATION SAMPLES ---');
  const sampleUpdates = await Profile.find({}).limit(4).populate('city category').lean();
  sampleUpdates.forEach((p, idx) => {
    console.log(`\n[Sample ${idx + 1}] ${p.name} (${p.category?.name}) - ${p.area}, ${p.city?.name}:`);
    console.log(p.description);
    console.log('SEO Description:', p.seoDescription);
  });

  const distinctCount = await Profile.distinct('description');
  console.log('\nTotal profiles in DB:', profiles.length);
  console.log('Total distinct descriptions:', distinctCount.length);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
