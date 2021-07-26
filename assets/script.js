// grab all required element

const start_box = document.querySelector('.start_box');
const start_btn = document.querySelector('.start_button');

const input_box = document.querySelector('.input_box');
const warning = document.querySelector('.input_content p');
const input = document.querySelector('input');
const submit_btn = document.querySelector('.input_content .buttons .submit');
const cancel_btn = document.querySelector('.input_content .buttons .cancel');


const topic_box = document.querySelector('.topic_box');
const topic_list = topic_box.querySelector('.topic_list');

const info_box = document.querySelector('.info_box');
const quit_btn = info_box.querySelector('.buttons .quit');
const continue_btn = info_box.querySelector('.buttons .restart');

const quiz_box = document.querySelector('.quiz_box');
const next_btn = quiz_box.querySelector('footer .next_btn');
const timerText = quiz_box.querySelector('header .timer .timer_sec');
const timerLine = quiz_box.querySelector('header .timer_line');

const result_box = document.querySelector('.result_box');
const restart_btn = result_box.querySelector('.buttons .restart');
const exit_btn = result_box.querySelector('.buttons .quit');

// global
let action;
let userName;
let topic;
let que_count = 0;
let poin = 0;
let userAnswer;
let timerValue = 30;
let timeLine = 0;
let counter;
let counterLine;
let totalQuiz;

// event

// == when start button clicked
start_btn.onclick = () => {
    addClass(start_box, add = false, 'active');
    addClass(input_box, add = true, 'active');
}

// == when submit button clicked
submit_btn.addEventListener('click', async function () {
    const topic_title = topic_box.querySelector('.topic_title p span');

    if (input.value === '') {
        addClass(warning, add = true, 'block');
    } else {
        userName = input.value;
        addClass(input_box, add = false, 'active');
        addClass(warning, add = false, 'block');
        addClass(topic_box, add = true, 'active');

        const getData = await getDb();
        updateTopic(getData);
        // console.log(userName);
        allTopicList();
        topic_title.textContent = userName;
        input.value = '';

    }
});

// == when cancel button clicked
cancel_btn.onclick = () => {
    addClass(input_box, add = false, 'active');
    addClass(start_box, add = true, 'active');
}

// == when exit btn in info_box clicked
quit_btn.onclick = () => {
    addClass(info_box, add = false, 'active');
    addClass(start_box, add = true, 'active');
}

// == when continue btn in info_box clicked
continue_btn.addEventListener('click', async function () {
    addClass(info_box, add = false, 'active');
    addClass(quiz_box, add = true, 'active');
    clearInterval(counter);
    clearInterval(counterLine);
    const getData = await getDb();
    updateQuestions(getData);
    startTimer(timerValue);
    startTimeLine(timeLine);
});

next_btn.addEventListener('click', async function () {
    const getData = await getDb();
    getData.questions.forEach(question => {
        if (question.name === topic) {
            cekAnswer(question.quiz[que_count].answer, userAnswer)
            que_count++
            if (que_count < question.quiz.length) {
                updateQuestions(getData);
                addClass(next_btn, add = false, 'display')
            } else {
                complate();
                clearInterval(counter);
                clearInterval(counterLine);
                addClass(next_btn, add = false, 'display');
                addClass(quiz_box, add = false, 'active');
                addClass(result_box, add = true, 'active');
            }
        }
    })
});

exit_btn.addEventListener('click', function () {
    addClass(result_box, add = false, 'active');
    addClass(start_box, add = true, 'active');
    poin = 0;
    que_count = 0;
});

restart_btn.addEventListener('click', function () {
    addClass(result_box, add = false, 'active');
    addClass(info_box, add = true, 'active');
    poin = 0;
    que_count = 0;
})



// function

function addClass(elem, status, nameClass) {
    return status ? elem.classList.add(nameClass) : elem.classList.remove(nameClass);
}

function getDb() {
    // console.log('that');
    return fetch(dataBase)
        .then(response => response.json())
        .then(response => response)
        .catch(err => console.log(err))
}

function updateTopic(result) {
    // console.log(result.topic);
    topicList = '';
    result.topic.forEach(topic => topicList += showTopic(topic))
    topic_list.innerHTML = topicList;
}

function showTopic(data) {
    dataUp = data.toUpperCase();
    return `<div class="list" name="math"><span>${dataUp}</span></div>`
}

function allTopicList() {
    const allTopic = topic_list.querySelectorAll('.list');
    allTopic.forEach(topic => {
        topic.setAttribute('onclick', 'topicClick(this)')
    })
}

function topicClick(element) {
    topic = element.textContent.toLowerCase();
    const info_title = info_box.querySelector('.info_title');
    topicWord = `${topic[0].toUpperCase() + topic.substring(1)}`
    info_title.innerHTML = `<p>Okay <span>${userName}</span>, You Choose <span>${topicWord}</span>, Cool<br> This is Some Rules of This Quiz</p>`
    addClass(topic_box, add = false, 'active');
    addClass(info_box, add = true, 'active');
}

function updateQuestions(response) {
    let userTopic = topic.toLowerCase();
    response.questions.forEach(question => {
        if (question.name === userTopic) {
            updateHeader(question.name)
            updateQuiz(question.quiz)
            totalQuiz = question.quiz.length;
        }
    })
}

function updateHeader(data) {
    const titleHeader = data[0].toUpperCase() + data.substring(1);
    const quiz_header = quiz_box.querySelector('header .title');
    let headerText = `${titleHeader} Quiz Application`;
    quiz_header.textContent = headerText;
}

function updateQuiz(data) {
    const dataArray = data[que_count];
    const quezText = quiz_box.querySelector('section .que_text');
    const optionList = quiz_box.querySelector('section .option_list');
    const footers = quiz_box.querySelector('footer .total_que');
    const foot_numb = footers.querySelector('span .number');
    const foot_numbTotal = footers.querySelector('span .total_quiz');

    let queTitle = `<span>${dataArray.question}</span>`;

    let options = dataArray.options;
    let allOption = options.map(option => {
        return `<div class="option"><span>${option}</span></div>`
    })

    let numbers = dataArray.numb;
    let total_numbs = dataArray.options.length + 1;

    quezText.innerHTML = queTitle;
    optionList.innerHTML = allOption.join('');
    
    foot_numb.textContent = numbers;
    foot_numbTotal.textContent = total_numbs;

    addClickEvent(optionList);
}

function addClickEvent(element) {
    const allListOption = element.querySelectorAll('.option');
    allListOption.forEach(option => {
        option.setAttribute('onclick', 'clickOption(this)');
    });
}

async function clickOption(choose) {
    const allOption = quiz_box.querySelectorAll('section .option_list .option');

    allOption.forEach(option => {
        if (choose.textContent === option.textContent) {
            addClass(option, add = true, 'clicked');
            addClass(next_btn, add = true, 'display')
            userAnswer = option.textContent;
        } else {
            addClass(option, add = false, 'clicked');
        }
    });
}

function cekAnswer(keyanswer, answer) {
    if (keyanswer === answer) {
        poin++
    }
}

function startTimer(time) {
    timerText.textContent = time;
    counter = setInterval(timer, 1000);
    function timer() {
        time--;
        timerText.textContent = time;
        if (time <= 0) {
            clearInterval(counter);
            timerText.textContent = '00';
        } else if (time <= 9) {
            crnVal = timerText.textContent;
            timerText.textContent = `0${crnVal}`;
        }
    }

}

function startTimeLine(time) {
    counterLine = setInterval(timer, (timerValue * 1000) / quiz_box.offsetWidth);
    function timer() {
        time++
        timerLine.style.width = `${time}px`;
        if (time > quiz_box.offsetWidth) {
            clearInterval(counterLine);
            timeOver();
        }
    }
}

function timeOver() {
    addClass(quiz_box, add = false, 'active');
    addClass(result_box, add = true, 'active');
    addClass(next_btn, add = false, 'display');
    complate();
}

function complate() {
    const complateText = result_box.querySelector('.complete_text');
    const scoreText = result_box.querySelector('.score_text');

    complateText.innerHTML = `<div class="complete_text">Congratulation <span class="user">${userName}</span>,<br> You've completed the <span class="topic">${topic[0].toUpperCase()+topic.substring(1)}</span> Quiz</div>`;

    if( poin === 0 ){
        scoreText.innerHTML = `<p>and Sorry,<br>You got only <span>${poin}</span> out of <span>${totalQuiz}</span></p>`;
    } else if ( poin < totalQuiz){
        scoreText.innerHTML = `<p>and Nice,<br>You got <span>${poin}</span> out of <span>${totalQuiz}</span>,Good Job</p>`;
    } else if (poin === totalQuiz){
        scoreText.innerHTML = `<p>and Wow,<br>You got <span>${poin}</span> out of <span>${totalQuiz}</span>,Perfect</p>`;
    }
}