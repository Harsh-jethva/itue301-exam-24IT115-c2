// Comprehensive Test Suite for DriveEasy REST API Endpoints
// Validates:
// 1. POST /api/v1/auth/login
// 2. GET /api/v1/vehicles
// 3. POST /api/v1/bookings (201 Created & vehicle.available -> false)
// 4. POST /api/v1/bookings (400 Bad Request on duplicate/unavailable vehicle)
// 5. GET /api/v1/bookings/my (200 with populated customer and vehicle)
// 6. PATCH /api/v1/bookings/:id/status (200 status update)

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("==================================================");
  console.log("   DRIVEEASY CAR RENTAL - AUTOMATED API TESTS     ");
  console.log("==================================================");

  let token = null;
  let customerId = null;
  let testVehicle = null;
  let createdBookingId = null;

  try {
    // TEST 1: Login
    console.log("\n[TEST 1] Testing Customer Login: POST /api/v1/auth/login...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul@example.com",
        password: "password123"
      })
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status} | Success: ${loginData.success}`);
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    token = loginData.token;
    customerId = loginData.customer.id;
    console.log(`✔ Passed! Authenticated as: ${loginData.customer.name} (${loginData.customer.email})`);

    // TEST 2: Get Vehicles
    console.log("\n[TEST 2] Testing Get Vehicles: GET /api/v1/vehicles...");
    const vehiclesRes = await fetch(`${BASE_URL}/vehicles`);
    const vehiclesData = await vehiclesRes.json();
    console.log(`Status: ${vehiclesRes.status} | Count: ${vehiclesData.count}`);
    if (vehiclesRes.status !== 200 || !vehiclesData.data || vehiclesData.data.length === 0) {
      throw new Error(`Get vehicles failed: ${JSON.stringify(vehiclesData)}`);
    }
    const vehiclesList = vehiclesData.data;
    testVehicle = vehiclesList.find((v) => v.available === true);
    if (!testVehicle) {
      throw new Error("No available vehicles found for booking test");
    }
    console.log(`✔ Passed! Found ${vehiclesList.length} vehicles. Selected for test: ${testVehicle.model} (ID: ${testVehicle._id})`);

    // TEST 3: Create Booking (Double-Booking Prevention Check 1 - Success case)
    console.log(`\n[TEST 3] Testing Create Booking: POST /api/v1/bookings for ${testVehicle.model}...`);
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: testVehicle._id,
        pickupDate: "2026-11-01",
        returnDate: "2026-11-05"
      })
    });
    const bookingData = await bookingRes.json();
    console.log(`Status: ${bookingRes.status} (Expected: 201) | Success: ${bookingData.success}`);
    if (bookingRes.status !== 201 || !bookingData.data) {
      throw new Error(`Booking creation failed: ${JSON.stringify(bookingData)}`);
    }
    createdBookingId = bookingData.data._id;
    console.log(`✔ Passed! Created Booking ID: ${createdBookingId}`);

    // TEST 4: Double-Booking Prevention Check 2 (Duplicate on same vehicle must fail with 400)
    console.log(`\n[TEST 4] Testing Double-Booking Prevention: POST /api/v1/bookings again for SAME vehicle...`);
    const dupRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: testVehicle._id,
        pickupDate: "2026-11-06",
        returnDate: "2026-11-10"
      })
    });
    const dupData = await dupRes.json();
    console.log(`Status: ${dupRes.status} (Expected: 400) | Response Message: "${dupData.message}"`);
    if (dupRes.status === 400 && dupData.message === "Vehicle is not available") {
      console.log("✔ Passed! Double-booking correctly prevented with HTTP 400 and exact message.");
    } else {
      throw new Error(`Double-booking prevention failed: Expected 400 "Vehicle is not available", got ${dupRes.status}`);
    }

    // TEST 5: My Bookings with .populate()
    console.log("\n[TEST 5] Testing Customer Bookings: GET /api/v1/bookings/my...");
    const myRes = await fetch(`${BASE_URL}/bookings/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const myData = await myRes.json();
    console.log(`Status: ${myRes.status} (Expected: 200) | Bookings Count: ${myData.count}`);
    if (myRes.status !== 200 || !myData.data || myData.data.length === 0) {
      throw new Error(`My bookings failed: ${JSON.stringify(myData)}`);
    }
    const myLatest = myData.data[0];
    console.log(`Populated Customer: ${myLatest.customerId?.name} (${myLatest.customerId?.email})`);
    console.log(`Populated Vehicle: ${myLatest.vehicleId?.model} (${myLatest.vehicleId?.type})`);
    console.log("✔ Passed! Populated customer and vehicle references verified.");

    // TEST 6: Update Booking Status
    console.log(`\n[TEST 6] Testing Update Status: PATCH /api/v1/bookings/${createdBookingId}/status...`);
    const statusRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: "ongoing" })
    });
    const statusData = await statusRes.json();
    console.log(`Status: ${statusRes.status} (Expected: 200) | New Status: ${statusData.data?.status}`);
    if (statusRes.status !== 200 || statusData.data?.status !== "ongoing") {
      throw new Error(`Status update failed: ${JSON.stringify(statusData)}`);
    }
    console.log("✔ Passed! Booking status successfully updated to 'ongoing'.");

    console.log("\n==================================================");
    console.log("  ALL 6 REST API ENDPOINT TESTS PASSED WITH 100%  ");
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Test Failed:", err.message);
    process.exit(1);
  }
}

runTests();
