const students = [
  {
    name: "Jordan Lee",
    major: "Business Administration",
    style: "Talk it out",
    courses: ["BSAD 281", "MKTG 301", "ECON 201"],
    schedule: ["Afternoon", "Evening"],
    scheduleText: "Mon & Wed · afternoons"
  },
  {
    name: "Amara Patel",
    major: "Marketing",
    style: "Study group",
    courses: ["BSAD 281", "MKTG 301", "STAT 200"],
    schedule: ["Morning", "Afternoon"],
    scheduleText: "Tue & Thu · mornings"
  },
  {
    name: "Mateo Rivera",
    major: "Economics",
    style: "Quiet focus",
    courses: ["ECON 201", "STAT 200", "ACCT 202"],
    schedule: ["Evening"],
    scheduleText: "Mon & Fri · evenings"
  },
  {
    name: "Kiara Brooks",
    major: "Business Administration",
    style: "Flashcards",
    courses: ["BSAD 281", "ACCT 202", "MKTG 301"],
    schedule: ["Afternoon", "Evening"],
    scheduleText: "Wed & Thu · afternoons"
  },
  {
    name: "Noah Kim",
    major: "Accounting",
    style: "Quiet focus",
    courses: ["ACCT 202", "STAT 200", "ECON 201"],
    schedule: ["Morning", "Evening"],
    scheduleText: "Tue & Fri · evenings"
  },
  {
    name: "Sofia Chen",
    major: "Marketing",
    style: "Teach & learn",
    courses: ["MKTG 301", "BSAD 281", "STAT 200"],
    schedule: ["Morning", "Afternoon"],
    scheduleText: "Mon & Thu · mornings"
  }
];

const avatarClasses = ["avatar-peach", "avatar-sage", "avatar-gold", "avatar-lilac", "avatar-blue", "avatar-rose"];
const courseFilter = document.querySelector("#course-filter");
const timeFilter = document.querySelector("#time-filter");
const searchInput = document.querySelector("#student-search");
const profileGrid = document.querySelector("#profile-grid");
const resultsCount = document.querySelector("#results-count");
const resultsTitle = document.querySelector("#results-title");
const emptyState = document.querySelector("#empty-state");
const matchResults = document.querySelector("#match-results");
const matchList = document.querySelector("#match-list");

const allCourses = [...new Set(students.flatMap((student) => student.courses))].sort();
allCourses.forEach((course) => {
  const option = document.createElement("option");
  option.value = course;
  option.textContent = course;
  courseFilter.append(option);
});

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("");
}

function profileCard(student) {
  const index = students.indexOf(student);
  const card = document.createElement("article");
  card.className = "profile-card";
  card.innerHTML = `
    <div class="profile-top">
      <span class="profile-avatar ${avatarClasses[index]}" aria-hidden="true">${initials(student.name)}</span>
      <div><h4>${student.name}</h4><p class="profile-major">${student.major}</p></div>
      <span class="study-style">${student.style}</span>
    </div>
    <div class="profile-details">
      <p class="detail-label">Courses</p>
      <div class="course-tags">${student.courses.map((course) => `<span class="course-tag">${course}</span>`).join("")}</div>
      <p class="profile-schedule"><strong>Usually free:</strong> ${student.scheduleText}</p>
    </div>`;
  return card;
}

function getVisibleStudents() {
  const course = courseFilter.value;
  const time = timeFilter.value;
  const query = searchInput.value.trim().toLowerCase();

  return students.filter((student) => {
    const matchesCourse = !course || student.courses.includes(course);
    const matchesTime = !time || student.schedule.includes(time);
    const searchableText = `${student.name} ${student.major} ${student.courses.join(" ")}`.toLowerCase();
    return matchesCourse && matchesTime && searchableText.includes(query);
  });
}

function renderProfiles() {
  const visibleStudents = getVisibleStudents();
  profileGrid.replaceChildren(...visibleStudents.map(profileCard));
  resultsCount.textContent = `${visibleStudents.length} ${visibleStudents.length === 1 ? "student" : "students"}`;
  resultsTitle.textContent = courseFilter.value ? `Classmates in ${courseFilter.value}` : "A few friendly faces";
  emptyState.hidden = visibleStudents.length > 0;
  profileGrid.hidden = visibleStudents.length === 0;
}

function findMatches() {
  const selectedCourse = courseFilter.value;
  const selectedTime = timeFilter.value;
  const matches = getVisibleStudents()
    .map((student) => {
      const sharedCourses = selectedCourse
        ? student.courses.includes(selectedCourse) ? [selectedCourse] : []
        : student.courses;
      const sharedTimes = selectedTime
        ? student.schedule.includes(selectedTime) ? [selectedTime] : []
        : student.schedule;
      return { student, sharedCourses, sharedTimes };
    })
    .filter((match) => match.sharedCourses.length > 0 && match.sharedTimes.length > 0)
    .sort((a, b) => (b.sharedCourses.length + b.sharedTimes.length) - (a.sharedCourses.length + a.sharedTimes.length));

  matchResults.hidden = false;
  matchList.replaceChildren();
  if (matches.length === 0) {
    const message = document.createElement("p");
    message.className = "no-matches";
    message.textContent = "No shared course and study-time matches yet. Try choosing a different time or course.";
    matchList.append(message);
    return;
  }

  matches.forEach(({ student, sharedCourses, sharedTimes }) => {
    const index = students.indexOf(student);
    const item = document.createElement("div");
    item.className = "match-item";
    item.innerHTML = `
      <span class="profile-avatar ${avatarClasses[index]}" aria-hidden="true">${initials(student.name)}</span>
      <div class="match-item-copy"><strong>${student.name}</strong><span>Shares ${sharedCourses.join(", ")} · ${sharedTimes.join(", ").toLowerCase()} availability</span></div>
      <span class="match-score">${sharedCourses.length + sharedTimes.length} shared signals</span>`;
    matchList.append(item);
  });
}

function updateResults() {
  renderProfiles();
  if (!matchResults.hidden) findMatches();
}

document.querySelector("#filter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  findMatches();
  matchResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

courseFilter.addEventListener("change", updateResults);
timeFilter.addEventListener("change", updateResults);
searchInput.addEventListener("input", updateResults);
document.querySelector("#clear-matches").addEventListener("click", () => {
  matchResults.hidden = true;
  matchList.replaceChildren();
});

function renderNetworkChart() {
  const cohorts = [5, 25, 100];
  const estimates = cohorts.map((studentsInCohort) => ({
    students: studentsInCohort,
    pairs: Math.round((studentsInCohort * (studentsInCohort - 1) / 2) * 0.12)
  }));
  const maxPairs = Math.max(...estimates.map(({ pairs }) => pairs));
  const chart = document.querySelector("#network-chart");

  estimates.forEach(({ students: count, pairs }) => {
    const row = document.createElement("div");
    row.className = "network-row";
    row.innerHTML = `
      <span class="network-label">${count} students</span>
      <span class="network-track" aria-hidden="true"><span class="network-bar" style="width: ${Math.max(1, pairs / maxPairs * 100)}%"></span></span>
      <span class="network-value">${pairs}</span>`;
    row.setAttribute("aria-label", `${count} students: estimated ${pairs} compatible pairs (simulated)`);
    chart.append(row);
  });
}

renderProfiles();
renderNetworkChart();
