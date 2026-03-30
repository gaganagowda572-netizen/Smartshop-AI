import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("Starting server...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Log all requests
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  interface Product {
    id: number;
    name: string;
    platform: string;
    price: number;
    deliveryTime: number;
    rating: number;
    buyUrl: string;
    isSearchLink?: boolean;
    // Advanced AI Fields
    originalPrice?: number;
    priceHistory?: number[]; // Last 7 days
    category?: string;
  }

  // Mock Dataset
  const products: Product[] = [
    { id: 1, name: "iPhone 15", platform: "Amazon", price: 69900, originalPrice: 79900, deliveryTime: 48, rating: 4.5, buyUrl: "https://www.amazon.in/dp/B0CHX1W1XY", category: "electronics", priceHistory: [72000, 71500, 71000, 70500, 70000, 69900, 69900] },
    { id: 2, name: "iPhone 15", platform: "Flipkart", price: 68500, originalPrice: 79900, deliveryTime: 72, rating: 4.4, buyUrl: "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4", category: "electronics", priceHistory: [69000, 68800, 68700, 68600, 68500, 68500, 68500] },
    { id: 3, name: "iPhone 15", platform: "Zepto", price: 72000, originalPrice: 72000, deliveryTime: 0.5, rating: 4.6, buyUrl: "https://www.zeptonow.com/search?query=iphone+15", category: "electronics", priceHistory: [72000, 72000, 72000, 72000, 72000, 72000, 72000] },
    { id: 4, name: "Milk (1L)", platform: "Amazon", price: 65, deliveryTime: 24, rating: 4.2, buyUrl: "https://www.amazon.in/dp/B08L5V9B9B", category: "grocery" },
    { id: 5, name: "Milk (1L)", platform: "Flipkart", price: 62, deliveryTime: 48, rating: 4.0, buyUrl: "https://www.flipkart.com/search?q=milk", category: "grocery" },
    { id: 6, name: "Milk (1L)", platform: "Zepto", price: 68, deliveryTime: 0.2, rating: 4.8, buyUrl: "https://www.zeptonow.com/search?query=milk", category: "grocery" },
    { id: 7, name: "Sony WH-1000XM5", platform: "Amazon", price: 29990, originalPrice: 34990, deliveryTime: 24, rating: 4.7, buyUrl: "https://www.amazon.in/dp/B09XS7JWHH", category: "electronics", priceHistory: [31000, 30500, 30000, 29990, 29990, 29990, 29990] },
    { id: 8, name: "Sony WH-1000XM5", platform: "Flipkart", price: 28990, originalPrice: 34990, deliveryTime: 48, rating: 4.6, buyUrl: "https://www.flipkart.com/sony-wh-1000xm5-wireless-noise-cancelling-headphones/p/itm123456789", category: "electronics", priceHistory: [29500, 29200, 29000, 28990, 28990, 28990, 28990] },
    { id: 9, name: "Sony WH-1000XM5", platform: "Zepto", price: 31000, originalPrice: 31000, deliveryTime: 1, rating: 4.8, buyUrl: "https://www.zeptonow.com/search?query=sony+headphones", category: "electronics" },
    { id: 10, name: "Bread", platform: "Amazon", price: 45, deliveryTime: 24, rating: 4.1, buyUrl: "https://www.amazon.in/dp/B08L5V9B9B", category: "grocery" },
    { id: 11, name: "Bread", platform: "Flipkart", price: 42, deliveryTime: 48, rating: 3.9, buyUrl: "https://www.flipkart.com/search?q=bread", category: "grocery" },
    { id: 12, name: "Bread", platform: "Zepto", price: 50, deliveryTime: 0.3, rating: 4.5, buyUrl: "https://www.zeptonow.com/search?query=bread", category: "grocery" },
    // Clothes
    { id: 13, name: "Cotton T-Shirt", platform: "Amazon", price: 499, originalPrice: 999, deliveryTime: 48, rating: 4.3, buyUrl: "https://www.amazon.in/s?k=cotton+tshirt", category: "fashion" },
    { id: 14, name: "Cotton T-Shirt", platform: "Flipkart", price: 449, originalPrice: 1299, deliveryTime: 72, rating: 4.1, buyUrl: "https://www.flipkart.com/search?q=cotton+tshirt", category: "fashion" },
    { id: 15, name: "Cotton T-Shirt", platform: "Zepto", price: 599, originalPrice: 599, deliveryTime: 1, rating: 4.5, buyUrl: "https://www.zeptonow.com/search?query=tshirt", category: "fashion" },
    { id: 16, name: "Blue Jeans", platform: "Amazon", price: 1499, originalPrice: 2999, deliveryTime: 48, rating: 4.4, buyUrl: "https://www.amazon.in/s?k=blue+jeans", category: "fashion" },
    { id: 17, name: "Blue Jeans", platform: "Flipkart", price: 1299, originalPrice: 3499, deliveryTime: 72, rating: 4.2, buyUrl: "https://www.flipkart.com/search?q=blue+jeans", category: "fashion" },
    { id: 18, name: "Denim Jacket", platform: "Amazon", price: 2499, originalPrice: 4999, deliveryTime: 48, rating: 4.6, buyUrl: "https://www.amazon.in/s?k=denim+jacket", category: "fashion" },
    { id: 19, name: "Denim Jacket", platform: "Flipkart", price: 2199, originalPrice: 5999, deliveryTime: 72, rating: 4.5, buyUrl: "https://www.flipkart.com/search?q=denim+jacket", category: "fashion" },
  ];

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "connected", timestamp: new Date().toISOString() });
  });

  // API endpoint for product search
  app.get("/api/search", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const profile = (req.query.profile as string || "budget").toLowerCase();
    
    if (!query) {
      return res.json([]);
    }

    let filtered = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.platform.toLowerCase().includes(query)
    );

    // Fallback: If no exact matches, generate search links for all platforms
    if (filtered.length === 0) {
      const encodedQuery = encodeURIComponent(query);
      filtered = [
        { 
          id: Date.now() + 1, 
          name: `Search "${query}"`, 
          platform: "Amazon", 
          price: 0, 
          deliveryTime: 24, 
          rating: 4.0, 
          buyUrl: `https://www.amazon.in/s?k=${encodedQuery}`,
          isSearchLink: true 
        },
        { 
          id: Date.now() + 2, 
          name: `Search "${query}"`, 
          platform: "Flipkart", 
          price: 0, 
          deliveryTime: 48, 
          rating: 4.0, 
          buyUrl: `https://www.flipkart.com/search?q=${encodedQuery}`,
          isSearchLink: true 
        },
        { 
          id: Date.now() + 3, 
          name: `Search "${query}"`, 
          platform: "Zepto", 
          price: 0, 
          deliveryTime: 0.5, 
          rating: 4.0, 
          buyUrl: `https://www.zeptonow.com/search?query=${encodedQuery}`,
          isSearchLink: true 
        }
      ];
    }

    // AI Scoring Logic
    // Find max values for normalization
    const maxPrice = Math.max(...filtered.map(p => p.price));
    const maxDelivery = Math.max(...filtered.map(p => p.deliveryTime));
    const minPrice = Math.min(...filtered.map(p => p.price));

    // Profile-based weights
    let weights = { price: 0.5, delivery: 0.3, rating: 0.2 };
    if (profile === "student") weights = { price: 0.6, delivery: 0.1, rating: 0.3 };
    if (profile === "gamer") weights = { price: 0.3, delivery: 0.2, rating: 0.5 };
    if (profile === "budget") weights = { price: 0.8, delivery: 0.1, rating: 0.1 };

    const results = filtered.map(p => {
      // Find the most expensive version of THIS specific product
      const sameProducts = products.filter(item => item.name === p.name);
      const productMaxPrice = Math.max(...sameProducts.map(item => item.price));
      
      // Normalize values (0 to 1, where 1 is best)
      const priceScore = maxPrice === minPrice ? 1 : (maxPrice - p.price) / (maxPrice - minPrice);
      const deliveryScore = maxDelivery === 0 ? 1 : (maxDelivery - p.deliveryTime) / maxDelivery;
      const ratingScore = p.rating / 5;

      // Weighted Total Score
      const totalScore = (priceScore * weights.price) + (deliveryScore * weights.delivery) + (ratingScore * weights.rating);
      
      // Calculate savings compared to the most expensive platform for this product
      const savings = productMaxPrice - p.price;

      // AI Verdict Logic
      let verdict = "Solid choice for your profile.";
      if (p.rating > 4.5 && p.price < productMaxPrice) verdict = "Exceptional value! High rating and great price.";
      if (p.deliveryTime < 1) verdict = "Need it now? This is the fastest option.";
      if (profile === "student" && p.price === minPrice) verdict = "Cheapest option found. Perfect for student budget.";
      
      // Best Time to Buy Logic (Simulated)
      let bestTimeToBuy = "Buy Now";
      if (p.priceHistory && p.priceHistory[p.priceHistory.length - 1] > Math.min(...p.priceHistory)) {
        bestTimeToBuy = "Wait (Price Drop Expected)";
      }

      // Fake Discount Detection
      const isFakeDiscount = p.originalPrice ? (p.originalPrice / p.price > 2 && p.category === "fashion") : false;

      return {
        ...p,
        score: totalScore,
        savings: savings,
        aiVerdict: verdict,
        bestTimeToBuy: bestTimeToBuy,
        isFakeDiscount: isFakeDiscount
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Mark the best choice
    if (results.length > 0) {
      (results[0] as any).isBestChoice = true;
    }

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
