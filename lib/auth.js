function safeLocalStorage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
    }
    return localStorage;
}

export function getUsers() {
    const storage = safeLocalStorage();
    if (!storage) return [];
    return JSON.parse(storage.getItem("users")) || [];
}

export function saveUsers(users) {
    const storage = safeLocalStorage();
    if (!storage) return;
    storage.setItem("users", JSON.stringify(users));
}

export function currentUser() {
    const storage = safeLocalStorage();
    if (!storage) return null;
    return storage.getItem("currentUser");
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

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

export function loadTodos(username) {
    return JSON.parse(localStorage.getItem("todos_" + username)) || [];
}

export function saveTodos(username, todos) {
    localStorage.setItem("todos_" + username, JSON.stringify(todos));
}

const defaultUsers = [
    {
        username: "admin",
        password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5"
    }
];

export function seedDefaultAccount() {
      console.log("seedDefaultAccount вызвана");
    const users = getUsers();
    if (users.length > 0) {
        console.log("Пользователи уже есть в localStorage");
        return;
    }
       saveUsers(defaultUsers);
    console.log("Аккаунты загружены из default-users.json!");
    console.log("Доступны:", defaultUsers.map(u => u.username).join(", "));
}