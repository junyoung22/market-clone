// 1) id = write-form 저장
const form = document.getElementById('write-form');

const handleSubmitForm = async (event) => {
    event.preventDefault(); // 페이지 리로드를 방지
    const body = new FormData(form);
    // 세계시간 기준 현재 시간을 insertAt 필드에 추가 
    body.append('insertAt', new Date().getTime());
    try {   //items 엔드포인트로 POST 요청
        const res = await fetch("/items", {
        method:"POST",
        body,
    }); // fetch 요청 끝
        // res 변수에 저장된 응답을 data에 저장
    const data = await res.json();
    if(data==='200') window.location.pathname = "/";    // 응답 데이터가 '200'이면 현재 페이지를 루트 경로로 리다이렉트
    } catch(e) {
        console.error(e);
    }
};
// 2) write-form 폼에 submit 이벤트 리스너를 추가하여, 폼이 제출될 때 handleSubmitForm 함수를 실행
form.addEventListener('submit', handleSubmitForm);