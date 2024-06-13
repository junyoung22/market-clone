const calcTime = (timestamp) => {
  // 한국시간 UTC+9
  const curTime = new Date().getTime() - 9 * 60 * 60 * 1000;
  const time = new Date(curTime - timestamp);
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();
  // 경과 시간이 1시간 이상이면 ${hour}시간 전을 반환합니다.
  if (hour > 0) return `${hour}시간 전`;
  else if (minute > 0) return `${minute}분 전`;
  else if (second > 0) return `${second}초 전`;
  else return "방금 전";
};
// 서버에서 가져온 데이터를 웹 페이지에 렌더링
// data= [{id:1, title:'aaaa'},{id:2, title:'bbbb"}...]
const renderData = (data) => {
  const main = document.querySelector("main");
  data.reverse().forEach(async (obj) => { // 데이터를 불러와 역순으로 반복하여 각 obj에 대해 비동기 처리합니다.  
    // 새로운 div 요소를 생성
    const div = document.createElement("div");
    div.className = "item-list";

    const imgDiv = document.createElement("div");
    imgDiv.className = "item-list_img";

    // py서버에서 Response해준 이미지를 불러오는 과정
    const img = document.createElement("img");
    const res = await fetch(`/images/${obj.id}`); // 이미지 데이터를 가져오기 위해 /images/${obj.id} 경로로 비동기 GET 요청을 보냅니다.
    const blob = await res.blob(); // 응답을 blob 형식으로 변환하여 blob 변수에 저장합니다.
    const url = URL.createObjectURL(blob); // blob 데이터를 URL 객체로 변환하여 url 변수에 저장
    img.src = url;

    const InfoDiv = document.createElement("div");
    InfoDiv.className = "item-list_info";

    const InfoTitleDiv = document.createElement("div");
    InfoTitleDiv.className = "item-list_info-title";
    InfoTitleDiv.innerText = obj.title;

    const InfoMetaDiv = document.createElement("div");
    InfoMetaDiv.className = "item-list_info-meta";
    InfoMetaDiv.innerText = obj.place + " " + calcTime(obj.insertAt); // InfoMetaDiv 요소의 텍스트 내용을 obj.place와 경과 시간으로 설정

    const InfoPriceDiv = document.createElement("div");
    InfoPriceDiv.className = "item-list_info-price";
    InfoPriceDiv.innerText = obj.price;
    // img 요소를 imgDiv 요소에 추가합니다.
    imgDiv.appendChild(img);
    InfoDiv.appendChild(InfoTitleDiv);
    InfoDiv.appendChild(InfoMetaDiv);
    InfoDiv.appendChild(InfoPriceDiv);
    div.appendChild(imgDiv);
    div.appendChild(InfoDiv);
    main.appendChild(div);
  });
};

const fetchList = async () => {
  const accessToken = window.localStorage.getItem("token");
  const res = await fetch("/items", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });  // 백엔드에 요청하면 select값을 넘겨줌

if (res.status === 401) {
  alert("로그인이 필요합니다!");
  window.location.pathname = "/login.html";
  return;
}


  const data = await res.json();
  console.log(data);
  renderData(data); // 넘겨받은 값을 renderDate에 넘겨줌
};

fetchList();
