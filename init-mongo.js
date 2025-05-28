// MongoDB initialization script
db = db.getSiblingDB('image_moderation');

// Create an admin token for initial setup
db.tokens.insertOne({
    token: "admin-token-12345",
    isAdmin: true,
    createdAt: new Date(),
    isActive: true,
    description: "Initial admin token for setup"
});

print("Database initialized with admin token: admin-token-12345");