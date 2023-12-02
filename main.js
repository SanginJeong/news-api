const $serach_btn = document.querySelector('.serach_btn');
const $search_area = document.querySelector('.search_area');
const $hamburger = document.querySelector('#hamburger');
const $nav = document.querySelector('nav');
const $close_hamburger = document.querySelector('#close_hamburger');
const $category_btns = document.querySelectorAll('nav button');

import NEWS_API_KEY from "./apikey.js";
const APIkey = NEWS_API_KEY;
$serach_btn.addEventListener('click',()=>{
  $search_area.classList.toggle('active');
})

$hamburger.addEventListener('click',()=>{
  $nav.classList.toggle('active');
})
// ----
let newsList = [];
let url = new URL(`https://newsapi.org/v2/top-headlines?country=kr&apiKey=${APIkey}`)
let totalResults = 0;
let page = 1;
let pageGroup = 1;
const pageSize = 10;
const groupSize = 5;

const getNews = async() =>{
  try {
    url.searchParams.set('page',page)
    url.searchParams.set('pageSize',pageSize)
    const response = await fetch(url);
    const data = await response.json();
    if(response.status == '200'){
      if(data.articles.length === 0){
        throw new Error('No results');
      }
      newsList = data.articles
      totalResults = data.totalResults;
      console.log('totalResults : ' , data.totalResults);
      console.log('newsList', newsList);
      render();
      paginationRender();
    }
    else {
      throw data //200이 아니면 data로 에러가 오고 data를 에러로 보낸다.
    }
  } catch (error) {
    console.log('error',error);
    errorRender(error.message)
  }
}
const getLatestNews = async ()=>{
  url = new URL(`https://newsapi.org/v2/top-headlines?country=kr&apiKey=${APIkey}`);
  getNews()
}
getLatestNews();

const render = () =>{
  const resultHTML = newsList.map( (news)=>{
    return `<div class="article row">
    <div class="col-lg-4">
    <img src = '${news.urlToImage}'/></div>
    <div class="col-lg-8 mt-3">
      <h2>${news.title}</h2>
      <p>${news.description}</p>
      <div>${news.name}*${news.publishedAt}</div>
    </div>
  </div>`
}) 
  console.log(resultHTML);
  document.querySelector('main').innerHTML = resultHTML.join('')
}



const clikcCategory = async(category) =>{
  url = new URL(`https://newsapi.org/v2/top-headlines?country=kr&category=${category}&apiKey=${APIkey}`);
  page=1;
  getNews();
}

const inputKeyword = async(keyword) =>{
  url = new URL(`https://newsapi.org/v2/top-headlines?country=kr&q=${keyword}&apiKey=${APIkey}`);
  page=1;
  getNews();
}

const errorRender = (errorMessage) =>{
  const errorHTML =  `<div class="alert alert-danger" role="alert">
  ${errorMessage}</div>`
  document.querySelector('main').innerHTML = errorHTML;
}

$category_btns.forEach(v=>{
  v.addEventListener('click',(btn)=>{
    const category = btn.target.textContent.toLowerCase();
    console.log(category);
    clikcCategory(category);
  })
})

$search_area.addEventListener('submit',(e)=>{
  const $keyword = document.querySelector('#keyword');
  e.preventDefault();
  const keyword = $keyword.value;
  console.log(keyword);  
  inputKeyword(keyword);
})

// totalResults : 총 데이터 개수
// page : 현재 페이지
// pageSize : 한 페이지의 데이터 개수
// totalPage : totalResult / pageSize
// groupSize : 페이지네이션을 몇개씩 묶을건지
// first : 현재 그룹의 첫번째 페이지 -> last - gs + 1
// last : 현재 그룹의 마지막 페이지 -> gS*Math.ceil(page / gS)

// totalResults를 받으면 각 정보들을 구해서 html에 그린다.

const paginationRender = () =>{
  const totalPage = Math.ceil(totalResults / pageSize)
  pageGroup = Math.ceil(page / groupSize)
  let last = groupSize * pageGroup;
  if(last > totalPage){
    last = totalPage
  }
  let first = (last - groupSize + 1) <=0 ? 1 :  (last - groupSize + 1);
  let paginationHTML = ``;
  if(pageGroup === 1){
    paginationHTML = ``
  }
  else if (pageGroup !== 1){
    paginationHTML = `<li class="page-item" onclick="moveToPage(${1})"><a class="page-link"><<</a></li><li class="page-item" onclick="moveToPage(${page-1})"><a class="page-link"><</a></li>`;
  }
  for(let i=first; i<=last; i++){
    paginationHTML += `<li class="page-item ${i===page ? 'active' : ''}" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`
  }
  paginationHTML += `<li class="page-item" onclick="moveToPage(${page+1})"><a class="page-link">></a></li><li class="page-item" onclick="moveToPage(${totalPage})"><a class="page-link">>></a></li>`
  document.querySelector('.pagination').innerHTML = paginationHTML;
}

const moveToPage = (pageNum) =>{
  page = pageNum;
  getNews();
}

// 