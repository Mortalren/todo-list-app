export function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

export function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

export function register(username, password) {

    const users = getUsers();

    if (users.find(u => u.username === username)) {
        return false;
    }

    users.push({
        username,
        password
    });

    saveUsers(users);

    return true;
}

export function login(username, password) {

    const users = getUsers();

    const user = users.find(u =>
        u.username === username &&
        u.password === password
    );

    if (!user)
        return false;

    localStorage.setItem("currentUser", username);

    return true;
}

export function logout() {
    localStorage.removeItem("currentUser");
}

export function currentUser() {
    return localStorage.getItem("currentUser");
}