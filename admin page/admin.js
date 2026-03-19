// ---------- LOGIN GUARD ----------
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser || loggedInUser.role !== "admin") {
  alert("Access denied. Admin only.");
  window.location.href = "../login page/login.html";
}

// ---------- DEFAULT DATA ----------
const defaultSpecialties = [
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "General Medicine",
  "Emergency Medicine",
  "Surgery",
  "Obstetrics & Gynecology",
  "Oncology",
  "Infectious Diseases",
  "Dermatology",
  "Dentistry",
  "Ophthalmology",
  "ENT"
];

const defaultHospitals = [
  {
    id: 1,
    name: "Calmette Hospital",
    type: "Public",
    location: "Phnom Penh",
    address: "No. 3 Monivong Blvd, Phnom Penh",
    phone: "+855 23 426 948",
    email: "info@calmettehospital.com",
    hours: "24 Hours",
    image: "../images/hospital1.jpg",
    emergency: "Yes",
    status: "Active",
    specialties: ["Cardiology", "Emergency Medicine", "Neurology", "Surgery"],
    description: "Major public hospital in Phnom Penh providing specialized and emergency care."
  },
  {
    id: 2,
    name: "Royal Phnom Penh Hospital",
    type: "Private",
    location: "Phnom Penh",
    address: "Russian Blvd, Phnom Penh",
    phone: "+855 23 991 000",
    email: "contact@royalphnompenhhospital.com",
    hours: "24 Hours",
    image: "../images/hospital2.jpg",
    emergency: "Yes",
    status: "Active",
    specialties: ["General Medicine", "Cardiology", "Orthopedics", "Surgery"],
    description: "International-standard private hospital with advanced facilities and multiple specialties."
  },
  {
    id: 3,
    name: "National Pediatric Hospital",
    type: "Public",
    location: "Phnom Penh",
    address: "Street 122, Phnom Penh",
    phone: "+855 23 880 737",
    email: "info@nph.gov.kh",
    hours: "Mon-Sun, 24 Hours",
    image: "../images/hospital3.jpg",
    emergency: "Yes",
    status: "Active",
    specialties: ["Pediatrics", "Emergency Medicine", "General Medicine"],
    description: "Specialized public hospital for infants, children, and adolescents."
  }
];

const defaultFaqs = [
  {
    id: 1,
    question: "How does FindMedKH work?",
    answer: "Users can search hospitals, filter by specialty, and use the chatbot for guidance."
  },
  {
    id: 2,
    question: "Can I find hospitals by specialty?",
    answer: "Yes, you can filter hospitals by medical specialty on the hospitals page."
  }
];

const defaultMessages = [
  {
    id: 1,
    name: "Sokha",
    email: "sokha@gmail.com",
    message: "I would like to know whether your platform includes emergency hospitals.",
    date: "2026-03-16"
  },
  {
    id: 2,
    name: "Dara",
    email: "dara@gmail.com",
    message: "Please add more dermatology hospitals in Siem Reap.",
    date: "2026-03-17"
  }
];

// ---------- STORAGE ----------
let specialties = JSON.parse(localStorage.getItem("adminSpecialties")) || defaultSpecialties;
let hospitals = JSON.parse(localStorage.getItem("adminHospitals")) || defaultHospitals;
let faqs = JSON.parse(localStorage.getItem("adminFaqs")) || defaultFaqs;
let messages = JSON.parse(localStorage.getItem("adminMessages")) || defaultMessages;

function saveAll() {
  localStorage.setItem("adminSpecialties", JSON.stringify(specialties));
  localStorage.setItem("adminHospitals", JSON.stringify(hospitals));
  localStorage.setItem("adminFaqs", JSON.stringify(faqs));
  localStorage.setItem("adminMessages", JSON.stringify(messages));
}

// ---------- ELEMENTS ----------
const menuItems = document.querySelectorAll(".menu-item");
const contentSections = document.querySelectorAll(".content-section");
const logoutBtn = document.getElementById("logoutBtn");

// dashboard
const totalHospitals = document.getElementById("totalHospitals");
const totalSpecialties = document.getElementById("totalSpecialties");
const totalPublic = document.getElementById("totalPublic");
const totalPrivate = document.getElementById("totalPrivate");
const totalActive = document.getElementById("totalActive");
const totalMessages = document.getElementById("totalMessages");
const recentHospitalsList = document.getElementById("recentHospitalsList");
const specialtyOverviewList = document.getElementById("specialtyOverviewList");

// hospital
const hospitalForm = document.getElementById("hospitalForm");
const hospitalFormTitle = document.getElementById("hospitalFormTitle");
const editHospitalId = document.getElementById("editHospitalId");
const hospitalName = document.getElementById("hospitalName");
const hospitalType = document.getElementById("hospitalType");
const hospitalLocation = document.getElementById("hospitalLocation");
const hospitalAddress = document.getElementById("hospitalAddress");
const hospitalPhone = document.getElementById("hospitalPhone");
const hospitalEmail = document.getElementById("hospitalEmail");
const hospitalHours = document.getElementById("hospitalHours");
const hospitalImage = document.getElementById("hospitalImage");
const hospitalImagePreview = document.getElementById("hospitalImagePreview");
const hospitalEmergency = document.getElementById("hospitalEmergency");
const hospitalStatus = document.getElementById("hospitalStatus");
const hospitalDescription = document.getElementById("hospitalDescription");
const specialtyCheckboxes = document.getElementById("specialtyCheckboxes");
const hospitalTableBody = document.getElementById("hospitalTableBody");
const cancelHospitalEdit = document.getElementById("cancelHospitalEdit");
const hospitalSearch = document.getElementById("hospitalSearch");
const typeFilter = document.getElementById("typeFilter");
const locationFilter = document.getElementById("locationFilter");
const specialtyFilter = document.getElementById("specialtyFilter");
const statusFilter = document.getElementById("statusFilter");

// specialty
const specialtyForm = document.getElementById("specialtyForm");
const specialtyInput = document.getElementById("specialtyInput");
const specialtyList = document.getElementById("specialtyList");

// faq
const faqForm = document.getElementById("faqForm");
const faqFormTitle = document.getElementById("faqFormTitle");
const editFaqId = document.getElementById("editFaqId");
const faqQuestion = document.getElementById("faqQuestion");
const faqAnswer = document.getElementById("faqAnswer");
const cancelFaqEdit = document.getElementById("cancelFaqEdit");
const faqList = document.getElementById("faqList");

// message
const messageList = document.getElementById("messageList");

// ---------- MENU SWITCH ----------
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(m => m.classList.remove("active"));
    contentSections.forEach(s => s.classList.remove("active"));
    item.classList.add("active");
    document.getElementById(item.dataset.section).classList.add("active");
  });
});

// ---------- LOGOUT ----------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "../login page/login.html";
});

// ---------- HELPERS ----------
function getSelectedSpecialties() {
  const checked = document.querySelectorAll(".specialty-check:checked");
  return Array.from(checked).map(item => item.value);
}

function resetHospitalForm() {
  hospitalForm.reset();
  editHospitalId.value = "";
  hospitalFormTitle.textContent = "Add Hospital";
  hospitalImagePreview.style.display = "none";
  hospitalImagePreview.src = "";
  renderSpecialtyCheckboxes();
}

function resetFaqForm() {
  faqForm.reset();
  editFaqId.value = "";
  faqFormTitle.textContent = "Add FAQ";
}

// ---------- IMAGE PREVIEW ----------
hospitalImage.addEventListener("input", () => {
  const value = hospitalImage.value.trim();
  if (value) {
    hospitalImagePreview.src = value;
    hospitalImagePreview.style.display = "block";
  } else {
    hospitalImagePreview.style.display = "none";
  }
});

// ---------- DASHBOARD ----------
function renderDashboard() {
  totalHospitals.textContent = hospitals.length;
  totalSpecialties.textContent = specialties.length;
  totalPublic.textContent = hospitals.filter(h => h.type === "Public").length;
  totalPrivate.textContent = hospitals.filter(h => h.type === "Private").length;
  totalActive.textContent = hospitals.filter(h => h.status === "Active").length;
  totalMessages.textContent = messages.length;

  recentHospitalsList.innerHTML = "";
  [...hospitals].slice(-5).reverse().forEach(hospital => {
    recentHospitalsList.innerHTML += `
      <div class="simple-item">
        <h4>${hospital.name}</h4>
        <p>${hospital.location} • ${hospital.type} • ${hospital.status}</p>
      </div>
    `;
  });

  specialtyOverviewList.innerHTML = "";
  specialties.forEach(spec => {
    const count = hospitals.filter(h => h.specialties.includes(spec)).length;
    specialtyOverviewList.innerHTML += `
      <div class="simple-item">
        <h4>${spec}</h4>
        <p>${count} hospital(s)</p>
      </div>
    `;
  });
}

// ---------- SPECIALTY ----------
function renderSpecialtyCheckboxes(selected = []) {
  specialtyCheckboxes.innerHTML = "";
  specialties.forEach(spec => {
    const checked = selected.includes(spec) ? "checked" : "";
    specialtyCheckboxes.innerHTML += `
      <label class="checkbox-item">
        <input type="checkbox" class="specialty-check" value="${spec}" ${checked}>
        <span>${spec}</span>
      </label>
    `;
  });
}

function renderSpecialtyFilter() {
  specialtyFilter.innerHTML = `<option value="all">All Specialties</option>`;
  specialties.forEach(spec => {
    specialtyFilter.innerHTML += `<option value="${spec}">${spec}</option>`;
  });
}

function renderSpecialtyList() {
  specialtyList.innerHTML = "";
  specialties.forEach(spec => {
    specialtyList.innerHTML += `
      <div class="specialty-tag">
        <span>${spec}</span>
        <button class="remove-tag-btn" onclick="removeSpecialty('${spec}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  });

  renderSpecialtyCheckboxes();
  renderSpecialtyFilter();
}

specialtyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = specialtyInput.value.trim();

  if (!value) return;
  if (specialties.includes(value)) {
    alert("This specialty already exists.");
    return;
  }

  specialties.push(value);
  specialtyInput.value = "";
  saveAll();
  renderSpecialtyList();
  renderDashboard();
});

function removeSpecialty(spec) {
  const used = hospitals.some(h => h.specialties.includes(spec));
  if (used) {
    alert("Cannot delete this specialty because it is being used by a hospital.");
    return;
  }

  specialties = specialties.filter(item => item !== spec);
  saveAll();
  renderSpecialtyList();
  renderDashboard();
}

// ---------- HOSPITAL ----------
function renderHospitalTable() {
  const searchText = hospitalSearch.value.toLowerCase().trim();
  const typeValue = typeFilter.value;
  const locationValue = locationFilter.value.toLowerCase().trim();
  const specialtyValue = specialtyFilter.value;
  const statusValue = statusFilter.value;

  const filtered = hospitals.filter(hospital => {
    const matchSearch = hospital.name.toLowerCase().includes(searchText);
    const matchType = typeValue === "all" || hospital.type === typeValue;
    const matchLocation = hospital.location.toLowerCase().includes(locationValue);
    const matchSpecialty = specialtyValue === "all" || hospital.specialties.includes(specialtyValue);
    const matchStatus = statusValue === "all" || hospital.status === statusValue;

    return matchSearch && matchType && matchLocation && matchSpecialty && matchStatus;
  });

  hospitalTableBody.innerHTML = "";

  filtered.forEach(hospital => {
    const specialtyTags = hospital.specialties
      .map(spec => `<span>${spec}</span>`)
      .join("");

    hospitalTableBody.innerHTML += `
      <tr>
        <td><img src="${hospital.image}" alt="${hospital.name}" class="table-img"></td>
        <td>${hospital.name}</td>
        <td>${hospital.type}</td>
        <td>${hospital.location}</td>
        <td><div class="table-tags">${specialtyTags}</div></td>
        <td>
          <span class="status-badge ${hospital.status === "Active" ? "status-active" : "status-inactive"}">
            ${hospital.status}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="small-btn view-btn" onclick="viewHospital(${hospital.id})">View</button>
            <button class="small-btn edit-btn" onclick="editHospital(${hospital.id})">Edit</button>
            <button class="small-btn delete-btn" onclick="deleteHospital(${hospital.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}

hospitalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedSpecialties = getSelectedSpecialties();
  if (selectedSpecialties.length === 0) {
    alert("Please select at least one specialty.");
    return;
  }

  const hospitalData = {
    name: hospitalName.value.trim(),
    type: hospitalType.value,
    location: hospitalLocation.value.trim(),
    address: hospitalAddress.value.trim(),
    phone: hospitalPhone.value.trim(),
    email: hospitalEmail.value.trim(),
    hours: hospitalHours.value.trim(),
    image: hospitalImage.value.trim(),
    emergency: hospitalEmergency.value,
    status: hospitalStatus.value,
    specialties: selectedSpecialties,
    description: hospitalDescription.value.trim()
  };

  if (editHospitalId.value) {
    const index = hospitals.findIndex(h => h.id == editHospitalId.value);
    hospitals[index] = { ...hospitals[index], ...hospitalData };
  } else {
    hospitals.push({
      id: Date.now(),
      ...hospitalData
    });
  }

  saveAll();
  resetHospitalForm();
  renderHospitalTable();
  renderDashboard();
});

function editHospital(id) {
  const hospital = hospitals.find(h => h.id == id);
  if (!hospital) return;

  editHospitalId.value = hospital.id;
  hospitalFormTitle.textContent = "Edit Hospital";
  hospitalName.value = hospital.name;
  hospitalType.value = hospital.type;
  hospitalLocation.value = hospital.location;
  hospitalAddress.value = hospital.address;
  hospitalPhone.value = hospital.phone;
  hospitalEmail.value = hospital.email;
  hospitalHours.value = hospital.hours;
  hospitalImage.value = hospital.image;
  hospitalEmergency.value = hospital.emergency;
  hospitalStatus.value = hospital.status;
  hospitalDescription.value = hospital.description;

  hospitalImagePreview.src = hospital.image;
  hospitalImagePreview.style.display = "block";

  renderSpecialtyCheckboxes(hospital.specialties);

  document.querySelector('[data-section="hospitalSection"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteHospital(id) {
  const hospital = hospitals.find(h => h.id == id);
  if (!hospital) return;

  const confirmDelete = confirm(`Are you sure you want to delete "${hospital.name}"?`);
  if (!confirmDelete) return;

  hospitals = hospitals.filter(h => h.id != id);
  saveAll();
  renderHospitalTable();
  renderDashboard();
}

cancelHospitalEdit.addEventListener("click", resetHospitalForm);

hospitalSearch.addEventListener("input", renderHospitalTable);
typeFilter.addEventListener("change", renderHospitalTable);
locationFilter.addEventListener("input", renderHospitalTable);
specialtyFilter.addEventListener("change", renderHospitalTable);
statusFilter.addEventListener("change", renderHospitalTable);

// ---------- FAQ ----------
function renderFaqList() {
  faqList.innerHTML = "";

  faqs.forEach(faq => {
    faqList.innerHTML += `
      <div class="faq-card">
        <h4>${faq.question}</h4>
        <p>${faq.answer}</p>
        <div class="faq-actions">
          <button class="small-btn edit-btn" onclick="editFaq(${faq.id})">Edit</button>
          <button class="small-btn delete-btn" onclick="deleteFaq(${faq.id})">Delete</button>
        </div>
      </div>
    `;
  });
}

faqForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    question: faqQuestion.value.trim(),
    answer: faqAnswer.value.trim()
  };

  if (editFaqId.value) {
    const index = faqs.findIndex(f => f.id == editFaqId.value);
    faqs[index] = { ...faqs[index], ...data };
  } else {
    faqs.push({
      id: Date.now(),
      ...data
    });
  }

  saveAll();
  resetFaqForm();
  renderFaqList();
});

function editFaq(id) {
  const faq = faqs.find(f => f.id == id);
  if (!faq) return;

  editFaqId.value = faq.id;
  faqFormTitle.textContent = "Edit FAQ";
  faqQuestion.value = faq.question;
  faqAnswer.value = faq.answer;

  document.querySelector('[data-section="faqSection"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteFaq(id) {
  const confirmDelete = confirm("Delete this FAQ?");
  if (!confirmDelete) return;

  faqs = faqs.filter(f => f.id != id);
  saveAll();
  renderFaqList();
}

cancelFaqEdit.addEventListener("click", resetFaqForm);

// ---------- MESSAGES ----------
function renderMessages() {
  messageList.innerHTML = "";
  messages.forEach(msg => {
    messageList.innerHTML += `
      <div class="message-card">
        <h4>${msg.name}</h4>
        <div class="message-meta">${msg.email} • ${msg.date}</div>
        <p>${msg.message}</p>
      </div>
    `;
  });
}

// ---------- VIEW MODAL ----------
function viewHospital(id) {
  const hospital = hospitals.find(h => h.id == id);
  if (!hospital) return;

  let modal = document.getElementById("hospitalViewModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "hospitalViewModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <h2>${hospital.name}</h2>
      <div class="modal-top">
        <img src="${hospital.image}" alt="${hospital.name}">
        <div class="modal-details">
          <p><strong>Type:</strong> ${hospital.type}</p>
          <p><strong>Location:</strong> ${hospital.location}</p>
          <p><strong>Address:</strong> ${hospital.address}</p>
          <p><strong>Phone:</strong> ${hospital.phone}</p>
          <p><strong>Email:</strong> ${hospital.email}</p>
          <p><strong>Opening Hours:</strong> ${hospital.hours}</p>
          <p><strong>Emergency:</strong> ${hospital.emergency}</p>
          <p><strong>Status:</strong> ${hospital.status}</p>
          <div class="modal-tags">
            ${hospital.specialties.map(spec => `<span class="tag-pill">${spec}</span>`).join("")}
          </div>
        </div>
      </div>
      <div style="margin-top:16px;">
        <p><strong>Description:</strong></p>
        <p style="margin-top:8px; color:#5d6d78;">${hospital.description}</p>
      </div>
      <div class="modal-close-wrap">
        <button class="btn secondary-btn" onclick="closeHospitalModal()">Close</button>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

function closeHospitalModal() {
  const modal = document.getElementById("hospitalViewModal");
  if (modal) modal.classList.remove("active");
}

window.addEventListener("click", (e) => {
  const modal = document.getElementById("hospitalViewModal");
  if (modal && e.target === modal) {
    modal.classList.remove("active");
  }
});

// ---------- INIT ----------
function init() {
  saveAll();
  renderSpecialtyList();
  renderHospitalTable();
  renderDashboard();
  renderFaqList();
  renderMessages();
  renderSpecialtyCheckboxes();
}

init();