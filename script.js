class View {
  constructor () {
    this.app = document.getElementById('app');

    this.block = this.createElement('div', 'block');

    this.blockInput = this.createElement('input', 'block__input');
    this.block.append(this.blockInput);

    this.blockNoFound = this.createElement('span', 'block__noFoundStr')
    this.blockNoFound.textContent = `No found`;
    this.blockNoFound.style.display = 'none';
    this.block.append(this.blockNoFound)

    this.blockError = this.createElement('span', 'block__ErrText')
    this.blockError.style.display = `none`;
    this.block.append(this.blockError);

    this.blockPeopleList = this.createElement('ul', 'block__peopleList');
    this.block.append(this.blockPeopleList);

    this.blockSelectedRepoList = this.createElement('ul', 'block__selectedRepoList');
    this.block.append(this.blockSelectedRepoList)

    this.app.append(this.block);

  }


  createElement(elemTag, elemClass){
    const element = document.createElement(elemTag);
    if (elemClass) element.classList.add(elemClass);
    return element;
  }


  createUser (user, obj) {
    const userElement = this.createElement('li' , 'block__listItem');
    userElement.insertAdjacentHTML(`afterbegin`,`<button class='block__ListBtn' data-user-info='${obj}' >${user.name}</button>` )
    this.blockPeopleList.append(userElement);
  }

  createSelectedUser (selectedItem) {

    this.blockInput.value = '';
    this.blockPeopleList.textContent = '';
    
    const obj = JSON.parse(selectedItem.getAttribute('data-user-info'));
    const userElement = this.createElement('li' , 'block__selectedItem');

    userElement.insertAdjacentHTML( `afterbegin`, `
    <div class='block__selectedInfo'>
      <p>Name: ${obj.name}</p>
      <p>Owner: ${obj.Owner}</p>
      <p>Stars: ${obj.Stars}</p>
    </div>
    <div class ='block__deleteBtnWrapper'>
      <button class='block__deleteBtn'></button>
    </div>
    `)

    this.blockSelectedRepoList.append(userElement);

    if (this.blockSelectedRepoList.children.length > 3) this.blockSelectedRepoList.style.overflowY = 'scroll';

  }


  removeSelectedUser (elem) {
    if(elem.tagName == 'BUTTON') this.blockSelectedRepoList.removeChild(elem.offsetParent.parentNode);
    if (this.blockSelectedRepoList.children.length <= 3) this.blockSelectedRepoList.style.overflowY = 'visible';
  }

}


const USER_PER_PAGE = 5;

class Search {
  constructor (view) {
    this.view = view;
    this.debounceTime = 500;


    this.view.blockInput.addEventListener('keyup', this.debounce(this.loadUsers, this.debounceTime).bind(this))
    this.view.blockPeopleList.addEventListener('click', (e) =>  this.view.createSelectedUser(e.target) )
    this.view.blockSelectedRepoList.addEventListener('click', (e) => this.view.removeSelectedUser(e.srcElement))
  }

  async loadUsers () {
    if (this.view.blockInput.value.trim() != ''){
      this.view.blockNoFound.style.display = 'none';
      this.clearUsers()
      await fetch(`https://api.github.com/search/repositories?q=${this.view.blockInput.value}&per_page=${USER_PER_PAGE}`)
      .then((res)=> {
        if (res.ok) {
          this.view.blockError.style.display = `none`;
          return res.json()
        }else {
          return Promise.reject(res);
        }
      })
      .then ( (res) => {
        res.items.forEach((elem) =>{
          this.view.createUser(elem, JSON.stringify({name : elem.name, Owner : elem.owner.login, Stars: elem.stargazers_count  }))
        })
        if (this.view.blockPeopleList.children.length == 0) this.view.blockNoFound.style.display = 'block';
      })
      .catch((err)=> {
        console.log(err);
        this.view.blockError.style.display = `block`;
        this.view.blockError.textContent = `${err.status}. \n Something was wrong. Please, try it later`;
      })

    }else {
      this.clearUsers();
    } 
  }

  clearUsers () {
    this.view.blockPeopleList.textContent = '';
  }

  debounce = (fn, debounceTime) => {
  
    let timeout;
  
    return function () {
      
      const fnCall = ()=> {
        fn.apply(this, arguments)
      }
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, debounceTime);
    };
  };

}

new Search (new View())