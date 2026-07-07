export function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

export function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

export async function register(username, password) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return false;
    }
    const hashedPassword = await hashPassword(password);
    users.push({
        username,
        password: hashedPassword
    });
    localStorage.setItem("users", JSON.stringify(users));
    return true;
}

export async function login(username, password) {
    const users = getUsers();
    const hashedPassword = await hashPassword(password);
    const user = users.find(u =>
        u.username === username &&
        u.password === hashedPassword
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

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}