let clickedCountries = [];

// Fix the clear button event listener
const clearButton = document.getElementById("clearbutton");
clearButton.addEventListener("click", async () => {
  await clearList(); // Call the function to clear the list
  await getCountries(); // Refresh the list of countries in the UI
});

// Modify the clearList function to call the correct backend route
async function clearList() {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/backend/clearList", // Corrected endpoint for clearing the list
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to clear the list");
    } else {
      console.log("Countries cleared successfully");
      clickedCountries = []; // Reset the clicked countries array
      await getCountries(); // Refresh the list of countries in the UI
      drawEuropeMap(); // Redraw the map to reset colors
    }
  } catch (error) {
    console.error("POST request error:", error);
  }
}

// Helper function for POST requests
async function postCountry(url, country) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country }),
    });
    if (!response.ok) {
      throw new Error(`Failed to process request for ${country}`);
    }
  } catch (error) {
    console.error("POST request error:", error);
  }
}

// Function to fetch the list of countries from the backend
async function getCountries() {
  try {
    const response = await fetch("http://127.0.0.1:5000/backend/getCountries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    clickedCountries = data.countries.map((country) => country.name); // Update the clickedCountries array
    updateCountryList(); // Update the list in the DOM
    console.log("Updated clickedCountries:", clickedCountries);
  } catch (error) {
    console.error("Failed to fetch countries:", error);
  }
}

// Function to update the list of countries in the DOM
function updateCountryList() {
  const listElement = document.getElementById("list");
  listElement.innerHTML = ""; // Clear existing content

  if (clickedCountries.length > 0) {
    const ul = document.createElement("ul");
    clickedCountries.forEach((country) => {
      const li = document.createElement("li");
      li.textContent = country;
      ul.appendChild(li);
    });
    listElement.appendChild(ul);
  } else {
    listElement.textContent = "No countries selected.";
  }
}

function mapSvg(
  d3projection,
  map,
  centerX,
  centerY,
  scaleFactor = 5,
  width = 800,
  height = 800,
  fillOne = "#a2d2ff",
  fillTwo = "#cdb4db"
) {
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  // Paths
  const projection = d3projection
    .center([centerX, centerY])
    .translate([width / 2, height / 2])
    .scale(width * scaleFactor);

  const path = d3.geoPath().projection(projection);

  // Data
  const mapData = map.features.map((d, i) => ({
    d: path(d),
    fill: i % 5 === 0 ? fillOne : fillTwo, // random colors
    name: d.properties.name, // Assuming each feature has a 'name' property
  }));

  // Function to draw the map with svg
  const drawMap = (el) => {
    el.selectAll("path")
      .data(mapData)
      .join("path")
      .attr("d", (d) => d.d)
      .style("fill", (d) => {
        // Check if the country is in the clickedCountries array
        return clickedCountries.includes(d.name)
          ? d3.color(d.fill).darker(1)
          : d.fill;
      })
      .style("stroke", "#fff")
      .style("stroke-width", 0.6)
      .on("click", async function (event, d) {
        try {
          if (clickedCountries.includes(d.name)) {
            // If the country is already clicked, remove it from the array and reset the color
            clickedCountries = clickedCountries.filter(
              (name) => name !== d.name
            );
            d3.select(this).style("fill", d.fill);

            // Send POST request to remove the country
            await postCountry(
              "http://127.0.0.1:5000/backend/removeCountry",
              d.name
            );
          } else {
            // If the country is not clicked, add it to the array and darken the color
            clickedCountries.push(d.name);
            d3.select(this).style("fill", d3.color(d.fill).darker(1));

            // Send POST request to add the country
            await postCountry(
              "http://127.0.0.1:5000/backend/addCountry",
              d.name
            );
          }
          // Update the list of clicked countries
          await getCountries();
        } catch (error) {
          console.error("Error handling map click:", error);
        }
      })
      .style("cursor", "pointer"); // Optional: change cursor to pointer on hover
  };

  // Draw the map
  const g = svg.append("g").classed("map", true);
  drawMap(g);

  return svg.node();
}

// Set up inputs
let fillTwoEurope = "#635985";
let d3projEurope = "geoConicConformal";
let scaleEurope = 1;

const d3projections = {
  geoConicConformal: d3.geoConicConformal(),
  // You can add more D3 projections here
};

// Main function to draw the map
async function drawEuropeMap() {
  // Fetch list of selected countries first
  await getCountries();
  const europe = await d3.json("europeUltra.json");

  const centerX = 25.19;
  const centerY = 57;
  const width = 1000;
  const height = 900;
  const scaleFactor = scaleEurope;
  const d3projection = d3projections[d3projEurope];

  // Ensure the map container is empty before drawing
  const mapElement = document.getElementById("map");
  mapElement.innerHTML = ""; // Clear any existing content

  const mapCanvas = mapSvg(
    d3projection,
    europe,
    centerX,
    centerY,
    scaleFactor,
    width,
    height,
    fillTwoEurope,
    fillTwoEurope
  );

  // Append the map to the DOM
  mapElement.appendChild(mapCanvas);
}

// Call the function to draw the map
drawEuropeMap();
