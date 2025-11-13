// ----- Sample Doctor Data -----
const doctors = [
  { id: 1, name: "Dr. A. Sharma", specialization: "Cardiologist", fee: 800 },
  { id: 2, name: "Dr. B. Singh", specialization: "Dermatologist", fee: 500 },
  { id: 3, name: "Dr. C. Patel", specialization: "Pediatrician", fee: 600 },
  { id: 4, name: "Dr. D. Mehta", specialization: "General Physician", fee: 400 },
];

// In-memory appointments (also synced with localStorage)
let appointments = [];

// ----- DOM Elements -----
const doctorsTableBody = document.getElementById("doctors-table-body");
const appointmentsTableBody = document.getElementById("appointments-table-body");
const noAppointmentsMsg = document.getElementById("noAppointmentsMsg");
const doctorSelect = document.getElementById("doctorSelect");
const doctorFeeInfo = document.getElementById("doctorFeeInfo");

const appointmentForm = document.getElementById("appointment-form");
const patientNameInput = document.getElementById("patientName");
const appointmentDateInput = document.getElementById("appointmentDate");

const patientNameError = document.getElementById("patientNameError");
const doctorSelectError = document.getElementById("doctorSelectError");
const appointmentDateError = document.getElementById("appointmentDateError");
const appointmentTimeError = document.getElementById("appointmentTimeError");
const formSuccess = document.getElementById("formSuccess");

// Time selects
const hourSelect = document.getElementById("hourSelect");
const minuteSelect = document.getElementById("minuteSelect");
const ampmSelect = document.getElementById("ampmSelect");

// Stats elements
const statTotalDoctors = document.getElementById("statTotalDoctors");
const statTotalAppointments = document.getElementById("statTotalAppointments");
const statTodayAppointments = document.getElementById("statTodayAppointments");

// ----- Navigation -----
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".page-section:not(.dashboard-section)");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");

    // change active button
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // show only selected section (dashboard always shown)
    sections.forEach((section) => {
      if (section.id === targetId) section.classList.remove("hidden");
      else section.classList.add("hidden");
    });
  });
});

// Set default active nav
if (navButtons.length > 0) {
  navButtons[0].classList.add("active");
}

// ----- Load / Save Appointments in localStorage -----
function loadAppointmentsFromStorage() {
  const stored = localStorage.getItem("appointments");
  if (stored) {
    appointments = JSON.parse(stored);
  } else {
    appointments = [];
  }
}

function saveAppointmentsToStorage() {
  localStorage.setItem("appointments", JSON.stringify(appointments));
}

// ----- Render Doctors -----
function renderDoctors() {
  doctorsTableBody.innerHTML = "";
  doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>';

  doctors.forEach((doc) => {
    // Table row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${doc.name}</td>
      <td>${doc.specialization}</td>
      <td>₹${doc.fee}</td>
    `;
    doctorsTableBody.appendChild(tr);

    // Dropdown option
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${doc.name} (${doc.specialization})`;
    doctorSelect.appendChild(option);
  });
}

// ----- Render Appointments -----
function renderAppointments() {
  appointmentsTableBody.innerHTML = "";

  if (!appointments.length) {
    noAppointmentsMsg.textContent = "No appointments booked yet.";
    updateStats();
    return;
  }

  noAppointmentsMsg.textContent = "";

  appointments.forEach((appt) => {
    const doctor = doctors.find((d) => d.id === appt.doctorId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${appt.patientName}</td>
      <td>${doctor ? doctor.name : "Unknown"}</td>
      <td>${doctor ? doctor.specialization : "-"}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
    `;
    appointmentsTableBody.appendChild(tr);
  });

  updateStats();
}

// ----- Stats -----
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateStats() {
  if (statTotalDoctors) {
    statTotalDoctors.textContent = doctors.length;
  }
  if (statTotalAppointments) {
    statTotalAppointments.textContent = appointments.length;
  }
  if (statTodayAppointments) {
    const todayStr = getTodayDateString();
    const todayCount = appointments.filter((a) => a.date === todayStr).length;
    statTodayAppointments.textContent = todayCount;
  }
}

// ----- Time Selects -----
function populateTimeSelects() {
  // Hours 1–12
  for (let h = 1; h <= 12; h++) {
    const opt = document.createElement("option");
    opt.value = h.toString();
    opt.textContent = h.toString();
    hourSelect.appendChild(opt);
  }

  // Minutes every 5 minutes (00, 05, 10, ... 55)
  for (let m = 0; m < 60; m += 5) {
    const mm = m.toString().padStart(2, "0");
    const opt = document.createElement("option");
    opt.value = mm;
    opt.textContent = mm;
    minuteSelect.appendChild(opt);
  }
}

// ----- Form Validation -----
function validateForm() {
  let isValid = true;

  // reset messages
  patientNameError.textContent = "";
  doctorSelectError.textContent = "";
  appointmentDateError.textContent = "";
  appointmentTimeError.textContent = "";
  formSuccess.textContent = "";

  const patientName = patientNameInput.value.trim();
  const doctorId = doctorSelect.value;
  const date = appointmentDateInput.value;

  if (!patientName) {
    patientNameError.textContent = "Patient name is required.";
    isValid = false;
  }

  if (!doctorId) {
    doctorSelectError.textContent = "Please select a doctor.";
    isValid = false;
  }

  if (!date) {
    appointmentDateError.textContent = "Please choose a date.";
    isValid = false;
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      appointmentDateError.textContent = "Date cannot be in the past.";
      isValid = false;
    }
  }

  if (!hourSelect.value || !minuteSelect.value || !ampmSelect.value) {
    appointmentTimeError.textContent = "Please choose a valid time.";
    isValid = false;
  }

  return isValid;
}

// ----- Handle Doctor Dropdown Change -----
doctorSelect.addEventListener("change", () => {
  const selectedId = parseInt(doctorSelect.value, 10);
  const doctor = doctors.find((d) => d.id === selectedId);
  if (doctor) {
    doctorFeeInfo.textContent = `Consultation fee: ₹${doctor.fee}`;
  } else {
    doctorFeeInfo.textContent = "";
  }
});

// ----- Handle Form Submit -----
appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const formattedTime = `${hourSelect.value}:${minuteSelect.value} ${ampmSelect.value}`;

  const newAppointment = {
    id: Date.now(),
    patientName: patientNameInput.value.trim(),
    doctorId: parseInt(doctorSelect.value, 10),
    date: appointmentDateInput.value,
    time: formattedTime,
  };

  appointments.push(newAppointment);
  saveAppointmentsToStorage();
  renderAppointments();

  formSuccess.textContent = "✅ Appointment booked successfully.";
  appointmentForm.reset();
  doctorFeeInfo.textContent = "";
  hourSelect.value = "";
  minuteSelect.value = "";
  ampmSelect.value = "";
});

// ----- Initialize -----
function init() {
  loadAppointmentsFromStorage();
  renderDoctors();
  renderAppointments();
  updateStats();
  populateTimeSelects();

  // Set minimum date to today
  const todayStr = getTodayDateString();
  appointmentDateInput.setAttribute("min", todayStr);
}

init();
