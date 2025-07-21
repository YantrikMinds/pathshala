// Global variables for Firebase instances and user data
let app;
let db;
let auth;
let storage;
let currentUserRole = null; // 'teacher' or 'student'
let currentStudentCode = null; // Stores the logged-in student's code
let currentTeacherId = null; // Stores the logged-in teacher's Firebase UID

// Fixed teacher credentials (for demonstration)
const TEACHER_EMAIL = 'pathakteacher123@gmail.com';
const TEACHER_PASSWORD = 'pathakpassword123';

// Firebase Configuration (Replace with your actual Firebase project config)
// IMPORTANT: Replace these with your actual Firebase project details from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDhECXZZi67f3D_zciN86Xxk6AUdKwH4_k",
  authDomain: "matrabhumiweb.firebaseapp.com",
  databaseURL: "https://matrabhumiweb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "matrabhumiweb",
  storageBucket: "matrabhumiweb.firebasestorage.app",
  messagingSenderId: "733223433679",
  appId: "1:733223433679:web:47fac54a019aab173b8eba",
  measurementId: "G-NL18ZC065L"
};
const appId = firebaseConfig.projectId; // Using projectId as appId for Firestore paths

// --- Utility Functions ---
function showMessage(text, type) {
    const msgBox = document.getElementById('messageBox');
    msgBox.textContent = text;
    msgBox.className = `message-box ${type}`;
    msgBox.style.display = 'block';
    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 5000); // Hide after 5 seconds
}

function hideAllPanels() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('teacherPanel').style.display = 'none';
    document.getElementById('studentPanel').style.display = 'none';
}

function showPanel(panelId) {
    hideAllPanels();
    document.getElementById(panelId).style.display = 'flex'; // Use flex for panels
}

function hideAllTeacherTabs() {
    document.getElementById('manageCodesContent').style.display = 'none';
    document.getElementById('attendanceContent').style.display = 'none';
    document.getElementById('assignmentsContent').style.display = 'none';
    document.getElementById('feesContent').style.display = 'none';
    document.getElementById('notificationsContent').style.display = 'none';
    // Deactivate all sidebar buttons
    document.querySelectorAll('#teacherPanel .sidebar button').forEach(btn => {
        btn.classList.remove('active');
    });
}

function showTeacherTab(tabId, btnId) {
    hideAllTeacherTabs();
    document.getElementById(tabId).style.display = 'block';
    document.getElementById(btnId).classList.add('active');
}

function hideAllStudentTabs() {
    document.getElementById('studentDashboardContent').style.display = 'none';
    document.getElementById('studentAttendanceContent').style.display = 'none';
    document.getElementById('studentAssignmentsContent').style.display = 'none';
    document.getElementById('studentNotificationsContent').style.display = 'none';
    // Deactivate all sidebar buttons
    document.querySelectorAll('#studentPanel .sidebar button').forEach(btn => {
        btn.classList.remove('active', 'student'); // Remove 'student' class from active for visual consistency
    });
}

function showStudentTab(tabId, btnId) {
    hideAllStudentTabs();
    document.getElementById(tabId).style.display = 'grid'; // Dashboard is grid
    if (tabId === 'studentAttendanceContent' || tabId === 'studentAssignmentsContent' || tabId === 'studentNotificationsContent') {
        document.getElementById(tabId).style.display = 'block'; // Others are block
    }
    document.getElementById(btnId).classList.add('active', 'student');
}

// --- Firebase Initialization ---
window.onload = function() {
    try {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();

        // Initial anonymous sign-in
        auth.signInAnonymously().catch(error => {
            console.error("Anonymous sign-in error:", error);
            showMessage('Firebase initialize karne mein error aa gayi.', 'error');
        });

        // Auth state change listener
        auth.onAuthStateChanged(user => {
            if (user) {
                // Check if it's the teacher
                if (user.email === TEACHER_EMAIL) {
                    currentUserRole = 'teacher';
                    currentTeacherId = user.uid;
                    showPanel('teacherPanel');
                    renderTeacherPanel();
                } else {
                    // For students, we rely on the login code, not Firebase UID
                    // Stay on login page until student successfully logs in with code
                    currentUserRole = null;
                    currentStudentCode = null;
                    showPanel('loginPage');
                }
            } else {
                // No user logged in, show login page
                currentUserRole = null;
                currentStudentCode = null;
                currentTeacherId = null;
                showPanel('loginPage');
            }
        });
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showMessage('Firebase initialize karne mein error aa gayi.', 'error');
    }
};

// --- Login Page Logic ---
const teacherLoginBtn = document.getElementById('teacherLoginBtn');
const studentLoginBtn = document.getElementById('studentLoginBtn');
const teacherLoginForm = document.getElementById('teacherLoginForm');
const studentLoginForm = document.getElementById('studentLoginForm');

teacherLoginBtn.addEventListener('click', () => {
    teacherLoginForm.style.display = 'block';
    studentLoginForm.style.display = 'none';
    teacherLoginBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
    teacherLoginBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    studentLoginBtn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
    studentLoginBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
});

studentLoginBtn.addEventListener('click', () => {
    teacherLoginForm.style.display = 'none';
    studentLoginForm.style.display = 'block';
    studentLoginBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
    studentLoginBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    teacherLoginBtn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
    teacherLoginBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
});

// Teacher Login Form Submission
teacherLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;

    if (email === TEACHER_EMAIL && password === TEACHER_PASSWORD) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            // Firestore user record is handled by onAuthStateChanged
            showMessage('Teacher login successful!', 'success');
        } catch (error) {
            console.error("Teacher login error:", error);
            showMessage('Teacher login mein error aa gayi. Email/Password check karein.', 'error');
        }
    } else {
        showMessage('Invalid Teacher Email or Password.', 'error');
    }
});

// Student Login Form Submission
studentLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentName = document.getElementById('studentName').value;
    const studentClass = document.getElementById('studentClass').value;
    const studentLoginCodeInput = document.getElementById('studentLoginCodeInput').value.toUpperCase();

    try {
        const studentDocRef = db.collection(`artifacts/${appId}/public/data/students`).doc(studentLoginCodeInput);
        const studentDocSnap = await studentDocRef.get();

        if (studentDocSnap.exists) {
            const studentData = studentDocSnap.data();
            if (studentData.name === studentName && studentData.class === studentClass && studentData.codeStatus === 'active') {
                currentUserRole = 'student';
                currentStudentCode = studentLoginCodeInput;
                showPanel('studentPanel');
                renderStudentPanel();
                showMessage(`Welcome, ${studentName}!`, 'success');
            } else if (studentData.codeStatus === 'inactive') {
                showMessage('Aapka login code inactive hai. Teacher se contact karein.', 'error');
            } else if (studentData.codeStatus === 'disbanded') {
                showMessage('Aapka login code disbanded ho gaya hai. Teacher se contact karein.', 'error');
            } else {
                showMessage('Invalid Name, Class, ya Login Code.', 'error');
            }
        } else {
            showMessage('Invalid Name, Class, ya Login Code.', 'error');
        }
    } catch (error) {
        console.error("Student login error:", error);
        showMessage('Student login mein error aa gayi.', 'error');
    }
});

// Logout Function
const teacherLogoutBtn = document.getElementById('teacherLogoutBtn');
const studentLogoutBtn = document.getElementById('studentLogoutBtn');

teacherLogoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showMessage('Aap successfully logout ho gaye hain.', 'success');
    } catch (error) {
        console.error("Logout error:", error);
        showMessage('Logout karne mein error aa gayi.', 'error');
    }
});

studentLogoutBtn.addEventListener('click', async () => {
    try {
        // For students, we just clear local state and show login page
        currentUserRole = null;
        currentStudentCode = null;
        showPanel('loginPage');
        showMessage('Aap successfully logout ho gaye hain.', 'success');
    } catch (error) {
        console.error("Logout error:", error);
        showMessage('Logout karne mein error aa gayi.', 'error');
    }
});


// --- Teacher Panel Logic ---
function renderTeacherPanel() {
    // Set initial active tab
    showTeacherTab('manageCodesContent', 'manageCodesTabBtn');
    // Load initial data for tabs
    renderStudentCodes();
    document.getElementById('attendanceDate').valueAsDate = new Date(); // Set current date
    renderAttendanceTable();
    renderAssignments();
    renderFeeStatus();
    populateStudentSelectForNotifications();
    document.getElementById('currentFeeMonth').textContent = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// Teacher Tab Switching
document.getElementById('manageCodesTabBtn').addEventListener('click', () => showTeacherTab('manageCodesContent', 'manageCodesTabBtn'));
document.getElementById('attendanceTabBtn').addEventListener('click', () => {
    showTeacherTab('attendanceContent', 'attendanceTabBtn');
    renderAttendanceTable(); // Re-render when tab is active
});
document.getElementById('assignmentsTabBtn').addEventListener('click', () => {
    showTeacherTab('assignmentsContent', 'assignmentsTabBtn');
    renderAssignments(); // Re-render when tab is active
});
document.getElementById('feesTabBtn').addEventListener('click', () => {
    showTeacherTab('feesContent', 'feesTabBtn');
    renderFeeStatus(); // Re-render when tab is active
});
document.getElementById('notificationsTabBtn').addEventListener('click', () => {
    showTeacherTab('notificationsContent', 'notificationsTabBtn');
    populateStudentSelectForNotifications(); // Re-populate students
});

// --- Manage Student Codes ---
const generateCodeForm = document.getElementById('generateCodeForm');
const newStudentNameInput = document.getElementById('newStudentName');
const newStudentClassSelect = document.getElementById('newStudentClass');
const generatedCodeDisplay = document.getElementById('generatedCodeDisplay');
const studentCodesListDiv = document.getElementById('studentCodesList');

async function generateUniqueCode() {
    let code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let isUnique = false;

    while (!isUnique) {
        code = '';
        for (let i = 0; i < codeLength; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const docSnap = await db.collection(`artifacts/${appId}/public/data/students`).doc(code).get();
        isUnique = !docSnap.exists;
    }
    return code;
}

generateCodeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newStudentName = newStudentNameInput.value;
    const newStudentClass = newStudentClassSelect.value;

    if (!newStudentName || !newStudentClass) {
        showMessage('Student Name aur Class fill karein.', 'error');
        return;
    }

    try {
        const code = await generateUniqueCode();
        await db.collection(`artifacts/${appId}/public/data/students`).doc(code).set({
            name: newStudentName,
            class: newStudentClass,
            loginCode: code,
            codeStatus: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        generatedCodeDisplay.textContent = `Generated Code: ${code}`;
        generatedCodeDisplay.style.display = 'block';
        newStudentNameInput.value = '';
        newStudentClassSelect.value = 'Nursery';
        showMessage(`Code '${code}' successfully generated for ${newStudentName}!`, 'success');
    } catch (error) {
        console.error("Error generating code:", error);
        showMessage('Code generate karne mein error aa gayi.', 'error');
    }
});

function renderStudentCodes() {
    db.collection(`artifacts/${appId}/public/data/students`)
        .where('codeStatus', '!=', 'disbanded') // Don't show disbanded codes by default
        .onSnapshot(snapshot => {
            const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (students.length === 0) {
                studentCodesListDiv.innerHTML = '<p class="text-gray-600">Koi student code registered nahi hai.</p>';
                return;
            }

            let tableHtml = `
                <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr class="bg-gray-100 border-b">
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Class</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Login Code</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            students.forEach(student => {
                const statusClass = student.codeStatus === 'active' ? 'text-green-600' : 'text-red-600';
                tableHtml += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4 text-gray-800">${student.name}</td>
                        <td class="py-3 px-4 text-gray-800">${student.class}</td>
                        <td class="py-3 px-4 font-mono text-blue-700 font-bold">${student.loginCode}</td>
                        <td class="py-3 px-4 font-semibold ${statusClass}">${student.codeStatus}</td>
                        <td class="py-3 px-4 space-x-2">
                            ${student.codeStatus === 'active' ?
                                `<button onclick="handleUpdateCodeStatus('${student.loginCode}', 'inactive')" class="btn btn-small btn-orange">Deactivate</button>` :
                                `<button onclick="handleUpdateCodeStatus('${student.loginCode}', 'active')" class="btn btn-small btn-green">Activate</button>`
                            }
                            <button onclick="handleDisbandCode('${student.loginCode}')" class="btn btn-small btn-red">Disband</button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += `</tbody></table>`;
            studentCodesListDiv.innerHTML = tableHtml;
        }, error => {
            console.error("Error fetching student codes:", error);
            showMessage('Student codes fetch karne mein error aa gayi.', 'error');
        });
}

async function handleUpdateCodeStatus(studentLoginCode, newStatus) {
    try {
        await db.collection(`artifacts/${appId}/public/data/students`).doc(studentLoginCode).update({ codeStatus: newStatus });
        showMessage(`Code '${studentLoginCode}' status updated to ${newStatus}.`, 'success');
    } catch (error) {
        console.error("Error updating code status:", error);
        showMessage('Code status update karne mein error aa gayi.', 'error');
    }
}

async function handleDisbandCode(studentLoginCode) {
    if (confirm(`Are you sure you want to disband code '${studentLoginCode}'? This will permanently disable access for this student.`)) {
        try {
            await db.collection(`artifacts/${appId}/public/data/students`).doc(studentLoginCode).update({ codeStatus: 'disbanded' });
            showMessage(`Code '${studentLoginCode}' disbanded successfully.`, 'success');
        } catch (error) {
            console.error("Error disbanding code:", error);
            showMessage('Code disband karne mein error aa gayi.', 'error');
        }
    }
}

// --- Daily Attendance ---
const attendanceClassSelect = document.getElementById('attendanceClassSelect');
const attendanceDateInput = document.getElementById('attendanceDate');
const attendanceTableContainer = document.getElementById('attendanceTableContainer');

attendanceClassSelect.addEventListener('change', renderAttendanceTable);
attendanceDateInput.addEventListener('change', renderAttendanceTable);

async function renderAttendanceTable() {
    const selectedClass = attendanceClassSelect.value;
    const attendanceDate = attendanceDateInput.value;

    if (!selectedClass || !attendanceDate) return;

    const today = new Date(attendanceDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Fetch active students for the selected class
    const studentsSnapshot = await db.collection(`artifacts/${appId}/public/data/students`)
        .where('class', '==', selectedClass)
        .where('codeStatus', '==', 'active')
        .get();
    const studentsInClass = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (studentsInClass.length === 0) {
        attendanceTableContainer.innerHTML = '<p class="text-gray-600">Is class mein koi active student registered nahi hai.</p>';
        return;
    }

    // Fetch attendance for the selected date
    db.collection(`artifacts/${appId}/public/data/attendance`)
        .where('class', '==', selectedClass)
        .where('date', '>=', today)
        .where('date', '<', tomorrow)
        .onSnapshot(async snapshot => {
            const currentDayAttendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            let tableHtml = `
                <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr class="bg-gray-100 border-b">
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Student Name (Code)</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Attendance</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Monthly %</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            for (const student of studentsInClass) {
                const record = currentDayAttendance.find(att => att.studentId === student.loginCode);
                const attendanceStatus = record ? record.status : 'not_marked';
                const attendanceRecordId = record ? record.id : null;

                const monthlyPercentage = await calculateMonthlyAttendance(student.loginCode, student.class);
                const percentageClass = monthlyPercentage < 75 ? 'text-red-500' : 'text-green-700';

                tableHtml += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4 text-gray-800">${student.name} (${student.loginCode})</td>
                        <td class="py-3 px-4">
                            <div class="flex space-x-2">
                                <button onclick="handleMarkAttendance('${student.loginCode}', 'present', '${attendanceRecordId}')"
                                    class="btn-small ${attendanceStatus === 'present' ? 'btn-green' : 'btn-outline-green'}">
                                    ✔️ Present
                                </button>
                                <button onclick="handleMarkAttendance('${student.loginCode}', 'absent', '${attendanceRecordId}')"
                                    class="btn-small ${attendanceStatus === 'absent' ? 'btn-red' : 'btn-outline-red'}">
                                    ❌ Absent
                                </button>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-gray-800">
                            <span class="${percentageClass} font-semibold">${monthlyPercentage}%</span>
                        </td>
                    </tr>
                `;
            }
            tableHtml += `</tbody></table>`;
            attendanceTableContainer.innerHTML = tableHtml;
        }, error => {
            console.error("Error fetching attendance:", error);
            showMessage('Attendance fetch karne mein error aa gayi.', 'error');
        });
}

async function handleMarkAttendance(studentLoginCode, status, attendanceRecordId) {
    const dateObj = new Date(document.getElementById('attendanceDate').value);
    const attendanceData = {
        studentId: studentLoginCode,
        class: document.getElementById('attendanceClassSelect').value,
        date: firebase.firestore.Timestamp.fromDate(dateObj),
        status: status,
        markedBy: currentTeacherId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        if (attendanceRecordId && attendanceRecordId !== 'null') { // Check for 'null' string as well
            await db.collection(`artifacts/${appId}/public/data/attendance`).doc(attendanceRecordId).update(attendanceData);
        } else {
            await db.collection(`artifacts/${appId}/public/data/attendance`).add(attendanceData);
        }
        showMessage('Attendance updated successfully!', 'success');
    } catch (error) {
        console.error("Error marking attendance:", error);
        showMessage('Attendance mark karne mein error aa gayi.', 'error');
    }
}

async function calculateMonthlyAttendance(studentLoginCode, studentClass) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const attendanceSnapshot = await db.collection(`artifacts/${appId}/public/data/attendance`)
        .where('studentId', '==', studentLoginCode)
        .where('class', '==', studentClass)
        .where('date', '>=', firstDayOfMonth)
        .where('date', '<=', lastDayOfMonth)
        .get();

    let presentDays = 0;
    const uniquePresentDates = new Set();
    attendanceSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'present') {
            uniquePresentDates.add(data.date.toDate().toDateString());
        }
    });
    presentDays = uniquePresentDates.size;

    const daysInMonthSoFar = today.getDate();
    const totalPossibleDays = daysInMonthSoFar;

    if (totalPossibleDays === 0) return 0;
    return ((presentDays / totalPossibleDays) * 100).toFixed(2);
}

// --- Assignments ---
const assignmentClassSelect = document.getElementById('assignmentClassSelect');
const uploadAssignmentForm = document.getElementById('uploadAssignmentForm');
const assignmentTitleInput = document.getElementById('assignmentTitle');
const assignmentContentGroup = document.getElementById('assignmentContentGroup');
const assignmentContentTextarea = document.getElementById('assignmentContent');
const assignmentFileGroup = document.getElementById('assignmentFileGroup');
const assignmentFileInput = document.getElementById('assignmentFile');
const selectedFileNameSpan = document.getElementById('selectedFileName');
const currentAssignmentClassSpan = document.getElementById('currentAssignmentClass');
const assignmentsListDiv = document.getElementById('assignmentsList');

assignmentClassSelect.addEventListener('change', () => {
    currentAssignmentClassSpan.textContent = assignmentClassSelect.value;
    renderAssignments();
});

// Toggle assignment type (text/file)
document.querySelectorAll('input[name="assignmentType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'text') {
            assignmentContentGroup.style.display = 'block';
            assignmentFileGroup.style.display = 'none';
            assignmentFileInput.value = ''; // Clear file input
            selectedFileNameSpan.style.display = 'none';
        } else {
            assignmentContentGroup.style.display = 'none';
            assignmentFileGroup.style.display = 'block';
            assignmentContentTextarea.value = ''; // Clear text content
        }
    });
});

assignmentFileInput.addEventListener('change', () => {
    if (assignmentFileInput.files.length > 0) {
        selectedFileNameSpan.textContent = `Selected: ${assignmentFileInput.files[0].name}`;
        selectedFileNameSpan.style.display = 'block';
    } else {
        selectedFileNameSpan.textContent = '';
        selectedFileNameSpan.style.display = 'none';
    }
});

uploadAssignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = assignmentTitleInput.value;
    const type = document.querySelector('input[name="assignmentType"]:checked').value;
    let content = '';
    let file = null;

    if (type === 'text') {
        content = assignmentContentTextarea.value;
    } else {
        file = assignmentFileInput.files[0];
    }

    if (!title || (!content && !file)) {
        showMessage('Please fill all assignment details or upload a file.', 'error');
        return;
    }

    try {
        let fileUrl = '';
        let contentType = type;
        if (file) {
            const fileRef = storage.ref(`artifacts/${appId}/assignments/${assignmentClassSelect.value}/${file.name}-${Date.now()}`);
            await fileRef.put(file);
            fileUrl = await fileRef.getDownloadURL();
            contentType = file.type.startsWith('image') ? 'image' : 'pdf';
        }

        await db.collection(`artifacts/${appId}/public/data/assignments`).add({
            class: assignmentClassSelect.value,
            title: title,
            type: contentType,
            content: file ? fileUrl : content,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            uploadedBy: currentTeacherId,
        });

        showMessage('Assignment uploaded successfully!', 'success');
        assignmentTitleInput.value = '';
        assignmentContentTextarea.value = '';
        assignmentFileInput.value = '';
        selectedFileNameSpan.style.display = 'none';
        document.querySelector('input[name="assignmentType"][value="text"]').checked = true; // Reset to text type
        assignmentContentGroup.style.display = 'block';
        assignmentFileGroup.style.display = 'none';
    } catch (error) {
        console.error("Error uploading assignment:", error);
        showMessage('Assignment upload karne mein error aa gayi.', 'error');
    }
});

function renderAssignments() {
    const selectedClass = assignmentClassSelect.value;
    db.collection(`artifacts/${appId}/public/data/assignments`)
        .where('class', '==', selectedClass)
        .orderBy('date', 'desc') // Order by date descending
        .onSnapshot(snapshot => {
            const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (assignments.length === 0) {
                assignmentsListDiv.innerHTML = '<p class="text-gray-600">Is class ke liye koi assignment upload nahi kiya gaya hai.</p>';
                return;
            }

            let assignmentsHtml = '';
            assignments.forEach(assignment => {
                let contentDisplay;
                if (assignment.type === 'text') {
                    contentDisplay = `<p class="text-gray-700">${assignment.content}</p>`;
                } else {
                    contentDisplay = `<a href="${assignment.content}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                        View ${assignment.type === 'image' ? 'Image' : 'PDF'}
                    </a>`;
                }
                assignmentsHtml += `
                    <li class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <p class="font-semibold text-lg">${assignment.title}</p>
                        <p class="text-sm text-gray-500 mb-2">Date: ${assignment.date?.toDate().toLocaleDateString()}</p>
                        ${contentDisplay}
                    </li>
                `;
            });
            assignmentsListDiv.innerHTML = `<ul class="space-y-4">${assignmentsHtml}</ul>`;
        }, error => {
            console.error("Error fetching assignments:", error);
            showMessage('Assignments fetch karne mein error aa gayi.', 'error');
        });
}

// --- Fee Status ---
const feeStatusTableContainer = document.getElementById('feeStatusTableContainer');

function renderFeeStatus() {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('currentFeeMonth').textContent = currentMonth;

    // Fetch all active students
    db.collection(`artifacts/${appId}/public/data/students`)
        .where('codeStatus', '==', 'active')
        .onSnapshot(async studentsSnapshot => {
            const activeStudents = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (activeStudents.length === 0) {
                feeStatusTableContainer.innerHTML = '<p class="text-gray-600">Koi active student registered nahi hai.</p>';
                return;
            }

            // Fetch fee statuses for the current month
            const feesSnapshot = await db.collection(`artifacts/${appId}/public/data/fees`)
                .where('month', '==', currentMonth)
                .get();
            const feeStatusList = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            let tableHtml = `
                <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr class="bg-gray-100 border-b">
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Student Name (Code)</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Class</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fee Status</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            activeStudents.forEach(student => {
                const studentFee = feeStatusList.find(fee => fee.studentId === student.loginCode);
                const currentStatus = studentFee ? studentFee.status : 'Not Paid';
                const statusClass = currentStatus === 'Paid' ? 'text-green-600' : 'text-red-600';

                tableHtml += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4 text-gray-800">${student.name} (${student.loginCode})</td>
                        <td class="py-3 px-4 text-gray-800">${student.class}</td>
                        <td class="py-3 px-4 font-semibold ${statusClass}">${currentStatus}</td>
                        <td class="py-3 px-4">
                            <button onclick="handleUpdateFeeStatus('${student.loginCode}', '${currentStatus}')"
                                class="btn-small ${currentStatus === 'Paid' ? 'btn-outline-orange' : 'btn-outline-green'}">
                                Mark ${currentStatus === 'Paid' ? 'Not Paid' : 'Paid'}
                            </button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += `</tbody></table>`;
            feeStatusTableContainer.innerHTML = tableHtml;
        }, error => {
            console.error("Error fetching fee status:", error);
            showMessage('Fee status fetch karne mein error aa gayi.', 'error');
        });
}

async function handleUpdateFeeStatus(studentLoginCode, currentStatus) {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const feesRef = db.collection(`artifacts/${appId}/public/data/fees`);
    const querySnapshot = await feesRef.where('studentId', '==', studentLoginCode).where('month', '==', currentMonth).get();

    const newStatus = currentStatus === 'Paid' ? 'Not Paid' : 'Paid';

    try {
        if (!querySnapshot.empty) {
            const docToUpdate = querySnapshot.docs[0];
            await feesRef.doc(docToUpdate.id).update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        } else {
            await feesRef.add({
                studentId: studentLoginCode,
                month: currentMonth,
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        }
        showMessage('Fee status updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating fee status:", error);
        showMessage('Fee status update karne mein error aa gayi.', 'error');
    }
}

// --- Send Notifications ---
const selectStudentForNotification = document.getElementById('selectStudentForNotification');
const notificationMessageInput = document.getElementById('notificationMessage');
const sendNotificationForm = document.getElementById('sendNotificationForm');

function populateStudentSelectForNotifications() {
    db.collection(`artifacts/${appId}/public/data/students`)
        .where('codeStatus', '==', 'active')
        .onSnapshot(snapshot => {
            const activeStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            let optionsHtml = '<option value="">-- Select a Student --</option>';
            activeStudents.forEach(student => {
                optionsHtml += `<option value="${student.loginCode}">${student.name} (Code: ${student.loginCode})</option>`;
            });
            selectStudentForNotification.innerHTML = optionsHtml;
        }, error => {
            console.error("Error populating student select:", error);
        });
}

sendNotificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = selectStudentForNotification.value;
    const message = notificationMessageInput.value;

    if (!studentId || !message) {
        showMessage('Please select a student and enter a message.', 'error');
        return;
    }

    try {
        await db.collection(`artifacts/${appId}/public/data/notifications`).add({
            studentId: studentId,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
            sentBy: currentTeacherId,
        });
        showMessage('Notification sent successfully!', 'success');
        notificationMessageInput.value = '';
        selectStudentForNotification.value = '';
    } catch (error) {
        console.error("Error sending notification:", error);
        showMessage('Notification bhejte waqt error aa gayi.', 'error');
    }
});


// --- Student Panel Logic ---
let studentCurrentData = null; // Stores the logged-in student's full data

function renderStudentPanel() {
    // Set initial active tab
    showStudentTab('studentDashboardContent', 'studentDashboardTabBtn');
    // Fetch and render student-specific data
    fetchAndRenderStudentData();
}

// Student Tab Switching
document.getElementById('studentDashboardTabBtn').addEventListener('click', () => {
    showStudentTab('studentDashboardContent', 'studentDashboardTabBtn');
    fetchAndRenderStudentData(); // Refresh dashboard data
});
document.getElementById('studentAttendanceTabBtn').addEventListener('click', () => {
    showStudentTab('studentAttendanceContent', 'studentAttendanceTabBtn');
    renderStudentAttendanceCalendar();
});
document.getElementById('studentAssignmentsTabBtn').addEventListener('click', () => {
    showStudentTab('studentAssignmentsContent', 'studentAssignmentsTabBtn');
    renderStudentAssignments();
});
document.getElementById('studentNotificationsTabBtn').addEventListener('click', () => {
    showStudentTab('studentNotificationsContent', 'studentNotificationsTabBtn');
    renderStudentNotifications();
});

async function fetchAndRenderStudentData() {
    if (!currentStudentCode) return;

    db.collection(`artifacts/${appId}/public/data/students`).doc(currentStudentCode)
        .onSnapshot(async docSnap => {
            if (docSnap.exists) {
                studentCurrentData = docSnap.data();
                document.getElementById('studentWelcomeText').textContent = `Welcome, ${studentCurrentData.name} (Class: ${studentCurrentData.class})!`;

                // Fetch and update dashboard data
                await updateStudentDashboard();
                await renderStudentAttendanceCalendar(); // Also update calendar
                await renderStudentAssignments(); // Also update assignments
                await renderStudentNotifications(); // Also update notifications

                // Check for alerts
                checkStudentAlerts();

            } else {
                console.log("Student document not found for login code:", currentStudentCode);
                showMessage('Aapka login code inactive/disbanded ho gaya hai. Logout kar rahe hain.', 'error');
                // Force logout if student document disappears
                auth.signOut(); // Sign out Firebase anonymous user
                currentUserRole = null;
                currentStudentCode = null;
                showPanel('loginPage');
            }
        }, error => {
            console.error("Error fetching student data:", error);
            showMessage('Student data fetch karne mein error aa gayi.', 'error');
        });
}

async function updateStudentDashboard() {
    if (!studentCurrentData) return;

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('dashboardAttendanceMonth').textContent = currentMonth;
    document.getElementById('dashboardFeeMonth').textContent = currentMonth;

    // Attendance
    const monthlyAttendance = await calculateMonthlyAttendance(currentStudentCode, studentCurrentData.class);
    document.getElementById('dashboardAttendance').textContent = `${monthlyAttendance}%`;

    // Fee Status
    const feesSnapshot = await db.collection(`artifacts/${appId}/public/data/fees`)
        .where('studentId', '==', currentStudentCode)
        .where('month', '==', currentMonth)
        .get();
    const feeStatus = feesSnapshot.empty ? 'Not Paid' : feesSnapshot.docs[0].data().status;
    document.getElementById('dashboardFeeStatus').textContent = feeStatus;
    document.getElementById('dashboardFeeCard').className = `card border-l-4 ${feeStatus === 'Paid' ? 'border-green-500' : 'border-red-500'}`;
    document.getElementById('dashboardFeeStatus').className = `text-4xl font-extrabold ${feeStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`;


    // Latest Assignment
    const assignmentsSnapshot = await db.collection(`artifacts/${appId}/public/data/assignments`)
        .where('class', '==', studentCurrentData.class)
        .orderBy('date', 'desc')
        .limit(1)
        .get();
    const dashboardLatestAssignmentDiv = document.getElementById('dashboardLatestAssignment');
    if (!assignmentsSnapshot.empty) {
        const latestAssignment = assignmentsSnapshot.docs[0].data();
        let contentDisplay;
        if (latestAssignment.type === 'text') {
            contentDisplay = `<p class="text-gray-700 line-clamp-2">${latestAssignment.content}</p>`;
        } else {
            contentDisplay = `<a href="${latestAssignment.content}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                View ${latestAssignment.type === 'image' ? 'Image' : 'PDF'}
            </a>`;
        }
        dashboardLatestAssignmentDiv.innerHTML = `
            <p class="text-lg font-semibold text-purple-700">${latestAssignment.title}</p>
            <p class="text-sm text-gray-500 mb-2">Date: ${latestAssignment.date?.toDate().toLocaleDateString()}</p>
            ${contentDisplay}
        `;
    } else {
        dashboardLatestAssignmentDiv.innerHTML = '<p class="text-gray-600">Koi naya assignment nahi hai.</p>';
    }

    // Latest Notification
    const notificationsSnapshot = await db.collection(`artifacts/${appId}/public/data/notifications`)
        .where('studentId', '==', currentStudentCode)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
    const dashboardLatestNotificationDiv = document.getElementById('dashboardLatestNotification');
    if (!notificationsSnapshot.empty) {
        const latestNotification = notificationsSnapshot.docs[0].data();
        dashboardLatestNotificationDiv.innerHTML = `
            <p class="text-lg font-semibold text-orange-700">${latestNotification.message}</p>
            <p class="text-sm text-gray-500">${latestNotification.timestamp?.toDate().toLocaleString()}</p>
        `;
    } else {
        dashboardLatestNotificationDiv.innerHTML = '<p class="text-gray-600">Koi naya notification nahi hai.</p>';
    }
}

async function checkStudentAlerts() {
    if (!studentCurrentData) return;

    const attendanceThreshold = 75;
    const monthlyAttendance = await calculateMonthlyAttendance(currentStudentCode, studentCurrentData.class);

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const feesSnapshot = await db.collection(`artifacts/${appId}/public/data/fees`)
        .where('studentId', '==', currentStudentCode)
        .where('month', '==', currentMonth)
        .get();
    const feeStatus = feesSnapshot.empty ? 'Not Paid' : feesSnapshot.docs[0].data().status;

    const studentAlertBox = document.getElementById('studentAlertBox');
    const studentAlertMessage = document.getElementById('studentAlertMessage');

    if (monthlyAttendance < attendanceThreshold || feeStatus === 'Not Paid') {
        studentAlertBox.style.display = 'block';
        let message = '';
        if (monthlyAttendance < attendanceThreshold) {
            message += `Aapki attendance ${monthlyAttendance}% hai jo ki ${attendanceThreshold}% se kam hai.`;
        }
        if (feeStatus === 'Not Paid') {
            if (message) message += ' Aur ';
            message += 'Aapki fees pending hai.';
        }
        studentAlertMessage.textContent = message;
    } else {
        studentAlertBox.style.display = 'none';
    }
}


// --- Student My Attendance ---
const myAttendanceMonthSpan = document.getElementById('myAttendanceMonth');
const myAttendancePercentageSpan = document.getElementById('myAttendancePercentage');
const attendanceCalendarGridDiv = document.getElementById('attendanceCalendarGrid');

async function renderStudentAttendanceCalendar() {
    if (!studentCurrentData) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday

    myAttendanceMonthSpan.textContent = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const attendanceSnapshot = await db.collection(`artifacts/${appId}/public/data/attendance`)
        .where('studentId', '==', currentStudentCode)
        .where('class', '==', studentCurrentData.class)
        .get(); // Fetch all attendance for the student
    const attendanceLogs = attendanceSnapshot.docs.map(doc => doc.data());

    const attendanceCalendar = {};
    attendanceLogs.forEach(log => {
        const dateKey = log.date.toDate().toISOString().split('T')[0];
        attendanceCalendar[dateKey] = log.status;
    });

    let calendarHtml = '';
    // Fill leading empty days
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHtml += '<div class="p-2"></div>';
    }

    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toISOString().split('T')[0];
        const status = attendanceCalendar[dateKey];
        const isToday = date.toDateString() === today.toDateString();

        let statusIcon = '';
        let statusColor = 'text-gray-500';
        if (status === 'present') {
            statusIcon = '✔️';
            statusColor = 'text-green-600';
        } else if (status === 'absent') {
            statusIcon = '❌';
            statusColor = 'text-red-600';
        }

        calendarHtml += `
            <div class="p-2 border rounded-md text-center ${isToday ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200'}">
                <div class="font-bold text-lg">${day}</div>
                <div class="text-sm ${statusColor}">${statusIcon}</div>
            </div>
        `;
    }
    attendanceCalendarGridDiv.innerHTML = calendarHtml;

    // Update monthly percentage
    const monthlyPercentage = await calculateMonthlyAttendance(currentStudentCode, studentCurrentData.class);
    myAttendancePercentageSpan.textContent = `${monthlyPercentage}%`;
    myAttendancePercentageSpan.className = `${monthlyPercentage < 75 ? 'text-red-500' : 'text-green-700'} font-semibold`;
}

// --- Student My Assignments ---
const myAssignmentsClassSpan = document.getElementById('myAssignmentsClass');
const myAssignmentsListDiv = document.getElementById('myAssignmentsList');

async function renderStudentAssignments() {
    if (!studentCurrentData) return;

    myAssignmentsClassSpan.textContent = studentCurrentData.class;

    db.collection(`artifacts/${appId}/public/data/assignments`)
        .where('class', '==', studentCurrentData.class)
        .orderBy('date', 'desc')
        .onSnapshot(snapshot => {
            const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (assignments.length === 0) {
                myAssignmentsListDiv.innerHTML = '<p class="text-gray-600">Aapki class ke liye koi assignment upload nahi kiya gaya hai.</p>';
                return;
            }

            let assignmentsHtml = '';
            assignments.forEach(assignment => {
                let contentDisplay;
                if (assignment.type === 'text') {
                    contentDisplay = `<p class="text-gray-700">${assignment.content}</p>`;
                } else {
                    contentDisplay = `<a href="${assignment.content}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                        View ${assignment.type === 'image' ? 'Image' : 'PDF'}
                    </a>`;
                }
                assignmentsHtml += `
                    <li class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <p class="font-semibold text-lg">${assignment.title}</p>
                        <p class="text-sm text-gray-500 mb-2">Date: ${assignment.date?.toDate().toLocaleDateString()}</p>
                        ${contentDisplay}
                    </li>
                `;
            });
            myAssignmentsListDiv.innerHTML = `<ul class="space-y-4">${assignmentsHtml}</ul>`;
        }, error => {
            console.error("Error fetching student assignments:", error);
            showMessage('Assignments fetch karne mein error aa gayi.', 'error');
        });
}

// --- Student My Notifications ---
const myNotificationsListDiv = document.getElementById('myNotificationsList');

async function renderStudentNotifications() {
    if (!studentCurrentData) return;

    db.collection(`artifacts/${appId}/public/data/notifications`)
        .where('studentId', '==', currentStudentCode)
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (notifications.length === 0) {
                myNotificationsListDiv.innerHTML = '<p class="text-gray-600">Aapke liye koi naya notification nahi hai.</p>';
                return;
            }

            let notificationsHtml = '';
            notifications.forEach(notification => {
                const readClass = notification.read ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-800 font-medium';
                const markReadButton = notification.read ? '' :
                    `<button onclick="markStudentNotificationAsRead('${notification.id}')" class="btn-small bg-blue-500 hover:bg-blue-600">Mark Read</button>`;

                notificationsHtml += `
                    <li class="p-3 rounded-md ${readClass} flex justify-between items-center">
                        <div>
                            <p>${notification.message}</p>
                            <p class="text-xs text-gray-500">${notification.timestamp?.toDate().toLocaleString()}</p>
                        </div>
                        ${markReadButton}
                    </li>
                `;
            });
            myNotificationsListDiv.innerHTML = `<ul class="space-y-3">${notificationsHtml}</ul>`;
        }, error => {
            console.error("Error fetching student notifications:", error);
            showMessage('Notifications fetch karne mein error aa gayi.', 'error');
        });
}

async function markStudentNotificationAsRead(notificationId) {
    try {
        await db.collection(`artifacts/${appId}/public/data/notifications`).doc(notificationId).update({ read: true });
        showMessage('Notification read mark kar diya gaya.', 'success');
    } catch (error) {
        console.error("Error marking notification as read:", error);
        showMessage('Notification read mark karne mein error aa gayi.', 'error');
    }
}