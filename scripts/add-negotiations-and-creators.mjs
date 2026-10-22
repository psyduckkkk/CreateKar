import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL missing.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Setting up contract_negotiations table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS contract_negotiations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id),
        sender_name VARCHAR(255) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        proposed_gross_amount_inr INT,
        proposed_advance_percent INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Seeding diverse Indian creators for Agency Explore roster...");
    const passwordHash = await bcrypt.hash("password123", 10);

    const creators = [
      {
        name: "Ananya Sharma",
        email: "ananya.finance@createkar.com",
        phone: "+91 9811122334",
        niche: "Finance & Wealth",
        bio: "CA and SEBI-registered advisor decoding personal finance, index funds, and tax planning for millennials.",
        instagram: "@ananya_invests",
        youtube: "youtube.com/@ananyafinance",
        followers: 850000,
        rate: 95000,
        upi: "ananya@oksbi",
        plan: "influencer",
        badge: "famous",
        boostDays: 28,
        gstin: "27AAACF8912P1Z3"
      },
      {
        name: "Kabir Mehta",
        email: "kabir.fit@createkar.com",
        phone: "+91 9822233445",
        niche: "Fitness & Nutrition",
        bio: "Strength coach and certified sports nutritionist. Evidence-based workout routines and clean eating.",
        instagram: "@kabir_ironfit",
        youtube: "youtube.com/@kabirfit",
        followers: 280000,
        rate: 45000,
        upi: "kabir@okhdfcbank",
        plan: "pro",
        badge: "verified",
        boostDays: 0,
        gstin: "27BBBCM4321A1Z2"
      },
      {
        name: "Dr. Priya Nair",
        email: "dr.priya@createkar.com",
        phone: "+91 9833344556",
        niche: "Health & Medicine",
        bio: "Dermatologist and preventative health advocate. Debunking medical myths with peer-reviewed research.",
        instagram: "@drpriya_skin",
        youtube: "youtube.com/@drpriyanair",
        followers: 340000,
        rate: 55000,
        upi: "priya@okaxis",
        plan: "pro",
        badge: "verified",
        boostDays: 14,
        gstin: "32CCCCN8765B1Z4"
      },
      {
        name: "Vikramaditya Roy",
        email: "vikram.auto@createkar.com",
        phone: "+91 9844455667",
        niche: "Automotive & EVs",
        bio: "Ex-automotive engineer testing electric vehicles, highway road trips, and deep-dive telemetry reviews.",
        instagram: "@vikram_drives",
        youtube: "youtube.com/@vikramadityaroy",
        followers: 1200000,
        rate: 135000,
        upi: "vikram@okicici",
        plan: "influencer",
        badge: "famous",
        boostDays: 20,
        gstin: "29DDDDV2468C1Z6"
      },
      {
        name: "Tanvi Patel",
        email: "tanvi.beauty@createkar.com",
        phone: "+91 9855566778",
        niche: "Beauty & Skincare",
        bio: "Cosmetic chemistry student reviewing Indian skin tones, sunscreen testing, and gentle barrier repair.",
        instagram: "@tanviskin",
        youtube: "youtube.com/@tanviskincare",
        followers: 210000,
        rate: 40000,
        upi: "tanvi@okpaytm",
        plan: "pro",
        badge: "verified",
        boostDays: 0,
        gstin: "24EEEEP1357D1Z8"
      },
      {
        name: "Sameer Joshi",
        email: "sameer.gaming@createkar.com",
        phone: "+91 9866677889",
        niche: "Gaming & Esports",
        bio: "Competitive PC gamer and tournament caster. PC building guides, peripheral roundups, and live streaming.",
        instagram: "@sameer_plays",
        youtube: "youtube.com/@sameerjoshi",
        followers: 140000,
        rate: 25000,
        upi: "sameer@okaxis",
        plan: "basic",
        badge: "none",
        boostDays: 0,
        gstin: null
      },
      {
        name: "Sneha Iyer",
        email: "sneha.travel@createkar.com",
        phone: "+91 9877788990",
        niche: "Travel & Heritage",
        bio: "Solo backpacking across Tier-2 Indian heritage circuits, train journeys, and vernacular architecture.",
        instagram: "@sneha_trails",
        youtube: "youtube.com/@snehaiyer",
        followers: 390000,
        rate: 50000,
        upi: "sneha@oksbi",
        plan: "pro",
        badge: "verified",
        boostDays: 7,
        gstin: "33FFFFS9876E1Z0"
      },
      {
        name: "Aditya Malhotra",
        email: "aditya.saas@createkar.com",
        phone: "+91 9888899001",
        niche: "Productivity & SaaS",
        bio: "Bootstrapped founder testing AI tools, Notion systems, and remote work automations for knowledge workers.",
        instagram: "@adityabuilds",
        youtube: "youtube.com/@adityamalhotra",
        followers: 190000,
        rate: 60000,
        upi: "aditya@okhdfcbank",
        plan: "pro",
        badge: "verified",
        boostDays: 10,
        gstin: "07GGGGA4567F1Z2"
      },
      {
        name: "Ritu Sen",
        email: "ritu.sustainable@createkar.com",
        phone: "+91 9899900112",
        niche: "Sustainable Living",
        bio: "Handloom textiles, zero-waste kitchen, composting in apartments, and slow fashion enthusiast.",
        instagram: "@ritu_slowliving",
        youtube: "youtube.com/@rituslowliving",
        followers: 160000,
        rate: 35000,
        upi: "ritu@okicici",
        plan: "basic",
        badge: "none",
        boostDays: 0,
        gstin: null
      },
      {
        name: "Devendra Rao",
        email: "devendra.food@createkar.com",
        phone: "+91 9800011223",
        niche: "Culinary & Regional Food",
        bio: "Uncovering forgotten royal recipes of South India, traditional clay pot cooking, and spice sourcing.",
        instagram: "@devendra_cooks",
        youtube: "youtube.com/@devendrarao",
        followers: 510000,
        rate: 70000,
        upi: "devendra@oksbi",
        plan: "pro",
        badge: "verified",
        boostDays: 12,
        gstin: "36HHHHH1234G1Z5"
      },
      {
        name: "Natasha Verma",
        email: "natasha.design@createkar.com",
        phone: "+91 9812345678",
        niche: "Architecture & Interiors",
        bio: "Principal architect showcasing modern Indian residential spaces, daylighting, and sustainable materials.",
        instagram: "@natasha_spaces",
        youtube: "youtube.com/@natashaspaces",
        followers: 310000,
        rate: 65000,
        upi: "natasha@okhdfcbank",
        plan: "pro",
        badge: "verified",
        boostDays: 5,
        gstin: "06JJJJN7890H1Z7"
      },
      {
        name: "Karan Johar Sharma",
        email: "karan.cinema@createkar.com",
        phone: "+91 9823456789",
        niche: "Cinema & Filmmaking",
        bio: "Cinematography breakdowns, lighting gear breakdowns, and interviews with indie film colorists.",
        instagram: "@karan_cine",
        youtube: "youtube.com/@karancinema",
        followers: 430000,
        rate: 80000,
        upi: "karan@okaxis",
        plan: "influencer",
        badge: "famous",
        boostDays: 18,
        gstin: "27KKKKK5678I1Z9"
      }
    ];

    for (const c of creators) {
      let existing = await client.query("SELECT id FROM users WHERE email = $1", [c.email]);
      let uid;
      if (existing.rows.length === 0) {
        const uRes = await client.query(
          `INSERT INTO users (email, password_hash, role, name, phone, status)
           VALUES ($1, $2, 'CREATOR', $3, $4, 'ACTIVE')
           RETURNING id`,
          [c.email, passwordHash, c.name, c.phone]
        );
        uid = uRes.rows[0].id;

        const boostDate = c.boostDays > 0 ? new Date(Date.now() + c.boostDays * 86400000) : null;

        await client.query(
          `INSERT INTO creator_profiles (
            user_id, niche, bio, instagram_handle, youtube_handle, followers_count,
            base_rate_inr, upi_id, gstin, plan_tier, badge_type, boost_active_until
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            uid, c.niche, c.bio, c.instagram, c.youtube, c.followers,
            c.rate, c.upi, c.gstin, c.plan, c.badge, boostDate
          ]
        );
      }
    }

    console.log("Successfully seeded 12 creators with diverse niches, boost states, and badges!");
  } catch (err) {
    console.error("Error setting up negotiations and creators:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
