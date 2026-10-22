require("dotenv").config();
const mongoose = require("mongoose");
const Customer = require("./models/Customer");
const Vehicle = require("./models/Vehicle");
const Booking = require("./models/Booking");

const sampleVehicles = [
  {
    model: "Honda City",
    type: "Sedan",
    pricePerDay: 2500,
    available: true
  },
  {
    model: "Hyundai Creta",
    type: "SUV",
    pricePerDay: 3000,
    available: true
  },
  {
    model: "Maruti Swift",
    type: "Hatchback",
    pricePerDay: 1800,
    available: true
  },
  {
    model: "Toyota Fortuner",
    type: "SUV",
    pricePerDay: 4500,
    available: true
  }
];

const sampleCustomers = [
  {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "9876543210",
    licenseNumber: "DL-1420110012345",
    password: "password123"
  },
  {
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "9876543211",
    licenseNumber: "MH-0220150067890",
    password: "password123"
  }
];

async function seedData() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/driveeasy";
    console.log("Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });

    console.log("Clearing existing data...");
    await Booking.deleteMany({});
    await Vehicle.deleteMany({});
    await Customer.deleteMany({});

    console.log("Seeding sample vehicles...");
    const createdVehicles = await Vehicle.insertMany(sampleVehicles);

    console.log("Seeding sample customers...");
    const createdCustomers = await Customer.insertMany(sampleCustomers);

    console.log("Seeding initial booking...");
    // Let's create one initial reserved booking for Rahul with the Fortuner
    await Booking.create({
      customerId: createdCustomers[0]._id,
      vehicleId: createdVehicles[3]._id, // Toyota Fortuner
      pickupDate: new Date(),
      returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "reserved"
    });
    // Mark Fortuner as not available
    await Vehicle.findByIdAndUpdate(createdVehicles[3]._id, { available: false });

    console.log("Seed completed successfully!");
    console.log("Sample Customers:");
    sampleCustomers.forEach((c) => console.log(` - Email: ${c.email} | Password: ${c.password}`));
    console.log("Sample Vehicles: 4 loaded (3 available, 1 booked)");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedData();
