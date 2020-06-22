const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form');
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

//add a new request
requestForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const addRequest = firebase.functions().httpsCallable('addRequest');
    
    addRequest({
        text: requestForm.request.value
    })
    .then(() => {
        requestForm.reset();
        requestForm.querySelector('.error').textContent = '';
        requestModal.classList.remove('open');
    })
    .catch(error => {
        requestForm.querySelector('.error').textContent = error.message;
    });
});

//notification
const notification = document.querySelector('.notification');
const showNotification = (message) => {
    notification.textContent = message;
    notification.classList.add('active');
    setTimeout(() => {
        notification.classList.remove('active');
        notification.textContent = '';
    }, 4000);
};