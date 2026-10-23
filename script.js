// ===============================
// TOUR TRACKER - MAIN JAVASCRIPT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // Login protection for dashboard
    if (
        document.body.classList.contains("dashboard-page") &&
        localStorage.getItem("tourLoggedIn") !== "true"
    ) {
        window.location.href = "login.html";
        return;
    }

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    updateStats();
    showTrips();
    loadJournal();

});


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("tourLoggedIn");

    window.location.href = "index.html";
}


// ===============================
// DARK / LIGHT MODE
// ===============================

function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}


// ===============================
// SMART DESTINATION
// ===============================

function recommendDestination() {

    let budget = Number(document.getElementById("travelBudget").value);
    let days = Number(document.getElementById("travelDays").value);
    let type = document.getElementById("travelType").value;

    let result = document.getElementById("recommendationResult");

    if (budget <= 0 || days <= 0 || type === "") {

        result.innerHTML =
            "⚠️ Please enter budget, days and travel type.";

        return;
    }

    let destination = "";

    if (type === "nature") {

        if (budget < 8000)
            destination = "🌿 Lonavala";
        else if (budget < 15000)
            destination = "🏔️ Mahabaleshwar";
        else
            destination = "🌴 Kerala";

    }

    else if (type === "adventure") {

        if (budget < 8000)
            destination = "🏕️ Rishikesh";
        else if (budget < 15000)
            destination = "⛰️ Manali";
        else
            destination = "🏔️ Ladakh";

    }

    else if (type === "culture") {

        if (budget < 8000)
            destination = "🏰 Pune";
        else if (budget < 15000)
            destination = "🕌 Jaipur";
        else
            destination = "🏛️ Delhi";

    }

    else if (type === "relax") {

        if (budget < 8000)
            destination = "🌊 Goa";
        else if (budget < 15000)
            destination = "🏝️ Kerala";
        else
            destination = "🌴 Andaman";

    }

    result.innerHTML =
        "✨ Recommended Destination:<br><strong>" +
        destination +
        "</strong><br><small>" +
        days +
        " day trip within your budget.</small>";

}


// ===============================
// SMART BUDGET ANALYZER
// ===============================

function calculateBudget() {

    let transport =
        Number(document.getElementById("transportCost").value) || 0;

    let hotel =
        Number(document.getElementById("hotelCost").value) || 0;

    let food =
        Number(document.getElementById("foodCost").value) || 0;

    let activity =
        Number(document.getElementById("activityCost").value) || 0;

    let total = transport + hotel + food + activity;

    document.getElementById("budgetResult").innerHTML =
        "💰 Total Estimated Expense: <strong>₹" +
        total.toLocaleString("en-IN") +
        "</strong>";

    localStorage.setItem("tourTotalExpense", total);

    updateStats();
}


// ===============================
// RANDOM ADVENTURE
// ===============================

function randomAdventure() {

    const adventures = [

        "🌄 Watch the sunrise from a hill",
        "🏕️ Try a peaceful camping experience",
        "🚲 Explore the city by bicycle",
        "🌊 Visit a beautiful waterfall",
        "📸 Go on a photography walk",
        "🍜 Try a local food speciality",
        "🏰 Explore a historical place",
        "🌿 Discover a hidden nature spot",
        "🎨 Visit a local art gallery",
        "🚶 Take a peaceful nature walk"

    ];

    let random =
        adventures[Math.floor(Math.random() * adventures.length)];

    document.getElementById("adventureResult").innerHTML =
        random;
}


// ===============================
// PACKING CHECKLIST
// ===============================

function checkPacking() {

    let items =
        document.querySelectorAll(".packing-item");

    let checked =
        document.querySelectorAll(".packing-item:checked");

    let percentage =
        Math.round((checked.length / items.length) * 100);

    document.getElementById("packingResult").innerHTML =
        "🎒 Packing Ready: <strong>" +
        percentage +
        "%</strong>";

    localStorage.setItem("packingPercentage", percentage);
}


// ===============================
// SAFETY CHECK
// ===============================

function calculateSafety() {

    let items =
        document.querySelectorAll(".safety-item");

    let checked =
        document.querySelectorAll(".safety-item:checked");

    let percentage =
        Math.round((checked.length / items.length) * 100);

    document.getElementById("safetyResult").innerHTML =
        "🛡️ Safety Readiness: <strong>" +
        percentage +
        "%</strong>";

    localStorage.setItem("safetyPercentage", percentage);
}


// ===============================
// TRIP HEALTH MONITOR
// ===============================

function checkTripHealth() {

    let packing =
        Number(localStorage.getItem("packingPercentage")) || 0;

    let safety =
        Number(localStorage.getItem("safetyPercentage")) || 0;

    let health =
        Math.round((packing + safety) / 2);

    document.getElementById("healthBar").style.width =
        health + "%";

    document.getElementById("healthPercentage").innerText =
        health + "%";

}


// ===============================
// ADD TRIP
// ===============================

function addTrip() {

    let name =
        document.getElementById("tripName").value.trim();

    let place =
        document.getElementById("tripPlace").value.trim();

    let date =
        document.getElementById("tripDate").value;

    if (name === "" || place === "" || date === "") {

        alert("Please enter all trip details.");

        return;
    }

    let trips =
        JSON.parse(localStorage.getItem("tourTrips")) || [];

    trips.push({
        name: name,
        place: place,
        date: date
    });

    localStorage.setItem(
        "tourTrips",
        JSON.stringify(trips)
    );

    document.getElementById("tripName").value = "";
    document.getElementById("tripPlace").value = "";
    document.getElementById("tripDate").value = "";

    showTrips();
    updateStats();

}


// ===============================
// SHOW TRIPS
// ===============================

function showTrips() {

    let tripList =
        document.getElementById("tripList");

    if (!tripList) return;

    let trips =
        JSON.parse(localStorage.getItem("tourTrips")) || [];

    tripList.innerHTML = "";

    if (trips.length === 0) {

        tripList.innerHTML =
            "<div class='result-box'>🗺️ No trips added yet.</div>";

        return;
    }

    trips.forEach(function (trip, index) {

        tripList.innerHTML += `

        <div class="trip-card">

            <h3>✈️ ${escapeHTML(trip.name)}</h3>

            <p>📍 ${escapeHTML(trip.place)}</p>

            <p>📅 ${escapeHTML(trip.date)}</p>

            <button onclick="deleteTrip(${index})">
                🗑️ Delete
            </button>

        </div>

        `;

    });

}


// ===============================
// DELETE TRIP
// ===============================

function deleteTrip(index) {

    let trips =
        JSON.parse(localStorage.getItem("tourTrips")) || [];

    trips.splice(index, 1);

    localStorage.setItem(
        "tourTrips",
        JSON.stringify(trips)
    );

    showTrips();
    updateStats();
}


// ===============================
// TRAVEL SCORE
// ===============================

function calculateTravelScore() {

    let packing =
        Number(localStorage.getItem("packingPercentage")) || 0;

    let safety =
        Number(localStorage.getItem("safetyPercentage")) || 0;

    let trips =
        JSON.parse(localStorage.getItem("tourTrips")) || [];

    let score =
        Math.round(
            (packing * 0.35) +
            (safety * 0.35) +
            (trips.length > 0 ? 30 : 0)
        );

    if (score > 100)
        score = 100;

    document.getElementById("scoreNumber").innerText =
        score;

    document.getElementById("scoreMessage").innerHTML =
        score >= 80
            ? "🏆 Excellent travel preparation!"
            : score >= 50
                ? "👍 Good preparation. A little more planning will help."
                : "📋 Complete your packing and safety checks.";

    localStorage.setItem("travelScore", score);

    updateStats();
}


// ===============================
// TRAVEL JOURNAL
// ===============================

function saveJournal() {

    let title =
        document.getElementById("journalTitle").value.trim();

    let text =
        document.getElementById("journalText").value.trim();

    if (title === "" || text === "") {

        alert("Please enter memory title and description.");

        return;
    }

    let journal =
        JSON.parse(localStorage.getItem("tourJournal")) || [];

    journal.push({

        title: title,
        text: text,
        date: new Date().toLocaleDateString("en-IN")

    });

    localStorage.setItem(
        "tourJournal",
        JSON.stringify(journal)
    );

    document.getElementById("journalTitle").value = "";
    document.getElementById("journalText").value = "";

    loadJournal();
    updateStats();

}


// ===============================
// LOAD JOURNAL
// ===============================

function loadJournal() {

    let journalList =
        document.getElementById("journalList");

    if (!journalList) return;

    let journal =
        JSON.parse(localStorage.getItem("tourJournal")) || [];

    journalList.innerHTML = "";

    journal.forEach(function (memory) {

        journalList.innerHTML += `

        <div class="journal-entry">

            <h3>📸 ${escapeHTML(memory.title)}</h3>

            <p>${escapeHTML(memory.text)}</p>

            <small>📅 ${escapeHTML(memory.date)}</small>

        </div>

        `;

    });

}


// ===============================
// EMERGENCY TRAVEL CARD
// ===============================

function createEmergencyCard() {

    let name =
        document.getElementById("emergencyName").value.trim();

    let contact =
        document.getElementById("emergencyContact").value.trim();

    let blood =
        document.getElementById("emergencyBlood").value.trim();

    if (name === "" || contact === "" || blood === "") {

        alert("Please enter all emergency card details.");

        return;
    }

    document.getElementById("emergencyResult").innerHTML = `

        <div class="emergency-result">

            <h3>🆘 Emergency Information</h3>

            <p><strong>Name:</strong> ${escapeHTML(name)}</p>

            <p><strong>Emergency Contact:</strong>
            ${escapeHTML(contact)}</p>

            <p><strong>Blood Group:</strong>
            ${escapeHTML(blood)}</p>

        </div>

    `;

}


// ===============================
// DASHBOARD STATISTICS
// ===============================

function updateStats() {

    let trips =
        JSON.parse(localStorage.getItem("tourTrips")) || [];

    let journal =
        JSON.parse(localStorage.getItem("tourJournal")) || [];

    let expense =
        Number(localStorage.getItem("tourTotalExpense")) || 0;

    let score =
        Number(localStorage.getItem("travelScore")) || 0;

    let tripCount =
        document.getElementById("tripCount");

    let totalExpense =
        document.getElementById("totalExpense");

    let memoryCount =
        document.getElementById("memoryCount");

    let travelScore =
        document.getElementById("travelScore");

    if (tripCount)
        tripCount.innerText = trips.length;

    if (totalExpense)
        totalExpense.innerText =
            "₹" + expense.toLocaleString("en-IN");

    if (memoryCount)
        memoryCount.innerText = journal.length;

    if (travelScore)
        travelScore.innerText = score;

}


// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}