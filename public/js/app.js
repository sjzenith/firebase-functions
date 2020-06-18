const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');

//open request modal
requestLink.addEventListener('click', ()=>{
    requestModal.classList.add('open');
});

//close request modal 바탕화면 클릭하면 모달종료
//모달누르면 종료하게하면 입력값 못받음. 그냥 닫히니까
requestModal.addEventListener('click', (e)=>{
    if(e.target.classList.contains('new-request')){
        requestModal.classList.remove('open');
    }
});

