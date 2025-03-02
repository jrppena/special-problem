
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

export const roleFunctions = {
    "Admin": adminFunctions,
}

