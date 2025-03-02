
const adminFunctions = [
    {
        "name": "Verify Accounts",
        "description": "Approve/Reject Account verifications of students and teachers that registered",
        "icon": "/assets/admin/shield-check.svg", 
        "button-name": "Verify Accounts" ,
        "route": "/admin/verify"
    },
    {
        "name": "Class Management",
        "description": "Manage classes, subjects, and teachers",
        "icon": "/assets/admin/school.svg", 
        "button-name": "Manage Classes",
        "route": "/admin/classes"
    },
    
]

const studentFunctions = [
    {
        "name": "Grades",
        "description": "View your grades and performance in subjects",
        "icon": "/assets/student/grades.svg", 
        "button-name": "View Grades",
        "route": "/student/grades"
    },
    {
        "name": "Trends",
        "description": "View the trends of your performance through data visualization",
        "icon": "/assets/student/trends.svg", 
        "button-name": "View Trends",
        "route": "/student/trends"
    },
]

const teacherFunctions = [
    {
        "name": "Grades",
        "description": "View and manage grades of students",
        "icon": "/assets/student/grades.svg", 
        "button-name": "Manage Grades",
        "route": "/teacher/grades"
    },
    {
        "name": "Class Trends",
        "description": "View the trends of student performance through data visualization",
        "icon": "/assets/student/trends.svg", 
        "button-name": "View Trends",
        "route": "/teacher/trends"
    }
]

export const roleFunctions = {
    "Admin": adminFunctions,
    "Student": studentFunctions,
    "Teacher": teacherFunctions
}

