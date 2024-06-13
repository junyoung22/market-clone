const form = document.querySelector("#login-form");

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  // HASH 암호화 과정
  const sha256Password = sha256(formData.get("password"));
  formData.set("password", sha256Password);

  const res = await fetch("/login", {
    method: "post",
    body: formData,
  });
  const data = await res.json(); // 4)데이터뿐 아니라 토근값도 내려받음
  // console.log("엑세스토큰", data);
  const accessToken = data.access_token;
  window.localStorage.setItem("token", accessToken);
//  window.sessionStorage.setItem("token", accessToken);  // 로그인시 세션스토리지
  alert('로그인되었습니다!');

  // const infoDiv = document.querySelector("#info")
  // infoDiv.innerText = "로그인 되었습니다";

   window.location.pathname = "/";

//   const btn = document.createElement("button");
//   btn.innerText = "상품 가져오기!";
//   btn.addEventListener("click", async ()=> {
//     const res = await fetch("/items", {     // 토큰 인증할수있게끔 던져주는건가? 모름
//         headers:{
//             'Authorization': `bearer ${accessToken}`,
//         }
//     });
//     const data = await res.json();
//     console.log(data);
//   });
//   infoDiv.appendChild(btn);

//   // return '200' 오면 Text 추출 -> res.status
//   if (res.status === 200) {
//     // div.innerText = "회원가입에 성공했습니다!";
//     // div.style.color = "blue";
//     alert("로그인에 성공했습니다.");
//     window.location.pathname = "/";
//   } else if (res.status === 401) {
//     // res.status는 return 200이 아닌 실제 에러코드(invaild) 기준
//     alert("id 혹은 password가 틀렸습니다.");
//   }
};

form.addEventListener("submit", handleSubmit);
