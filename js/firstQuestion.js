document.getElementById("user-info-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const nickname = document.getElementById("nickname").value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
    const age = document.getElementById("age").value.trim();

    const userInfo = { nickname, gender, age };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    window.location.href = "./../index.html";
});