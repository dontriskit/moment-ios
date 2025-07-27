import "dotenv/config";
import { db } from "@/server/db";
import { categories, activations, achievements, authors, tags, articles, articleTags, ulepszeniaCollections, collectionItems } from "@/server/db/schema";

async function seed() {
  console.log("🌱 Seedowanie bazy danych...");

  // Seed categories
  const categoryData = [
    { name: "Szczęście", slug: "szczescie", description: "Popraw swój nastrój i znajdź radość", color: "#F59E0B", icon: "sun" },
    { name: "Motywacja", slug: "motywacja", description: "Zainspiruj się i działaj", color: "#EF4444", icon: "flame" },
    { name: "Energia", slug: "energia", description: "Zwiększ swój poziom energii", color: "#EC4899", icon: "zap" },
    { name: "Relaks", slug: "relaks", description: "Znajdź spokój i wyciszenie", color: "#10B981", icon: "flower" },
    { name: "Skupienie", slug: "skupienie", description: "Popraw koncentrację", color: "#3B82F6", icon: "target" },
    { name: "Poranek", slug: "poranek", description: "Zacznij dzień we właściwy sposób", color: "#F97316", icon: "sunrise" },
    { name: "Wieczór", slug: "wieczor", description: "Wycisz się przed snem", color: "#6366F1", icon: "moon" },
    { name: "Początkujący", slug: "poczatkujacy", description: "Idealne na początek", color: "#8B5CF6", icon: "sparkles" },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoryData)
    .returning();

  console.log(`✅ Dodano ${insertedCategories.length} kategorii`);

  // Seed activations
  const activationData = [
    {
      title: "Transformacja Myślenia",
      description: "Przeprogramuj swoją podświadomość na sukces i obfitość",
      durationSeconds: 300, // 5 minut
      audioUrl: "/ulepszenie-1.wav", // Using the actual audio file
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
      categoryId: insertedCategories.find(c => c.slug === "motywacja")?.id,
      status: "published" as const,
      publishedAt: new Date(),
      featured: true,
    },
    {
      title: "Poranny Zastrzyk Energii",
      description: "Rozpocznij dzień z odnowioną energią i skupieniem",
      durationSeconds: 300,
      audioUrl: "/ulepszenie-1.wav", // Same audio for demo purposes
      imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400",
      categoryId: insertedCategories.find(c => c.slug === "poranek")?.id,
      status: "published" as const,
      publishedAt: new Date(),
      featured: false,
    },
    {
      title: "Budowanie Pewności Siebie",
      description: "Zbuduj niezachwianą pewność siebie od wewnątrz",
      durationSeconds: 420,
      audioUrl: "/ulepszenie-1.wav",
      imageUrl: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=400",
      categoryId: insertedCategories.find(c => c.slug === "motywacja")?.id,
      status: "published" as const,
      publishedAt: new Date(),
      featured: false,
    },
    {
      title: "Wieczorne Wyciszenie",
      description: "Uwolnij stres dnia i przygotuj się do odpoczynku",
      durationSeconds: 600,
      audioUrl: "/ulepszenie-1.wav",
      imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400",
      categoryId: insertedCategories.find(c => c.slug === "wieczor")?.id,
      status: "published" as const,
      publishedAt: new Date(),
      featured: true,
    },
    {
      title: "Przepływ Skupienia",
      description: "Wejdź w stan głębokiego skupienia i produktywności",
      durationSeconds: 480,
      audioUrl: "/ulepszenie-1.wav",
      imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
      categoryId: insertedCategories.find(c => c.slug === "skupienie")?.id,
      status: "published" as const,
      publishedAt: new Date(),
      featured: false,
    },
    {
      title: "Aktywacja Szczęścia",
      description: "Aktywuj uczucia radości i zadowolenia",
      durationSeconds: 360,
      audioUrl: "/ulepszenie-1.wav",
      imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400",
      categoryId: insertedCategories.find(c => c.slug === "szczescie")?.id,
      status: "published" as const,
      publishedAt: new Date(),
      featured: false,
    },
  ];

  const insertedActivations = await db
    .insert(activations)
    .values(activationData.filter(a => a.categoryId))
    .returning();

  console.log(`✅ Dodano ${insertedActivations.length} ulepszeń`);

  // Seed achievements
  const achievementData = [
    {
      name: "Pierwsze Kroki",
      description: "Ukończ swoje pierwsze ulepszenie",
      type: "activation_count",
      milestone: 1,
      badgeImageUrl: "https://example.com/badges/first-steps.png",
    },
    {
      name: "Zaangażowany",
      description: "Ukończ 5 ulepszeń",
      type: "activation_count",
      milestone: 5,
      badgeImageUrl: "https://example.com/badges/committed.png",
    },
    {
      name: "Oddany",
      description: "Ukończ 25 ulepszeń",
      type: "activation_count",
      milestone: 25,
      badgeImageUrl: "https://example.com/badges/dedicated.png",
    },
    {
      name: "Transformacja",
      description: "Ukończ 100 ulepszeń",
      type: "activation_count",
      milestone: 100,
      badgeImageUrl: "https://example.com/badges/transformation.png",
    },
    {
      name: "Konsekwentny",
      description: "Utrzymaj 7-dniową serię",
      type: "streak_days",
      milestone: 7,
      badgeImageUrl: "https://example.com/badges/consistent.png",
    },
    {
      name: "Niepowstrzymany",
      description: "Utrzymaj 30-dniową serię",
      type: "streak_days",
      milestone: 30,
      badgeImageUrl: "https://example.com/badges/unstoppable.png",
    },
  ];

  const insertedAchievements = await db
    .insert(achievements)
    .values(achievementData)
    .returning();

  console.log(`✅ Dodano ${insertedAchievements.length} osiągnięć`);

  // Seed authors
  const authorData = [
    {
      name: "Jan Kowalski",
      slug: "jan-kowalski",
      bio: "Ekspert w dziedzinie rozwoju osobistego i mindfulness.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
    {
      name: "Anna Nowak",
      slug: "anna-nowak",
      bio: "Psycholog i trener mentalny z 15-letnim doświadczeniem.",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
  ];

  const insertedAuthors = await db
    .insert(authors)
    .values(authorData)
    .returning();

  console.log(`✅ Dodano ${insertedAuthors.length} autorów`);

  // Seed tags
  const tagData = [
    { name: "Mindfulness", slug: "mindfulness", description: "Techniki uważności", color: "#10B981" },
    { name: "Rozwój osobisty", slug: "rozwoj-osobisty", description: "Artykuły o rozwoju osobistym", color: "#3B82F6" },
    { name: "Zdrowie mentalne", slug: "zdrowie-mentalne", description: "Dbanie o zdrowie psychiczne", color: "#8B5CF6" },
    { name: "Produktywność", slug: "produktywnosc", description: "Zwiększanie efektywności", color: "#F59E0B" },
    { name: "Medytacja", slug: "medytacja", description: "Techniki medytacyjne", color: "#EC4899" },
  ];

  const insertedTags = await db
    .insert(tags)
    .values(tagData)
    .returning();

  console.log(`✅ Dodano ${insertedTags.length} tagów`);

  // Seed collections
  const collectionData = [
    {
      name: "Nowości tygodnia",
      description: "Najnowsze ulepszenia dodane w tym tygodniu",
      type: "new",
      isActive: true,
      position: 0,
    },
    {
      name: "Odkrywaj spokój",
      description: "Kolekcja ulepszeń dla relaksu i wyciszenia",
      type: "odkrywaj",
      isActive: true,
      position: 1,
    },
    {
      name: "Wyzwanie 7 dni",
      description: "Tygodniowe wyzwanie transformacji",
      type: "wyzwania",
      isActive: true,
      position: 2,
    },
  ];

  const insertedCollections = await db
    .insert(ulepszeniaCollections)
    .values(collectionData)
    .returning();

  console.log(`✅ Dodano ${insertedCollections.length} kolekcji`);

  // Add some activations to collections
  const collectionItemsData = [
    {
      collectionId: insertedCollections[0]!.id,
      activationId: insertedActivations[0]!.id,
      position: 0,
    },
    {
      collectionId: insertedCollections[0]!.id,
      activationId: insertedActivations[1]!.id,
      position: 1,
    },
    {
      collectionId: insertedCollections[1]!.id,
      activationId: insertedActivations[3]!.id,
      position: 0,
    },
    {
      collectionId: insertedCollections[1]!.id,
      activationId: insertedActivations[2]!.id,
      position: 1,
    },
  ];

  await db
    .insert(collectionItems)
    .values(collectionItemsData);

  console.log(`✅ Dodano elementy do kolekcji`);

  console.log("✨ Seedowanie zakończone!");
}

// Run the seed function
seed()
  .catch((e) => {
    console.error("❌ Seedowanie nie powiodło się:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });