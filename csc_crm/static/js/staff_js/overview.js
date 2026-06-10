// ====== GRAPH ======
document.addEventListener("DOMContentLoaded", function () {

    const thisMonthEl = document.getElementById("week-data-this");
    const lastMonthEl = document.getElementById("week-data-last");

    if (!thisMonthEl || !lastMonthEl) return;

    let thisMonth = [];
    let lastMonth = [];

    try {
        thisMonth = JSON.parse(thisMonthEl.textContent || "[]");
        lastMonth = JSON.parse(lastMonthEl.textContent || "[]");
    } catch (e) {
        console.log("Invalid JSON data");
        return;
    }

    const x = [50, 180, 310, 440, 620];

    function getY(value) {
        return 320 - ((value / 100) * 200);
    }

    function buildPoints(data) {

        if (!Array.isArray(data)) return "";

        let points = "";

        data.forEach((value, index) => {

            let safeValue = Number(value) || 0;

            if (index >= x.length) return;

            points += `${x[index]},${getY(safeValue)} `;
        });

        return points.trim();
    }

    const blueLine = document.querySelector(".over-performance-blueline");
    const greenLine = document.querySelector(".over-performance-greenline");

    if (blueLine) {
        blueLine.setAttribute("points", buildPoints(thisMonth));
    }

    if (greenLine) {
        greenLine.setAttribute("points", buildPoints(lastMonth));
    }
});


// ====== NAVBAR ======
document.addEventListener("DOMContentLoaded", function () {

    const navToggle = document.getElementById("navToggle");
    const navTabs = document.getElementById("navTabs");

    if (!navToggle || !navTabs) return;

    navToggle.addEventListener("click", function () {
        navTabs.classList.toggle("show");
    });
});