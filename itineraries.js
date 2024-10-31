const apiKey = "32804b24a847407391c53709241010"; // Replace with your Weather API key
const addBtn = document.getElementById("addBtn");
const itineraryList = document.getElementById("itineraryList");
const addTaskBtn = document.getElementById("addTaskBtn");
const addActivityBtn = document.getElementById("addActivityBtn");
const taskInput = document.getElementById("taskInput");
const activityInput = document.getElementById("activityInput");
const taskList = document.getElementById("taskList");
const activityList = document.getElementById("activityList");
let currentTasks = []; // Store tasks for the current itinerary
let currentActivities = []; // Store activities related to weather for the current itinerary

// Retrieve data from localStorage on load
document.addEventListener("DOMContentLoaded", displayItineraries);

// Add itinerary
addBtn.addEventListener("click", async () => {
    const destination = document.getElementById("destination").value;
    const date = document.getElementById("date").value;

    if (!destination || !date || currentTasks.length === 0) {
        alert("Please fill all fields and add at least one task and activity.");
        return;
    }

    const weatherData = await fetchWeather(destination);
    if (!weatherData) {
        alert("Could not fetch weather data. Please try again.");
        return;
    }

    const itinerary = {
        id: Date.now(),
        destination,
        date,
        tasks: currentTasks || [],
        activities: currentActivities || [],
        weather: {
            temperature: weatherData.current.temp_c,
            condition: weatherData.current.condition.text,
            humidity: weatherData.current.humidity,
        },
    };

    saveItinerary(itinerary);
    displayItineraries();
    clearForm();
});

// Add task to the current task list
addTaskBtn.addEventListener("click", () => {
    const taskValue = taskInput.value.trim();
    if (!taskValue) {
        alert("Please enter a task.");
        return;
    }

    currentTasks.push({ task: taskValue, completed: false });
    taskInput.value = "";
    displayTasks();
});

// Add activity to the current activity list
addActivityBtn.addEventListener("click", () => {
    const activityValue = activityInput.value.trim();
    if (!activityValue) {
        alert("Please enter an activity.");
        return;
    }

    currentActivities.push({ activity: activityValue, completed: false }); // Added completed status
    activityInput.value = "";
    displayActivities();
});

// Display tasks
function displayTasks() {
    taskList.innerHTML = "";
    currentTasks.forEach((taskObj, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" id="task-${index}" ${taskObj.completed ? 'checked' : ''} onchange="toggleTask(${index})">
            <label for="task-${index}">${taskObj.task}</label>
            <span class="close" onclick="removeTask(${index})">×</span>
            <button onclick="editTask(${index})">Edit</button>
        `;
        taskList.appendChild(li);
    });
}

// Display activities
function displayActivities() {
    activityList.innerHTML = "";
    currentActivities.forEach((activityObj, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" id="activity-${index}" ${activityObj.completed ? 'checked' : ''} onchange="toggleActivity(${index})">
            <label for="activity-${index}">${activityObj.activity}</label>
            <span class="close" onclick="removeActivity(${index})">×</span>
            <button onclick="editActivity(${index})">Edit</button>
        `;
        activityList.appendChild(li);
    });
}

// Toggle task completion
function toggleTask(index) {
    currentTasks[index].completed = !currentTasks[index].completed;
    displayTasks();
}

// Toggle activity completion
function toggleActivity(index) {
    currentActivities[index].completed = !currentActivities[index].completed;
    displayActivities();
}

// Remove task
function removeTask(index) {
    currentTasks.splice(index, 1);
    displayTasks();
}

// Remove activity
function removeActivity(index) {
    currentActivities.splice(index, 1);
    displayActivities();
}

// Edit a task with inline input
function editTask(index) {
    const taskItem = taskList.children[index];
    const taskLabel = taskItem.querySelector("label");
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentTasks[index].task;
    taskItem.replaceChild(editInput, taskLabel);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-btn");
    taskItem.appendChild(saveButton);

    saveButton.addEventListener("click", () => {
        const newValue = editInput.value.trim();
        if (newValue) {
            currentTasks[index].task = newValue;
            displayTasks();
        }
    });
}

// Edit an activity with inline input
function editActivity(index) {
    const activityItem = activityList.children[index];
    const activityLabel = activityItem.querySelector("label");
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentActivities[index].activity;
    activityItem.replaceChild(editInput, activityLabel);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-btn");
    activityItem.appendChild(saveButton);

    saveButton.addEventListener("click", () => {
        const newValue = editInput.value.trim();
        if (newValue) {
            currentActivities[index].activity = newValue;
            displayActivities();
        }
    });
}

async function fetchWeather(destination) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${destination}&days=1`
        );
        if (!response.ok) throw new Error("Weather fetch failed.");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

function saveItinerary(itinerary) {
    const itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];
    itineraries.push(itinerary);
    localStorage.setItem("itineraries", JSON.stringify(itineraries));
}

function displayItineraries() {
    itineraryList.innerHTML = "";
    const itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];

    itineraries.forEach((itinerary) => {
        const tasks = Array.isArray(itinerary.tasks) ? itinerary.tasks : [];
        const activities = Array.isArray(itinerary.activities) ? itinerary.activities : [];

        const li = document.createElement("li");
        li.classList.add("itinerary-item");
        li.innerHTML = `
            <p><strong>Destination:</strong> ${itinerary.destination}</p>
            <p><strong>Date:</strong> ${itinerary.date}</p>
            <p><strong>Weather:</strong> ${itinerary.weather.condition}, ${itinerary.weather.temperature}°C, ${itinerary.weather.humidity}% Humidity</p>
            <p><strong>Itinerary Tasks:</strong></p>
            <ul>
                ${tasks.map((taskObj, index) => `
                    <li>
                        <input type="checkbox" id="itinerary-task-${itinerary.id}-${index}" ${taskObj.completed ? 'checked' : ''} onchange="toggleItineraryTask(${itinerary.id}, ${index})">
                        <label for="itinerary-task-${itinerary.id}-${index}">${taskObj.task}</label>
                    </li>
                `).join('')}
            </ul>
            <p><strong>Activities:</strong></p>
            <ul>
                ${activities.map((activityObj, index) => `
                    <li>
                        <input type="checkbox" id="itinerary-activity-${itinerary.id}-${index}" ${activityObj.completed ? 'checked' : ''} onchange="toggleItineraryActivity(${itinerary.id}, ${index})">
                        <label for="itinerary-activity-${itinerary.id}-${index}">${activityObj.activity}</label>
                    </li>
                `).join('')}
            </ul>
            <div class="actions">
                <button class="edit" onclick="editItinerary(${itinerary.id})">Edit</button>
                <button class="delete" onclick="deleteItinerary(${itinerary.id})">Delete</button>
            </div>
        `;
        itineraryList.appendChild(li);
    });
}

// Toggle task completion for itinerary tasks
function toggleItineraryTask(itineraryId, index) {
    const itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];
    const itinerary = itineraries.find((it) => it.id === itineraryId);
    itinerary.tasks[index].completed = !itinerary.tasks[index].completed;
    localStorage.setItem("itineraries", JSON.stringify(itineraries));
    displayItineraries();
}

// Toggle activity completion for itinerary activities
function toggleItineraryActivity(itineraryId, index) {
    const itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];
    const itinerary = itineraries.find((it) => it.id === itineraryId);
    itinerary.activities[index].completed = !itinerary.activities[index].completed;
    localStorage.setItem("itineraries", JSON.stringify(itineraries));
    displayItineraries();
}

// Edit and delete itinerary functions
function deleteItinerary(id) {
    const itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];
    const updatedItineraries = itineraries.filter((it) => it.id !== id);
    localStorage.setItem("itineraries", JSON.stringify(updatedItineraries));
    displayItineraries();
}

function editItinerary(id) {
    const itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];
    const itinerary = itineraries.find((it) => it.id === id);

    document.getElementById("destination").value = itinerary.destination;
    document.getElementById("date").value = itinerary.date;
    currentTasks = itinerary.tasks || [];
    currentActivities = itinerary.activities || [];
    displayTasks();
    displayActivities();
    deleteItinerary(id);
}

function clearForm() {
    document.getElementById("destination").value = "";
    document.getElementById("date").value = "";
    taskInput.value = "";
    activityInput.value = "";
    currentTasks = [];
    currentActivities = [];
    displayTasks();
    displayActivities();
}
