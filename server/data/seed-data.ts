import { 
  InsertCategory, 
  InsertArtisan, 
  InsertProduct,
  InsertReview
} from "@shared/schema";

// Seed data for the application
export const seedData = {
  categories: [
    {
      name: "Ceramics",
      slug: "ceramics",
      imageUrl: "https://pixabay.com/get/g3e458e7801599ab92fd0c75684c9639e8e873ecbaee95a61391d80db951149d3bfb3c4c7ea666d6d60f69f85e1eabec6dc7e60d31d62e83e57df310b650c40b4_1280.jpg"
    },
    {
      name: "Textiles",
      slug: "textiles",
      imageUrl: "https://images.unsplash.com/photo-1616486788371-62d930495c44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400"
    },
    {
      name: "Woodwork",
      slug: "woodwork",
      imageUrl: "https://pixabay.com/get/gdee55ccf8de94552879197198da57f66b0b1f370e3a535a6efa1b83fd270f6f398fc5140fa9c5a48ba53e561230c15b3ae64177b247df0cc46b50160e1fe5d44_1280.jpg"
    },
    {
      name: "Jewelry",
      slug: "jewelry",
      imageUrl: "https://pixabay.com/get/gfde21a6543e8521b215c00e509716f67d63e481f0c15f0805e729ce48d66eea0ff54ba55a20901e440a06f4fb36e8b3ceb70cf7e318cdef9c141fb8ba8e63d7a_1280.jpg"
    },
    {
      name: "Bath & Body",
      slug: "bath-body",
      imageUrl: "https://pixabay.com/get/g7ca96a08fab2d9d9fcee73ae4d6a4730ace9d05749833d5ff68934ffd1e5f9360dc42a3fa49f94ef27583354543a56b333ea900bf0eb6a8b7e75999ade36ee6b_1280.jpg"
    },
    {
      name: "Home Decor",
      slug: "home-decor",
      imageUrl: "https://pixabay.com/get/g3c99d94ec5fd4998f88eaf4b832a9cd09fe7b2ff7b9d0f451b04e40819b44dae49580c66a5e680b998ec7e83c68b818c1ded5aa4290015e19bb46125a48ec0d0_1280.jpg"
    }
  ] as InsertCategory[],
  
  artisans: [
    {
      name: "Maria Thompson",
      businessName: "Terra Pottery",
      description: "Creating functional ceramic art for over 15 years. Specializes in minimalist designs that highlight the natural beauty of clay.",
      imageUrl: "https://pixabay.com/get/g119607e69eafdbc5fd051ddcb8a93a158de03a721ee531b023e09611ad54c310d02109948c6c0a31f85040776b56f1e82796b499b706db443a8193c9de8602d1_1280.jpg",
      tags: ["Ceramics", "Home Decor"]
    },
    {
      name: "James Foster",
      businessName: "Woodland Studio",
      description: "Third-generation woodworker creating sustainable kitchen tools and home decor from responsibly sourced hardwoods.",
      imageUrl: "https://pixabay.com/get/g144de86bcc3b78547909bb9bd56121ed80d8edbad6c4cc29483c78122c2beac9521a2f6771e582b8accfc4fa02baaa265aaa75922743e2e1ea739809e9bc68fc_1280.jpg",
      tags: ["Woodwork", "Kitchen"]
    },
    {
      name: "Diana Rodriguez",
      businessName: "Fiber & Thread",
      description: "Weaver and textile artist creating contemporary wall hangings and textiles using traditional techniques and natural materials.",
      imageUrl: "https://images.unsplash.com/photo-1459478309853-2c33a60058e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=350",
      tags: ["Textiles", "Home Decor"]
    },
    {
      name: "Elena Chen",
      businessName: "Elena Crafts",
      description: "Passionate about natural ingredients and sustainable packaging. Creating handmade soaps and bath products with organic materials.",
      imageUrl: "https://pixabay.com/get/g7dc64c59b7e7c5624f15dca1bb1a6d43f3e0e7a61e3e9ead42ecc2c90ba0fe7324cd7752ab81efea6e4cc80a1f0e08d33c38faa27b22e05cc7e4bd98bc29fd03_1280.jpg",
      tags: ["Bath & Body", "Organic"]
    },
    {
      name: "Michael Reeves",
      businessName: "Silver Forge",
      description: "Metal artist specializing in handcrafted silver jewelry with nature-inspired designs. Each piece is unique and made with traditional silversmithing techniques.",
      imageUrl: "https://pixabay.com/get/g2f84fd6ef4c2a1ba5d5aa54fa9c5e80329eb4a1cb67a3ca45d6d1c43db8fd89e8cd29d08be78b43c17bfb25d7f1bda4ca9347e6c19d5c36e34eb71d49e1ac8d6_1280.jpg",
      tags: ["Jewelry", "Accessories"]
    }
  ] as InsertArtisan[],
  
  products: [
    {
      name: "Ceramic Handmade Mug",
      description: "Each of our ceramic mugs is handcrafted by skilled artisans using traditional pottery techniques. Made from locally sourced clay, these mugs go through a careful process of throwing, trimming, firing, and glazing to create a unique piece that's both beautiful and functional.",
      price: 28.00,
      categoryId: 1, // Ceramics
      artisanId: 1, // Terra Pottery
      isCustomizable: true,
      imageUrl: "https://pixabay.com/get/gaa936b5915af6863cdbe8500248c03ce956ac576e720b28c80f50b046a6b3f1a22e725bb241ec9f9052c655919c2e0c1ec0d819a0469230c545f733cdf22651a_1280.jpg",
      imageUrls: [
        "https://pixabay.com/get/gf568973cbf92005777226b7a88b9af6bac18bdf87759693c85af0b40ed1aa77492809a02c853dd2d9b3c21db2c21d5e3f85f7a5c27b6cc96e050aa1f61ba6c8e_1280.jpg",
        "https://pixabay.com/get/g7b84c345dd6a71ed90c1cd5285ca1fdcc6efdc178a2078cce9df29d85f7f957a189379733602e054eb3025d5b023aee75a87d3c4d379c0aa53fc7e0ea62a5d3c_1280.jpg",
        "https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200",
        "https://pixabay.com/get/ga96338b4e42c4abfe7aa63563827f1a4620edb213dcc2c53006ac0b7ced8ed6640d476081f3d626027d4afde86fb2f0be8eebb9659aa34c18b35e48ac797f696_1280.jpg"
      ],
      customizationOptions: JSON.stringify({
        colors: [
          { name: "Natural", value: "natural", hex: "#D7C0AE" },
          { name: "Brown", value: "brown", hex: "#8B5A2B" },
          { name: "Green", value: "green", hex: "#4A6741" },
          { name: "Charcoal", value: "charcoal", hex: "#4B4237" }
        ],
        sizes: [
          { name: "Small (8oz)", value: "small" },
          { name: "Medium (12oz)", value: "medium" },
          { name: "Large (16oz)", value: "large" }
        ],
        personalization: {
          maxLength: 10,
          additionalFee: 5
        }
      })
    },
    {
      name: "Woven Wall Hanging",
      description: "A beautiful handwoven wall hanging made with natural fibers and dyed with plant-based colors. Each piece is carefully crafted to add texture and warmth to any space. The earthy tones and organic design make this a stunning focal point for your home.",
      price: 85.00,
      categoryId: 2, // Textiles
      artisanId: 3, // Fiber & Thread
      isCustomizable: true,
      imageUrl: "https://pixabay.com/get/gb85dff241512c0c81c53fa8505d8863456fc3c59d7ba674f8ea6952b2ab49eef1261a000751bc98f899127f00d7aead2fc0bfc1abbd140ab926624f89ab296a3_1280.jpg",
      imageUrls: [
        "https://pixabay.com/get/gb85dff241512c0c81c53fa8505d8863456fc3c59d7ba674f8ea6952b2ab49eef1261a000751bc98f899127f00d7aead2fc0bfc1abbd140ab926624f89ab296a3_1280.jpg",
        "https://pixabay.com/get/g2e767c55ac29d4c9de36d63d09c0c9e2e07f6dcf0bd22fb5536da36fc7d52c06e29584ba96d5f92767b50d13bf5de0f8b5fc9aebbc3ed71fd58f97cf94db7f67_1280.jpg",
        "https://pixabay.com/get/g7b6bf6dd80b3d95d3b4e9222bb097c31b3ca64ec41bd4a5252ed53d50c3daa65ede7bdb75bfd6fef68e6e8d0ab73c9e29b5dbf36bcc7f5cc343ad4ea2d8fa3a1_1280.jpg",
        "https://pixabay.com/get/g6f24fd8e7b0c6af723a8a5d33ce3bc0a7c8a59a47e9b62b0e63c35b5c752b9db59a6fcd8de12fb16fdab8f81cde1bde10a3a36e7ba9ec1a87e47b5d47e08b7b2_1280.jpg"
      ],
      customizationOptions: JSON.stringify({
        colors: [
          { name: "Earth Tones", value: "earth", hex: "#C8B6A6" },
          { name: "Blues", value: "blue", hex: "#6096B4" },
          { name: "Neutrals", value: "neutral", hex: "#EEE3CB" }
        ],
        sizes: [
          { name: "Small (18\" x 24\")", value: "small" },
          { name: "Medium (24\" x 36\")", value: "medium" },
          { name: "Large (36\" x 48\")", value: "large" }
        ]
      })
    },
    {
      name: "Wooden Cutting Board",
      description: "This handcrafted wooden cutting board is made from sustainably harvested maple and walnut. The unique grain patterns and organic shape make each board one-of-a-kind. Perfect for food preparation or as a serving board for charcuterie and appetizers.",
      price: 45.00,
      categoryId: 3, // Woodwork
      artisanId: 2, // Woodland Studio
      isCustomizable: true,
      imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=500",
      imageUrls: [
        "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=500",
        "https://pixabay.com/get/g38a5a31e54fa2b21fa4a5cc73db3fe6d9f9b5b9a1cf3e0ba8b3c6df2c7fd0da3c4ce99fc33e649fb5b5d27a4bf3fe63a18a40c16ac1cfdc050c52ee60c6f2222_1280.jpg",
        "https://pixabay.com/get/gbba6f6cc29f3e580b60db5a9db2e5ef58a4c85e1c50e0c3329232dc92d44cec34b5962cf2e0b85b02f1fb54ef73f01c1a8dffd4ac85eba4f9bed22e7d9c09de7_1280.jpg",
        "https://pixabay.com/get/g7dc5cbeee64be8e4b77ff55c7b2e6cc8baf7b6a41e5d15a5a3c67ec38c10eafcf99a7e0d5ea0be7bb03b78af4c0a437a452f81b12ecc6cc0ebac54f1e90abab1_1280.jpg"
      ],
      customizationOptions: JSON.stringify({
        wood: [
          { name: "Maple", value: "maple", hex: "#F5DEB3" },
          { name: "Walnut", value: "walnut", hex: "#5E4B3E" },
          { name: "Cherry", value: "cherry", hex: "#954535" }
        ],
        sizes: [
          { name: "Small (8\" x 12\")", value: "small" },
          { name: "Medium (10\" x 15\")", value: "medium" },
          { name: "Large (12\" x 18\")", value: "large" }
        ],
        personalization: {
          maxLength: 15,
          additionalFee: 8
        }
      })
    },
    {
      name: "Natural Soap Set",
      description: "Our handcrafted soap set includes four unique bars made with all-natural ingredients like essential oils, herbs, and botanical extracts. Free from harsh chemicals, these soaps gently cleanse while nourishing your skin with moisturizing oils and butters.",
      price: 32.00,
      categoryId: 5, // Bath & Body
      artisanId: 4, // Elena Crafts
      isCustomizable: false,
      imageUrl: "https://pixabay.com/get/g1e848906fe5bcf9e80691f96d3140f82eb414afd78c7e66fe53dae8d423f7fd479d1d6083e3dfc7f920119010bd0e759ba47c1a336ff292a199d765bbe71fcd0_1280.jpg",
      imageUrls: [
        "https://pixabay.com/get/g1e848906fe5bcf9e80691f96d3140f82eb414afd78c7e66fe53dae8d423f7fd479d1d6083e3dfc7f920119010bd0e759ba47c1a336ff292a199d765bbe71fcd0_1280.jpg",
        "https://pixabay.com/get/g9ec3c30b02ef62adf3fa5d57b6bdb7f88afa4e4a6694c65642fe8db6f1068a92c98b25879cb63d834fd7b38d03c3339f7f35ed63c2e03d3b1d2a00eb1a3e9ae9_1280.jpg",
        "https://pixabay.com/get/gc26aac4ac2caeae066e98d8d56cdbb5c8b30bcbee6c0cde2cc1d1c6f99be23f0fe91183b797be2f9ba8f9a8ef82c86e92a4ef72ff53d97d1a8e72a95b9de96b7_1280.jpg",
        "https://pixabay.com/get/g88ffacb1afeadf95e57e23e8f2b6b3bd9dd5d9aeae9cea6e5e323e4c631b6acf644e59aaceab1ff775b74ca4c566d0b97d05cc8ffbab28e2ddb7e70e38e7a538_1280.jpg"
      ],
      customizationOptions: ""
    },
    {
      name: "Silver Leaf Pendant",
      description: "This handcrafted silver pendant features a delicate leaf design inspired by nature. Each pendant is carefully hand-formed and textured to capture the intricate details of a real leaf. Comes with an 18-inch sterling silver chain.",
      price: 65.00,
      categoryId: 4, // Jewelry
      artisanId: 5, // Silver Forge
      isCustomizable: true,
      imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=500",
      imageUrls: [
        "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=500",
        "https://pixabay.com/get/ga05a0bdc4f4f8b4c62e8af6c1e1b8f2f7bf5bc50bcb0b8fd1962a52a0c85d3a88d51f7bdd7d2cbf582f39b6fa4e909c56d7193c8de6f55b3e0e7c74b6b52b07b_1280.jpg",
        "https://pixabay.com/get/g7ba27f4d9fc0f67bf3ba90a252cae3e23a0e4c8d580afcfff67c83d33bc47ff71cd626d3b9dc7b1a6f33cdbcde7df2b31fca2e5ffb507c2a57e97aa28c4b6f2c_1280.jpg",
        "https://pixabay.com/get/g4bb2b3dfb67a2dfda00f38c9a8c09d371db1e8b6f7b75f3d4ac48e3b4c73e3f27b26bf11b16a98a6ce4c4c0c69d74b3e51e6d2bb28d353feeb499a43ae05fa3e_1280.jpg"
      ],
      customizationOptions: JSON.stringify({
        finish: [
          { name: "Polished", value: "polished" },
          { name: "Oxidized", value: "oxidized" },
          { name: "Brushed", value: "brushed" }
        ],
        chainLength: [
          { name: "16 inches", value: "16" },
          { name: "18 inches", value: "18" },
          { name: "20 inches", value: "20" },
          { name: "24 inches", value: "24" }
        ],
        leafType: [
          { name: "Maple", value: "maple" },
          { name: "Oak", value: "oak" },
          { name: "Fern", value: "fern" }
        ]
      })
    },
    {
      name: "Artisan Candle Set",
      description: "Our hand-poured candles are made with 100% soy wax and premium fragrance oils. This set includes three ceramic containers with harmonizing scents designed to create a calming atmosphere. Each candle burns cleanly for approximately 40 hours.",
      price: 38.00,
      categoryId: 6, // Home Decor
      artisanId: 1, // Terra Pottery
      isCustomizable: false,
      imageUrl: "https://pixabay.com/get/g8512ed1e2361d606ec447daea0a528fd33ed8873498759b45d443eeeb8a4c80d3923dc8ecdf3bf26a721febc12006e28f6e933961ef5f0ebd3b1958db158448d_1280.jpg",
      imageUrls: [
        "https://pixabay.com/get/g8512ed1e2361d606ec447daea0a528fd33ed8873498759b45d443eeeb8a4c80d3923dc8ecdf3bf26a721febc12006e28f6e933961ef5f0ebd3b1958db158448d_1280.jpg",
        "https://pixabay.com/get/g60defffbb0ff88e5fd72a1c5f05de8b94ad93d2e723cd8bf9fac5fd4a68af0caa73b7aeaf33af0a2cf83f28c94ef1bf3f1aad90f0e9d24db9b01ffb83dc30fe3_1280.jpg",
        "https://pixabay.com/get/g4b8df70e21e3ed58f6f34e28fa13abe97a520c1773fb10c27ab7a60d54eb26b1ba7c5c55b1c7b55e58d73f51a2602d7b5bb9a06c5a1c91e96e5d3a4d4e7d9c1e_1280.jpg",
        "https://pixabay.com/get/g7da16e14fd1c9c1979da14d04657b7fd1b37a1c14be15a4b93aee08629fcb07d8c2e77c38f93b98aa93c14bec0c9f2d4d6a9d0a8b47b95cfa31e14b1c0cbca3c_1280.jpg"
      ],
      customizationOptions: ""
    }
  ] as InsertProduct[],
  
  reviews: [
    {
      productId: 1, // Ceramic Handmade Mug
      userName: "Sarah Johnson",
      email: "sarah.j@example.com",
      title: "Love my personalized mug!",
      content: "I ordered a ceramic mug with my daughter's name on it, and it's now her favorite thing to drink from. The craftsmanship is excellent, and the personalization makes it so special. Will definitely be ordering more as gifts!",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-09-15")
    },
    {
      productId: 1, // Ceramic Handmade Mug
      userName: "David Wilson",
      email: "dwilson@example.com",
      title: "Beautiful craftsmanship",
      content: "The attention to detail on this mug is remarkable. It feels substantial in the hand and the glaze is absolutely perfect. My coffee stays hot for quite a while too. Very pleased with this purchase.",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-08-22")
    },
    {
      productId: 1, // Ceramic Handmade Mug
      userName: "Laura Martinez",
      email: "laura.m@example.com",
      title: "Good but slightly irregular",
      content: "The mug is beautiful and clearly handmade with care. Just be aware that because it's handmade, there are some irregularities in the shape. Not a problem for me, but worth noting if you expect perfection.",
      rating: 4,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-07-30")
    },
    {
      productId: 2, // Woven Wall Hanging
      userName: "Michael Rodriguez",
      email: "mrodriguez@example.com",
      title: "Gorgeous statement piece",
      content: "The wooden cutting board I purchased is absolutely beautiful. You can really tell it's handmade with care. It's become a centerpiece in my kitchen and so many guests have asked where I got it. Worth every penny!",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-09-05")
    },
    {
      productId: 2, // Woven Wall Hanging
      userName: "Jennifer Lee",
      email: "jlee@example.com",
      title: "Beautiful craftsmanship",
      content: "This wall hanging transformed my living room! The colors are rich and the craftsmanship is exceptional. I love that each piece is unique. Shipping was fast and it came with easy hanging instructions.",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-08-17")
    },
    {
      productId: 3, // Wooden Cutting Board
      userName: "Robert Taylor",
      email: "rtaylor@example.com",
      title: "Functional art for the kitchen",
      content: "This cutting board is both beautiful and functional. The wood grain is stunning and the board is perfectly sized for my needs. I like that it's reversible too - one side for display, one for cutting.",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-09-12")
    },
    {
      productId: 3, // Wooden Cutting Board
      userName: "Amanda Parker",
      email: "amanda.p@example.com",
      title: "Quality needs improvement",
      content: "While the board looks nice, I noticed some rough edges that needed sanding. Also, it's started to warp slightly after just a few uses despite following the care instructions. Disappointed given the price.",
      rating: 2,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-08-30")
    },
    {
      productId: 4, // Natural Soap Set
      userName: "Emily Chen",
      email: "emily.chen@example.com",
      title: "Best natural soaps ever!",
      content: "I've purchased several items from Artisana, and each one has exceeded my expectations. The natural soap set smells divine and lasts much longer than store-bought options. Supporting local artisans while getting amazing products is a win-win!",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-09-08")
    },
    {
      productId: 4, // Natural Soap Set
      userName: "Thomas Brown",
      email: "tbrown@example.com",
      title: "Great for sensitive skin",
      content: "As someone with very sensitive skin, I've struggled to find soaps that don't cause irritation. These natural soaps have been wonderful! No reactions and my skin feels moisturized rather than dry after use.",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-08-25")
    },
    {
      productId: 5, // Silver Leaf Pendant
      userName: "Jessica Adams",
      email: "jessica.a@example.com",
      title: "Elegant and unique",
      content: "This pendant is absolutely gorgeous! The detail in the silver leaf is incredible and it catches the light beautifully. I've received so many compliments. The chain is also substantial quality.",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-09-10")
    },
    {
      productId: 5, // Silver Leaf Pendant
      userName: "Mark Stevens",
      email: "mstevens@example.com",
      title: "Perfect anniversary gift",
      content: "I purchased this for my wife for our anniversary and she loves it. The craftsmanship is excellent and the packaging was beautiful. Arrived quickly and exactly as described.",
      rating: 5,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-08-15")
    },
    {
      productId: 6, // Artisan Candle Set
      userName: "Olivia Washington",
      email: "olivia.w@example.com",
      title: "Wonderful scents, beautiful containers",
      content: "These candles are amazing! The scents are natural and not overpowering, and the ceramic containers are beautiful enough to reuse after the candle is gone. Burn time is excellent as well.",
      rating: 4,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-09-03")
    },
    {
      productId: 6, // Artisan Candle Set
      userName: "Daniel Morgan",
      email: "dmorgan@example.com",
      title: "Nice but pricey",
      content: "The candles are certainly high quality with pleasant scents, but I'm not sure they're worth the price compared to other artisan candles I've purchased. The ceramic containers are a nice touch though.",
      rating: 3,
      isVerifiedPurchase: true,
      createdAt: new Date("2023-08-20")
    }
  ] as InsertReview[]
};
