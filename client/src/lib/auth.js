export function registerUser(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.find((u) => u.email === email);
  if (userExists) {
    return { success: false, message: "Email sudah terdaftar." };
  }

  users.push({ email, password });
  localStorage.setItem("users", JSON.stringify(users));
  return { success: true, message: "Registrasi berhasil!" };
}

export function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true, message: "Login berhasil!" };
  } else {
    return { success: false, message: "Email atau password salah." };
  }
}

export function logoutUser() {
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}