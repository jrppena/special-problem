
const adminFunctions = [
    {
        "name": "Verify Accounts",
        "description": "Approve/Reject Account verifications of students and teachers that registered",
        "icon": "/assets/admin/shield-check.svg", 
        "button-name": "Verify Accounts" ,
        "route": "/admin/verify"
    },
    {
        "name": "Manage Sections",
        "description": "Manage sections, advisers, and students",
        "icon": "/assets/admin/section.png",
        "button-name": "Manage Sections",
        "route": "/admin/manage-sections"
    },
    {
        "name": "Class Management",
        "description": "Manage classes, subjects, and teachers",
        "icon": "/assets/admin/classroom.svg", 
        "button-name": "Manage Classes",
        "route": "/admin/manage-classes"
    },
    {
        "name": "Grades",
        "description": "View and manage grades of students",
        "icon": "/assets/student/grades.svg", 
        "button-name": "Manage Grades",
        "route": "/admin/manage-grades"
    },
    {
        "name": "Configuration",
        "description": "Manage system configurations and settings",
        "icon": "/assets/admin/setting.png",
        "button-name": "Manage Configurations",
        "route": "/admin/manage-configurations"
    }
    
]

const studentFunctions = [
    {
        "name": "Grades",
        "description": "View your grades and performance in subjects",
        "icon": "/assets/student/grades.svg", 
        "button-name": "View Grades",
        "route": "/student/view-grades"
    },
    {
        "name": "Trends",
        "description": "View the trends of your performance through data visualization",
        "icon": "/assets/student/trends.svg", 
        "button-name": "View Trends",
        "route": "/student/grade-trends"
    },
]

const teacherFunctions = [
    {
        "name": "Section Management",
        "description": "Add and manage students to sections you are advising, or also view the grades of students you are advising",
        "icon": "/assets/admin/section.png", 
        "button-name": "Manage Sections",
        "route": "/teacher/manage-sections"
    },
    {
        "name": "Grades",
        "description": "View and manage grades of students",
        "icon": "/assets/student/grades.svg", 
        "button-name": "Manage Grades",
        "route": "/teacher/manage-grades"
    },
    {
        "name": "Class Trends",
        "description": "View the trends of student performance through data visualization",
        "icon": "/assets/student/trends.svg", 
        "button-name": "View Trends",
        "route": "/teacher/grade-trends"
    }
]

const adviserFunctions = [
    {
        "name": "Section Management",
        "description": "Add and manage students to sections you are advising",
        "icon": "/assets/admin/section.png", 
        "button-name": "Manage Sections",
        "route": "/teacher/manage-sections"
    },
    {
        "name": "Grades",
        "description": "View and manage grades of students you are teaching",
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


export const schoolYears = [
    {
        "name": "2024-2025",
        "isCurrent": true
    },
    {
        "name": "2023-2024",
        "isCurrent": false
    },
    {
        "name": "2022-2023",
        "isCurrent": false
    },
    {
        "name": "2021-2022",
        "isCurrent": false
    },
    {
        "name": "2020-2021",
        "isCurrent": false
    },

]

export const gradeLevels = [
    {
        "name": "Grade 7",
        "value": 7
    },
    {
        "name": "Grade 8",
        "value": 8
    },
    {
        "name": "Grade 9",
        "value": 9
    },
    {
        "name": "Grade 10",
        "value": 10
    },
]

export const roleFunctions = {
    "Admin": adminFunctions,
    "Student": studentFunctions,
    "Teacher": teacherFunctions,
    "Adviser": adviserFunctions
}

